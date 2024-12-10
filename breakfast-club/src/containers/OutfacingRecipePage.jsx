import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import RatingModal from "../components/RatingModal";

const OutfacingRecipePage = () => {
  const [recipeData, setRecipeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState([]);
  const location = useLocation();

  // Destructure after useEffect to avoid the initialization error
  const { recipe, nutrition } = recipeData || {};

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
  const instructionSteps = recipe?.instructions ? formatInstructions(recipe.instructions) : [];

  useEffect(() => {
    const fetchRecipeFromUrl = async () => {
      const params = new URLSearchParams(location.search);
      const recipeId = params.get('id');
      
      if (!recipeId) {
        setError('No recipe ID provided');
        setLoading(false);
        return;
      }

      try {
        // Fetch recipe data
<<<<<<< HEAD
        const recipeResponse = await fetch(`http://localhost:6969/get_recipe/${recipeId}`);
=======
        const recipeResponse = await fetch(`http://45.56.112.26:6969/get_recipe/${recipeId}`);
>>>>>>> 91b17d1b158c1520fd8541d7e4ac947af640a8d5
        if (!recipeResponse.ok) throw new Error('Recipe not found');
        const recipeData = await recipeResponse.json();
        
        // Fetch ratings
<<<<<<< HEAD
        const ratingsResponse = await fetch(`http://localhost:6969/get_ratings/${recipeId}`);
=======
        const ratingsResponse = await fetch(`http://45.56.112.26:6969/get_ratings/${recipeId}`);
>>>>>>> 91b17d1b158c1520fd8541d7e4ac947af640a8d5
        if (ratingsResponse.ok) {
          const ratingsData = await ratingsResponse.json();
          setRatings(ratingsData.ratings);
        }

        setRecipeData({
          recipe: recipeData.recipe.recipe,
          nutrition: recipeData.nutrition,
          instructions: recipeData.recipe.instructions
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeFromUrl();
  }, [location]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }



  const handleRatingSubmit = async () => {
    try {
<<<<<<< HEAD
        const response = await fetch(`http://localhost:6969/get_ratings/${recipe?.id}`);
=======
        const response = await fetch(`http://45.56.112.26:6969/get_ratings/${recipe?.id}`);
>>>>>>> 91b17d1b158c1520fd8541d7e4ac947af640a8d5
      if (response.ok) {
        const data = await response.json();
        setRatings(data.ratings);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };



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
                      <p className="mb-0 fs-5">{nutrition?.nutrition?.calories} kcal</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3">
                      <p className="mb-1"><strong>Protein</strong></p>
                      <p className="mb-0 fs-5">{nutrition?.nutrition?.protein} g</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3">
                      <p className="mb-1"><strong>Fat</strong></p>
                      <p className="mb-0 fs-5">{nutrition?.nutrition?.fat} g</p>
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

<div className="card border-0 shadow-sm mt-4">
  <div className="card-header bg-warning bg-opacity-10 border-0 d-flex justify-content-between align-items-center">
    <h5 className="fw-bold mb-0">Reviews</h5>
    <span className="badge bg-warning text-dark">
      {ratings.length} {ratings.length === 1 ? 'Review' : 'Reviews'}
    </span>
  </div>
  <div className="card-body">
    {ratings.length > 0 ? (
      <div className="d-flex flex-column gap-3">
        {ratings.map((rating) => (
          <div key={rating.id} className="card border-0 bg-light">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`bi bi-star${i < rating.rating ? '-fill' : ''} text-warning`}
                    />
                  ))}
                </div>
                <small className="text-muted">
                {rating.created_at ? (
                    typeof rating.created_at === 'string' 
                      ? new Date(rating.created_at).toLocaleDateString()
                      : new Date(rating.created_at).toLocaleDateString()
                  ) : 'Date not available'}         
                </small>
              </div>
              {rating.review && (
                <p className="mb-0 text-break">{rating.review}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-muted text-center mb-0">No reviews yet.</p>
    )}
  </div>
</div>

    </div>
  );
};

export default OutfacingRecipePage;