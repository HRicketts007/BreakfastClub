import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Routes, Route } from "react-router-dom";

const handleExportCalendar = async (planId, planType) => {
  try {
    // Show date picker based on plan type
    const startDate = await new Promise((resolve) => {
      const picker = document.createElement('input');
      picker.type = planType === 'day' ? 'date' : 'week';
      picker.style.display = 'none';
      picker.style.position = 'fixed';
      picker.style.top = '50%';
      picker.style.left = '50%';
      picker.style.transform = 'translate(-50%, -50%)';
      picker.style.zIndex = '9999';
      picker.onchange = (e) => {
        document.body.removeChild(picker);
        resolve(e.target.value);
      };
      document.body.appendChild(picker);
      picker.showPicker();
      picker.addEventListener('cancel', () => {
        document.body.removeChild(picker);
        resolve(null);
      });
    });

    if (!startDate) return; // User cancelled

    const response = await axios.get(
      `http://localhost:6969/generate_calendar?plan_id=${planId}&start_date=${startDate}&plan_type=${planType}`,
      { responseType: 'blob' }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'meal_plan.ics');
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting calendar:', error);
    alert('Failed to export calendar. Please try again.');
  }
};

// Create new component for individual meal plan view
const MealPlanView = () => {
  const { planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSummaries, setExpandedSummaries] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        console.log("Fetching plan with ID:", planId);
        const response = await axios.get(`http://localhost:6969/Get_Meal_Plan/${planId}`);
        console.log("Raw response:", response.data);
        setPlan({
          type: response.data.meal_plan.type,
          plan: response.data.meal_plan.plan,
          created_at: response.data.meal_plan.created_at
        });
      } catch (error) {
        console.error("Error fetching meal plan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);

  //format date time
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

  //format data
  const formatData = (htmlContent) => {
    const temp = document.createElement("div");
    temp.innerHTML = htmlContent;
    return temp.textContent || temp.innerText || "";
  };

  //toggle summary
  const toggleSummary = (index) => {
    setExpandedSummaries((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  //view recipe
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

    navigate(`/recipe/${recipe.id}`, {
      state: {
        recipe,
        nutrition,
        instructions,
        ingredients: formattedIngredients,
      },
    });
  };

  //meal card ui
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

  //plan ui
  const renderCurrentPlan = () => {
    if (!plan?.plan) {
      console.log("No plan data available:", plan);
      return null;
    }

    const daysOfWeek = [
      'Monday', 
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ];

    if (plan.type === "day") {
      return (
        <div className="row">
          {Object.entries(plan.plan).map(([key, mealData], index) => {
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

    // Modify the weekly plan rendering to sort by day
    return Object.entries(plan.plan)
      .filter(([day]) => daysOfWeek.includes(day))
      .sort((a, b) => daysOfWeek.indexOf(a[0]) - daysOfWeek.indexOf(b[0]))
      .map(([day, meals], dayIndex) => (
        <div key={dayIndex} className="mb-5">
          <div className="d-flex align-items-center gap-3 mb-4">
            <h4 className="mb-0 fw-bold text-warning">{day}</h4>
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="alert alert-warning m-4">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Meal plan not found
      </div>
    );
  }

  return (
    <div className="container-fluid py-5 px-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h3 className="display-6 fw-bold mb-1">
                {plan.type === "day" ? "Daily" : "Weekly"} Meal Plan
              </h3>
              <p className="text-muted mb-0">
                <i className="bi bi-calendar-event me-2"></i>
                Created on {formatDateTime(plan.created_at)}
              </p>
            </div>
            <button
              className="btn btn-warning"
              onClick={() => handleExportCalendar(planId, plan.type)}
            >
              <i className="bi bi-calendar-plus me-2"></i>
              Export to Calendar
            </button>
          </div>
          {renderCurrentPlan()}
        </div>
      </div>
    </div>
  );
};

// Modify main MyMeals component
const MyMeals = () => {
  const [savedMealPlans, setSavedMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  //format date time
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

  

  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        const response = await axios.get('http://localhost:6969/user/meal_plans');
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

  const MealPlansList = () => (
    <div className="container-fluid py-5 px-4">
      <div className="row justify-content-center">
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
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
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
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-warning flex-grow-1"
                          onClick={() => navigate(`/my-meals/${plan.id}`)}
                        >
                          <i className="bi bi-eye me-2"></i>
                          View Plan
                        </button>
                        <button
                          className="btn btn-outline-warning"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportCalendar(plan.id, plan.type);
                          }}
                        >
                          <i className="bi bi-calendar-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<MealPlansList />} />
      <Route path="/:planId" element={<MealPlanView />} />
    </Routes>
  );
};

export default MyMeals;
