import React, { useState, useEffect } from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    email: '',
    sortBy: 'order_date',
    sortOrder: 'DESC'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  const API_BASE = 'http://localhost:4000/api';

  // Load orders summary
  const loadOrdersSummary = async () => {
    try {
      const response = await fetch(`${API_BASE}/orders/summary`);
      const data = await response.json();
      
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  // Load orders with current filters
  const loadOrders = async (page = 1) => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        status: filters.status,
        email: filters.email,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      const response = await fetch(`${API_BASE}/orders?${params}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setPagination(data.pagination);
      } else {
        throw new Error(data.error || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Failed to load orders: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        loadOrdersSummary();
        loadOrders(pagination.currentPage);
        alert('Order status updated successfully!');
      } else {
        throw new Error(data.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status: ' + error.message);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    loadOrders(1);
  };

  // Pagination functions
  const goToPage = (page) => {
    loadOrders(page);
  };

  // Load data on component mount
  useEffect(() => {
    loadOrdersSummary();
    loadOrders();
  }, []);

  // Debounced email search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (filters.email !== '') {
        loadOrders(1);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [filters.email]);

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div >
       <Header />
       <br/>
      <div >
       
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl mb-8 p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
              <span>🛍️</span> Orders Management
            </h1>
            <p className="text-indigo-100">Manage and track all customer orders</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              title: 'Total Orders', 
              value: summary.total_orders || 0, 
              icon: '📋', 
              color: 'from-blue-500 to-blue-600',
              bgColor: 'bg-blue-50'
            },
            { 
              title: 'Total Revenue', 
              value: `$${(Number(summary.total_revenue) || 0).toFixed(2)}`, 
              icon: '💰', 
              color: 'from-green-500 to-green-600',
              bgColor: 'bg-green-50'
            },
            { 
              title: 'Pending Orders', 
              value: summary.pending_orders || 0, 
              icon: '⏳', 
              color: 'from-yellow-500 to-yellow-600',
              bgColor: 'bg-yellow-50'
            },
            { 
              title: 'Cancelled Orders', 
              value: summary.cancelled_orders || 0, 
              icon: '❌', 
              color: 'from-red-500 to-red-600',
              bgColor: 'bg-red-50'
            }
          ].map((card, index) => (
            <div key={index} className={`${card.bgColor} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
              <div className="p-6">
                <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center text-white text-xl mb-4 shadow-lg`}>
                  {card.icon}
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Email</label>
              <input
                type="email"
                value={filters.email}
                onChange={(e) => handleFilterChange('email', e.target.value)}
                placeholder="Search by email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="order_date">Order Date</option>
                <option value="id">Order ID</option>
                <option value="totalAmount">Total Amount</option>
                <option value="customer_name">Customer Name</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="DESC">Newest First</option>
                <option value="ASC">Oldest First</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 font-medium"
              >
                <span>🔍</span> Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center gap-3 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
              Loading orders...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Orders Table */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150 align-top">
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <span className="text-base font-bold text-indigo-700">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="mb-1 text-sm font-semibold text-gray-900">{order.customer_name}</div>
                        <div className="text-xs text-gray-500">{order.customer_phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <span className="text-sm text-gray-900">{order.customer_email}</span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <ul className="space-y-1 max-w-xs">
                          {Array.isArray(order.items) && order.items.length > 0 ? (
                            order.items.map((item, idx) => (
                              <li key={idx} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                                <span className="font-medium text-gray-800 text-xs truncate max-w-[120px]">{item.name || item}</span>
                                <span className="text-xs text-gray-500 ml-2">{`${item.quantity || ''} ${item.price ? Number(item.price).toFixed(2) : ''}`}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-xs text-gray-400 italic">No items</li>
                          )}
                        </ul>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <span className="text-base font-bold text-gray-900">
                          ${parseFloat(order.totalAmount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <select
                          value={order.order_status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getStatusBadgeColor(order.order_status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <span className="text-xs text-gray-500">{formatDate(order.order_date)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {orders.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">Try adjusting your filters to see more results.</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && orders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {pagination.currentPage} of {pagination.totalPages} 
                ({pagination.totalOrders} total orders)
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => goToPage(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const startPage = Math.max(1, pagination.currentPage - 2);
                  const pageNumber = startPage + i;
                  
                  if (pageNumber <= pagination.totalPages) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          pageNumber === pagination.currentPage
                            ? 'bg-indigo-500 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => goToPage(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
    
  );
};

export default OrdersManagement;