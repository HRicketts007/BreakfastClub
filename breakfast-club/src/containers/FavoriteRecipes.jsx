import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FavoriteRecipes = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      // First get the list of favorite IDs
      const favoritesResponse = await axios.get('http://45.56.112.26:6969/favorites');
      const favoriteIds = favoritesResponse.data.favorites;

      // Then fetch full recipe details for each ID
      const recipesPromises = favoriteIds.map(id =>
        axios.get(`http://45.56.112.26:6969/get_recipe/${id}`)
      );
      
      const recipesResponses = await Promise.all(recipesPromises);
      const recipesData = recipesResponses.map(response => response.data);
      
      console.log(recipesData);
      setFavorites(recipesData);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch favorite recipes');
      console.error(err);
      setLoading(false);
    }
  };

  const viewRecipe = (recipeData) => {
    console.log('Raw recipe data:', recipeData); // For debugging

    // Extract the base recipe data
    const recipe = {
      ...recipeData.recipe.recipe,
      id: recipeData.id || recipeData.recipe.recipe.id
    };

    // Format ingredients if they exist
    const formattedIngredients = recipe.extendedIngredients?.map(ing => {
      const amount = ing.amount || "";
      const unit = ing.unit || "";
      const name = ing.name || "";
      return `${amount} ${unit} ${name}`.trim();
    }) || [];

    // Create the state object matching RecipePage's expected structure
    const state = {
      recipe: recipe,
      nutrition: recipeData.nutrition.nutrition || recipeData.nutrition,
      instructions: recipe.instructions,
      ingredients: formattedIngredients,
      fromFavorites: true
    };

    console.log('Formatted state:', state); // For debugging

    navigate(`/recipe/${recipe.id}`, { state });
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

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">Favorite Recipes</h2>
      
      {favorites.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          You haven't favorited any recipes yet.
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {favorites.map((favorite) => (
            <div key={favorite.recipe.recipe.id} className="col">
              <div className="card h-100 border-0 shadow-sm hover-shadow-lg transition-all">
                <img
                  src={favorite.recipe.recipe.image}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                  alt={favorite.recipe.recipe.title}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold mb-3">{favorite.recipe.recipe.title}</h5>
                  <div className="d-flex justify-content-between text-muted small mb-3">
                    <span>
                      <i className="bi bi-people-fill me-1"></i>
                      {favorite.recipe.recipe.servings} servings
                    </span>
                    <span>
                      <i className="bi bi-clock-fill me-1"></i>
                      {favorite.recipe.recipe.readyInMinutes} min
                    </span>
                  </div>
                  <button
                    className="btn btn-warning mt-auto"
                    onClick={() => viewRecipe(favorite)}
                  >
                    View Recipe
                    <i className="bi bi-arrow-right-circle ms-2"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteRecipes; 