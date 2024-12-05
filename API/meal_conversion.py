def meal_defractorization(meal_plan):
    serving_meal = dict()
    meals = []
    plan_data = meal_plan['plan']
    DaysInAWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
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
    return meals
