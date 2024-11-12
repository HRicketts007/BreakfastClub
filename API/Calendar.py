from ics import Calendar as ICSCalendar, Event
from datetime import datetime, timedelta
class calendar:
    def __init__(self, meals, num_meals_perday):
        self.meals = meals
        self.num_meals_perday = num_meals_perday

    def generate_ics_calendar(self, meals, num_meals_perday, filename="meal_plan.ics"):
        cal = ICSCalendar()
        start_date = datetime.now().date()

        # Loop through the fetched meal plan for each day
        for i, (day, meals) in enumerate(self.meals.items()):
            event_date = start_date + timedelta(days=i)
            for meal in meals.get("meals", []):
                event = Event()
                event.name = meal["title"]
                event.begin = datetime.combine(event_date, datetime.min.time())
                event.description = f"Meal ID: {meal['id']}\nReady in {meal['readyInMinutes']} minutes.\nServings: {meal['servings']}"
                event.url = meal.get("sourceUrl", "")
                cal.events.add(event)

        # Export to .ics file
        with open(filename, "w") as f:
            f.writelines(cal)
        print(f"Calendar saved as {filename}")