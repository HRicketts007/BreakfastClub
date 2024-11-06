import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import MealPlanner from "./containers/MealPlanner";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Nav from "./components/Util/Nav";

function App() {
  const [auth, setAuth] = useState(false);

  return (
    <Router>
      <Nav />
      <div className="container d-flex flex-column justify-content-center align-items-center p-5">
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login setAuth={setAuth} />} />
          <Route
            path="/meal-planner"
            element={auth ? <MealPlanner /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to="/meal-planner" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
