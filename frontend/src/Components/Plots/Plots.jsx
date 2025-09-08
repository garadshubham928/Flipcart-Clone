import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { Card, Box, Button } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

function Plots() {
  const chartRef = useRef(null);
  const [orderData, setOrderData] = useState([]);
  const [chartType, setChartType] = useState('bar');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:4000/api/orders');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('API Response:', data);

      // Handle different response structures
      let ordersArray = [];
      if (Array.isArray(data)) {
        ordersArray = data;
      } else if (data.orders && Array.isArray(data.orders)) {
        ordersArray = data.orders;
      } else if (data.data && Array.isArray(data.data)) {
        ordersArray = data.data;
      } else {
        console.error('Unexpected data structure:', data);
        throw new Error('Data is not in expected array format');
      }

      setOrderData(ordersArray);
    } catch (error) {
      console.error("Error fetching order data:", error);
      setError(error.message);
      setOrderData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, []);

  useEffect(() => {
    if (!Array.isArray(orderData) || orderData.length === 0 || !chartRef.current) return;

    // Aggregate data by customer_state and order_status combination
    const aggregatedData = {};
    orderData.forEach((order) => {
      if (!order) return;
      const state = order.customer_state || 'Unknown State';
      const status = order.order_status || 'Unknown Status';
      const combinedKey = `${state} - ${status}`;
      const amount = Number(order.totalAmount) || Number(order.total_amount) || 0;
      
      if (!aggregatedData[combinedKey]) {
        aggregatedData[combinedKey] = amount;
      } else {
        aggregatedData[combinedKey] += amount;
      }
    });

    // Sort by total amount (descending) and limit to top 15
    const sortedEntries = Object.entries(aggregatedData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15);

    const labels = sortedEntries.map(([key]) => key);
    const values = sortedEntries.map(([, amount]) => amount);

    const myChart = echarts.init(chartRef.current);
    let option;

    if (chartType === 'bar') {
      option = {
        title: {
          text: 'Total Amount by Customer State & Order Status',
          left: 'left',
          top: '20px',
          textStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#2c3e50'
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function (params) {
            const data = params[0];
            return `<strong>${data.name}</strong><br/> Total Amount: $${data.value.toLocaleString()}`;
          }
        },
        grid: {
          left: '10%',
          right: '10%',
          bottom: '25%',
          top: '15%'
        },
        xAxis: {
          type: 'category',
          data: labels,
          axisLabel: {
            rotate: 60,
            color: '#333',
            fontSize: 10
          },
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#333',
            formatter: '${value}'
          },
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0'
            }
          }
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            start: 0,
            end: 50,
            xAxisIndex: 0,
          },
          {
            type: 'inside',
            xAxisIndex: 0,
          },
        ],
        series: [
          {
            name: 'Total Amount',
            data: values,
            type: 'bar',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#667eea' },
                { offset: 1, color: '#764ba2' }
              ]),
              borderRadius: [8, 8, 0, 0],
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#f093fb' },
                  { offset: 1, color: '#f5576c' }
                ])
              }
            }
          },
        ],
      };
    } else {
      // Pie chart
      const pieData = sortedEntries.map(([key, amount]) => ({
        name: key,
        value: amount
      }));

      option = {
        title: {
          text: 'Total Amount by State & Status',
          left: 'left',
          top: '20px',
          textStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#2c3e50'
          },
        },
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            return `<strong>${params.name}</strong><br/> Amount: $${params.value.toLocaleString()}<br/> Percentage: ${params.percent}%`;
          }
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          right: 10,
          top: 20,
          bottom: 20,
          data: labels,
        },
        series: [
          {
            name: 'State & Status Amount',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['40%', '50%'],
            data: pieData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              formatter: '{b}\n${c|0}'
            }
          }
        ]
      };
    }

    myChart.setOption(option);

    const resizeHandler = () => myChart.resize();
    window.addEventListener('resize', resizeHandler);

    return () => {
      myChart.dispose();
      window.removeEventListener('resize', resizeHandler);
    };
  }, [orderData, chartType]);

  const toggleChartType = () => {
    setChartType(prev => prev === 'bar' ? 'pie' : 'bar');
  };

  const calculateStatistics = () => {
    if (!Array.isArray(orderData) || orderData.length === 0) {
      return { totalCombinations: 0, totalRevenue: 0, averagePerCombination: 0 };
    }

    try {
      const uniqueCombinations = new Set();
      let totalRevenue = 0;

      orderData.forEach((order) => {
        if (order) {
          const state = order.customer_state || 'Unknown State';
          const status = order.order_status || 'Unknown Status';
          const combinedKey = `${state} - ${status}`;
          uniqueCombinations.add(combinedKey);
          
          const amount = Number(order.totalAmount) || Number(order.total_amount) || 0;
          totalRevenue += amount;
        }
      });

      const totalCombinations = uniqueCombinations.size;
      const averagePerCombination = totalCombinations > 0 ? Math.round(totalRevenue / totalCombinations) : 0;

      return { totalCombinations, totalRevenue, averagePerCombination };
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return { totalCombinations: 0, totalRevenue: 0, averagePerCombination: 0 };
    }
  };

  const stats = calculateStatistics();

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6">Loading chart data...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Card sx={{ p: 3, backgroundColor: '#ffebee' }}>
          <Typography variant="h6" color="error">
            Error loading data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {error}
          </Typography>
          <Button variant="contained" onClick={fetchOrderData} sx={{ mt: 2 }} color="primary">
            Retry
          </Button>
        </Card>
      </Box>
    );
  }

  // No data state
  if (!Array.isArray(orderData) || orderData.length === 0) {
    return (
      <>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static" sx={{ backgroundColor: '#667eea' }}>
            <Toolbar>
              <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Customer State & Order Status Analytics - No Data
              </Typography>
            </Toolbar>
          </AppBar>
        </Box>
        <Box sx={{ p: 3 }}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No data available
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              No order data found to display the chart.
            </Typography>
            <Button variant="contained" onClick={fetchOrderData} sx={{ mt: 2 }}>
              Refresh Data
            </Button>
          </Card>
        </Box>
      </>
    );
  }

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ backgroundColor: '#667eea' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Customer State & Order Status Analytics ({orderData.length} orders)
            </Typography>
            <Button 
              color="inherit" 
              onClick={toggleChartType} 
              variant="outlined"
              sx={{ 
                borderColor: 'white', 
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                  borderColor: 'white' 
                } 
              }}
            >
              Switch to {chartType === 'bar' ? 'Pie' : 'Bar'} Chart
            </Button>
          </Toolbar>
        </AppBar>
      </Box>

      <div style={{ padding: '20px' }}>
        <Card sx={{ mt: 2, p: 3, boxShadow: 3 }}>
          <div 
            ref={chartRef} 
            style={{ 
              width: '100%', 
              height: '600px', 
              maxWidth: '1400px', 
              margin: '0 auto' 
            }} 
          />
        </Card>

        {/* Summary Statistics */}
        <Card sx={{ mt: 2, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Summary Statistics
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total State-Status Combinations
              </Typography>
              <Typography variant="h6">
                {stats.totalCombinations}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Revenue
              </Typography>
              <Typography variant="h6">
                ${stats.totalRevenue.toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Average per Combination
              </Typography>
              <Typography variant="h6">
                ${stats.averagePerCombination.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Card>
      </div>
    </>
  );
}

export default Plots;