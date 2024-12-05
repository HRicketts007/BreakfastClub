import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GroceryModal from "../components/GroceryModal";

const RecipePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [recipeData, setRecipeData] = useState(location.state || null);
  
  useEffect(() => {
    const fetchRecipeFromUrl = async () => {
      // Check if we have URL parameters instead of state
      const params = new URLSearchParams(location.search);
      const recipeId = params.get('id');
      
      if (recipeId && !recipeData) {
        try {
          const response = await fetch(`http://45.56.112.26:6969/Get_Recipe/${recipeId}`);
          if (!response.ok) throw new Error('Recipe not found');
          const data = await response.json();
          setRecipeData(data);
        } catch (error) {
          console.error('Failed to fetch recipe:', error);
        }
      }
    };

    fetchRecipeFromUrl();
  }, [location, recipeData]);

  // Update all state destructuring to use recipeData
  const { recipe, nutrition, instructions, ingredients, planId } = recipeData || {};
  const [showGroceryModal, setShowGroceryModal] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const handleGroceryConfirm = (selectedIngredients) => {
    const existingItems = JSON.parse(localStorage.getItem('groceryList')) || [];
    const updatedItems = [...existingItems, ...selectedIngredients];
    localStorage.setItem('groceryList', JSON.stringify(updatedItems));
    setShowGroceryModal(false);
  };
  //clear local storage on back btn
  // useEffect(() => {
  //   return () => {
  //     //clear saved meal plan
  //     if (!location.pathname.includes('meal-planner')) {
  //       localStorage.removeItem('currentMealPlan');
  //     }
  //   };
  // }, [location.pathname]);


  
  //format instructions
  const formatInstructions = (htmlContent) => {
    if (!htmlContent) return [];
    //rem html
    const temp = document.createElement("div");
    temp.innerHTML = htmlContent;
    const text = temp.textContent || temp.innerText || "";
    //clean text
    const cleanText = text
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();

    //split into sentences
    const sentences = cleanText
      .split(/(?:\d+\.|\d+\)|\d+\.)/)
      .filter(Boolean)
      .map((step) => step.trim());

    if (sentences.length <= 1) {
      return cleanText
        .split(/(?<=[.!?])\s+/)
        .filter(
          (sentence) =>
            sentence.length > 0 &&
            !sentence.match(/^[A-Za-z]$/) &&
            sentence.trim() !== "."
        )
        .map((sentence) => sentence.trim());
    }

    return sentences;
  };

  const instructionSteps = formatInstructions(instructions);

  //error handling
  if (!recipe) {
    return (
      <div className="container bg-white rounded-4 p-4 shadow-lg">
        <p className="text-center">
          No recipe data available. Please go back and select a recipe.
        </p>
        <button className="btn btn-warning w-100" onClick={() => navigate(-1)}>
          &larr; Back to Meal Plan
        </button>
      </div>
    );
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/recipe?id=${recipe.id}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (

    <>
     <GroceryModal
      show={showGroceryModal}
      onHide={() => setShowGroceryModal(false)}
      ingredients={ingredients || []}
      planId={planId}
      onConfirm={handleGroceryConfirm}
    />
    <div className="container bg-white rounded-4 p-4 shadow-lg">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          &larr; Back to Meal Plan
        </button>
        <div className="d-flex gap-2">
          <button className="btn btn-warning">
            <i className="bi bi-star me-2"></i>Leave a Review
          </button>
          <button 
            className="btn btn-outline-warning" 
            onClick={handleShare}
          >
            <i className="bi bi-share me-2"></i>Share
          </button>
          <button className="btn btn-dark">
            <i className="bi bi-heart me-2"></i>Favorite
          </button>
        </div>
      </div>

      {/*Recipe content */}
      <div className="row g-4">
        <div className="col-md-6">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="img-fluid rounded-4 shadow-sm mb-4 w-100 object-fit-cover"
            style={{ maxHeight: "400px" }}
          />
          <div className="d-flex justify-content-around p-3 bg-light rounded-4">
            <div className="text-center">
              <i className="bi bi-people fs-4 mb-2 text-warning"></i>
              <p className="mb-0">
                <strong>Serves</strong>
              </p>
              <p className="mb-0">{recipe.servings}</p>
            </div>
            <div className="text-center">
              <i className="bi bi-clock fs-4 mb-2 text-warning"></i>
              <p className="mb-0">
                <strong>Prep Time</strong>
              </p>
              <p className="mb-0">{recipe.readyInMinutes} min</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <h2 className="fw-bold mb-4">{recipe.title}</h2>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-warning bg-opacity-10 border-0">
              <h5 className="fw-bold mb-0">Nutrition Facts</h5>
            </div>
            {nutrition ? (
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3">
                      <p className="mb-1">
                        <strong>Calories</strong>
                      </p>
                      <p className="mb-0 fs-5">{nutrition.calories}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3">
                      <p className="mb-1">
                        <strong>Protein</strong>
                      </p>
                      <p className="mb-0 fs-5">{nutrition.protein}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3">
                      <p className="mb-1">
                        <strong>Fat</strong>
                      </p>
                      <p className="mb-0 fs-5">{nutrition.fat}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3">
                      <p className="mb-1">
                        <strong>Carbs</strong>
                      </p>
                      <p className="mb-0 fs-5">{nutrition.carbs}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-body">
                <p className="mb-0">Nutritional information not available.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4 mt-3">
        <div className="card-header bg-warning bg-opacity-10 border-0 d-flex align-items-center justify-content-between">
          <h5 className="fw-bold mb-">Ingredients</h5>
          <button className="btn btn-warning" data-bs-toggle="modal" data-bs-target="#groceryModal">Add to Grocery List</button>
        </div>
        <div className="card-body">
          {ingredients && ingredients.length > 0 ? (
            <ul className="list-group list-group-flush">
              {ingredients.map((ingredient, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex align-items-center"
                >
                  <i className="bi bi-check2-circle text-warning me-2"></i>
                  {ingredient}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-0">Ingredients not available.</p>
          )}
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-warning bg-opacity-10 border-0">
          <h5 className="fw-bold mb-0">Instructions</h5>
        </div>
        <div className="card-body">
          {instructionSteps.length > 0 ? (
            <ol className="list-group list-group-numbered">
              {instructionSteps.map((step, index) => (
                <li key={index} className="list-group-item d-flex">
                  <div className="ms-2 me-auto">
                    <div>{step}</div>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mb-0">Instructions not available.</p>
          )}
        </div>
      </div>
      
    </div>
    {showShareToast && (
      <div 
        className="position-fixed bottom-0 end-0 p-3" 
        style={{ zIndex: 11 }}
      >
        <div 
          className="toast show bg-warning text-dark" 
          role="alert" 
          aria-live="assertive" 
          aria-atomic="true"
        >
          <div className="toast-body d-flex align-items-center">
            <i className="bi bi-check-circle-fill me-2"></i>
            Link copied to clipboard!
          </div>
        </div>
      </div>
    )}
    </>
   
  );
};

export default RecipePage;
