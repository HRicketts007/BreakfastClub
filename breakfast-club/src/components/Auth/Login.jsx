import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ setAuth }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setMessage("Username and password cannot be empty.");
      return;
    }

    try {
      const response = await axios.post(
        `http://45.56.112.26:6969/login`,
        {
          username,
          password,
        },
      );
      if (response.data.status === "success") {
        setAuth(true);
        setMessage("Login successful!");
        navigate("/meal-planner");
      } else {
        setMessage("Invalid username or password.");
      }
    } catch (error) {
      setMessage("Invalid username or password.");
    }
  };

  return (
    <div className="container bg-white rounded-4 p-3 shadow-lg">
      <h2 className="fw-bold">Log In</h2>
        <p >Don't have an account? <span className="fw-semibold text-warning point" onClick={
            () => navigate("/signup")
        }>Sign up</span></p>
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
          onClick={handleLogin}
        >
          Log In
        </button>
      
      </div>
      {message && <div style={{ color: "red", marginTop: "10px" }}>{message}</div>}
    </div>
  );
};

export default Login;
