import { AppDataSource } from "./data-source"
import * as bodyParser from "body-parser";
import * as scrapper from "./modules/scrapper";
import {MangaType} from "./types/manga.type";
import {Manga} from "./entity/Manga";
import * as MangaTable from "./modules/tables/manga-table";
import * as HtmlLocateTable from "./modules/tables/html-locate-table";
import * as EmailHandler from "./modules/email-handler";
import {convertDataToTableEntry} from "./modules/tables/manga-table";
import {HtmlLocate} from "./entity/HtmlLocate";
const express = require('express');
const cors = require("cors");

AppDataSource.initialize().then(async () => {
    const app = express();
    let listener: any = app.listen(process.env.PORT || 3000, () => {
        console.log(`The server started on port ${listener.address()!.port}`);
    });
    app.use(bodyParser.json());
    app.use(function (req: any, res: any, next: any) {
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Headers', true);
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        next();
    })
    app.use(cors(
        '*',
        true,
        200
    ));

    app.post("/post", (req: any, res: any) => {
        let body = req.body;
        EmailHandler.sendMail(body, (info: { messageId: any; }) => {
            console.log(`E-mail has been sent. Id -> ${info.messageId}`);
            res.send(info);
        });
    });

    app.post("/getMangaPages", async (req: any, res: any) => {
        let manga: MangaType = req.body.manga;
        let chapter: number = req.body.chapter;
        scrapper.getMangaPages(chapter, manga.htmlLocate)
            .then((results: any) => {
                res.send(results);
                let data = MangaTable.convertDataToTableEntry(manga);
                data.view_count++;
                MangaTable.update(data, manga.id)
            })
    })

    app.post("/testMangaForm", async (req: any, res: any) => {
        let manga: MangaType = req.body.manga || null;
        let testId = req.body.testId || null;
        if (testId) {
            scrapper.continueTest(manga, testId)
                .then((results: any) => {
                    res.send(results);
                })
        } else {
            scrapper.testMangaForm(manga)
                .then((results: any) => {
                    res.send(results);
                })
        }
    })

    app.post("/createManga", async (req: any, res: any) => {
        let manga: Manga = MangaTable.convertDataToTableEntry(req.body.manga) || null;
        MangaTable.create(manga)
            .then((results: any) => {
                res.send({
                    success: true
                });
            })
    })

    app.post("/removeManga", async (req: any, res: any) => {
        let manga: MangaType = req.body.manga;
        HtmlLocateTable.remove(manga.htmlLocate.id)
            .then(() => {
                MangaTable.remove(manga.id).then(() => {
                    res.send({
                        success: true
                    });
                })
            })
    })

    app.get("/getMangaList", (req: any, res: any) => {
        let id: number | undefined = req.query.id;
        MangaTable.read(id)
            .then((mangaList: any) => {
                let convertedList = [];
                mangaList.forEach(el => {
                    convertedList.push(MangaTable.convertTableEntryToData(el));
                })
                res.send(convertedList);
            })
    })

}).catch(error => console.log(error))
