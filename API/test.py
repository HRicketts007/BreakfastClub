from Calendar import calendar
from meal import Serving,Ingredients,Nutrition,Meal,MealPlan

# Example servings
serving1_monday = Serving(
    info={
        "id": 123456,
        "title": "Vegan Avocado Salad",
        "readyInMinutes": 15,
        "servings": 2,
        "sourceUrl": "https://spoonacular.com/recipe/vegan-avocado-salad-123456",
        "image": "https://spoonacular.com/recipeImages/123456-556x370.jpg"
    },
    ingredients=Ingredients(items=[
        {"name": "avocado", "amount": 1, "unit": "whole"},
        {"name": "tomato", "amount": 2, "unit": "medium"},
        {"name": "lemon juice", "amount": 1, "unit": "tbsp"},
        {"name": "salt", "amount": 0.5, "unit": "tsp"}
    ]),
    nutrition=Nutrition(calories=250, carbs="22g", fat="16g", protein="3g")
)

serving2_monday = Serving(
    info={
        "id": 789012,
        "title": "Quinoa Stuffed Peppers",
        "readyInMinutes": 30,
        "servings": 4,
        "sourceUrl": "https://spoonacular.com/recipe/quinoa-stuffed-peppers-789012",
        "image": "https://spoonacular.com/recipeImages/789012-556x370.jpg"
    },
    ingredients=Ingredients(items=[
        {"name": "bell pepper", "amount": 4, "unit": "whole"},
        {"name": "quinoa", "amount": 1, "unit": "cup"},
        {"name": "black beans", "amount": 1, "unit": "cup"},
        {"name": "corn", "amount": 0.5, "unit": "cup"}
    ]),
    nutrition=Nutrition(calories=300, carbs="45g", fat="8g", protein="10g")
)

# Meals for each day
monday_meal = Meal(servings=[serving1_monday, serving2_monday], total_calories=1800)

# Plan for the week
plan = {
    "Monday": monday_meal,
    "Tuesday": Meal(servings=[Serving(
        info={
            "id": 345678,
            "title": "Chickpea Curry",
            "readyInMinutes": 20,
            "servings": 3,
            "sourceUrl": "https://spoonacular.com/recipe/chickpea-curry-345678",
            "image": "https://spoonacular.com/recipeImages/345678-556x370.jpg"
        },
        ingredients=Ingredients(items=[
            {"name": "chickpeas", "amount": 1, "unit": "can"},
            {"name": "coconut milk", "amount": 1, "unit": "cup"},
            {"name": "curry powder", "amount": 1, "unit": "tbsp"},
            {"name": "spinach", "amount": 2, "unit": "cups"}
        ]),
        nutrition=Nutrition(calories=400, carbs="40g", fat="20g", protein="10g")
    )], total_calories=1700)
}

# Create the meal plan
example_meal_plan = MealPlan(
    username="john_doe",
    plan_type="week",
    plan=plan,
    total_calories_for_week=3500
)

meals_data = {
    "Monday": {
        "meals": [
            {
                "id": 123456,
                "title": "Vegan Avocado Salad",
                "readyInMinutes": 15,
                "servings": 2,
                "sourceUrl": "https://spoonacular.com/recipe/vegan-avocado-salad-123456"
            },
            {
                "id": 789012,
                "title": "Quinoa Stuffed Peppers",
                "readyInMinutes": 30,
                "servings": 4,
                "sourceUrl": "https://spoonacular.com/recipe/quinoa-stuffed-peppers-789012"
            }
        ]
    },
    "Tuesday": {
        "meals": [
            {
                "id": 345678,
                "title": "Chickpea Curry",
                "readyInMinutes": 20,
                "servings": 3,
                "sourceUrl": "https://spoonacular.com/recipe/chickpea-curry-345678"
            }
        ]
    }
}



# Convert to BSON-like dictionary for MongoDB
meal_plan_dict = example_meal_plan.to_dict()


calendar.generate_ics_calendar(meals=meals_data,num_meals_perday=2)