const knex = require("../database/knex");
const AppError = require('../utils/AppError');
const DiskStorage = require("../providers/DiskStorage");

class FoodsController {
  async create(req, res) {
    const {title, description, category, price, ingredients} = req.body;

    const checkFoodAlreadyExists = await knex("foods").where({title}).first();

    if(checkFoodAlreadyExists){
      throw new AppError("Este prato já existe no cardápio.");
    }

    const imageFileName = req.file.filename;

    const diskStorage = new DiskStorage()

    const filename = await diskStorage.saveFile(imageFileName);

    const [food_id] = await knex("foods").insert({
      image: filename,
      title,
      description,
      price,
      category,
    });

    const hasOnlyOneIngredient = typeof(ingredients) === "string";

    let ingredientsInsert

    if (typeof ingredients === "string") {
      ingredientsInsert = [
        {
          name: ingredients,
          food_id,
        },
      ];
    } else if (Array.isArray(ingredients) && ingredients.length > 0) {
      ingredientsInsert = ingredients.map((name) => ({
        name,
        food_id,
      }));
    }

    await knex("ingredients").insert(ingredientsInsert);

    return res.status(201).json();
  }

  async show(req, res) {
    const { id } = req.params;
    const food = await knex("foods").where({ id }).first();
    const ingredients = await knex("ingredients").where({ food_id: id }).orderBy("name");

    return res.status(201).json({
        ...food,
        ingredients
    });
  }

  async update(req, res) {
    const { title, description, category, price, ingredients, image } = req.body;
    const { id } = req.params;

    const imageFileName = req.file.filename;

    const diskStorage = new DiskStorage();

    const food = await knex("foods").where({ id }).first();

    if (food.image) {
      await diskStorage.deleteFile(food.image);
    }

    const filename = await diskStorage.saveFile(imageFileName);

    food.image = image ?? filename;
    food.title = title ?? food.title;
    food.description = description ?? food.description;
    food.category = category ?? food.category;
    food.price = price ?? food.price;

    await knex("foods").where({ id }).update(food);

    const hasOnlyOneIngredient = typeof(ingredients) === "string";

    let ingredientsInsert

    if (hasOnlyOneIngredient) {
        ingredientsInsert = {
            name: ingredients,
            food_id: food.id,
        }

    } else if (ingredients.length > 1) {
        ingredientsInsert = ingredients.map(ingredient => {
            return {
            food_id: food.id,
            name : ingredient
            }
        });
    }

    await knex("ingredients").where({ food_id: id}).delete()
    await knex("ingredients").where({ food_id: id}).insert(ingredientsInsert)

    return res.status(201).json('Prato atualizado com sucesso')
  }

  async delete(req, res) {
    const { id } = req.params;

    await knex("foods").where({ id }).delete();

    return res.status(202).json();
  }

  async index(req, res) {
    const { title, ingredients } = req.query;

    let foods;

    if (ingredients) {
        const filterIngredients = ingredients.split(',').map(ingredient => ingredient.trim());

        foods = await knex("ingredients")
            .select([
                "foods.id",
                "foods.title",
                "foods.description",
                "foods.category",
                "foods.price",
                "foods.image",
            ])
            .whereLike("foods.title", `%${title}%`)
            .whereIn("name", filterIngredients)
            .innerJoin("foods", "foods.id", "ingredients.food_id")
            .groupBy("foods.id")
            .orderBy("foods.title")
    } else {
      foods = await knex("foods")
            .whereLike("title", `%${title}%`)
            .orderBy("title");
    }

    const foodsIngredients = await knex("ingredients")
    const foodsWithIngredients = foods.map(food => {
        const foodIngredient = foodsIngredients.filter(ingredient => ingredient.food_id === food.id);

        return {
            ...food,
            ingredients: foodIngredient
        }
    })

    return res.status(200).json(foodsWithIngredients);
  }
}

module.exports = FoodsController;
