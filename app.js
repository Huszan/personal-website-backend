const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const details = require("./details.json");

const app = express();
app.use(cors(
    ['https://personal-website-060797.herokuapp.com/'],
    true,
    200
));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', "https://personal-website-060797.herokuapp.com/");
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

// main().catch(console.error);
// START BY USING 'nodemon' COMMAND!