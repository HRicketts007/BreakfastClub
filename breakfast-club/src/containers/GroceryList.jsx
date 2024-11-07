import React, { useState } from "react";
import axios from "axios";


const GroceryList = () => {
    // State for the list of grocery items
    const [groceryItems, setGroceryItems] = useState([]);
    // State for tracking the new item name input
    const [newItem, setNewItem] = useState("");
    // State for tracking the new item quantity input
    const [newQuantity, setNewQuantity] = useState("");

    // Function to add a new item to the grocery list
    const addItem = () => {
        // Only add the item if both name and quantity are provided
        if (newItem && newQuantity) {
            // Update the groceryItems list with the new item
            setGroceryItems([
                ...groceryItems, // Preserve existing items
                { name: newItem, quantity: newQuantity, purchased: false }, // Add new item with initial "purchased" status set to false
            ]);
            // Clear the input fields after adding the item
            setNewItem("");
            setNewQuantity("");
        }
    };

    // Function to toggle the "purchased" status of an item
    const togglePurchased = (index) => {
        // Map over groceryItems to update the "purchased" status of the selected item
        setGroceryItems(
            groceryItems.map((item, i) =>
                i === index ? { ...item, purchased: !item.purchased } : item // Toggle "purchased" only for the clicked item
            )
        );
    };

    // Function to download the grocery list as a plain text file
    const downloadList = () => {
        // Prepare text content with each item's name, quantity, and purchased status
        const listContent = groceryItems
            .map((item) => `${item.name} - ${item.quantity} ${item.purchased ? "(Purchased)" : ""}`)
            .join("\n"); // Join each item into a new line

        // Create a Blob (file-like object) with the list content
        const blob = new Blob([listContent], { type: "text/plain" });
        // Create a temporary link element for downloading the file
        const link = document.createElement("a");
        // Set the link to the Blob URL
        link.href = URL.createObjectURL(blob);
        // Set the filename for the download
        link.download = "GroceryList.txt";
        // Trigger the download by clicking the link programmatically
        link.click();
    };

    return (
        // Main container for the grocery list section, styled with Bootstrap classes
        <section className="container bg-white rounded-4 p-3 shadow-lg mt-4">
            {/* Header for the Grocery List section */}
            <h2 className="fw-bold">Grocery List</h2>

            {/* Input section for adding new items */}
            <div className="input-group mb-3">
                {/* Input field for the item name */}
                <input
                    type="text"
                    className="form-control"
                    placeholder="Item name"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)} // Update newItem state with input value
                />
                {/* Input field for the item quantity */}
                <input
                    type="text"
                    className="form-control"
                    placeholder="Quantity"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)} // Update newQuantity state with input value
                />
                {/* Button to add the new item to the list */}
                <button className="btn btn-primary" onClick={addItem}>
                    Add Item
                </button>
            </div>

            {/* Display list of grocery items */}
            <ul className="list-group mb-3">
                {/* Map over groceryItems to render each item */}
                {groceryItems.map((item, index) => (
                    // Each item as a list-group item styled with Bootstrap
                    <li
                        key={index} // Unique key for each item
                        className={`list-group-item d-flex justify-content-between align-items-center ${item.purchased ? "bg-light" : ""}`} // Light background if purchased
                    >
                        {/* Checkbox and label for each item */}
                        <div className="form-check">
                            {/* Checkbox to mark item as purchased */}
                            <input
                                type="checkbox"
                                className="form-check-input"
                                checked={item.purchased} // Checkbox checked if item is purchased
                                onChange={() => togglePurchased(index)} // Toggle purchased status on change
                            />
                            {/* Label showing item name and quantity, with strikethrough if purchased */}
                            <label
                                className={`form-check-label ${item.purchased ? "text-decoration-line-through" : ""}`} // Strikethrough style if purchased
                            >
                                {item.name} - {item.quantity} {/* Display item name and quantity */}
                            </label>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Button to download the grocery list as a text file */}
            <button className="btn btn-success" onClick={downloadList}>
                Download Grocery List
            </button>
        </section>
    );
};

export default GroceryList;

