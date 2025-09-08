// src/Components/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/api/userinfo/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email, Password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('isLoggedIn', 'true');
        navigate("/Home");
      } else {
        setError("Wrong credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again later.");
    }
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
            Manage your account and access all features easily from one place.
          </p>
          <img
            src="https://cdn-icons-png.flaticon.com/512/2910/2910768.png"
            alt="Illustration"
            className="w-48"
          />
        </div>

        {/* Right Section */}
        <div className="w-1/2 flex flex-col justify-center px-12">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-center mb-6">
            Please log in to your account
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="email"
              value={Email}
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <input
              type="password"
              value={Password}
              required
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            {error && (
              <p className="text-red-500 text-sm font-medium text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Login
            </button>

            {/* Social Login Buttons */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                type="button"
                className="flex items-center gap-2 border rounded-lg px-4 py-2 w-full justify-center hover:bg-gray-100 transition"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/300/300221.png"
                  alt="Google"
                  className="w-5 h-5"
                />
                Google
              </button>
              <button
                type="button"
                className="flex items-center gap-2 border rounded-lg px-4 py-2 w-full justify-center hover:bg-gray-100 transition"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png"
                  alt="Facebook"
                  className="w-5 h-5"
                />
                Facebook
              </button>
            </div>

            <p className="text-center text-gray-500 text-sm mt-4">
              Don’t have an account?{" "}
              <Link to="/Registration" className="text-orange-600 font-medium">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

