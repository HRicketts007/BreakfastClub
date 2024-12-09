import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const OutfacingRecipePage = () => {
  const [recipeData, setRecipeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const formatInstructions = (htmlContent) => {
    if (!htmlContent) return [];
    const temp = document.createElement("div");
    temp.innerHTML = htmlContent;
    const text = temp.textContent || temp.innerText || "";
    const cleanText = text
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();

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

  useEffect(() => {
    const fetchRecipeFromUrl = async () => {
      console.log("fetching recipe from url");
      const params = new URLSearchParams(location.search);
      const recipeId = params.get('id');
      
      if (!recipeId) {
        setError('No recipe ID provided');
        setLoading(false);
        return;
      }

      try {
        // Single API call to get both recipe and nutrition data
        const response = await fetch(`http://45.155.185.100:6969/get_recipe/${recipeId}`);
        if (!response.ok) throw new Error('Recipe not found');
        const data = await response.json();
        console.log("API Response:", data);

        setRecipeData({
          recipe: data.recipe.recipe,
          nutrition: data.nutrition,
          instructions: data.recipe.instructions
        });
        
        console.log("Recipe Data Set:", {
          recipe: data.recipe.recipe,
          nutrition: data.nutrition,
          instructions: data.recipe.instructions
        });
      } catch (error) {
        console.error('Failed to fetch recipe:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeFromUrl();
  }, [location]);


  if (loading) {
    return (
      <div className="container bg-white rounded-4 p-4 shadow-lg">
        <div className="text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container bg-white rounded-4 p-4 shadow-lg">
        <div className="text-center">
          <h3 className="text-danger">Error</h3>
          <p>{error}</p>
          <p>The recipe you're looking for might not exist or there was an error loading it.</p>
        </div>
      </div>
    );
  }

  const { recipe, nutrition, instructions } = recipeData || {};
  console.log("Recipe Data:", recipeData);
  const instructionSteps = formatInstructions(recipe.instructions);

  return (
    <div className="container bg-white rounded-4 p-4 shadow-lg">
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
                      <p className="mb-1"><strong>Calories</strong></p>
                      <p className="mb-0 fs-5">{nutrition.nutrition.calories} kcal</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3">
                      <p className="mb-1"><strong>Protein</strong></p>
                      <p className="mb-0 fs-5">{nutrition.nutrition.protein} g</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3">
                      <p className="mb-1"><strong>Fat</strong></p>
                      <p className="mb-0 fs-5">{nutrition.nutrition.fat} g</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3">
                      <p className="mb-1"><strong>Carbs</strong></p>
                      <p className="mb-0 fs-5">{nutrition.nutrition.carbs} g</p>
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
        <div className="card-header bg-warning bg-opacity-10 border-0">
          <h5 className="fw-bold mb-0">Ingredients</h5>
        </div>
        <div className="card-body">
          {recipe.extendedIngredients ? (
            <ul className="list-group list-group-flush">
              {recipe.extendedIngredients.map((ingredient, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex align-items-center"
                >
                  <i className="bi bi-check2-circle text-warning me-2"></i>
                  {ingredient.original}
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
  );
};

export default OutfacingRecipePage;