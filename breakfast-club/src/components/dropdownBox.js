import React, { useState } from 'react';
import './ExclusionDropdown.css';

const ExclusionDropdown = ({ onChange }) => {
  const [selectedExclusions, setSelectedExclusions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: 'gluten', label: 'Gluten' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'nuts', label: 'Nuts' },
    { value: 'soy', label: 'Soy' },
  ];

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    let updatedSelections;

    if (checked) {
      updatedSelections = [...selectedExclusions, value];
    } else {
      updatedSelections = selectedExclusions.filter((exclusion) => exclusion !== value);
    }

    setSelectedExclusions(updatedSelections);
    onChange(updatedSelections);
  };

  const toggleDropdown = () => {
    console.log('Dropdown toggle clicked');
    setIsOpen(!isOpen); // Toggle dropdown visibility
    console.log('Dropdown isOpen state:', !isOpen);
  };

  return (
    <div className="exclusion-dropdown">
      <label>Exclude Ingredients/Diets:</label>
      <div className="dropdown-header" onClick={toggleDropdown}>
        {selectedExclusions.length > 0
          ? `${selectedExclusions.length} item(s) selected`
          : "Select exclusions"}
        <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option) => (
            <div key={option.value} className="checkbox-option">
              <input
                type="checkbox"
                id={option.value}
                value={option.value}
                checked={selectedExclusions.includes(option.value)}
                onChange={handleCheckboxChange}
              />
              <label htmlFor={option.value}>{option.label}</label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExclusionDropdown;
