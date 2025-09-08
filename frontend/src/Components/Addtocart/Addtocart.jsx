import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const AddToCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  // Get cart items from localStorage when component mounts
  React.useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('Loaded cart items:', parsedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error parsing cart items:', error);
        localStorage.removeItem('cartItems');
        setCartItems([]);
      }
    }

    // Pre-fill email if user is logged in - check multiple possible keys
    const userEmail = localStorage.getItem('userEmail') || 
                     localStorage.getItem('email') || 
                     localStorage.getItem('user_email');
                     
    console.log('Available localStorage keys:', Object.keys(localStorage));
    console.log('Found user email:', userEmail);
    
    if (userEmail) {
      setCustomerInfo(prev => ({ ...prev, email: userEmail }));
    }
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return total + (price * quantity);
    }, 0);
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: Math.max(1, newQuantity) };
      }
      return item;
    });
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  };

  const removeItem = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      city: 'City',
      state: 'State',
      postalCode: 'Postal Code'
    };

    // Check required fields
    Object.keys(requiredFields).forEach(field => {
      if (!customerInfo[field] || customerInfo[field].trim() === '') {
        errors[field] = `${requiredFields[field]} is required`;
      }
    });

    // Email validation
    if (customerInfo.email && !/\S+@\S+\.\S+/.test(customerInfo.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (customerInfo.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(customerInfo.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Postal code validation
    if (customerInfo.postalCode && !/^[\d\w\s\-]{3,}$/.test(customerInfo.postalCode)) {
      errors.postalCode = 'Please enter a valid postal code';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckout = async () => {
    setLoading(true);
    
    // Check multiple possible keys for user email
    const userEmail = localStorage.getItem('userEmail') || 
                     localStorage.getItem('email') || 
                     localStorage.getItem('user_email') ||
                     customerInfo.email; // Fallback to form email
    
    console.log('Checking for user email:', {
      userEmail: localStorage.getItem('userEmail'),
      email: localStorage.getItem('email'),
      user_email: localStorage.getItem('user_email'),
      formEmail: customerInfo.email,
      finalEmail: userEmail
    });
    
    if (!userEmail) {
      console.log('No user email found in localStorage or form');
      alert('Please login first or ensure your email is filled in the form');
      setLoading(false);
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      setLoading(false);
      return;
    }

    // Validate customer information form
    if (!validateForm()) {
      alert('Please fill in all required fields correctly');
      setLoading(false);
      return;
    }

    try {
      const orderData = {
        email: userEmail,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name || item.model_name || 'Unknown Item',
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.quantity) || 1,
        })),
        totalAmount: parseFloat(calculateTotal().toFixed(2)),
        customerInfo: {
          name: customerInfo.name.trim(),
          email: customerInfo.email.trim(),
          phone: customerInfo.phone.trim(),
          address: customerInfo.address.trim(),
          city: customerInfo.city.trim(),
          state: customerInfo.state.trim(),
          postalCode: customerInfo.postalCode.trim()
        }
      };
      
      console.log('Sending order data:', orderData);
      
      const response = await fetch('http://localhost:4000/api/orders/insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('Error parsing response JSON:', jsonError);
        throw new Error('Invalid response from server');
      }
      
      console.log('Server response:', result);
      
      if (response.ok && result.success) {
        // Clear cart after successful order
        setCartItems([]);
        localStorage.removeItem('cartItems');
        alert(`Order placed successfully! Order ID: ${result.orderId}\n\nThank you ${customerInfo.name}! Your order will be delivered to:\n${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.postalCode}`);
        navigate('/Home');
      } else {
        console.error('Server error response:', result);
        throw new Error(result.error || result.message || `HTTP ${response.status}: Failed to place order`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      
      if (error.message.includes('413')) {
        alert('Order data is too large. Please try with fewer items or contact support.');
      } else if (error.message.includes('Failed to fetch')) {
        alert('Network error. Please check your internet connection and try again.');
      } else {
        alert(`Failed to place order: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to get image source with fallback
  const getImageSrc = (item) => {
    const image = item.image || item.photo;
    
    if (!image) {
      return 'https://via.placeholder.com/80x80?text=No+Image';
    }
    
    // Check if it's already a data URL with any image format
    if (image.startsWith('data:image/')) {
      return image;
    }
    
    // Check if it's base64 data without prefix
    if (image.length > 100 && !image.startsWith('http')) {
      // Try to detect image format from the base64 data
      try {
        const decoded = atob(image.substring(0, 8));
        // Check for PNG signature
        if (decoded.includes('PNG')) {
          return `data:image/png;base64,${image}`;
        }
        // Check for JPEG signature
        if (decoded.includes('JFIF') || decoded.includes('Exif')) {
          return `data:image/jpeg;base64,${image}`;
        }
        // Default to JPEG if can't detect
        return `data:image/jpeg;base64,${image}`;
      } catch (e) {
        return `data:image/jpeg;base64,${image}`;
      }
    }
    
    // Regular URL
    if (image.startsWith('http')) {
      return image;
    }
    
    return 'https://via.placeholder.com/80x80?text=No+Image';
  };

  return (
    <div>
      <Header/>
      <br/>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Shopping Cart ({cartItems.length} items)</h1>
          
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 0L6 4H4m3 9a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate('/Home')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="bg-white rounded-lg shadow-md p-6 mb-4">
                  <div className="flex items-center">
                    <img
                      src={getImageSrc(item)}
                      alt={item.name || item.model_name || 'Product'}
                      className="w-20 h-20 object-cover rounded"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                      }}
                    />
                    <div className="ml-4 flex-grow">
                      <h2 className="text-lg font-semibold">
                        {item.name || item.model_name || 'Unknown Item'}
                      </h2>
                      <p className="text-gray-600">${parseFloat(item.price || 0).toFixed(2)}</p>
                      {item.category && (
                        <p className="text-sm text-gray-500">Category: {item.category}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        Subtotal: ${(parseFloat(item.price || 0) * parseInt(item.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="mx-3 font-semibold min-w-[20px] text-center">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-4 text-red-500 hover:text-red-600 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 h-fit">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              {/* Order Items Summary */}
              <div className="space-y-2 mb-4">
                {cartItems.map((item, index) => (
                  <div key={`summary-${item.id}-${index}`} className="flex justify-between text-sm">
                    <span className="truncate mr-2">
                      {((item.name || item.model_name || 'Unknown Item').length > 20 
                        ? `${(item.name || item.model_name).substring(0, 20)}...` 
                        : item.name || item.model_name || 'Unknown Item'
                      )} x {item.quantity || 1}
                    </span>
                    <span>${(parseFloat(item.price || 0) * parseInt(item.quantity || 1)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between mb-2 text-sm text-gray-500">
                <span>Tax</span>
                <span>Included</span>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between mb-6 text-lg font-bold">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>

              {/* Customer Information Form */}
              <div className="border-t pt-6">
                <h3 className="text-md font-semibold mb-4">Shipping Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={customerInfo.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={customerInfo.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={customerInfo.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={customerInfo.address}
                      onChange={handleInputChange}
                      rows="2"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                        formErrors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full address"
                    />
                    {formErrors.address && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={customerInfo.city}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="City"
                      />
                      {formErrors.city && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={customerInfo.state}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="State"
                      />
                      {formErrors.state && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={customerInfo.postalCode}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.postalCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter postal code"
                    />
                    {formErrors.postalCode && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.postalCode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={loading || cartItems.length === 0}
                className={`w-full py-3 mt-6 rounded-lg font-medium transition-all duration-200 ${
                  loading || cartItems.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Order...
                  </div>
                ) : (
                  `Place Order - $${calculateTotal().toFixed(2)}`
                )}
              </button>

              {/* Required Fields Notice */}
              <p className="text-xs text-gray-500 mt-2 text-center">
                <span className="text-red-500">*</span> Required fields
              </p>
              
              {/* Security Notice */}
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-xs text-green-700">Secure checkout process</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AddToCart;