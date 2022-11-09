const util = require("util");
const mysql = require("mysql");

const TABLES = {
    manga: 'manga',
    htmlLocate: 'html_locate',
}
const localCon = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "***REMOVED***",
    database: "***REMOVED***",
});
const remoteCon = mysql.createConnection({
    host: "***REMOVED***",
    user: "***REMOVED***",
    password: "***REMOVED***",
    database: "***REMOVED***",
})
const query = util.promisify(remoteCon.query).bind(remoteCon);

module.exports = {TABLES, query};