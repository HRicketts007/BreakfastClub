import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RecipePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { recipe, nutrition, instructions } = location.state || {};

  // Return a message if no recipe data is available
  if (!recipe) {
    return (
      <div className="container bg-white rounded-4 p-4 shadow-lg">
        <p>No recipe data available. Please go back and select a recipe.</p>
        <button className="btn btn-link" onClick={() => navigate(-1)}>
          &larr; Back to Meal Plan
        </button>
      </div>
    );
  }

  return (
    <div className="container bg-white rounded-4 p-4 shadow-lg">
      <button className="btn btn-link mb-3" onClick={() => navigate(-1)}>
        &larr; Back to Meal Plan
      </button>
      <h2 className="fw-bold mb-3">{recipe.title}</h2>
      <img src={recipe.image} alt="Recipe" className="img-fluid mb-3" />
      <p><strong>Serves:</strong> {recipe.servings}</p>
      <p><strong>Prep Time:</strong> {recipe.readyInMinutes} minutes</p>

      {/* Instructions Section */}
      <h4 className="fw-bold mt-4">Instructions</h4>
      {instructions && instructions}

      {/* Nutritional Information Section */}
      <h4 className="fw-bold mt-4">Nutritional Information</h4>
      {nutrition ? (
        <ul>
          <li><strong>Calories:</strong> {nutrition.calories}</li>
          <li><strong>Protein:</strong> {nutrition.protein}</li>
          <li><strong>Fat:</strong> {nutrition.fat}</li>
          <li><strong>Carbs:</strong> {nutrition.carbs}</li>
        </ul>
      ) : (
        <p>Nutritional information not available.</p>
      )}
    </div>
  );
};

export default RecipePage;
