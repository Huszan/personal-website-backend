import "reflect-metadata"
import { DataSource } from "typeorm"
import { HtmlLocate } from "./entity/HtmlLocate"
import { Manga } from "./entity/Manga";
import {Like} from "./entity/Like";
import {User} from "./entity/User";
import {Chapter} from "./entity/Chapter";

const localDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "***REMOVED***",
    database: "***REMOVED***",
    synchronize: true,
    logging: false,
    entities: [HtmlLocate, Manga, Like, User, Chapter],
    migrations: [],
    subscribers: [],
})

const productionDataSource = new DataSource({
    type: "mysql",
    host: "***REMOVED***",
    port: 3306,
    username: "***REMOVED***",
    password: "***REMOVED***",
    database: "***REMOVED***",
    synchronize: true,
    logging: false,
    entities: [HtmlLocate, Manga, Like, User, Chapter],
    migrations: [],
    subscribers: [],
})

let dataSource = productionDataSource;

if (process.env.NODE_ENV.trim() === 'development') {
    console.log('Started data source on development mode');
    dataSource = localDataSource;
}

export const AppDataSource = dataSource;
