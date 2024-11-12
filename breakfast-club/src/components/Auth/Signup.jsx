import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../../App.css';

const Signup = ({setAuth}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!username || !password) {
      setMessage("Username and password cannot be empty.");
      return;
    }

    try {
      const response = await axios.post(
        `http://45.56.112.26:6969/register`,
        {
          username,
          password,
        },
     
        
      );
      if (response.data.message === "User registered successfully") {
        setMessage("Registration successful! Logging you in...");
        // Log in the user automatically after successful signup
        setAuth(true);
        navigate("/meal-planner");
      } else {
        setMessage("Username already exists or failed to register.");
      }
    } catch (error) {
      console.error("Error registering user:", error);
      setMessage("Username already exists or failed to register.");
    }
  };

  return (
    <div className="container bg-white rounded-4 p-3 shadow-lg">
      <h2 className="fw-bold">Sign Up</h2>
      <p >Don't have an account? <span className="fw-semibold text-warning point" onClick={
            () => navigate("/login")
        }>Log in</span></p>
      <div className="d-flex flex-column">
        <input
          className="form-control"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          className="form-control"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button
          className="btn btn-warning"
          onClick={handleSignup}
        >
          Sign Up
        </button>
      </div>
      {message && <div style={{ color: "red", marginTop: "10px" }}>{message}</div>}
    </div>
  );
};

export default Signup;
