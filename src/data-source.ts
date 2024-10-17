import "reflect-metadata";
import { DataSource } from "typeorm";
import { HtmlLocate } from "./entity/HtmlLocate";
import { Manga } from "./entity/Manga";
import { Like } from "./entity/Like";
import { User } from "./entity/User";
import { Chapter } from "./entity/Chapter";
import { Page } from "./entity/Page";

const localDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "***REMOVED***",
    database: "***REMOVED***",
    synchronize: true,
    logging: false,
    entities: [HtmlLocate, Manga, Like, User, Chapter, Page],
    migrations: [],
    subscribers: [],
});

const dsGoogleCloud = new DataSource({
    type: "mysql",
    host: "***REMOVED***",
    port: 3306,
    username: "***REMOVED***",
    password: "***REMOVED***",
    database: "***REMOVED***",
    synchronize: true,
    logging: false,
    entities: [HtmlLocate, Manga, Like, User, Chapter, Page],
    migrations: [],
    subscribers: [],
});

const dsKamateraBaseMaD = new DataSource({
    type: "mysql",
    host: "***REMOVED***",
    port: 3306,
    username: "root",
    password: "***REMOVED***",
    database: "***REMOVED***",
    synchronize: true,
    logging: false,
    entities: [HtmlLocate, Manga, Like, User, Chapter, Page],
    migrations: [],
    subscribers: [],
});

let dataSource = dsGoogleCloud;

if (process.env.NODE_ENV.trim() === "development") {
    console.log("Started data source on development mode");
    dataSource = localDataSource;
}

export const AppDataSource = dataSource;
