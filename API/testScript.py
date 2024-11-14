import requests
import json

# Global user data for testing
USER_DATA = {
    "email": "nsalazar2@student.gsu.edu",
    "password": "password123",
    "username": "nsalazar2",
    "firstName": "Nick",
    "lastName": "S"
}

class MealPlannerAPITest:
    def __init__(self, base_url):
        self.base_url = base_url
        self.token = None
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })

    def login(self, identifier, password):
        endpoint = f"{self.base_url}/auth/login"
        login_data = {
            "identifier": identifier,
            "password": password
        }
        
        try:
            response = self.session.post(endpoint, json=login_data)
            response_data = response.json()
            
            if response.status_code == 200 and response_data.get('status') == 'success':
                self.token = response_data.get('id_token')
                print(f"Login successful with {identifier}")
                return True
            elif response.status_code == 401:
                print(f"Account not found")
                return False
            else:
                print(f"Login failed: {response_data.get('message', 'Unknown error')}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"Error during login: {str(e)}")
            return False

    def register(self, user_data):
        endpoint = f"{self.base_url}/auth/register"
        try:
            response = self.session.post(endpoint, json=user_data)
            response_data = response.json()
            
            if response.status_code == 201 and response_data.get('status') == 'success':
                print("Account created successfully")
                return True
            else:
                print(f"Registration failed: {response_data.get('message', 'Unknown error')}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"Error during registration: {str(e)}")
            return False

    def logout(self):
        self.token = None
        print("Logged out")

    def generate_day_plan(self, daily_calories, servings):
        if not self.token:
            print("Error: Not logged in")
            return None

        endpoint = f"{self.base_url}/Generate_Day"
        params = {
            "DailyCaloricIntake": str(daily_calories),
            "ServingsPerDay": str(servings),
            "excludeIngredients": "",
            "intolerances": "",
            "diet": ""
        }
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            response = self.session.get(endpoint, params=params, headers=headers)
            response_data = response.json()
            
            if response.status_code == 200 and response_data.get('status') == 'success':
                plan_id = response_data.get('plan_id')
                print(f"Plan_ID: {plan_id}")
                return plan_id
            return None
        except requests.exceptions.RequestException as e:
            print(f"Error generating meal plan: {str(e)}")
            return None
    
    def get_meal_plan_ingredients(self, plan_id):
        if not self.token:
            print("Error: Not logged in")
            return None

        endpoint = f"{self.base_url}/meal_plan/{plan_id}/ingredients"
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            response = self.session.get(endpoint, headers=headers)
            return response.json() if response.status_code == 200 else None
        except requests.exceptions.RequestException as e:
            print(f"Error getting ingredients: {str(e)}")
            return None

    def get_user_meal_plans(self):
        if not self.token:
            print("Error: Not logged in")
            return None

        endpoint = f"{self.base_url}/user/meal_plans"
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            print(f"Fetching meal plans...")
            response = self.session.get(endpoint, headers=headers)
            
            try:
                response_data = response.json()
                
                if response.status_code == 200 and response_data.get('status') == 'success':
                    plans = response_data.get('meal_plans', [])
                    if plans:
                        print("\nAll User's Meal Plans:")
                        print("-" * 40)
                        for plan in plans:
                            created_at = plan.get('created_at', 'No date')
                            plan_type = plan.get('type', 'No type')
                            plan_id = plan.get('id', 'No ID')
                            print(f"ID: {plan_id}")
                            print(f"Type: {plan_type}")
                            print(f"Created: {created_at}")
                            print()
                        return plans
                    else:
                        print("No meal plans found for this user.")
                        return None
                else:
                    error_msg = response_data.get('error', 'Unknown error')
                    print(f"Failed to fetch meal plans: {error_msg}")
                    return None
                    
            except json.JSONDecodeError:
                print(f"Error: Invalid JSON response")
                print(f"Raw response: {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"Error getting meal plans: {str(e)}")
            return None

def main():
    api = MealPlannerAPITest('http://45.56.112.26:6969')

    # Try initial login with username
    print("\nTesting initial login...")
    initial_login_success = api.login(USER_DATA["username"], USER_DATA["password"])

    if initial_login_success:
        # If login worked, skip to meal plan generation
        print("\nGenerating meal plan...")
        plan_id = api.generate_day_plan(2000, 3)
        print()
        plan_ingredients = api.get_meal_plan_ingredients(plan_id)
        if plan_ingredients:
            print(json.dumps(plan_ingredients, indent=2))

        print("\nFetching all meal plans...")
        api.get_user_meal_plans()
    else:
        # If login failed, proceed with registration and additional login tests
        print("\nRegistering new account...")
        api.register(USER_DATA)

        # Login with username
        print("\nTesting login with username...")
        api.logout()
        api.login(USER_DATA["username"], USER_DATA["password"])

        # Login with email
        print("\nTesting login with email...")
        api.logout()
        if api.login(USER_DATA["email"], USER_DATA["password"]):
            # Generate meal plan after successful login
            print("\nGenerating meal plan...")
            api.generate_day_plan(2000, 3)

            print("\nFetching all meal plans...")
            api.get_user_meal_plans()

if __name__ == "__main__":
    main()
