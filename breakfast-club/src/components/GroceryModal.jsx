import React, { useState } from 'react';
import axios from 'axios';
import { getIdToken } from '../utils/auth';

// Add a request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.setItem('isAuthenticated', 'false');
};

const GroceryModal = ({ show, onHide, ingredients = [], onConfirm }) => {
  const [selectedIngredients, setSelectedIngredients] = useState(ingredients || []);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getIdToken();
      const response = await axios.get('http://45.56.112.26:6969/grocery/items', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const existingItems = response.data.status === 'success' ? response.data.items : [];
      const updatedItems = [...existingItems, ...selectedIngredients];
      
      await axios.post('http://45.56.112.26:6969/grocery/items',
        { items: updatedItems },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onConfirm(selectedIngredients);
        onHide();
      }, 1500);
    } catch (err) {
      setError('Failed to update grocery list');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIngredient = (index) => {
    if (!ingredients || !ingredients.length) return;
    
    const ingredient = ingredients[index];
    setSelectedIngredients(prev => 
      prev.includes(ingredient)
        ? prev.filter(item => item !== ingredient)
        : [...prev, ingredient]
    );
  };

  return (
    <div className="modal fade" id="groceryModal" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add to Grocery List</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          
          <div className="modal-body">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-warning" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : ingredients && ingredients.length > 0 ? (
              <div className="list-group">
                {ingredients.map((ingredient, index) => (
                  <label key={index} className="list-group-item">
                    <div className="d-flex align-items-center">
                      <input
                        type="checkbox"
                        className="form-check-input me-2"
                        checked={selectedIngredients.includes(ingredient)}
                        onChange={() => toggleIngredient(index)}
                      />
                      <span>{ingredient}</span>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted">No ingredients found</p>
            )}
          </div>

          <div className="modal-footer">
            {showSuccess ? (
              <div className="text-success w-100 text-center">
                <i className="bi bi-check-circle me-2"></i>
                Added to grocery list!
              </div>
            ) : (
              <>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={onHide}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleConfirm}
                  disabled={selectedIngredients.length === 0}
                >
                  Add Selected Items
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroceryModal;