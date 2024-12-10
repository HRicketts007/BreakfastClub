import React, { useState } from 'react';
import axios from 'axios';
import { getIdToken } from '../utils/auth';


const GroceryModal = ({ ingredients = [], onConfirm }) => {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleIngredient = (index) => {
    if (!ingredients || !ingredients.length) return;
    
    const ingredient = ingredients[index];
    setSelectedIngredients(prev => 
      prev.includes(ingredient)
        ? prev.filter(item => item !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getIdToken();
      const response = await axios.get('http://45.56.112.26:6969/grocery/items', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const existingItems = response.data.items || [];
      const updatedItems = [...new Set([...existingItems, ...selectedIngredients])];
      
      await axios.post(
        'http://45.56.112.26:6969/grocery/items',
        { items: updatedItems },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      onConfirm(updatedItems);
      document.getElementById('groceryModalClose').click();
      
      setSelectedIngredients([]);
    } catch (err) {
      console.error('Error updating grocery list:', err);
      setError(err.response?.data?.message || 'Failed to add items to grocery list');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal fade" id="groceryModal" tabIndex="-1" aria-labelledby="groceryModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="groceryModalLabel">Add to Grocery List</h5>
            <button type="button" id='groceryModalClose' className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger">{error}</div>
            )}
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
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button 
              type="button" 
              className="btn btn-warning"
              onClick={handleConfirm}
              disabled={isLoading || selectedIngredients.length === 0}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Adding...
                </>
              ) : (
                'Add to Grocery List'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroceryModal;