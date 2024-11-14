import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import MealPlanner from "./containers/MealPlanner";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";

import RecipePage from "./containers/RecipePage";
import Nav from "./components/Nav";
import MyMeals from "./containers/MyMeals";
import GroceryList from "./containers/GroceryList";
import { isAuthenticated } from './utils/auth';

function App() {
  const [auth, setAuth] = useState(() => isAuthenticated());
  
  const handleAuth = (authStatus) => {
    setAuth(authStatus);
    localStorage.setItem('isAuthenticated', authStatus);
  };

  return (
    <Router>
      <Nav setAuth={handleAuth} auth={auth} />
      <div className="container d-flex flex-column justify-content-center align-items-center p-5">
        <Routes>
          <Route path="/signup" element={<Signup setAuth={handleAuth} />} />
          <Route path="/login" element={<Login setAuth={handleAuth} />} />
          <Route
            path="/meal-planner"
            element={auth ? <MealPlanner /> : <Navigate to="/login" />}
          />
          <Route
            path="/recipe"
            element={auth ? <RecipePage /> : <Navigate to="/login" />}
          />
           <Route
            path="/my-meals"
            element={auth ? <MyMeals /> : <Navigate to="/login" />}
          />
           <Route
            path="/grocery-list"
            element={auth ? <GroceryList /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to="/meal-planner" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
