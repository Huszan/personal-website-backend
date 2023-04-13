const util = require("util");
const mysql = require("mysql");

const TABLES = {
    manga: 'manga',
    htmlLocate: 'html_locate',
}
const localCon = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Su6E%%15Ybu#",
    database: "pwmain",
});
const remoteCon = mysql.createConnection({
    host: "o2olb7w3xv09alub.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "wjlmndg8y3a72ezl",
    password: "zgh3o33rphf58bih",
    database: "t065i8yl6afla4e4",
})
const query = util.promisify(localCon.query).bind(remoteCon);

module.exports = {TABLES, query};
