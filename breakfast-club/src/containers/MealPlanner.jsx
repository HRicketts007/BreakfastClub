import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MealPlanner = () => {
  const [caloricIntake, setCaloricIntake] = useState("");
  const [servings, setServings] = useState("");
  const [mealPlan, setMealPlan] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedSummaries, setExpandedSummaries] = useState({});
  const [planType, setPlanType] = useState("day");
  const navigate = useNavigate();

  // Generate meal plan
  const generateMealPlan = async () => {
    // Validate inputs
    if (caloricIntake <= 0 || servings <= 0) {
      setError(
        "Daily Caloric Intake and Servings Per Day must be greater than zero."
      );
      return;
    }
    // Reset error & loading
    setError("");
    setLoading(true);

    // API call to get meal plans
    try {
      const endpoint =
        planType === "day" ? "/Generate_Day" : "/Generate_Week";
      const response = await axios.get(`http://45.56.112.26:6969${endpoint}`, {
        params: {
          DailyCaloricIntake: caloricIntake,
          ServingsPerDay: servings,
        },
      });
      // Set meal plan in state
      setMealPlan(response.data.meal_plan);
      console.log(response.data.meal_plan);
    } catch (error) {
      // Handle error
      console.error("Error generating meal plan:", error);
      setError("Failed to generate meal plan. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Format HTML content to plain text
  const formatData = (htmlContent) => {
    const temp = document.createElement("div");
    temp.innerHTML = htmlContent;
    return temp.textContent || temp.innerText || "";
  };

  // Show recipe description
  const toggleSummary = (index) => {
    setExpandedSummaries((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  // Navigate to recipe page
  const viewRecipe = (recipe, nutrition, instructions, ingredients) => {
    const formattedIngredients = ingredients?.ingredients?.map(ing => 
      `${ing.amount.us.value} ${ing.amount.us.unit} ${ing.name}`
    ) || [];
    navigate("/recipe", {
      state: { recipe, nutrition, instructions, formattedIngredients },
    });
  };

  return (
    <>
      <div className="container bg-white rounded-4 p-3 shadow-lg">
        <h2 className="fw-bold">Generate Your Meal Plan</h2>
       
        <p>Set your goals, select your dietary preferences, and let us do the rest! Create a daily or weekly meal plan in seconds.</p>
        <div className="d-flex flex-column ">
          <select
            className="form-select mb-3"
            value={planType}
            onChange={(e) => setPlanType(e.target.value)}
          >
            <option value="day">Generate by Day</option>
            <option value="week">Generate by Week</option>
          </select>
          <input
            className="form-control"
            type="number"
            placeholder="Caloric Intake"
            value={caloricIntake}
            onChange={(e) => setCaloricIntake(e.target.value)}
          />
          <br />
          <input
            className="form-control"
            type="number"
            placeholder="Servings Per Day"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
          />
          <br />
          <button
            className="btn btn-warning d-flex flex-row justify-content-center align-items-center"
            style={{ height: "50px" }}
            disabled={loading}
            onClick={generateMealPlan}
          >
            {loading ? (
              <div className="text-center text-white my-3">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              "Generate Meal Plan"
            )}
          </button>
        </div>
        {/* Display error */}
        {error && <div className="alert alert-danger" style={{ color: "red", marginTop: "10px" }}>{error}</div>}
      </div>

      {/* Display meal plan */}
      {mealPlan && (
        <>
          <br />
          <div className="container bg-white rounded-4 p-3 shadow-lg ">
            <h3>Your Meal Plan for the {planType === "day" ? "Day" : "Week"}</h3>

            <div className="row row row-cols-1 row-cols-md-3 g-4">
              {/* Display each recipe */}
              {Object.keys(mealPlan).map((key, index) => {
                const recipe = mealPlan[key]?.Information;
                const nutrition = mealPlan[key]?.Nutrition;
                const ingredients =  mealPlan[key]?.Ingredients;
                const instructions = recipe?.instructions; 
               
                if (recipe) {
                  const summary = formatData(recipe.summary);
                  const isExpanded = expandedSummaries[index];
                  const truncatedSummary = summary.slice(0, 100);
                  
                  console.log(recipe)
                  console.log(instructions);
                  console.log(ingredients)
                

                  return (
                    <div className="col mb-4" key={index}>
                      <div className="card h-100" style={{ width: "18rem" }}>
                        <img
                          src={recipe.image}
                          className="card-img-top"
                          alt="Recipe Img"
                        />
                        <div className="card-body d-flex flex-column">
                          <h4>{recipe.title}</h4>
                          <p>
                            {isExpanded ? summary : `${truncatedSummary}...`}
                            {summary.length > 100 && (
                              <button
                                className="btn btn-link p-0"
                                onClick={() => toggleSummary(index)}
                              >
                                {isExpanded ? "View Less" : "View More"}
                              </button>
                            )}
                          </p>
                          <p>
                            Serves: {recipe.servings} | Prep Time: {" "}
                            {recipe.readyInMinutes} minutes
                          </p>
                          <p>
                            Calories: {nutrition.calories} | Protein: {nutrition.protein} | Fat: {nutrition.fat} | Carbs: {nutrition.carbs}
                          </p>
                          <div className="mt-auto">
                            <button 
                              className="btn btn-warning"
                              onClick={() => viewRecipe(recipe, nutrition, instructions, ingredients)}
                            >
                              View Recipe
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return null;
                }
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MealPlanner;
