class meal:
    def __init__(self,id,title,image,ready_in_minutes,servings,source_url,summary,diets,dish_type,cuisine,ingredients,instructions,nutrients):
        self.id = id
        self.title = title
        self.image = image
        self.ready_in_minutes = ready_in_minutes
        self.servings = servings
        self.source_url = source_url
        self.summary = summary
        self.diets = diets or []
        self.dish_type = dish_type or []
        self.cuisine = cuisine or []
        self.ingredients = ingredients or []
        self.instructions = instructions
        def get_ingredient_list(self):
            """
            Returns a formatted list of ingredients.
            """
            return [f"{ingredient['amount']} {ingredient['unit']} {ingredient['name']}"
                    for ingredient in self.ingredients]

        def get_nutrient_info(self):
            """
            Returns a summary of the key nutrients.
            """
            return f"Calories: {self.nutrients.get('calories', 'N/A')}, " \
                   f"Protein: {self.nutrients.get('protein', 'N/A')}, " \
                   f"Fat: {self.nutrients.get('fat', 'N/A')}, " \
                   f"Carbs: {self.nutrients.get('carbs', 'N/A')}"

        def to_dict(self):
            return {
                "id": self.id,
                "title": self.title,
                "image": self.image,
                "ready_in_minutes": self.ready_in_minutes,
                "servings": self.servings,
                "source_url": self.source_url,
                "summary": self.summary,
                "diets": self.diets,
                "dish_type": self.dish_type,
                "cuisine": self.cuisine,
                "nutrients": self.nutrients,
                "ingredients": self.ingredients,
                "instructions": self.instructions,
        }