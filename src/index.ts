import { AppDataSource } from "./data-source";
import * as bodyParser from "body-parser";
import { AdvancedScrapper } from "./modules/scrapper/advanced-scrapper";
import * as express from "express";
import * as router from "./routes/_main-router";

const cors = require("cors");
require("@dotenvx/dotenvx").config();

AppDataSource.initialize()
    .then(async () => {
        const app = express();
        let listener: any = app.listen(process.env.PORT || 3000, () => {
            console.log(
                `The server started on port ${listener.address()!.port}`
            );
        });
        app.use(bodyParser.json());
        app.use(cors());
        router.applyRoutes(app);

        AdvancedScrapper.axiosSetup();

        // let bttScrapper = new BTTScrapper();
        // bttScrapper.sendSpider({
        //     saveEntries: true,
        //     skipTo: 15031,
        // });
    })
    .catch((error) => console.log(error));
