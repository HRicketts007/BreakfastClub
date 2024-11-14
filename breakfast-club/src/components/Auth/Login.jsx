import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ setAuth }) => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async () => {
    if (!formData.identifier || !formData.password) {
      setMessage("Email/Username and password cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `http://45.56.112.26:6969/auth/login`,
        formData
      );

      if (response.data.status === "success") {
        // Store the token
        localStorage.setItem("token", response.data.id_token);
        setAuth(true);
        setMessage("Login successful!");
        navigate("/meal-planner");
      } else {
        setMessage(response.data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container bg-white rounded-4 p-3 shadow-lg">
      <h2 className="fw-bold">Log In</h2>
      <p>Don't have an account? <span className="fw-semibold text-warning point" onClick={() => navigate("/signup")}>Sign up</span></p>
      <div className="d-flex flex-column">
        <input
          className="form-control mb-2"
          type="text"
          name="identifier"
          placeholder="Email or Username"
          value={formData.identifier}
          onChange={handleChange}
        />
        <input
          className="form-control mb-3"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        <button
          className="btn btn-warning"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <div className="d-flex align-items-center justify-content-center">
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              Logging in...
            </div>
          ) : (
            "Log In"
          )}
        </button>
      </div>
      {message && (
        <div className={`mt-3 text-${message.includes("successful") ? "success" : "danger"}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default Login;
