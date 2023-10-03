const { Router } = require("express");

const usersRoutes = require("./users.routes");
const foodsRouter = require("./foods.routes");
const sessionsRouter = require("./sessions.routes");

const routes = Router();

routes.use("/users", usersRoutes);
routes.use("/foods", foodsRouter);
routes.use("/sessions", sessionsRouter);


module.exports = routes;
