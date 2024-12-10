from firebase_admin import auth, credentials, firestore, initialize_app
from flask import Flask, jsonify, request,send_file
from ics import Calendar as ICSCalendar, Event
from flask import Flask, jsonify, request
from datetime import datetime, timedelta
from bson.objectid import ObjectId
from flask_cors import CORS
from functools import wraps
import requests
import time


app = Flask(__name__)
CORS(app)

# Initialize Firebase Admin
cred = credentials.Certificate("/root/firebase-credentials.json")
firebase_app = initialize_app(cred)
db = firestore.client()
FIREBASE_WEB_API_KEY = "AIzaSyA2M0xP2WEsmlf4aJPzcxJAWc90JUqApWQ"

# API key rotation logic
api_keys = [
    "6849c0c816mshb4e9ebc6fe79ea9p17c2e7jsn8c871f624f35",
    "0ea1aa7d96mshed2606d46ae33bfp115072jsn39dbd423bc47",
    "f6e8943a6bmsh9ecf4a9b8f39fc4p10ddd0jsn45b3c9ee0d7f",
    "cd41a26768mshb671d0643df4622p18b508jsnf07cbf1b3c14",
    "c7ef2c8e15mshccb9616c9745390p1c2989jsn798482168497",
    "d3e37b6dafmsh5e75683d78b0ca9p1b4021jsn1c2834f18b1e"
]
current_key_index = 0
failed_keys = set()

# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'No token provided'}), 401
        
        token = auth_header.split('Bearer ')[1]
        try:
            decoded_token = auth.verify_id_token(token)
            request.user = decoded_token
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid token'}), 401
            
    return decorated_function

def get_next_valid_api_key():
    global current_key_index, failed_keys
    
    if len(failed_keys) == len(api_keys):
        failed_keys.clear()
    
    while current_key_index < len(api_keys):
        if api_keys[current_key_index] not in failed_keys:
            return api_keys[current_key_index]
        current_key_index = (current_key_index + 1) % len(api_keys)
    
    current_key_index = 0
    failed_keys.clear()
    return api_keys[0]

def make_api_request(url: str, params: dict = None) -> dict:
    global current_key_index, failed_keys
    
    max_retries = len(api_keys)
    retries = 0
    
    while retries < max_retries:
        current_key = get_next_valid_api_key()
        headers = {
            "x-rapidapi-key": current_key,
            "x-rapidapi-host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com"
        }
        
        try:
            response = requests.get(url, headers=headers, params=params)
            if response.status_code == 429:  # Too Many Requests
                failed_keys.add(current_key)
                current_key_index = (current_key_index + 1) % len(api_keys)
                retries += 1
                continue
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            if "429" in str(e):
                failed_keys.add(current_key)
                current_key_index = (current_key_index + 1) % len(api_keys)
                retries += 1
                continue
            raise e
    
    raise Exception("All API keys have been exhausted")

# Meal planning endpoints
DaysInAWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def get_ServingID(maxCalories, minCalories, FilterItems):
    querystring = {
        "random": "true",
        "number": "1",
        "maxCalories": maxCalories,
        "minCalories": minCalories,
    }
    url = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByNutrients"
    response = make_api_request(url, params=(querystring | FilterItems))
    return response

def get_PlateInfo(ID):
    base_url = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes"
    
    Info = make_api_request(f"{base_url}/{ID}/information")
    Ingredients = make_api_request(f"{base_url}/{ID}/ingredientWidget.json")
    Nutrition = make_api_request(f"{base_url}/{ID}/nutritionWidget.json")
    
    return {
        "Information": Info,
        "Ingredients": Ingredients,
        "Nutrition": Nutrition,
    }

def get_recipes(ID):
    base_url = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes"
    Info = make_api_request(f"{base_url}/{ID}/information")
    return {"recipe": Info}
    
def get_nutrition(ID):
    base_url = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes"
    Nutrition = make_api_request(f"{base_url}/{ID}/nutritionWidget.json")
    return {"nutrition": Nutrition}

def get_meal_plan(plan_id):
    """Retrieve a meal plan from Firestore"""
    doc_ref = db.collection('meal_plans').document(plan_id)
    doc = doc_ref.get()
    if doc.exists:
        data = doc.to_dict()
        data['id'] = doc.id
        return data
    return None

