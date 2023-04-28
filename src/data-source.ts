import "reflect-metadata"
import { DataSource } from "typeorm"
import { HtmlLocate } from "./entity/HtmlLocate"
import { Manga } from "./entity/Manga";

const localDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "***REMOVED***",
    database: "***REMOVED***",
    synchronize: true,
    logging: false,
    entities: [HtmlLocate, Manga],
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
    entities: [HtmlLocate, Manga],
    migrations: [],
    subscribers: [],
})

export const AppDataSource = productionDataSource;
