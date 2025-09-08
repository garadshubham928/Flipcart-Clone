// src/Components/Registration.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Registration() {
  const navigate = useNavigate();

  const [Form, setForm] = useState({
    Name: "",
    Email: "",
    City: "",
    Mobilenumber: "",
    Password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/api/userinfo/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Form),
      });

      if (response.ok) {
        alert("Registration successful!");
        resetForm();
        navigate("/Login");
      } else {
        alert("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please check your backend connection.");
    }
  };

  const resetForm = () => {
    setForm({
      Name: "",
      Email: "",
      City: "",
      Mobilenumber: "",
      Password: "",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-[900px] h-[600px] bg-white rounded-2xl shadow-xl flex overflow-hidden">
        
        {/* Left Section */}
        <div className="w-1/2 bg-gradient-to-b from-orange-500 to-orange-700 text-white flex flex-col justify-center items-start p-10">
          <h2 className="text-3xl font-bold mb-4">
            Simplify management with our dashboard.
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Simplify your e-commerce management with our user-friendly admin dashboard.
          </p>
          <img
            src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
            alt="Illustration"
            className="w-48"
          />
        </div>

        {/* Right Section */}
        <div className="w-1/2 flex flex-col justify-center px-12">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Please sign up for your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              placeholder="Full Name"
              value={Form.Name}
              onChange={(e) => setForm({ ...Form, Name: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={Form.Email}
              onChange={(e) => setForm({ ...Form, Email: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />

            <input
              type="text"
              placeholder="City"
              value={Form.City}
              onChange={(e) => setForm({ ...Form, City: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />

            <input
              type="text"
              placeholder="Mobile Number"
              value={Form.Mobilenumber}
              onChange={(e) => setForm({ ...Form, Mobilenumber: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={Form.Password}
              onChange={(e) => setForm({ ...Form, Password: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Sign Up
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">
              Already have an account?{" "}
              <Link to="/Login" className="text-orange-600 font-medium">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