def get_user_meal_plans(user_id):
    """Get all meal plans for a specific user"""
    plans = db.collection('meal_plans').where('user_id', '==', user_id).order_by(
        'created_at', direction=firestore.Query.DESCENDING
    ).limit(10).stream()
    
    return [{**plan.to_dict(), 'id': plan.id} for plan in plans]

def get_plan_ingredients(plan_id):
    """Retrieve ingredients for a specific meal plan"""
    plan = get_meal_plan(plan_id)
    if not plan or 'plan' not in plan:
        return None
        
    ingredients_list = []
    plan_data = plan['plan']
    
    # For daily meal plans
    if plan['type'] == 'day':
        for serving_key in plan_data:
            if serving_key.startswith('Serving'):
                serving = plan_data[serving_key]
                if 'Ingredients' in serving:
                    ingredients_list.append({
                        'serving': serving_key,
                        'ingredients': serving['Ingredients']
                    })
    
    # For weekly meal plans
    elif plan['type'] == 'week':
        for day in plan_data:
            if day in DaysInAWeek:
                day_ingredients = []
                for serving_key in plan_data[day]:
                    if serving_key.startswith('Serving'):
                        serving = plan_data[day][serving_key]
                        if 'Ingredients' in serving:
                            day_ingredients.append({
                                'serving': serving_key,
                                'ingredients': serving['Ingredients']
                            })
                if day_ingredients:
                    ingredients_list.append({
                        'day': day,
                        'servings': day_ingredients
                    })
    
    return ingredients_list

def get_grocery_items(user_id):
    """Get grocery items from Firestore"""
    doc_ref = db.collection('users').document(user_id)
    doc = doc_ref.get()
    if doc.exists:
        data = doc.to_dict()
        return data.get('grocery_list', [])
    return []

def set_Day(ServingsPerDay, DailyCaloricIntake, FilterItems):
    maxCalories = int(DailyCaloricIntake)
    totalCalories = 0
    Day = {}
    
    for num in range(int(ServingsPerDay)):
        ServingID = num + 1
        minCalories = 0
        Plate = get_ServingID(maxCalories, minCalories, FilterItems)
        
        PlateCalories = int(Plate[0]["calories"])
        maxCalories = maxCalories - PlateCalories
        totalCalories = totalCalories + PlateCalories
        
        PlateID = Plate[0]["id"]
        PlateInfo = get_PlateInfo(PlateID)
        Day[f"Serving {str(ServingID)}"] = PlateInfo
    
    Day["totalCaloriesPerDiem"] = totalCalories
    return Day

def set_Week(ServingsPerDay, DailyCaloricIntake, FilterItems):
    Week = {}
    for Day in DaysInAWeek:
        Week[Day] = set_Day(ServingsPerDay, DailyCaloricIntake, FilterItems)
    return Week

def meal_defractorization(meal_plan):
    meals = []
    plan_data = meal_plan['plan']
    DaysInAWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    # Count number of servings per day
    num_servings = 0
    if meal_plan['type'] == 'day':
        num_servings = sum(1 for key in plan_data if key.startswith('Serving'))
    elif meal_plan['type'] == 'week' and DaysInAWeek[0] in plan_data:
        num_servings = sum(1 for key in plan_data[DaysInAWeek[0]] if key.startswith('Serving'))
    
    # For Daily meal plans
    if meal_plan['type'] == 'day':
        for serving_key in plan_data:
            if serving_key.startswith('Serving'):
                serving = plan_data[serving_key]
                information = serving['Information']
                meal_id = information['id']
                ready_in = information['readyInMinutes']
                servings = information['servings']
                summary = information['summary']
                meal_name = information['title']
                source_url = information['sourceUrl']
                meal = {'meal_id': meal_id, 'ready_in': ready_in, 'servings': servings, 'summary': summary,
                       'meal_name': meal_name, 'sourceUrl': source_url}
                meals.append(meal)

    # For weekly meal plans
    elif meal_plan['type'] == 'week':
        for day in plan_data:
            if day in DaysInAWeek:
                for serving_key in plan_data[day]:
                    if serving_key.startswith('Serving'):
                        serving = plan_data[day][serving_key]
                        information = serving['Information']
                        meal_id = information['id']
                        ready_in = information['readyInMinutes']
                        servings = information['servings']
                        summary = information['summary']
                        meal_name = information['title']
                        meal_url = information['sourceUrl']
                        meal = {'meal_id': meal_id, 'ready_in': ready_in, 'servings': servings, 'summary': summary,
                               'meal_name': meal_name, 'sourceUrl': meal_url}
                        meals.append(meal)
    
    return meals, num_servings

