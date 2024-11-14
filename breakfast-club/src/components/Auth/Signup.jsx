import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
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

  const handleSignup = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      setMessage("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `http://45.56.112.26:6969/auth/signup`,
        formData
      );

      if (response.data.status === "success") {
        setMessage("Signup successful! Please log in.");
        navigate("/login");
      } else {
        setMessage(response.data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setMessage(error.response?.data?.message || "Signup failed");
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
              <h2 className="fw-bold mb-3 text-center">Sign Up</h2>
              <p className="text-center">
                Already have an account?{" "}
                <span
                  className="fw-semibold text-warning point"
                  onClick={() => navigate("/login")}
                  style={{ cursor: "pointer" }}
                >
                  Log in
                </span>
              </p>
              <div className="d-flex flex-column">
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
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
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
                  onClick={handleSignup}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="d-flex align-items-center justify-content-center">
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Signing up...
                    </div>
                  ) : (
                    "Sign Up"
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

export default Signup;
