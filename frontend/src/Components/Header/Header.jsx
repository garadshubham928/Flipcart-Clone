import {Link} from "react-router-dom"
import {  ShoppingCart, User } from 'lucide-react';


function Header() {
  return (
    <>
        <nav className="bg-blue-300 text-white flex justify-between items-center px-10 py-3 shadow-md sticky top-0 z-50">
        <div className="text-sm font-medium"><div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ShopHub
              </div></div>
        <div className="flex gap-6">
         <Link to="/Home" className="text-orange-600 font-medium ">
                            <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
                                           <span className="hidden md:block">Home</span>
                            </button>
                         </Link>
         <Link to="/Templet" className="text-orange-600 font-medium ">
                            <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
                                           <span className="hidden md:block">Plots</span>
                            </button>
                         </Link>
           <Link to="/Admin" className="text-orange-600 font-medium ">
                            <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
                                           <span className="hidden md:block">Admin Section</span>
                            </button>
                         </Link>
          <Link to="/OrdersManagement" className="text-orange-600 font-medium ">
                           <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
                                          <span className="hidden md:block">Order Dashbord</span>
                           </button>
                        </Link>
          <Link to="/Userdeatils" className="text-orange-600 font-medium ">
                           <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
                          <User className="w-5 h-5" />
                          <span className="hidden md:block">Account</span>
                           </button>
                        </Link>
          <Link to="/Addtocart" className="relative flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden md:block">Cart</span>
          </Link>
        </div>
      </nav>
     
    </>
  )
}

export default Header