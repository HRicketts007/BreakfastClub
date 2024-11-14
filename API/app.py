import requests
from flask import Flask, request, render_template, redirect, url_for, session, flash, jsonify, send_file

from pymongo import MongoClient
from datetime import datetime
from bson.objectid import ObjectId
from ics import Calendar as ICSCalendar, Event
from datetime import datetime, timedelta
import time


app = Flask(__name__)

app.secret_key = "your-secret-key"
mongo_uri = "mongodb+srv://User:.@mealprepper.4ko8v.mongodb.net/?retryWrites=true&w=majority&appName=MealPrepper"
client = MongoClient(mongo_uri)
db = client.meal_prepper
meal_plans = db.meal_plans
users = db.users

headers = {
    "x-rapidapi-key": "c0d239cd76mshf7141d9ae816aeap194ed7jsn1345827527df",
    "x-rapidapi-host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com"
}
DaysInAWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def is_logged_in():
    return 'username' in session
@app.route('/register', methods=['GET', 'POST'])
def register():
    data = request.json
    if request.method == 'POST':
        username = data.get('username')
        password = data.get('password')

        if users.find_one({"username": username}):
            flash("Username already exists", "error")
            #return redirect(url_for('register'))


        users.insert_one({"username": username, "password": password})
        flash("Registration successful! Please log in.", "success")
        #return redirect(url_for('login'))
        return jsonify({"message": "User registered successfully"})
@app.route('/login', methods=['GET', 'POST'])
def login():
    data = request.json
    if request.method == 'POST':
        username = data.get('username')
        password = data.get('password')

        # Find user in database
        user = users.find_one({"username": username})

        if user and password == user['password']:
            session['username'] = username

            return jsonify({"message": "Login successful!", "status": "success"})   #Do not have a dashboard yet
        else:

            return jsonify({"message": "Invalid username or password", "status": "error"})

@app.route('/logout')
def logout():
    session.pop('username', None)
    flash("You have been logged out.", "info")
    return redirect(url_for('login'))


def get_ServingID(maxCalories, minCalories, filter_items, max_retries=5):
    querystring = {
        "random": "true",
        "number": "1",
        "maxCalories": maxCalories,
        "minCalories": minCalories,
    }
    querystring.update(filter_items)

    url = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByNutrients"

    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=headers, params=querystring)
            if response.status_code == 429:
                print(f"Rate limit hit. Retrying in {2 ** attempt} seconds...")
                time.sleep(2 ** attempt)  # Exponential backoff
                continue
            response.raise_for_status()
            data = response.json()

            if isinstance(data, list) and len(data) > 0:
                return data
            else:
                print("No recipes found with the given parameters.")
                return []
        except requests.RequestException as e:
            print(f"Error fetching serving ID: {e}")
            return []

    print("Max retries reached. Unable to fetch data from Spoonacular API.")
    return []

def get_PlateInfo(ID):
    url = f"https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/{ID}/information"
    Info = requests.get(url, headers=headers).json()

    url = f"https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/{ID}/ingredientWidget.json"
    Ingredients = requests.get(url, headers=headers).json()
    
    url = f"https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/{ID}/nutritionWidget.json"
    Nutrition = requests.get(url, headers=headers).json()
    
    response = {
        "Information": Info,
        "Ingredients": Ingredients,
        "Nutrition": Nutrition,
    }

    return response


def set_Day(servings_per_day, daily_caloric_intake, filter_items):
    max_calories = int(daily_caloric_intake)
    total_calories = 0
    day_plan = {}

    for serving_num in range(int(servings_per_day)):
        min_calories = max_calories // 2
        plate = get_ServingID(max_calories, min_calories, filter_items)

        if not plate:
            break  # Stop if no more meals can be fetched

        plate_calories = int(plate[0].get("calories", 0))
        max_calories -= plate_calories
        total_calories += plate_calories

        plate_id = plate[0].get("id")
        plate_info = get_PlateInfo(plate_id)
        day_plan[f"Serving {serving_num + 1}"] = plate_info

    day_plan["totalCaloriesPerDiem"] = total_calories
    return day_plan


