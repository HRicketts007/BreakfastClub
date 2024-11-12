import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RecipePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { recipe, nutrition, instructions, ingredients } = location.state || {};

  // Format HTML content to plain text and split into steps
  const formatInstructions = (htmlContent) => {
    if (!htmlContent) return [];
    const temp = document.createElement("div");
    temp.innerHTML = htmlContent;
    const text = temp.textContent || temp.innerText || "";
    // Split by numbers followed by dot or period
    return text.split(/\d+[.)]/g)
      .filter(step => step.trim().length > 0)
      .map(step => step.trim());
  };

  const instructionSteps = formatInstructions(instructions);

  // Return a message if no recipe data is available
  if (!recipe) {
    return (
      <div className="container bg-white rounded-4 p-4 shadow-lg">
        <p className="text-center">No recipe data available. Please go back and select a recipe.</p>
        <button className="btn btn-warning w-100" onClick={() => navigate(-1)}>
          &larr; Back to Meal Plan
        </button>
      </div>
    );
  }

  return (
    <div className="container bg-white rounded-4 p-4 shadow-lg">
      {/* Header with navigation and action buttons */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          &larr; Back to Meal Plan
        </button>
        <div className="d-flex gap-2">
          <button className="btn btn-warning">
            <i className="bi bi-download me-2"></i>Export
          </button>
          <button className="btn btn-outline-warning">
            <i className="bi bi-share me-2"></i>Share
          </button>
          <button className="btn btn-dark">
            <i className="bi bi-bookmark me-2"></i>Save
          </button>
        </div>
      </div>

      {/* Recipe main content */}
      <div className="row g-4">
        {/* Left column - Image and basic info */}
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
              <p className="mb-0"><strong>Serves</strong></p>
              <p className="mb-0">{recipe.servings}</p>
            </div>
            <div className="text-center">
              <i className="bi bi-clock fs-4 mb-2 text-warning"></i>
              <p className="mb-0"><strong>Prep Time</strong></p>
              <p className="mb-0">{recipe.readyInMinutes} min</p>
            </div>
          </div>
        </div>

        {/* Right column - Title and nutrition */}
        <div className="col-md-6">
          <h2 className="fw-bold mb-4">{recipe.title}</h2>
          
          {/* Nutrition card */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-warning bg-opacity-10 border-0">
              <h5 className="fw-bold mb-0">Nutrition Facts</h5>
            </div>
            {nutrition ? (
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3">
                      <p className="mb-1"><strong>Calories</strong></p>
                      <p className="mb-0 fs-5">{nutrition.calories}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3">
                      <p className="mb-1"><strong>Protein</strong></p>
                      <p className="mb-0 fs-5">{nutrition.protein}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3">
                      <p className="mb-1"><strong>Fat</strong></p>
                      <p className="mb-0 fs-5">{nutrition.fat}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3">
                      <p className="mb-1"><strong>Carbs</strong></p>
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

      {/* Ingredients Section */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-warning bg-opacity-10 border-0">
          <h5 className="fw-bold mb-0">Ingredients</h5>
        </div>
        <div className="card-body">
          {ingredients && ingredients.length > 0 ? (
            <ul className="list-group list-group-flush">
              {ingredients.map((ingredient, index) => (
                <li key={index} className="list-group-item d-flex align-items-center">
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

      {/* Instructions Section */}
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
  );
};

export default RecipePage;
