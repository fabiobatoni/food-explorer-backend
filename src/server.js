require("express-async-errors");

const cors = require("cors");

const express = require("express");
const swaggerUi = require("swagger-ui-express");

const swaggersDocs = require('./swagger.json');;

const AppError = require("./utils/AppError");

const routes = require("./routes");

const uploadConfig = require("./configs/upload");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggersDocs));

app.use("/files", express.static(uploadConfig.UPLOADS_FOLDER))

app.use(routes);

app.use((error, req, res, next) => {
    if(error instanceof AppError){
        return res.status(error.statusCode).json({
            status: "error",
            message: error.message
        });
    }

    console.error(error);

    return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
    })
});

const PORT = 3333;

app.listen(PORT, () => console.log(`Server Listening on ${PORT}`));