def save_meal_plan(plan_type, plan_data, user_id=None):
    """Save a meal plan to Firestore"""
    doc_ref = db.collection('meal_plans').document()
    plan_data = {
        "type": plan_type,
        "created_at": firestore.SERVER_TIMESTAMP,
        "plan": plan_data,
        "user_id": user_id
    }
    
    doc_ref.set(plan_data)
    return doc_ref.id

def save_grocery_items(user_id, items):
    """Save grocery items to Firestore"""
    doc_ref = db.collection('users').document(user_id)
    doc_ref.update({
        'grocery_list': items,
        'grocery_list_updated_at': firestore.SERVER_TIMESTAMP
    })

def generate_ics_calendar(meals, num_meals_perday, filename="meal_plan.ics", start_date=None, plan_type='day'):
    cal = ICSCalendar()
    
    # Use provided start_date or default to current date
    if start_date is None:
        start_date = datetime.now().date()
    
    # Define meal times for breakfast, lunch, and dinner
    meal_times = {
        "breakfast": datetime.min.time().replace(hour=8),
        "lunch": datetime.min.time().replace(hour=12),
        "dinner": datetime.min.time().replace(hour=18),
    }
    
    # Calculate number of days based on plan type
    num_days = 7 if plan_type == 'week' else 1
    
    # Group meals into days
    meals_per_day = num_meals_perday
    meal_groups = [meals[i:i + meals_per_day] for i in range(0, len(meals), meals_per_day)]
    
    # Loop through the grouped meals and assign them to days
    for day_index, meal_group in enumerate(meal_groups[:num_days]):
        event_date = start_date + timedelta(days=day_index)
        
        # Distribute meals across breakfast, lunch, and dinner
        for meal_index, meal in enumerate(meal_group):
            meal_time_key = list(meal_times.keys())[meal_index % 3]
            meal_time = meal_times[meal_time_key]
            
            event = Event()
            event.name = meal['meal_name']
            event.begin = datetime.combine(event_date, meal_time)
            event.description = (
                f"Meal ID: {meal['meal_id']}\n"
                f"Ready in {meal['ready_in']} minutes\n"
                f"Servings: {meal['servings']}\n"
                f"Recipe URL: {meal['sourceUrl']}"
            )
            event.url = meal["sourceUrl"]
            cal.events.add(event)
    
    # Save the calendar to a file
    with open(filename, 'w') as f:
        f.writelines(cal)
    
    return filename

# Authentication endpoints
@app.route('/auth/register', methods=['GET','POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        username = data.get('username')
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        
        # Check if username already exists
        existing_users = db.collection('users').where('username', '==', username).get()
        if len(list(existing_users)) > 0:
            return jsonify({
                'status': 'error',
                'message': 'Username already exists'
            }), 400
        
        # Create user in Firebase Auth
        user = auth.create_user(
            email=email,
            password=password,
            display_name=username
        )
        
        # Create user document in Firestore
        db.collection('users').document(user.uid).set({
            'email': email,
            'username': username,
            'firstName': first_name,
            'lastName': last_name,
            'created_at': datetime.now().isoformat(),
            'meal_plan_ids': []
        })
        
        return jsonify({
            'status': 'success',
            'message': 'User created successfully',
            'user_id': user.uid
        }), 201
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/auth/login', methods=['GET','POST'])
def login():
    try:
        data = request.get_json()
        identifier = data.get('identifier')  # This can be email or username
        password = data.get('password')
        
        # First, try to find user by username
        users = db.collection('users').where('username', '==', identifier).limit(1).get()
        user_data = None
        
        for user in users:
            user_data = user.to_dict()
            email = user_data.get('email')
            break
        
        # If no user found by username, use identifier as email
        email = email if user_data else identifier
        
        try:
            # Sign in with email and password to get the ID token directly
            user = auth.get_user_by_email(email)
            # Generate a custom token
            custom_token = auth.create_custom_token(user.uid)
            
            # Exchange custom token for ID token using correct API key
            auth_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key={FIREBASE_WEB_API_KEY}"
            
            firebase_response = requests.post(auth_url, json={
                'token': custom_token.decode(),
                'returnSecureToken': True
            })
            
            if firebase_response.status_code == 200:
                id_token = firebase_response.json()['idToken']
                return jsonify({
                    'status': 'success',
                    'message': 'Login successful',
                    'id_token': id_token,
                    'user': {
                        'uid': user.uid,
                        'email': user.email,
                        'username': user.display_name
                    }
                }), 200
            else:
                print(f"Firebase Response Error: {firebase_response.text}")  # Add debugging
                return jsonify({
                    'status': 'error',
                    'message': 'Failed to get ID token',
                    'debug_info': firebase_response.text
                }), 401
                
        except Exception as e:
            print(f"Login error: {str(e)}")  # Add this for debugging
            return jsonify({
                'status': 'error',
                'message': 'Invalid credentials'
            }), 401
            
    except Exception as e:
        print(f"Outer login error: {str(e)}")  # Add this for debugging
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/Generate_Day', methods=['GET','POST'])
@login_required
def get_GenDay():
    try:
        DailyCaloricIntake = request.args.get('DailyCaloricIntake')
        ServingsPerDay = request.args.get('ServingsPerDay')
        excludeIngredients = request.args.get('excludeIngredients')
        intolerances = request.args.get('intolerances')
        diet = request.args.get('diet')

        FilterItems = {
            "diet": diet,
            "excludeIngredients": excludeIngredients,
            "intolerances": intolerances,
        }

        Day = set_Day(ServingsPerDay, DailyCaloricIntake, FilterItems)
        
        # Get user_id from the authenticated request
        user_id = request.user['uid'] if request.user else None
        
        plan_id = save_meal_plan("day", Day, user_id)
        
        return jsonify({
            "plan_id": plan_id,
            "meal_plan": Day,
            "status": "success"
        }), 200
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/Generate_Week', methods=['GET','POST'])
@login_required
def get_GenWeek():
    try:
        DailyCaloricIntake = request.args.get('DailyCaloricIntake')
        ServingsPerDay = request.args.get('ServingsPerDay')
        excludeIngredients = request.args.get('excludeIngredients')
        intolerances = request.args.get('intolerances')
        diet = request.args.get('diet')

        FilterItems = {
            "diet": diet,
            "excludeIngredients": excludeIngredients,
            "intolerances": intolerances,
        }

        Week = set_Week(ServingsPerDay, DailyCaloricIntake, FilterItems)
        
        # Get user_id from the authenticated request
        user_id = request.user['uid'] if request.user else None
        
        plan_id = save_meal_plan("week", Week, user_id)
        
        return jsonify({
            "plan_id": plan_id,
            "meal_plan": Week,
            "status": "success"
        }), 200
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/generate_calendar', methods=['GET'])
@login_required
def generate_calendar():
    try:
        plan_id = request.args.get('plan_id')
        start_date = request.args.get('start_date')
        plan_type = request.args.get('plan_type', 'day')
        
        if not plan_id:
            return jsonify({"error": "Meal plan ID is required"}), 400
            
        meals_data = get_meal_plan(plan_id)
        if not meals_data:
            return jsonify({"error": "Meal plan not found"}), 404
            
        meals, num_servings = meal_defractorization(meals_data)
        
        # Parse start date based on plan type
        if plan_type == 'week' and start_date:
            year, week = start_date.split('-W')
            selected_date = datetime.strptime(f'{year}-W{week}-1', '%Y-W%W-%w').date()
        else:
            selected_date = datetime.strptime(start_date, '%Y-%m-%d').date() if start_date else datetime.now().date()
        
        filename = "meal_plan.ics"
        generate_ics_calendar(
            meals=meals,
            num_meals_perday=num_servings,
            filename=filename,
            start_date=selected_date,
            plan_type=plan_type
        )
        
        return send_file(
            filename,
            as_attachment=True,
            download_name=filename,
            mimetype='text/calendar'
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/Get_Meal_Plan/<plan_id>', methods=['GET','POST'])
@login_required
def retrieve_meal_plan(plan_id):
    try:
        plan = get_meal_plan(plan_id)
        if plan:
            return jsonify({
                "meal_plan": plan,
                "status": "success"
            }), 200
        return jsonify({
            "message": "Meal plan not found",
            "status": "error"
        }), 404
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/user/meal_plans', methods=['GET','POST'])
@login_required
def get_user_plans():
    try:
        user_id = request.user['uid']
        plans = db.collection('meal_plans').where('user_id', '==', user_id).order_by(
            'created_at', direction=firestore.Query.DESCENDING
        ).limit(10).stream()
        
        plans_list = []
        for plan in plans:
            plan_dict = plan.to_dict()
            plan_dict['id'] = plan.id
            plans_list.append(plan_dict)
        
        return jsonify({
            "meal_plans": plans_list,
            "status": "success"
        }), 200
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500
    
@app.route('/meal_plan/<plan_id>/ingredients', methods=['GET','POST'])
@login_required
def get_meal_plan_ingredients(plan_id):
    try:
        ingredients = get_plan_ingredients(plan_id)
        if ingredients is not None:
            return jsonify({
                "ingredients": ingredients,
                "status": "success"
            }), 200
        return jsonify({
            "message": "Meal plan not found or no ingredients available",
            "status": "error"
        }), 404
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/get_recipe/<recipe_id>', methods=['GET','POST'])
def get_recipe(recipe_id):
    try:
        recipe = get_recipes(recipe_id)
        nutrition = get_nutrition(recipe_id)

        if recipe is not None:
            return jsonify({
                "id": recipe_id,
                "recipe": recipe,
                "nutrition": nutrition,
                "status": "success"
            }), 200
        return jsonify({
            "message": "Recipe not found",
            "status": "error"
        }), 404
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500
    
@app.route('/grocery/items', methods=['GET','POST'])
@login_required
def get_user_grocery_items():
    try:
        user_id = request.user['uid']
        items = get_grocery_items(user_id)
        return jsonify({
            "items": items,
            "status": "success"
        }), 200
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/grocery/items', methods=['GET','POST'])
@login_required
def update_grocery_items():
    try:
        user_id = request.user['uid']
        data = request.get_json()
        items = data.get('items', [])
        save_grocery_items(user_id, items)
        return jsonify({
            "status": "success",
            "message": "Grocery list updated successfully"
        }), 200
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/create_rating', methods=['POST'])
@login_required
def create_rating():
    try:
        data = request.get_json()
        user_id = request.user['uid']
        recipe_id = data.get('recipe_id')
        rating = data.get('rating')
        review = data.get('review')

        # Save rating to Firestore
        db.collection('ratings').add({
            'user_id': user_id,
            'recipe_id': recipe_id,
            'rating': rating,
            'review': review,
            'created_at': firestore.SERVER_TIMESTAMP
        })

        return jsonify({
            "status": "success",
            "message": "Rating added successfully"
        }), 201
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/get_ratings/<recipe_id>', methods=['GET'])
def get_ratings(recipe_id):
    try:
        # Convert recipe_id to integer to match Firestore data type
        recipe_id = int(recipe_id)  # Changed from str() to int()
        
        # Query ratings for the specific recipe_id
        ratings_ref = db.collection('ratings')
        ratings = ratings_ref.where('recipe_id', '==', recipe_id).get()
        
        ratings_list = []
        for rating in ratings:
            rating_data = rating.to_dict()
            rating_data['id'] = rating.id
            # Convert Firestore Timestamp to ISO format string
            if 'created_at' in rating_data and rating_data['created_at']:
                rating_data['created_at'] = rating_data['created_at'].isoformat()
            ratings_list.append(rating_data)
        
        
        return jsonify({
            "ratings": ratings_list,
            "status": "success"
        }), 200
    except Exception as e:
        print(f"Error in get_ratings: {str(e)}")
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6969)
