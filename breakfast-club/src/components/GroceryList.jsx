import React, { useState } from "react";

const GroceryList = ({ items }) => {
  const [checkedItems, setCheckedItems] = useState({});

  const toggleItem = (index) => {
    setCheckedItems((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-4">
              <h2 className="fw-bold mb-3 text-center">Grocery List</h2>
              <ul className="list-group list-group-flush">
                {items.map((item, index) => (
                  <li
                    key={index}
                    className={`list-group-item d-flex justify-content-between align-items-center ${
                      checkedItems[index] ? "list-group-item-success" : ""
                    }`}
                  >
                    <span
                      className={`${
                        checkedItems[index] ? "text-decoration-line-through" : ""
                      }`}
                    >
                      {item}
                    </span>
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => toggleItem(index)}
                    >
                      {checkedItems[index] ? "Undo" : "Check"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroceryList; 