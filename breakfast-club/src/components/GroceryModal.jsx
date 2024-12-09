import React, { useState } from 'react';
import axios from 'axios';
import { getIdToken } from '../utils/auth';


const GroceryModal = ({ show, onHide, ingredients = [], onConfirm }) => {
  const [selectedIngredients, setSelectedIngredients] = useState(ingredients || []);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  //add items to grocery list func
  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      //get token
      const token = await getIdToken();
      //get user grocery list
      const response = await axios.get('http://45.56.112.26:6969/grocery/items', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const existingItems = response.data.status === 'success' ? response.data.items : [];
      //update items
      const updatedItems = [...existingItems, ...selectedIngredients];
      await axios.post('http://45.56.112.26:6969/grocery/items',
        { items: updatedItems },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      //success
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

  //handle checkbox for ingredients
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
            <button type="button" className="btn-close"                   data-bs-dismiss="modal"
            ></button>
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
                  data-bs-dismiss="modal"
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