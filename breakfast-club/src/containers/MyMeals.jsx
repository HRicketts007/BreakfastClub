import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyMeals = () => {
  const [savedMealPlans, setSavedMealPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [expandedSummaries, setExpandedSummaries] = useState({});

  const formatData = (htmlContent) => {
    const temp = document.createElement("div");
    temp.innerHTML = htmlContent;
    return temp.textContent || temp.innerText || "";
  };

  const toggleSummary = (index) => {
    setExpandedSummaries((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  // Fetch all meal plans
  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        const response = await axios.get('http://45.56.112.26:6969/user/meal_plans');
        if (response.data.status === 'success') {
          setSavedMealPlans(response.data.meal_plans);
        }
      } catch (error) {
        console.error("Error fetching meal plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlans();
  }, []);

  const viewMealPlan = async (planId) => {
    try {
      const response = await axios.get(`http://45.56.112.26:6969/Get_Meal_Plan/${planId}`);
      if (response.data.status === 'success') {
        setCurrentPlan(response.data.meal_plan);
      }
    } catch (error) {
      console.error("Error fetching meal plan:", error);
    }
  };

  const viewRecipe = (recipe, nutrition, instructions, ingredients) => {
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
      },
    });
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">My Saved Meal Plans</h2>

      {savedMealPlans.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          You haven't saved any meal plans yet. Generate a meal plan to get started!
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {savedMealPlans.map((plan, index) => (
            <div className="col" key={plan.id}>
              <div className="card h-100 border-0 shadow-sm hover-shadow-lg transition-all">
                <div className="card-body">
                  <h5 className="card-title fw-bold mb-3">
                    {plan.type === "day" ? "Daily" : "Weekly"} Meal Plan
                  </h5>
                  <div className="mb-3 text-muted small">
                    <p className="mb-1">
                      <i className="bi bi-calendar me-2"></i>
                      {formatDateTime(plan.created_at)}
                    </p>
                  </div>
                  <button
                    className="btn btn-warning w-100"
                    onClick={() => viewMealPlan(plan.id)}
                  >
                    <i className="bi bi-eye me-2"></i>
                    View Plan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentPlan && (
        <div className="mt-5">
          <h3 className="fw-bold mb-4">
            {currentPlan.type === "day" ? "Daily" : "Weekly"} Meal Plan Details
          </h3>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {Object.entries(currentPlan.plan).map(([key, mealData], index) => {
              // Skip the totalCaloriesPerDiem key
              if (key === 'totalCaloriesPerDiem') return null;

              const recipe = mealData.Information;
              const nutrition = mealData.Nutrition;
              const ingredients = mealData.Ingredients;
              const instructions = recipe?.instructions;

              if (!recipe) return null;

              const summary = formatData(recipe.summary || '');
              const isExpanded = expandedSummaries[index];
              const truncatedSummary = summary.slice(0, 100);

              return (
                <div className="col" key={`${currentPlan.id}-${index}`}>
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
                            ingredients
                          )
                        }
                      >
                        View Recipe <i className="bi bi-arrow-right-circle ms-2"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMeals;
