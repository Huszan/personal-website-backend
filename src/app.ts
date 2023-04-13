import {MangaType} from "./types/manga.type";
import express, {Application, Request, Response} from "express";

const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const scrapper = require("./modules/scrapper");
const emailHandler = require("./modules/emailHandler");
const dbTables = require("./modules/database/dbTables");

app.use(cors(
    '*',
    true,
    200
));
app.use(bodyParser.json());
app.use(function (req: any, res: any, next: any) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', true);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  next();
})

let listener: any = app.listen(process.env.PORT || 3000, () => {
  console.log(`The server started on port ${listener.address()!.port}`);
});

app.post("/post", (req: any, res: any) => {
  let body = req.body;
  emailHandler.sendMail(body, (info: { messageId: any; }) => {
    console.log(`E-mail has been sent. Id -> ${info.messageId}`);
    res.send(info);
  });
});

app.post("/getMangaPages", async (req: Request, res: Response) => {
    let id = req.body.idHtmlLocate;
    let chapter = req.body.chapter;
    scrapper.getMangaPages(id, chapter)
        .then((results: any) => {
            res.send(results);
        })
})

app.post("/testMangaForm", async (req: Request, res: Response) => {
    let manga: MangaType = req.body.manga || null;
    scrapper.testMangaForm(manga)
        .then((results: any) => {
            res.send(results);
        })
})

app.post("/createManga", async (req: Request, res: Response) => {
    let manga: MangaType = req.body.manga || null;
    dbTables.manga.create(manga)
        .then((results: any) => {
            res.send(true);
        })
})

app.get("/getMangaList", (req: Request, res: Response) => {
    let id = req.query.id;
    if(id !== undefined) {
        dbTables.manga.read(id)
            .then((mangaList: MangaType[]) => {
                res.send(mangaList);
            })
    }
    else {
        dbTables.manga.read()
            .then((mangaList: MangaType[]) => {
                res.send(mangaList);
            })
    }
})
