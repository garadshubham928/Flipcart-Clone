import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, Star, Heart, Filter, ChevronDown } from 'lucide-react';
import {Link} from "react-router-dom"
import Header from '../Header/Header';

const EcommerceWebsite = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cartItems, setCartItems] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Get user email
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
    }

    // Initialize cart count from localStorage
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      const cartItems = JSON.parse(savedCart);
      setCartItems(cartItems.reduce((total, item) => total + item.quantity, 0));
    }
  }, []);

  // Sample data
  const bannerSlides = [
    { id: 1, image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=1600&h=900&fit=crop', title: 'Summer Sale', subtitle: 'Up to 70% OFF' },
    { id: 2, image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1600&h=900&fit=crop', title: 'Electronics Deal', subtitle: 'Best Prices Guaranteed' },
    { id: 3, image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&h=900&fit=crop', title: 'Fashion Week', subtitle: 'Trending Styles' }
  ];

  const categories = ['All', 'Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty'];
  
  const products = [
    { id: 1, name: 'iPhone 15 Pro', price: 999, originalPrice: 1099, image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop', rating: 4.5, reviews: 1250, category: 'Electronics' },
    { id: 2, name: 'Nike Air Max', price: 120, originalPrice: 150, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop', rating: 4.3, reviews: 890, category: 'Fashion' },
    { id: 3, name: 'MacBook Pro', price: 1299, originalPrice: 1499, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop', rating: 4.7, reviews: 2100, category: 'Electronics' },
    { id: 4, name: 'Coffee Maker', price: 89, originalPrice: 120, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop', rating: 4.2, reviews: 450, category: 'Home & Kitchen' },
    { id: 5, name: 'Wireless Headphones', price: 199, originalPrice: 249, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop', rating: 4.4, reviews: 780, category: 'Electronics' },
    { id: 6, name: 'Designer Handbag', price: 299, originalPrice: 399, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop', rating: 4.6, reviews: 320, category: 'Fashion' },
    { id: 7, name: 'Smart Watch', price: 249, originalPrice: 299, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop', rating: 4.3, reviews: 1100, category: 'Electronics' },
    { id: 8, name: 'Kitchen Blender', price: 79, originalPrice: 99, image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=300&h=300&fit=crop', rating: 4.1, reviews: 280, category: 'Home & Kitchen' }
  ];

  const filteredProducts = selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const addToCart = (product) => {
    try {
      // Debug log
      //console.log('Adding product to cart:', product);

      const existingCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
      //console.log('Existing cart:', existingCart);

      const existingItem = existingCart.find(item => item.id === product.id);

      let updatedCart;
      if (existingItem) {
        // If item exists, increase quantity
        updatedCart = existingCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // If item doesn't exist, add it with quantity 1
        updatedCart = [...existingCart, { ...product, quantity: 1 }];
      }

      // Debug log
      //console.log('Updated cart:', updatedCart);

      localStorage.setItem('cartItems', JSON.stringify(updatedCart));
      const newCount = updatedCart.reduce((total, item) => total + item.quantity, 0);
      setCartItems(newCount);

      // Debug log
      //console.log('New cart count:', newCount);
      
      return true; // Return success
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false; // Return failure
    }
  };

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden">
      <div className="relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-white p-2 rounded-full shadow-lg hover:bg-red-50">
            <Heart className="w-4 h-4 text-red-500" />
          </button>
        </div>
        {product.originalPrice > product.price && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">${product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
            )}
          </div>
        </div>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const success = addToCart(product);
            if (success) {
              // Show success feedback
              alert(`Added ${product.name} to cart!`);
            }
          }}
          className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-500 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );

  // Models state and handlers
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchModels();
    
    // Initialize cart count
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart.reduce((total, item) => total + (item.quantity || 0), 0));
    }
  }, []);
  
  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/models');
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      const data = await response.json();
      
      console.log('Raw models data:', data.map(model => ({
        id: model.id,
        name: model.model_name,
        photoLength: model.photo ? model.photo.length : 0,
        photoStart: model.photo ? model.photo.substring(0, 50) : 'no photo'
      })));

      // Process images for each model
      const processedData = await Promise.all(data.map(async model => {
        if (!model.photo) {
          console.warn(`No photo data for model: ${model.model_name}`);
          return model;
        }

        try {
          // If it's already a complete data URL, validate and use it
          if (model.photo.startsWith('data:image/')) {
            console.log(`Model ${model.model_name} already has data URL`);
            return model;
          }

          // Check if the base64 is valid
          try {
            atob(model.photo);
          } catch (e) {
            console.error(`Invalid base64 data for model ${model.model_name}`);
            return { ...model, photo: null };
          }

          // Try to detect image format
          const header = atob(model.photo.slice(0, 12));
          let mimeType = 'image/jpeg'; // default

          if (header.charCodeAt(0) === 0x89 && header.charCodeAt(1) === 0x50) {
            mimeType = 'image/png';
          } else if (header.charCodeAt(0) === 0xFF && header.charCodeAt(1) === 0xD8) {
            mimeType = 'image/jpeg';
          } else if (header.startsWith('GIF')) {
            mimeType = 'image/gif';
          } else if (header.startsWith('RIFF')) {
            mimeType = 'image/webp';
          }

          console.log(`Detected MIME type for ${model.model_name}:`, mimeType);

          // Create and validate the data URL
          const dataUrl = `data:${mimeType};base64,${model.photo}`;
          
          // Validate the image data
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              console.log(`Image validated successfully for ${model.model_name}`);
              resolve({ ...model, photo: dataUrl });
            };
            img.onerror = () => {
              console.error(`Invalid image data for ${model.model_name}`);
              resolve({ ...model, photo: null });
            };
            img.src = dataUrl;
          });

        } catch (error) {
          console.error(`Error processing image for model: ${model.model_name}`, error);
          return { ...model, photo: null };
        }
      }));

      console.log('Processed models data:', processedData.map(model => ({
        id: model.id,
        name: model.model_name,
        hasPhoto: !!model.photo
      })));

      setModels(processedData);
    } catch (err) {
      console.error('Error fetching models:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to convert BLOB to base64 image
  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return window.btoa(binary);
  };
  
  if (loading) {
    return (
      
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    
    <div>
       <Header className = "sticky top-0 z-50 container mx-auto px-4" />
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-4">
              <button 
                className="md:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="w-6 h-6" />
              </button>
              
            </div>  
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <input 
                type="text"
                placeholder="Search products..."
                className="w-full py-2 px-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* Categories */}
          <div className="hidden md:flex items-center space-x-8 py-3 border-t">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-3'
                    : 'text-gray-700 hover:text-blue-600 pb-3'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowMobileMenu(false);
                  }}
                  className={`text-sm font-medium p-2 rounded ${
                    selectedCategory === category
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="relative h-64 ">
          {bannerSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="relative h-full">
                <img 
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-amber-500 bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-black">
                    <h2 className="text-3xl md:text-5xl font-bold mb-2">{slide.title}</h2>
                    <p className="text-lg md:text-xl">{slide.subtitle}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Slider Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-black' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>
      
    <div>
    <div>
      
    {/* Header Section with Filters */}
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="text-2xl font-bold text-gray-800">
          {selectedCategory === 'All' ? 'All Products' : selectedCategory}
          <span className="ml-2 text-lg font-normal text-gray-500">
            ({selectedCategory === 'All' ? models.length : models.filter(model => model.category === selectedCategory).length} items)
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
            <span>Sort</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>

    {/* Enhanced Product Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {(selectedCategory === 'All' ? models : models.filter(model => model.category === selectedCategory)).map((model) => (
        <div 
          key={model.id} 
          className="group bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
        >
          {/* Image Container */}
          <div className="relative h-56 overflow-hidden">
            {model.photo ? (
              <img
                key={`${model.id}-${model.photo.substring(0, 100)}`}
                src={model.photo}
                alt={model.model_name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  console.error('Image load error for:', model.model_name, {
                    modelId: model.id,
                    photoStart: model.photo.substring(0, 100)
                  });
                  if (e.target.parentNode) {
                    const placeholder = e.target.nextElementSibling;
                    if (placeholder) {
                      e.target.style.display = 'none';
                      placeholder.style.display = 'flex';
                    }
                  }
                }}
                onLoad={(e) => {
                  console.log('Image loaded successfully:', {
                    name: model.model_name,
                    naturalWidth: e.target.naturalWidth,
                    naturalHeight: e.target.naturalHeight
                  });
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-white rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <span className="text-gray-500 text-sm">Product Image</span>
                </div>
              </div>
            )}
            
            {/* Hover Overlay */}
            <div>
              <div>
                <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-200">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-200">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <span className="bg-white bg-opacity-90 text-gray-700 text-xs font-medium px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
                {model.category}
              </span>
            </div>
          </div>
          
          {/* Card Content */}
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
              {model.model_name}
            </h3>
            
            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <svg
                    key={index}
                    className={`w-4 h-4 ${
                      index < parseInt(model.rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-500 ml-2 text-sm font-medium">({model.rating}.0)</span>
            </div>
            
            {/* Price and Cart */}
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900">
                ${model.price}
              </span>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const productData = {
                    id: model.id,
                    name: model.model_name,
                    price: model.price,
                    image: model.photo || '',
                    category: model.category
                  };
                  const success = addToCart(productData);
                  if (success) {
                    // Show success feedback
                    alert(`Added ${model.model_name} to cart!`);
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 0L6 4H4m3 9a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Load More Button */}
    <div className="text-center mt-12">
      <button className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl">
        Load More Products
      </button>
    </div>
  </div>
</div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ShopHub</h3>
              <p className="text-gray-400 mb-4">Your one-stop destination for all shopping needs.</p>
              <div className="flex space-x-4">
                <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">f</button>
                <button className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">t</button>
                <button className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors">i</button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Electronics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Fashion</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Home & Kitchen</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sports</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <p className="text-gray-400 mb-4">Subscribe for exclusive offers and updates.</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-l-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
                />
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 rounded-r-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ShopHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EcommerceWebsite;