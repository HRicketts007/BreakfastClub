import React, {  useState } from "react";
import axios from "axios";

const MealPlanner = () => {
  const [caloricIntake, setCaloricIntake] = useState("");
  const [servings, setServings] = useState("");
  const [mealPlan, setMealPlan] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedSummaries, setExpandedSummaries] = useState({});


  //generate meal plan for day
  const generateDay = async () => {
    //validate inputs
    if (caloricIntake <= 0 || servings <= 0) {
      setError(
        "Daily Caloric Intake and Servings Per Day must be greater than zero."
      );
      return;
    }
    //reset error & loading
    setError("");
    setLoading(true);

    //api call to get meal plans by day
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/Generate_Day`,
        {
          params: {
        DailyCaloricIntake: caloricIntake,
        ServingsPerDay: servings,
          },
        }
      );
      //set meal plan in state
      setMealPlan(response.data.meal_plan);
      console.log(response.data.meal_plan);
    } catch (error) {
      //handle error
      console.error("Error generating meal plan:", error);
      setError("Failed to generate meal plan. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  //format html content to plain text
  const formatData = (htmlContent) => {
    const temp = document.createElement("div");
    temp.innerHTML = htmlContent;
    return temp.textContent || temp.innerText || "";
  };

  //show recipe description
  const toggleSummary = (index) => {
    setExpandedSummaries((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  return (
    <>
      <div className="container bg-white rounded-4 p-3 shadow-lg">

        <h2 className="fw-bold">Meal Planner</h2>
        <p>Input your calorie goals and target servings per day</p>
        <div className="d-flex flex-column ">
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
          <button className="btn btn-warning d-flex flex-row justify-content-center align-items-center" style={{height: "50px"}} onClick={generateDay}>
          {loading ?  (
        <div className="text-center text-white my-3">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : "Generate Meal Plan"}
          </button>
        </div>
        {/* display error */}
        {error && (
          <div style={{ color: "red", marginTop: "10px" }}>{error}</div>
        )}
      </div>


      {/* display meal plan */}
      {mealPlan && (
        <>
          <br />
          <div className="container bg-white rounded-4 p-3 shadow-lg ">
            <h3>Your Meal Plan for the Day</h3>

            <div className="row">
              {/* display each recipe */}
              {Object.keys(mealPlan).map((key, index) => {
                const recipe = mealPlan[key]?.Information;
                const instructions = mealPlan[key]?.Instructions;
                const nutrition = mealPlan[key]?.Nutrition;
                if (recipe ) {
                  const summary = formatData(recipe.summary);
                  const isExpanded = expandedSummaries[index];
                  const truncatedSummary = summary.slice(0, 100);
                  console.log(recipe)
                  // console.log(instructions)
                  console.log(nutrition)

                  return (
                    <div className="col mb-4" key={index}>
                      <div className="card h-100" style={{ width: "18rem" }}>
                      <img src={recipe.image} className="card-img-top" alt="Recipe Img"/>
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
                            Calories: {nutrition.calories} | Protein:
                            {nutrition.protein} | Fat: {nutrition.fat} | Carbs: {nutrition.carbs}
                          </p>
                          <div className="mt-auto">
                            <button className="btn btn-warning">View Recipe</button>
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
