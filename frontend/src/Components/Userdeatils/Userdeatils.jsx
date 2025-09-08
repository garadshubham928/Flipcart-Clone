import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

function Userdeatils() {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || !userId) {
      navigate('/login');
      return;
    }

    fetchUserDetails(userId);
  }, [navigate]);

  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/userinfo/${userId}`);
      const data = await response.json();
      
      
      if (response.ok && data.user) {
        setUserDetails(data.user);
      } else {
        console.error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };
 

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div >
      <Header />
      <br/>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">User Profile</h2>
        
        {userDetails ? (
          <div className="space-y-4">
            <div className="border-b pb-4">
              <label className="block text-gray-700 font-bold mb-2">Name:</label>
              <p className="text-gray-600">{userDetails.Name || 'Not available'}</p>
            </div>
            
            <div className="border-b pb-4">
              <label className="block text-gray-700 font-bold mb-2">Email:</label>
              <p className="text-gray-600">{userDetails.Email}</p>
            </div>
            
            <div className="border-b pb-4">
              <label className="block text-gray-700 font-bold mb-2">City:</label>
              <p className="text-gray-600">{userDetails.City || 'Not available'}</p>
            </div>
            
            <div className="border-b pb-4">
              <label className="block text-gray-700 font-bold mb-2">Mobile Number:</label>
              <p className="text-gray-600">{userDetails.Mobilenumber || 'Not available'}</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600">No user details available</p>
        )}
        
        <div className="flex justify-between mt-8">
          <button
            onClick={() => navigate('/home')}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
          >
            Back to Home
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Userdeatils;
