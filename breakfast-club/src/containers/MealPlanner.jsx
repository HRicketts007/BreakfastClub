import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import axios from "axios";

//diet options
const DIET_OPTIONS = [
  { value: 'gluten free', label: 'Gluten Free' },
  { value: 'ketogenic', label: 'Ketogenic' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'lacto-vegetarian', label: 'Lacto-Vegetarian' },
  { value: 'ovo-vegetarian', label: 'Ovo-Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescetarian', label: 'Pescetarian' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'primal', label: 'Primal' },
  { value: 'low fodmap', label: 'Low FODMAP' },
  { value: 'whole30', label: 'Whole30' }
];

//allergy options
const INTOLERANCE_OPTIONS = [
  { value: 'dairy', label: 'Dairy' },
  { value: 'egg', label: 'Egg' },
  { value: 'gluten', label: 'Gluten' },
  { value: 'grain', label: 'Grain' },
  { value: 'peanut', label: 'Peanut' },
  { value: 'seafood', label: 'Seafood' },
  { value: 'sesame', label: 'Sesame' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'soy', label: 'Soy' },
  { value: 'sulfite', label: 'Sulfite' },
  { value: 'tree nut', label: 'Tree Nut' },
  { value: 'wheat', label: 'Wheat' }
];

const MealPlanner = () => {
  const [caloricIntake, setCaloricIntake] = useState("");
  const [servings, setServings] = useState("");
  const [mealPlan, setMealPlan] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedSummaries, setExpandedSummaries] = useState({});
  const [planType, setPlanType] = useState("day");
  const [diet, setDiet] = useState([]);
  const [excludeIngredients, setExcludeIngredients] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const navigate = useNavigate();

  //scroll to recipes
  const scrollToRecipes = () => {
    window.scrollTo({
      top: window.scrollY + 1000,
      behavior: 'smooth'
    });
  };

  //load user's last meal plan
  useEffect(() => {
    const fetchLastMealPlan = async () => {
      try {
        const response = await axios.get('http://45.56.112.26:6969/user/meal_plans');
        if (response.data.meal_plans?.length > 0) {
          const lastPlan = response.data.meal_plans[0];
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

  //generate meal plan
  const generateMealPlan = async () => {
    //check inputs
    const calories = parseInt(caloricIntake);
    const mealServings = parseInt(servings);
    
    if (isNaN(calories) || calories <= 0) {
      setError("Please enter a valid caloric intake greater than 0.");
      return;
    }
    
    if (isNaN(mealServings) || mealServings <= 0) {
      setError("Please enter a valid number of servings greater than 0.");
      return;
    }

    setError("");
    setLoading(true);

    //generate endpoint
    try {
      const endpoint = planType === "day" ? "/Generate_Day" : "/Generate_Week";
      
      //params
      const params = {
        timeFrame: planType,
        targetCalories: calories,
        DailyCaloricIntake: calories
      };

      //format params
      //diet
      if (diet.length > 0) {
        params.diet = diet[0].value.toLowerCase().replace(/\s+/g, '-');
      }

      //exclude ingredients
      if (excludeIngredients.length > 0) {
        params.exclude = excludeIngredients
          .map(e => e.value.toLowerCase().trim())
          .filter(Boolean)
          .join(',');
      }

      //allergies
      if (allergies.length > 0) {
        params.intolerances = allergies
          .map(i => i.value.toLowerCase().trim())
          .filter(Boolean)
          .join(',');
      }

      //servings
      params.ServingsPerDay = mealServings;

      //log params
      // console.log('Generating meal plan with params:', params);

      //generate request
      const response = await axios.get(`http://45.56.112.26:6969${endpoint}`, {
        params,

        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      //error
      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'Failed to generate meal plan');
      }

      if (!response.data.meal_plan) {
        throw new Error('No meal plan returned from the server');
      }

      //set meal plan to state
      setMealPlan(response.data.meal_plan);
      scrollToRecipes();
    } catch (error) {
      console.error("Error generating meal plan:", error);
      setError(error.message || "Failed to generate meal plan. Please try again later.");
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
    <div className="container-fluid py-4 px-4">
      {/* Main Form Section */}
      <div className="row justify-content-center mb-5">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card border-0 shadow-lg rounded-4 bg-light">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-5">
                <h2 className="display-6 fw-bold mb-3">Meal Plan Generator</h2>
                <p className="text-muted lead">
                  Create your personalized meal plan in seconds
                </p>
              </div>

              <form className="needs-validation" noValidate>
                <div className="row g-4">
              
                  <div className="col-12">
                    <div className="btn-group w-100" role="group">
                      <input
                        type="radio"
                        className="btn-check"
                        name="planType"
                        id="dailyPlan"
                        checked={planType === "day"}
                        onChange={() => setPlanType("day")}
                      />
                      <label className="btn btn-outline-warning" htmlFor="dailyPlan">
                        Daily Plan
                      </label>

                      <input
                        type="radio"
                        className="btn-check"
                        name="planType"
                        id="weeklyPlan"
                        checked={planType === "week"}
                        onChange={() => setPlanType("week")}
                      />
                      <label className="btn btn-outline-warning" htmlFor="weeklyPlan">
                        Weekly Plan
                      </label>
                    </div>
                  </div>

              
                  <div className="col-12 col-md-6">
                    <div className="form-floating">
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        id="caloricIntake"
                        placeholder="Daily Calories"
                        value={caloricIntake}
                        onChange={(e) => setCaloricIntake(e.target.value)}
                      />
                      <label htmlFor="caloricIntake">Daily Caloric Intake</label>
                    </div>
                  </div>

        
                  <div className="col-12 col-md-6">
                    <div className="form-floating">
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        id="servings"
                        placeholder="Servings"
                        value={servings}
                        onChange={(e) => setServings(e.target.value)}
                      />
                      <label htmlFor="servings">Servings Per Day</label>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <Select
                      isMulti
                      name="diet"
                      options={DIET_OPTIONS}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      onChange={setDiet}
                      value={diet}
                      placeholder="Select diet preferences..."
                    />
                   
                  </div>

                  <div className="col-12 col-md-6">
                    <Select
                      isMulti
                      name="allergies"
                      options={INTOLERANCE_OPTIONS}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      onChange={setAllergies}
                      value={allergies}
                      placeholder="Select allergies/intolerances..."
                    />
                   
                  </div>

                  <div className="col-12">
                    <CreatableSelect
                      isMulti
                      
                      name="excludeIngredients"
                      className="basic-multi-select"
                      classNamePrefix="select"
                      onChange={setExcludeIngredients}
                      value={excludeIngredients}
                      placeholder="Enter ingredients to exclude..."
                      formatCreateLabel={(inputValue) => `Exclude "${inputValue}"`}
                      noOptionsMessage={() => "Type to add an ingredient"}
                    />
                    
                  </div>

                  <div className="col-12">
                    <button
                      className="btn btn-warning btn-lg w-100 py-3 text-white fw-bold"
                      disabled={loading}
                      onClick={generateMealPlan}
                      type="button"
                    >
                      {loading ? (
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <div className="spinner-border spinner-border-sm" role="status" />
                          <span>Generating your perfect meal plan...</span>
                        </div>
                      ) : (
                        <>
                          <i className="bi bi-magic me-2"></i>
                          Generate Meal Plan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {error && (
                <div className="alert alert-danger mt-4 mb-0 d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {mealPlan && (
        <div className="row g-4">
          <div className="col-12 text-center mb-4">
            <h3 className="display-6 fw-bold">
              Your {planType === "day" ? "Daily" : "Weekly"} Meal Plan
            </h3>
            <p className="lead text-muted">
              {planType === "day" ? "Today's" : "This week's"} delicious recipes await!
            </p>
            <div className="bg-warning rounded-pill px-2 py-1 hover-shadow-lg transition-all" style={{cursor: "pointer", width: "fit-content", margin: "0 auto"}} onClick={scrollToRecipes}>
              <i className="bi bi-chevron-down text-dark"></i>
            </div>
          </div>

          {planType === "week" ? (
            Object.entries(mealPlan).map(([day, meals], dayIndex) => (
              <div key={dayIndex} className="col-12 mb-4">
                <h4 className="mb-3">Day {dayIndex + 1}</h4>
                <div className="row g-4">
                  {Object.entries(meals).map(([mealKey, meal], mealIndex) => {
                    const recipe = meal?.Information;
                    const nutrition = meal?.Nutrition;
                    const ingredients = meal?.Ingredients;
                    const instructions = recipe?.instructions;

                    if (recipe) {
                      const summary = formatData(recipe.summary);
                      const isExpanded = expandedSummaries[`${dayIndex}-${mealIndex}`];
                      const truncatedSummary = summary.slice(0, 100);

                      return (
                        <div className="col-12 col-md-6 col-lg-4" key={mealIndex}>
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
                                onClick={() => viewRecipe(recipe, nutrition, instructions, ingredients, recipe.id)}
                              >
                                View Recipe
                                <i className="bi bi-arrow-right-circle ms-2"></i>
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
            ))
          ) : (
            Object.keys(mealPlan).map((key, index) => {
              const recipe = mealPlan[key]?.Information;
              const nutrition = mealPlan[key]?.Nutrition;
              const ingredients = mealPlan[key]?.Ingredients;
              const instructions = recipe?.instructions;

              if (recipe) {
                const summary = formatData(recipe.summary);
                const isExpanded = expandedSummaries[index];
                const truncatedSummary = summary.slice(0, 100);

                return (
                  <div className="col-12 col-md-6 col-lg-4" key={index}>
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
                              onClick={() => toggleSummary(index)}
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
                          onClick={() => viewRecipe(recipe, nutrition, instructions, ingredients, recipe.id)}
                        >
                          View Recipe
                          <i className="bi bi-arrow-right-circle ms-2"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })
          )}
        </div>
      )}
    </div>
  );
};

export default MealPlanner;
