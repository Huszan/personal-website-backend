const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const scrapper = require("./modules/scrapper");
const emailHandler = require("./modules/emailHandler");
const dbTables = require("./modules/database/dbTables");
const {Manga} = require("./classes/manga");
const {HtmlLocate} = require("./classes/htmlLocate");

const allowedSite = 'https://personal-website-060797.herokuapp.com/';

app.use(cors(
    '*',
    true,
    200
));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', true);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  next();
})

let listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`The server started on port ${listener.address().port}`);
});

app.post("/post", (req, res) => {
  let body = req.body;
  emailHandler.sendMail(body, info => {
    console.log(`E-mail has been sent. Id -> ${info.messageId}`);
    res.send(info);
  });
});

app.post("/getMangaPages", async (req, res) => {
    let id = req.body.idHtmlLocate;
    let chapter = req.body.chapter;
    scrapper.getMangaPages(id, chapter)
        .then(info => {
            res.send(info);
        })
})
app.post("/testMangaForm", async (req, res) => {
    // It's receiving full manga form
    let manga = new Manga(
        null,
        req.body.name,
        req.body.pic,
        req.body.startingChapter,
        req.body.chapterCount,
        new HtmlLocate(
            req.body.htmlLocate.positions,
            req.body.htmlLocate.lookedType,
            req.body.htmlLocate.lookedAttr,
            [],
            req.body.htmlLocate.urls,
        ),
    )
    scrapper.testMangaForm(manga)
        .then(info => {
            res.send(info);
        })
})
app.post("/createManga", async (req, res) => {
    // It's receiving full manga form
    let manga = new Manga(
        null,
        req.body.name,
        req.body.pic,
        req.body.startingChapter,
        req.body.chapterCount,
        new HtmlLocate(
            req.body.htmlLocate.positions,
            req.body.htmlLocate.lookedType,
            req.body.htmlLocate.lookedAttr,
            [],
            req.body.htmlLocate.urls,
        ),
    )
    dbTables.manga.create(manga)
        .then(id => {
            res.send(true);
        })
})

app.get("/getMangaList", (req, res) => {
    dbTables.manga.read()
        .then(mangas => {
            res.send(mangas);
        })
})