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

  //handle input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  //login func
  const handleLogin = async () => {
    //check inputs
    if (!formData.identifier || !formData.password) {
      setMessage("Email/Username and password cannot be empty.");
      return;
    }

    setLoading(true);
    
    //login endpoint
    try {
      const response = await axios.post(
        `http://45.56.112.26:6969/auth/login`,
        formData
      );
      
      if (response.data.status === "success") {
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
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-4">
              <h2 className="fw-bold mb-3 text-center">Log In</h2>
              <p className="text-center">
                Don't have an account?{" "}
                <span
                  className="fw-semibold text-warning point"
                  onClick={() => navigate("/signup")}
                  style={{ cursor: "pointer" }}
                >
                  Sign up
                </span>
              </p>
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
                  className="btn btn-warning w-100"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
