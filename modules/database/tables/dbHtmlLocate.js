const dbHandler = require("../dbHandler");
const {TABLES} = require("../dbHandler");

const tableName = TABLES.htmlLocate;
const FIELD = {
    id: 'id_html_locate',
    positions: 'positions',
    lookedType: 'looked_type',
    lookedAttr: 'looked_attr',
    reqComparisons: 'req_comparisons',
    urls: 'urls',
}

function packData(data) {
    data.positions ? data.positions = JSON.stringify(data.positions) : data.positions = null;
    data.reqComparisons ? data.reqComparisons = JSON.stringify(data.reqComparisons) : data.reqComparisons = null;
    data.urls ? data.urls = JSON.stringify(data.urls) : data.urls = null;
}
function unpackData(data) {
    data.positions ? data.positions = JSON.parse(data.positions) : data.positions = null;
    data.reqComparisons ? data.reqComparisons = JSON.parse(data.reqComparisons) : data.reqComparisons = null;
    data.urls ? data.urls = JSON.parse(data.urls) : data.urls = null;
}

async function create(data) {
    packData(data);
    let sql =
        `INSERT INTO ${tableName} (${FIELD.positions}, ${FIELD.lookedType}, 
        ${FIELD.lookedAttr}, ${FIELD.reqComparisons}, ${FIELD.urls}) 
        VALUES ('${data.positions}', '${data.lookedType}', 
        '${data.lookedAttr}', '${data.reqComparisons}', '${data.urls}')`;
    let table;
    await dbHandler.query(sql)
        .then(res => {
            console.log(`Successfully created ${tableName}, id -> ${res.insertId}`);
            table = res.insertId;
        })
    return table;
}
async function read(id = null) {
    let sql =
        `SELECT ${FIELD.positions} AS positions,
        ${FIELD.lookedType} AS lookedType,
        ${FIELD.lookedAttr} AS lookedAttr,
        ${FIELD.reqComparisons} AS reqComparisons,
        ${FIELD.urls} AS urls
        FROM ${tableName}`;
    if(id) sql += ` WHERE ${FIELD.id} = ${id}`;
    let data;
    await dbHandler.query(sql)
        .then(res => {
        res ? data = JSON.parse(JSON.stringify(res)) : data = null;
    })
    if(!data) return null;
    if(data.length) {
        data.forEach(el => unpackData(el));
    }
    if(id) return data[0];
    return data;
}
async function update(id, data) {
    packData(data);
    let sql =
        `UPDATE ${tableName}
        SET ${FIELD.positions} = '${data.positions}', ${FIELD.lookedType} = "${data.lookedType}", 
        ${FIELD.lookedAttr} = "${data.lookedAttr}", ${FIELD.reqComparisons} = '${data.reqComparisons}', 
        ${FIELD.urls} = '${data.urls}'
        WHERE id_html_locate = ${id}`
    await dbHandler.query(sql)
        .then(res => {
            console.log(`Successfully updated ${id} ${tableName}`)
        })
        .catch(err => {
            console.log(`Updating ${id} ${tableName} weren't successful\n${err.message}`);
        })
}
async function remove(id) {
    let sql =
        `DELETE FROM ${tableName}
        WHERE id_html_locate = ${id}`
    dbHandler.query(sql)
        .then(res => {
            console.log(`Successfully deleted ${id} ${tableName}`)
        })
        .catch(err => {
            console.log(`Deleting ${id} ${tableName} weren't successful\n${err.message}`);
        })
}

module.exports = {create, read, update, remove, FIELD}