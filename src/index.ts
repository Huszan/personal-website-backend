import { AppDataSource } from "./data-source";
import * as bodyParser from "body-parser";
import { AdvancedScrapper } from "./modules/scrapper/advanced-scrapper";
import * as express from "express";
import * as router from "./routes/_main-router";
import rateLimit from "express-rate-limit";

const cors = require("cors");
require("@dotenvx/dotenvx").config();

AppDataSource.initialize()
    .then(async () => {
        const app = express();
        const limiter = rateLimit({
            windowMs: 1 * 60 * 1000, // 1 minute
            max: 200,
            message: "Too many requests, please try again later.",
        });

        let listener: any = app.listen(process.env.PORT || 3000, () => {
            console.log(
                `The server started on port ${listener.address()!.port}`
            );
        });
        app.set("trust proxy", 1);
        app.use(bodyParser.json({ limit: "100mb" }));
        app.use(cors());
        app.use(limiter);
        router.applyRoutes(app);

        AdvancedScrapper.axiosSetup();
    })
    .catch((error) => console.log(error));
