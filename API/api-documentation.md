# Meal Planning API Documentation

## Base URL
`http://your-domain:6969`

## Authentication
All endpoints (except authentication endpoints) require a Bearer token in the Authorization header:
```
Authorization: Bearer <firebase_id_token>
```

## Authentication Endpoints

### Register User
- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "username": "string",
    "firstName": "string",
    "lastName": "string"
  }
  ```
- **Success Response**: 
  - Status: 201
  ```json
  {
    "status": "success",
    "message": "User created successfully",
    "user_id": "string"
  }
  ```

### Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "identifier": "string", // email or username
    "password": "string"
  }
  ```
- **Success Response**:
  - Status: 200
  ```json
  {
    "status": "success",
    "message": "Login successful",
    "id_token": "string",
    "user": {
      "uid": "string",
      "email": "string",
      "username": "string"
    }
  }
  ```

## Meal Planning Endpoints

### Generate Daily Meal Plan
- **URL**: `/Generate_Day`
- **Method**: `GET`
- **Query Parameters**:
  - `DailyCaloricIntake`: Total daily calories (number)
  - `ServingsPerDay`: Number of meals per day (number)
  - `excludeIngredients`: Ingredients to exclude (string)
  - `intolerances`: Food intolerances (string)
  - `diet`: Diet type (string)
- **Success Response**:
  - Status: 200
  ```json
  {
    "plan_id": "string",
    "meal_plan": {
      // Meal plan details
    },
    "status": "success"
  }
  ```

### Generate Weekly Meal Plan
- **URL**: `/Generate_Week`
- **Method**: `GET`
- **Query Parameters**:
  - `DailyCaloricIntake`: Total daily calories (number)
  - `ServingsPerDay`: Number of meals per day (number)
  - `excludeIngredients`: Ingredients to exclude (string)
  - `intolerances`: Food intolerances (string)
  - `diet`: Diet type (string)
- **Success Response**:
  - Status: 200
  ```json
  {
    "plan_id": "string",
    "meal_plan": {
      // Weekly meal plan details
    },
    "status": "success"
  }
  ```

### Get Specific Meal Plan
- **URL**: `/Get_Meal_Plan/<plan_id>`
- **Method**: `GET`
- **Success Response**:
  - Status: 200
  ```json
  {
    "meal_plan": {
      // Meal plan details
    },
    "status": "success"
  }
  ```

### Get User's Meal Plans
- **URL**: `/user/meal_plans`
- **Method**: `GET`
- **Success Response**:
  - Status: 200
  ```json
  {
    "meal_plans": [
      // Array of meal plans
    ],
    "status": "success"
  }
  ```

### Get Meal Plan Ingredients
- **URL**: `/meal_plan/<plan_id>/ingredients`
- **Method**: `GET`
- **Success Response**:
  - Status: 200
  ```json
  {
    "ingredients": [
      // Array of ingredients by serving/day
    ],
    "status": "success"
  }
  ```

## Error Responses
All endpoints may return the following error response:
```json
{
  "error": "error message",
  "status": "error"
}
```
- Status: 400, 401, 404, or 500

## Notes
- All authenticated endpoints require a valid Firebase ID token
- Meal plans are automatically saved to the user's account
- The API uses rate-limited endpoints, so some requests might need to be retried
- Weekly meal plans include recipes for all seven days of the week