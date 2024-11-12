import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyMeals = () => {
  const [savedMealPlans, setSavedMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [expandedSummaries, setExpandedSummaries] = useState({});
  const navigate = useNavigate();

  //get meal plans from storage
  useEffect(() => {
    fetchSavedMealPlans();
  }, []);

  //format html
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

  const fetchSavedMealPlans = async () => {
    try {
      const savedPlans = localStorage.getItem("mealPlans");
      if (savedPlans) {
        const parsedPlans = JSON.parse(savedPlans);
        const formattedPlans = parsedPlans.map((plan) => ({
          mealPlanId: plan.planId,
          planType: plan.planType,
          caloricIntake: plan.caloricIntake,
          servings: plan.servings,
          date: plan.date,
          planData: plan.planData,
        }));
        setSavedMealPlans(formattedPlans);
      }
    } catch (error) {
      console.error("Error fetching saved meal plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const viewMealPlan = async (planId) => {
    try {
      const response = await axios.get(
        `http://45.56.112.26:6969/Get_Meal_Plan/${planId}`
      );
      const selectedPlan = savedMealPlans.find(
        (plan) => plan.mealPlanId === planId
      );
      if (selectedPlan) {
        setCurrentPlan({
          ...selectedPlan,
          planData: response.data,
        });
      }
    } catch (error) {
      console.error("Error fetching meal plan:", error);
    }
  };
  //Navigate to recipe page
  const viewRecipe = (recipe, nutrition, instructions, ingredients) => {
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
          You haven't saved any meal plans yet. Generate a meal plan to get
          started!
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {savedMealPlans.map((plan, index) => (
            <div className="col" key={index}>
              <div className="card h-100 border-0 shadow-sm hover-shadow-lg transition-all">
                <div className="card-body">
                  <h5 className="card-title fw-bold mb-3">
                    {plan.planType === "day" ? "Daily" : "Weekly"} Meal Plan
                  </h5>
                  <div className="mb-3 text-muted small">
                    <p className="mb-1">
                      <i className="bi bi-calendar me-2"></i>
                      {new Date(plan.date).toLocaleDateString()}
                    </p>
                    <p className="mb-1">
                      <i className="bi bi-lightning me-2"></i>
                      {plan.caloricIntake} calories
                    </p>
                    <p className="mb-1">
                      <i className="bi bi-grid me-2"></i>
                      {plan.servings} servings per day
                    </p>
                  </div>
                  <button
                    className="btn btn-warning w-100"
                    onClick={() => viewMealPlan(plan.mealPlanId)}
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
            {currentPlan.planType === "day" ? "Daily" : "Weekly"} Meal Plan
            Details
          </h3>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {Object.keys(currentPlan.planData?.meal_plan?.plan || {}).map(
              (key, index) => {
                const recipe =
                  currentPlan.planData?.meal_plan?.plan[key]?.Information;
                const nutrition =
                  currentPlan.planData?.meal_plan?.plan[key]?.Nutrition;
                const ingredients =
                  currentPlan.planData?.meal_plan?.plan[key]?.Ingredients;
                const instructions = recipe?.instructions;

                console.log(ingredients);

                const summary = formatData(recipe?.summary);
                const isExpanded = expandedSummaries[index];
                const truncatedSummary = summary.slice(0, 100);

                if (!recipe) {
                  return null;
                }

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
                              ingredients
                            )
                          }
                        >
                          View Recipe{" "}
                          <i className="bi bi-arrow-right-circle me-2"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMeals;
