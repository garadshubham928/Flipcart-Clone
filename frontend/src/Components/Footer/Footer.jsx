import React from 'react'

import { Search, ShoppingCart, User, Menu, Star, Heart, Filter, ChevronDown } from 'lucide-react';
import {Link} from "react-router-dom"

function Footer() {
  return (
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
  )
}

export default Footer