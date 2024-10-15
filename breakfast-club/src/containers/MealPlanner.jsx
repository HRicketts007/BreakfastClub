import React, { useState } from "react";
import axios from "axios";

const MealPlanner = () => {
  const [caloricIntake, setCaloricIntake] = useState("");
  const [servings, setServings] = useState("");
  const [mealPlan, setMealPlan] = useState(null);
  const [error, setError] = useState("");

  // Function to generate a meal plan for the day
  const generateDay = async () => {
    //check input
    if (caloricIntake <= 0 || servings <= 0) {
      setError(
        "Daily Caloric Intake and Servings Per Day must be greater than zero."
      );
      return;
    }
    //reset error
    setError("");

    // Call the API to generate the meal plan
    try {
      const response = await axios.get(
        "http://194.195.210.118:5000/Generate_Day",
        {
          params: {
            DailyCaloricIntake: caloricIntake,
            ServingsPerDay: servings,
          },
        }
      );
      // Set the meal plan in the state
      setMealPlan(response.data.meal_plan);
    } catch (error) {
      // Log the error and set the error message in the state
      console.error("Error generating meal plan:", error);
      setError("Failed to generate meal plan. Please try again later.");
    }
  };

  return (
    <div>
      <input
        type="number"
        placeholder="Caloric Intake"
        value={caloricIntake}
        onChange={(e) => setCaloricIntake(e.target.value)}
      />
      <br />
      <input
        type="number"
        placeholder="Servings Per Day"
        value={servings}
        onChange={(e) => setServings(e.target.value)}
      />
      <br />
      <button onClick={generateDay}>Generate Meal Plan</button>
      {/* display error */}
      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
      {/* display meal plan */}
      {mealPlan && (
        <div>
          <h3>Your Meal Plan for the Day</h3>
          <ul>
            {Object.keys(mealPlan).map((key, index) => (
              <li key={index}>
                <h4>{mealPlan[key]?.Information?.title}</h4>
                <p>{mealPlan[key]?.Information?.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;
