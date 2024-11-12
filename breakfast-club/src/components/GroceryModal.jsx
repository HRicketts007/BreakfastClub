import React, { useState, useEffect } from 'react';

const GroceryModal = ({ show, onHide, ingredients, onConfirm }) => {
  const [selectedIngredients, setSelectedIngredients] = useState(ingredients || []);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const modal = document.getElementById('groceryModal');
    if (show) {
      modal.classList.add('show');
      modal.style.display = 'block';
      document.body.classList.add('modal-open');
      setIsLoading(false);
      setShowSuccess(false);
    } else {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  }, [show]);

  const removeIngredient = (index) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const existingList = JSON.parse(localStorage.getItem('groceryList')) || [];
      const updatedList = [...existingList, ...selectedIngredients];
      localStorage.setItem('groceryList', JSON.stringify(updatedList));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onConfirm(selectedIngredients);
        onHide();
      }, 1500);
    } catch (error) {
      console.error('Error saving to grocery list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal fade" id="groceryModal" tabIndex="-1" aria-labelledby="groceryModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold" id="groceryModalLabel">Add to Grocery List</h5>
            <button 
              type="button" 
              className="btn-close" 
              data-bs-dismiss="modal" 
              aria-label="Close" 
              onClick={onHide}
              disabled={isLoading}
            ></button>
          </div>
          <div className="modal-body">
            {showSuccess ? (
              <div className="alert alert-success d-flex align-items-center" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                <div>Items successfully added to your grocery list!</div>
              </div>
            ) : (
              <div className="list-group">
                {selectedIngredients.map((ingredient, index) => (
                  <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{ingredient}</span>
                    <button 
                      className="btn btn-link text-danger p-0" 
                      onClick={() => removeIngredient(index)}
                      disabled={isLoading}
                    >
                      <i className="bi bi-x-circle"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-footer border-0">
            <button 
              type="button" 
              className="btn btn-secondary" 
              data-bs-dismiss="modal" 
              onClick={onHide}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-warning d-flex align-items-center" 
              onClick={handleConfirm}
              disabled={isLoading || showSuccess}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Adding...
                </>
              ) : (
                'Add to List'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroceryModal;