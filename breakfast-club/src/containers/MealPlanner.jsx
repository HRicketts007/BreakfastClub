import React, { useEffect, useState } from "react";
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

  // Load user's last meal plan
  useEffect(() => {
    const fetchLastMealPlan = async () => {
      try {
        const response = await axios.get('http://45.56.112.26:6969/user/meal_plans');
        if (response.data.meal_plans?.length > 0) {
          const lastPlan = response.data.meal_plans[0]; // Get most recent plan
          setMealPlan(lastPlan.plan);
          setPlanType(lastPlan.type);
          setCaloricIntake(lastPlan.caloricIntake);
          setServings(lastPlan.servings);
        }
      } catch (error) {
        console.error("Error fetching last meal plan:", error);
      }
    };

    fetchLastMealPlan();
  }, []);

  // Generate meal plan
  const generateMealPlan = async () => {
    if (caloricIntake <= 0 || servings <= 0) {
      setError("Daily Caloric Intake and Servings Per Day must be greater than zero.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const endpoint = planType === "day" ? "/Generate_Day" : "/Generate_Week";
      const response = await axios.get(`http://45.56.112.26:6969${endpoint}`, {
        params: {
          DailyCaloricIntake: caloricIntake,
          ServingsPerDay: servings,
        }
      });

      setMealPlan(response.data.meal_plan);
    } catch (error) {
      console.error("Error generating meal plan:", error);
      setError("Failed to generate meal plan. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  //format HTML to plain text
  const formatData = (htmlContent) => {
    const temp = document.createElement("div");
    temp.innerHTML = htmlContent;
    return temp.textContent || temp.innerText || "";
  };

  //show desc
  const toggleSummary = (index) => {
    setExpandedSummaries((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  //navigate to recipe page
  const viewRecipe = (
    recipe,
    nutrition,
    instructions,
    ingredients,
    mealPlanId
  ) => {
    //format ingredients list
    const formattedIngredients =
      ingredients?.ingredients
        ?.map((ing) => {
          const amount = ing.amount?.us?.value || "";
          const unit = ing.amount?.us?.unit || "";
          const name = ing.name || "";
          return `${amount} ${unit} ${name}`.trim();
        })
        .filter((ing) => ing) || [];

    navigate("/recipe", {
      state: {
        recipe,
        nutrition,
        instructions,
        ingredients: formattedIngredients,
        mealPlanId,
      },
    });
  };

  return (
    <>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-body p-4 p-md-5">
                <h2 className="card-title fw-bold mb-4 text-center">
                  Generate Your Meal Plan
                </h2>
                <p className="text-muted text-center mb-4">
                  Set your goals, select your dietary preferences, and let us do
                  the rest! Create a daily or weekly meal plan in seconds.
                </p>

                <form className="needs-validation" noValidate>
                  <div className="mb-4">
                    <select
                      className="form-select form-select-lg"
                      value={planType}
                      onChange={(e) => setPlanType(e.target.value)}
                    >
                      <option value="day">Daily Plan</option>
                      <option value="week">Weekly Plan</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <input
                      className="form-control form-control-lg"
                      type="number"
                      placeholder="Daily Caloric Intake"
                      value={caloricIntake}
                      onChange={(e) => setCaloricIntake(e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <input
                      className="form-control form-control-lg"
                      type="number"
                      placeholder="Servings Per Day"
                      value={servings}
                      onChange={(e) => setServings(e.target.value)}
                    />
                  </div>

                  <button
                    className="btn btn-warning btn-lg w-100 text-white fw-bold"
                    disabled={loading}
                    onClick={generateMealPlan}
                    type="button"
                  >
                    {loading ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        />
                        Generating...
                      </div>
                    ) : (
                      "Generate Meal Plan"
                    )}
                  </button>
                </form>

                {error && (
                  <div className="alert alert-danger mt-4 mb-0" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Display meal plan */}
      {mealPlan && (
        <div className="container py-5">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8 text-center">
              <h3 className="fw-bold mb-4">
                Your Meal Plan for the {planType === "day" ? "Day" : "Week"}
              </h3>
            </div>
          </div>

          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {Object.keys(mealPlan).map((key, index) => {
              const recipe = mealPlan[key]?.Information;
              const nutrition = mealPlan[key]?.Nutrition;
              const ingredients = mealPlan[key]?.Ingredients;
              const instructions = recipe?.instructions;

              if (recipe) {
                const summary = formatData(recipe.summary);
                const isExpanded = expandedSummaries[index];
                const truncatedSummary = summary.slice(0, 100);

                return (
                  <div className="col" key={index}>
                    <div className="card h-100 border-0 shadow-sm hover-shadow-lg transition-all">
                      <img
                        src={recipe.image}
                        className="card-img-top object-fit-cover"
                        style={{ height: "200px" }}
                        alt={recipe.title}
                      />
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title fw-bold mb-3">
                          {recipe.title}
                        </h5>

                        <p className="card-text text-muted small">
                          {isExpanded ? summary : `${truncatedSummary}...`}
                          {summary.length > 100 && (
                            <button
                              className="btn btn-link btn-sm p-0 ms-1"
                              onClick={() => toggleSummary(index)}
                            >
                              {isExpanded ? "View Less" : "View More"}
                            </button>
                          )}
                        </p>

                        <div className="d-flex justify-content-between mb-3 text-muted small">
                          <span>
                            <i className="bi bi-people me-1"></i>
                            Serves: {recipe.servings}
                          </span>
                          <span>
                            <i className="bi bi-clock me-1"></i>
                            {recipe.readyInMinutes} min
                          </span>
                        </div>

                        <div className="nutrition-info p-3 bg-light rounded-3 mb-3 small">
                          <div className="row row-cols-2 g-2">
                            <div className="col">
                              Calories: {nutrition.calories}
                            </div>
                            <div className="col">
                              Protein: {nutrition.protein}
                            </div>
                            <div className="col">Fat: {nutrition.fat}</div>
                            <div className="col">Carbs: {nutrition.carbs}</div>
                          </div>
                        </div>

                        <button
                          className="btn btn-warning mt-auto w-100"
                          onClick={() =>
                            viewRecipe(
                              recipe,
                              nutrition,
                              instructions,
                              ingredients,
                              recipe.id
                            )
                          }
                        >
                          <i className="bi bi-arrow-right-circle me-2"></i>
                          View Recipe
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default MealPlanner;