def set_Week(servings_per_day, daily_caloric_intake, filter_items):
    week_plan = {}
    for day in DaysInAWeek:
        daily_plan = set_Day(servings_per_day, daily_caloric_intake, filter_items)
        week_plan[day] = daily_plan
    return week_plan


def save_meal_plan(plan_type, plan_data):
    document = {
        "type": plan_type,
        "created_at": datetime.now().strftime("%Y%m%d_%H%M%S"),
        "plan": plan_data
    }
    try:
        result = meal_plans.insert_one(document)
        if session.get('username'):
            users.update_one(
                {"username": session['username']},
                {"$push": {"recent_meal_plan_ids": result.inserted_id}}
            )
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error saving meal plan: {e}")
        return None


def get_meal_plan(plan_id):
    try:
        plan = meal_plans.find_one({"_id": ObjectId(plan_id)})
        if plan:
            plan['_id'] = str(plan['_id'])
        return plan
    except Exception as e:
        print(f"Error fetching meal plan: {e}")
        return None


# Flask route to generate a daily meal plan
@app.route('/Generate_Day', methods=['GET'])
def get_GenDay():
    try:
        daily_caloric_intake = request.args.get('DailyCaloricIntake')
        servings_per_day = request.args.get('ServingsPerDay')
        exclude_ingredients = request.args.get('excludeIngredients')
        intolerances = request.args.get('intolerances')
        diet = request.args.get('diet')

        if not daily_caloric_intake or not servings_per_day:
            return jsonify({"error": "Missing required parameters"}), 400

        filter_items = {
            "diet": diet,
            "excludeIngredients": exclude_ingredients,
            "intolerances": intolerances,
        }

        day_plan = set_Day(servings_per_day, daily_caloric_intake, filter_items)
        plan_id = save_meal_plan("day", day_plan)

        return jsonify({"plan_id": plan_id, "meal_plan": day_plan}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Flask route to generate a weekly meal plan
@app.route('/Generate_Week', methods=['GET'])
def get_GenWeek():
    daily_caloric_intake = request.args.get('DailyCaloricIntake')
    servings_per_day = request.args.get('ServingsPerDay')
    exclude_ingredients = request.args.get('excludeIngredients')
    intolerances = request.args.get('intolerances')
    diet = request.args.get('diet')

    if not daily_caloric_intake or not servings_per_day:
        return jsonify({"error": "Missing required parameters"}), 400

    filter_items = {
        "diet": diet,
        "excludeIngredients": exclude_ingredients,
        "intolerances": intolerances,
    }

    week_plan = set_Week(servings_per_day, daily_caloric_intake, filter_items)
    plan_id = save_meal_plan("week", week_plan)

    return jsonify({"plan_id": plan_id, "meal_plan": week_plan}), 200

def generate_ics_calendar(meals, num_meals_perday, filename="meal_plan.ics"):
    cal = ICSCalendar()
    start_date = datetime.now().date()

    # Loop through the fetched meal plan for each day
    for i, (day, meals) in enumerate(meals.items()):
        event_date = start_date + timedelta(days=i)
        for meal in meals:
            event = Event()
            event.name = meal["title"]
            event.begin = datetime.combine(event_date, datetime.min.time())
            event.description = f"Meal ID: {meal['_id']}\nReady in {meal['readyInMinutes']} minutes.\nServings: {meal['servings']}"
            event.url = meal.get("sourceUrl", "")
            cal.events.add(event)

        # Export to .ics file
    with open(filename, "w") as f:
        f.writelines(cal)
    print(f"Calendar saved as {filename}")

@app.route('/generate_calendar', methods=['GET','POST'])
def generate_calendar():
    plan_id = request.args.get('plan_id')
    meals_data = get_meal_plan(plan_id)
    if not plan_id:
        return {"error": "Meal plan not found"}, 404
    filename = "meal_plan.ics"
    generate_ics_calendar(meals=meals_data, num_meals_perday=2, filename=filename)
    return send_file(filename, as_attachment=True, download_name=filename, mimetype='text/calendar')

@app.route('/Get_Meal_Plan/<plan_id>', methods=['GET'])
def retrieve_meal_plan(plan_id):
    plan = get_meal_plan(plan_id)
    if plan:
        return plan
    else:
        return {"error": "Meal plan not found"}, 404




if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0', port=5000)