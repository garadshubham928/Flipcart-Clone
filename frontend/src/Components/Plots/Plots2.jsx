import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { Card, Box, Button } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

function Plots2() {
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
      console.log('API Response:', data); // Debug log
      
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
      setOrderData([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, []);

  useEffect(() => {
    // Add safety checks
    if (!Array.isArray(orderData) || orderData.length === 0 || !chartRef.current) return;

    // Aggregate data by customer city and total amount
    const aggregatedData = {};
    orderData.forEach((order) => {
      if (!order) return; // Skip null/undefined orders
      
      const city = order.customer_city || order.city || 'Unknown City';
      const amount = Number(order.totalAmount) || Number(order.total_amount) || 0;
      
      if (!aggregatedData[city]) {
        aggregatedData[city] = amount;
      } else {
        aggregatedData[city] += amount;
      }
    });

    // Sort cities by total amount (descending)
    const sortedEntries = Object.entries(aggregatedData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15); // Show top 15 cities

    const cityNames = sortedEntries.map(([city]) => city);
    const totalAmounts = sortedEntries.map(([, amount]) => amount);

    const myChart = echarts.init(chartRef.current);

    let option;

    if (chartType === 'bar') {
      option = {
        title: {
          text: 'Total Amount by Customer City',
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
          axisPointer: { type: 'shadow' },
          formatter: function (params) {
            const data = params[0];
            return `<strong>${data.name}</strong><br/>
                    Total Amount: $${data.value.toLocaleString()}`;
          }
        },
        grid: {
          left: '10%',
          right: '10%',
          bottom: '15%',
          top: '15%'
        },
        xAxis: {
          type: 'category',
          data: cityNames,
          axisLabel: { 
            rotate: 45, 
            color: '#333',
            fontSize: 11
          },
          axisLine: {
            lineStyle: { color: '#ddd' }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: { 
            color: '#333',
            formatter: '${value}'
          },
          axisLine: {
            lineStyle: { color: '#ddd' }
          },
          splitLine: {
            lineStyle: { color: '#f0f0f0' }
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
            data: totalAmounts,
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
      // Pie chart option
      const pieData = sortedEntries.map(([city, amount]) => ({
        name: city,
        value: amount
      }));

      option = {
        title: {
          text: 'Total Amount Distribution by City',
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
            return `<strong>${params.name}</strong><br/>
                    Amount: $${params.value.toLocaleString()}<br/>
                    Percentage: ${params.percent}%`;
          }
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          right: 10,
          top: 20,
          bottom: 20,
          data: cityNames,
        },
        series: [
          {
            name: 'City Amount',
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

  // Safe statistics calculation function
  const calculateStatistics = () => {
    // Ensure orderData is an array and has length
    if (!Array.isArray(orderData) || orderData.length === 0) {
      return {
        totalCities: 0,
        totalRevenue: 0,
        averagePerCity: 0
      };
    }

    try {
      // Calculate unique cities
      const uniqueCities = new Set();
      let totalRevenue = 0;

      orderData.forEach((order) => {
        if (order) { // Check if order exists
          const city = order.customer_city || order.city || 'Unknown City';
          uniqueCities.add(city);
          
          const amount = Number(order.totalAmount) || Number(order.total_amount) || 0;
          totalRevenue += amount;
        }
      });

      const totalCities = uniqueCities.size;
      const averagePerCity = totalCities > 0 ? Math.round(totalRevenue / totalCities) : 0;

      return {
        totalCities,
        totalRevenue,
        averagePerCity
      };
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return {
        totalCities: 0,
        totalRevenue: 0,
        averagePerCity: 0
      };
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
          <Button 
            variant="contained" 
            onClick={fetchOrderData} 
            sx={{ mt: 2 }}
            color="primary"
          >
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
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Customer City Analytics - No Data
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
            <Button 
              variant="contained" 
              onClick={fetchOrderData} 
              sx={{ mt: 2 }}
            >
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
               ({orderData.length} orders)
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
        
        {/* Summary Statistics - FIXED SECTION */}
        <Card sx={{ mt: 2, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Summary Statistics
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Cities
              </Typography>
              <Typography variant="h6">
                {stats.totalCities}
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
                Average per City
              </Typography>
              <Typography variant="h6">
                ${stats.averagePerCity.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Card>
      </div>
    </>
  );
}

export default Plots2;
