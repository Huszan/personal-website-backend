const nodemailer = require("nodemailer");
const details = require("../../details.json");
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: details.email,
        pass: details.password
    }
});

async function sendMail(body: any, callback: any) {
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

module.exports = { sendMail };
