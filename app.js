const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const details = require("./details.json");
const {mangaList} = require("./classes/manga");
const scrapper = require("./classes/scrapper");

const allowedSite = 'https://personal-website-060797.herokuapp.com/';

scrapper.testMangas();

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
  sendMail(body, info => {
    console.log(`E-mail has been sent. Id -> ${info.messageId}`);
    res.send(info);
  });
});

app.post("/getManga", (req, res) => {
    let id = req.body.id;
    let chapter = req.body.chapter;
    scrapper.getManga(mangaList[id], chapter)
        .then(info => {
          res.send(info);
        })
})

app.get("/getMangaList", (req, res) => {
  let list = [];
  for (let i = 0; i < mangaList.length; i++) {
    let manga = mangaList[i];
    list.push({
      id: i,
      name: manga.name,
      pic: manga.pic,
      startingChapter: manga.startingChapter,
      chapterCount: manga.chapterCount,
    })
  }
  res.send(list);
})

async function sendMail(body, callback) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: details.email,
      pass: details.password
    }
  });

  let mailOptions = {
    from: '"Personal Website"', // sender address
    to: details.email, // list of receivers
    subject: "Contact from Personal site ✔", // Subject line
    text: `\n
    Name: ${body.name},\n
    Email: ${body.email},\n\n
    ${body.message}` // plain text body
  };

  // send mail with defined transport object
  let info = await transporter.sendMail(mailOptions);

  callback(info);
}