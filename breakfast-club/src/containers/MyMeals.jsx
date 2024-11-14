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

  const renderMealCard = (recipe, nutrition, ingredients, instructions, dayIndex, mealIndex) => {
    if (!recipe) return null;

    const summary = formatData(recipe.summary || '');
    const isExpanded = expandedSummaries[`${dayIndex}-${mealIndex}`];
    const truncatedSummary = summary.slice(0, 100);

    return (
      <div className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="card h-100 border-0 shadow-sm hover-shadow-lg transition-all">
          <img
            src={recipe.image}
            className="card-img-top"
            style={{ height: "200px", objectFit: "cover" }}
            alt={recipe.title}
          />
          <div className="card-body d-flex flex-column gap-3">
            <h5 className="card-title fw-bold">{recipe.title}</h5>
            
            <p className="card-text small text-muted">
              {isExpanded ? summary : `${truncatedSummary}...`}
              {summary.length > 100 && (
                <button
                  className="btn btn-link btn-sm p-0 ms-1"
                  onClick={() => toggleSummary(`${dayIndex}-${mealIndex}`)}
                >
                  {isExpanded ? "Show Less" : "Show More"}
                </button>
              )}
            </p>

            <div className="d-flex justify-content-between text-muted small">
              <span>
                <i className="bi bi-people-fill me-1"></i>
                {recipe.servings} servings
              </span>
              <span>
                <i className="bi bi-clock-fill me-1"></i>
                {recipe.readyInMinutes} min
              </span>
            </div>

            <div className="bg-light rounded-3 p-3">
              <div className="row row-cols-2 g-2 text-center">
                <div className="col">
                  <div className="fw-bold text-warning mb-1">Calories</div>
                  <div className="small">{nutrition.calories}</div>
                </div>
                <div className="col">
                  <div className="fw-bold text-warning mb-1">Protein</div>
                  <div className="small">{nutrition.protein}</div>
                </div>
                <div className="col">
                  <div className="fw-bold text-warning mb-1">Fat</div>
                  <div className="small">{nutrition.fat}</div>
                </div>
                <div className="col">
                  <div className="fw-bold text-warning mb-1">Carbs</div>
                  <div className="small">{nutrition.carbs}</div>
                </div>
              </div>
            </div>

            <button
              className="btn btn-warning mt-auto w-100"
              onClick={() => viewRecipe(recipe, nutrition, instructions, ingredients)}
            >
              View Recipe
              <i className="bi bi-arrow-right-circle ms-2"></i>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentPlan = () => {
    if (!currentPlan) return null;

    const daysOfWeek = [
      'Sunday',
      'Monday', 
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];

    if (currentPlan.type === "day") {
      return (
        <div className="row">
          {Object.entries(currentPlan.plan).map(([key, mealData], index) => {
            if (key === 'totalCaloriesPerDiem') return null;
            return renderMealCard(
              mealData.Information,
              mealData.Nutrition,
              mealData.Ingredients,
              mealData.Information?.instructions,
              0,
              index
            );
          })}
        </div>
      );
    }

    return Object.entries(currentPlan.plan).map(([day, meals], dayIndex) => (
      <div key={dayIndex} className="mb-5">
        <div className="d-flex align-items-center gap-3 mb-4">
          <h4 className="mb-0 fw-bold text-warning">{daysOfWeek[dayIndex]}</h4>
          <div className="flex-grow-1">
            <div className="border-bottom border-warning opacity-50"></div>
          </div>
        </div>
        <div className="row">
          {Object.entries(meals).map(([mealKey, meal], mealIndex) => {
            if (mealKey === 'totalCaloriesPerDiem') return null;
            return renderMealCard(
              meal.Information,
              meal.Nutrition,
              meal.Ingredients,
              meal.Information?.instructions,
              dayIndex,
              mealIndex
            );
          })}
        </div>
      </div>
    ));
  };

  return (
    <div className="container-fluid py-5 px-4">
      <div className="row justify-content-center mb-5">
        <div className="col-12 col-lg-10">
          <h2 className="display-6 fw-bold mb-4">My Saved Meal Plans</h2>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : savedMealPlans.length === 0 ? (
            <div className="alert alert-warning d-flex align-items-center">
              <i className="bi bi-info-circle-fill me-2"></i>
              <div>You haven't saved any meal plans yet. Generate a meal plan to get started!</div>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-5">
              {savedMealPlans.map((plan) => (
                <div className="col" key={plan.id}>
                  <div className="card h-100 border-0 shadow-sm hover-shadow-lg transition-all">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title fw-bold mb-0">
                          {plan.type === "day" ? "Daily" : "Weekly"} Meal Plan
                        </h5>
                        <span className="badge bg-warning text-dark">
                          {plan.type === "day" ? "1 Day" : "7 Days"}
                        </span>
                      </div>
                      <p className="text-muted small mb-4">
                        <i className="bi bi-calendar-event me-2"></i>
                        {formatDateTime(plan.created_at)}
                      </p>
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
              <div className="d-flex align-items-center mb-4">
                <h3 className="display-6 fw-bold mb-0">
                  {currentPlan.type === "day" ? "Daily" : "Weekly"} Meal Plan Details
                </h3>
                <div className="ms-3 flex-grow-1 border-bottom border-warning"></div>
              </div>
              {renderCurrentPlan()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyMeals;
