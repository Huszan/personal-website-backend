import "reflect-metadata";
import { DataSource } from "typeorm";
import { HtmlLocate } from "./entity/HtmlLocate";
import { Manga } from "./entity/Manga";
import { Like } from "./entity/Like";
import { User } from "./entity/User";
import { Chapter } from "./entity/Chapter";
import { Page } from "./entity/Page";
import { Cache } from "./entity/Cache";
import { ReadProgress } from "./entity/ReadProgress";

const dataSource = new DataSource({
    type: "mysql",
    host: process.env.DS_HOST ? process.env.DS_HOST : "localhost",
    port: process.env.DS_PORT ? Number(process.env.DS_PORT) : 3306,
    username: process.env.DS_USERNAME ? process.env.DS_USERNAME : "root",
    password: process.env.DS_PASSWORD,
    database: process.env.DS_DATABASE,
    synchronize: true,
    logging: false,
    entities: [
        HtmlLocate,
        Manga,
        Like,
        User,
        Chapter,
        Page,
        Cache,
        ReadProgress,
    ],
    migrations: [],
    subscribers: [],
});

export const AppDataSource = dataSource;
