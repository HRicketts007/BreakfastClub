import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../../App.css';

const Signup = ({setAuth}) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    firstName: "",
    lastName: ""
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async () => {
    // Validate all required fields
    if (!formData.email || !formData.password || !formData.username || !formData.firstName || !formData.lastName) {
      setMessage("All fields are required");
      return;
    }

    try {
      const response = await axios.post(
        `http://45.56.112.26:6969/auth/register`,
        formData
      );

      if (response.data.status === "success") {
        setMessage("Registration successful! Logging you in...");
        
        // Automatically log in the user
        const loginResponse = await axios.post(
          `http://45.56.112.26:6969/auth/login`,
          {
            identifier: formData.email,
            password: formData.password
          }
        );

        if (loginResponse.data.status === "success") {
          // Store the token
          localStorage.setItem("token", loginResponse.data.id_token);
          setAuth(true);
          navigate("/meal-planner");
        }
      }
    } catch (error) {
      console.error("Error registering user:", error);
      setMessage(error.response?.data?.message || "Failed to register. Please try again.");
    }
  };

  return (
    <div className="container bg-white rounded-4 p-3 shadow-lg">
      <h2 className="fw-bold">Sign Up</h2>
      <p>Already have an account? <span className="fw-semibold text-warning point" onClick={() => navigate("/login")}>Log in</span></p>
      <div className="d-flex flex-column">
        <input
          className="form-control mb-2"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          className="form-control mb-2"
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        />
        <input
          className="form-control mb-2"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        <input
          className="form-control mb-2"
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
        />
        <input
          className="form-control mb-2"
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
        />
        <button
          className="btn btn-warning"
          onClick={handleSignup}
        >
          Sign Up
        </button>
      </div>
      {message && <div className={`mt-3 text-${message.includes("successful") ? "success" : "danger"}`}>{message}</div>}
    </div>
  );
};

export default Signup;
