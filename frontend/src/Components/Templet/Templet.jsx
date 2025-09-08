// src/pages/ChartsPage.jsx
import React from "react";

// Assume you already have a <Card /> component for charts
import Plots from '../Plots/Plots';
import Plots2 from '../Plots/Plots2'
import Header from '../Header/Header';
import Footer from '../Footer/Footer';


const Templet = () => {
  return (
    <div >
     <Header />
      <h1 className="text-2xl font-bold mb-6 text-center">Charts Dashboard</h1>

      {/* Grid layout for 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-md p-4">
          <Plots />
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4">
          <Plots2 />
        </div>
       
      </div>
      <Footer />
    </div>
  );
};

export default Templet;
