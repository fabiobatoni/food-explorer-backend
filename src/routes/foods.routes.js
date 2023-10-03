const { Router } = require('express');
const multer = require('multer');
const uploadConfig = require('../configs/upload');

const ensureAuthenticated = require('../middlewares/ensureAuthenticated');
const FoodsController = require("../controllers/FoodsController")

const foodsController = new FoodsController();

const foodsRoutes = Router();
const upload = multer(uploadConfig.MULTER);

foodsRoutes.use(ensureAuthenticated);

// Foods Routes
foodsRoutes.post("/", upload.single("image"), foodsController.create);
foodsRoutes.get("/", foodsController.index);
foodsRoutes.get("/:id", foodsController.show);
foodsRoutes.delete("/:id", foodsController.delete);
foodsRoutes.put("/:id", upload.single("image"), foodsController.update);

module.exports = foodsRoutes;
