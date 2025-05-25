import { AppDataSource } from './data-source';
import * as bodyParser from 'body-parser';
import { AdvancedScrapper } from './modules/scrapper/advanced-scrapper';
import * as express from 'express';
import * as router from './routes/_main-router';

const cors = require('cors');
require('@dotenvx/dotenvx').config();

AppDataSource.initialize()
    .then(async () => {
        const app = express();

        let listener: any = app.listen(process.env.PORT || 3000, () => {
            console.log(
                `The server started on port ${listener.address()!.port}`
            );
        });
        app.set('trust proxy', 1);
        app.use(bodyParser.json({ limit: '100mb' }));
        app.use(cors());
        router.applyRoutes(app);

        AdvancedScrapper.axiosSetup();
    })
    .catch((error) => console.log(error));
