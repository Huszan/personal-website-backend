import "reflect-metadata"
import { DataSource } from "typeorm"
import { HtmlLocate } from "./entity/HtmlLocate"
import { Manga } from "./entity/Manga";
import {Like} from "./entity/Like";
import {User} from "./entity/User";

const localDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "Su6E%%15Ybu#",
    database: "pwmain",
    synchronize: true,
    logging: false,
    entities: [HtmlLocate, Manga, Like, User],
    migrations: [],
    subscribers: [],
})

const productionDataSource = new DataSource({
    type: "mysql",
    host: "o2olb7w3xv09alub.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    port: 3306,
    username: "wjlmndg8y3a72ezl",
    password: "zgh3o33rphf58bih",
    database: "t065i8yl6afla4e4",
    synchronize: true,
    logging: false,
    entities: [HtmlLocate, Manga, Like, User],
    migrations: [],
    subscribers: [],
})

let dataSource = productionDataSource;

if (process.env.NODE_ENV.trim() === 'development') {
    console.log('Started data source on development mode');
    dataSource = localDataSource;
}

export const AppDataSource = dataSource;
