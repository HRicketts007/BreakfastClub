import React, { useState, useEffect } from 'react';

const GroceryList = () => {
  const [groceryItems, setGroceryItems] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem('groceryList')) || [];
    setGroceryItems(savedItems);
  }, []);

  const toggleItem = (index) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const removeItem = (index) => {
    const updatedItems = groceryItems.filter((_, i) => i !== index);
    setGroceryItems(updatedItems);
    localStorage.setItem('groceryList', JSON.stringify(updatedItems));
  };

  const clearCheckedItems = () => {
    const remainingItems = groceryItems.filter((_, index) => !checkedItems[index]);
    setGroceryItems(remainingItems);
    setCheckedItems({});
    localStorage.setItem('groceryList', JSON.stringify(remainingItems));
  };

  const clearAllItems = () => {
    setGroceryItems([]);
    setCheckedItems({});
    localStorage.removeItem('groceryList');
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Grocery List</h2>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-warning" 
            onClick={clearCheckedItems}
            disabled={!Object.keys(checkedItems).length}
          >
            Clear Checked Items
          </button>
          <button 
            className="btn btn-danger" 
            onClick={clearAllItems}
            disabled={!groceryItems.length}
          >
            Clear All
          </button>
        </div>
      </div>

      {groceryItems.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          Your grocery list is empty.
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="list-group list-group-flush">
            {groceryItems.map((item, index) => (
              <div key={index} className="list-group-item d-flex align-items-center">
                <div className="form-check flex-grow-1">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={checkedItems[index] || false}
                    onChange={() => toggleItem(index)}
                  />
                  <label 
                    className="form-check-label ms-2"
                    style={{ 
                      textDecoration: checkedItems[index] ? 'line-through' : 'none',
                      color: checkedItems[index] ? '#6c757d' : 'inherit'
                    }}
                  >
                    {item}
                  </label>
                </div>
                <button 
                  className="btn btn-link text-danger"
                  onClick={() => removeItem(index)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroceryList;