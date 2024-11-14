import React, {useEffect} from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";


const Nav = ({ auth, setAuth }) => {
  const navigate = useNavigate();

  const openGenerate = () => {


    // localStorage.removeItem('currentMealPlan');
    navigate("/meal-planner")
  };

 

  //logout
  const handleLogout = async () => {
    try {
      const response = await axios.get("http://45.56.112.26:6969/logout", {
        withCredentials: true, // Include credentials in the request
      });
      setAuth(false);
      localStorage.removeItem("isAuthenticated");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      // Still logout on frontend even if backend fails
      setAuth(false);
      localStorage.removeItem("isAuthenticated");
      navigate("/login");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg bg-warning">
      <div className="container-fluid d-flex justify-content-between w-100">
        <h3 className="navbar-brand fw-bold mb-0 " >The Breakfast Club</h3>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end " id="navbarNav">
          <ul class="navbar-nav d-flex align-items-center gap-3">
        
           
          
            <li class="nav-item">
               <Link className="text-decoration-none text-dark" to="/my-meals">My Meals</Link>
            </li>
          
            <li class="nav-item">
               <Link className="text-decoration-none text-dark" to="/grocery-list">Grocery List</Link>
            </li>
            <li class="nav-item">
               <Link className="btn btn-dark text-decoration-none text-light" to="/meal-planner" onClick={openGenerate} >Create +</Link>
            </li>
            {auth && (
              <li class="nav-item">
                <button className="btn btn-outline-dark" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
