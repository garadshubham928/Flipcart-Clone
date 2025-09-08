import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {BrowserRouter, Routes,Route,Link} from 'react-router-dom'
import Registration from './Components/Registration/Registration'
import Login from './Components/Login/Login'
import Home from './Components/Home/Home'
import Userdeatils from './Components/Userdeatils/Userdeatils'
import Addtocart from './Components/Addtocart/Addtocart'
import OrdersManagement from './Components/OrdersManagement/OrdersManagement'
import Admin from './Components/Admin/Admin'
import Header from './Components/Header/Header'
import Footer from'./Components/Footer/Footer'
import Templet from './Components/Templet/Templet'

function App() {
  
return (
  <>
  <div className = "App-continar">
    <BrowserRouter>
       <Routes>
            <Route path="/" element={<Registration />} /> 
            <Route path="/login" element={<Login />} />
            <Route path="/Registration" element={<Registration />} />
            <Route path = "/Home" element ={<Home />} />
            <Route path = "/Userdeatils" element ={<Userdeatils />} />
            <Route path = "/Addtocart" element={<Addtocart />} />
            <Route path = "/OrdersManagement" element={<OrdersManagement />} />
            <Route path = "/Admin" element={<Admin />} />
            <Route path = "/Header" element={<Header />} />
            <Route path = "/Footer" element={<Footer />} />
            <Route path = "/Templet" element={<Templet />} />
       </Routes>
    </BrowserRouter>
  </div>
  </>
)
}

export default App
