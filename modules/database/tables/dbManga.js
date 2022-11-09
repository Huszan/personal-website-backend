const dbHandler = require("../dbHandler");
const dbHtmlLocate = require("./dbHtmlLocate");
const {TABLES} = require("../dbHandler");

const tableName = TABLES.manga;
const FIELD = {
    id: 'id_manga',
    name: 'name',
    pic: 'pic',
    startingChapter: 'starting_chapter',
    chapterCount: 'chapter_count',
    idHtmlLocate: 'id_html_locate',
}

async function create(data) {
    let idHtmlLocate = await dbHtmlLocate.create(data.htmlLocate);
    let sql =
        `INSERT INTO ${tableName} 
        (${FIELD.name}, ${FIELD.pic}, ${FIELD.startingChapter}, ${FIELD.chapterCount}, ${FIELD.idHtmlLocate}) 
        VALUES ("${data.name}", "${data.pic}", ${data.startingChapter}, ${data.chapterCount}, ${idHtmlLocate})`;
    let table;
    await dbHandler.query(sql)
        .then(res => {
            console.log(`Successfully created ${tableName}, id -> ${res.insertId}`);
            table = res.insertId;
        })
    return table;
}
async function read() {
    let sql =
        `SELECT ${FIELD.id} AS id,
        ${FIELD.name} AS name,
        ${FIELD.pic} AS pic,
        ${FIELD.startingChapter} AS startingChapter,
        ${FIELD.chapterCount} AS chapterCount,
        ${FIELD.idHtmlLocate} AS idHtmlLocate
        FROM ${tableName}`
    let data = null;
    await dbHandler.query(sql)
        .then(res => {
            if(res) data = JSON.parse(JSON.stringify(res));
        })
    if(!data) return null;
    return data;
}
async function update(id, data) {
    let sql =
        `UPDATE ${tableName}
        SET name = '${data.name}', pic = '${data.pic}', starting_chapter = ${data.startingChapter}, 
        chapter_count = ${data.chapterCount}
        WHERE id_manga = ${id}`
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
        WHERE id_manga = ${id}`
    await dbHandler.query(sql)
        .then(res => {
            console.log(`Successfully deleted ${id} ${tableName}`);
        })
        .catch(err => {
            console.log(`Deleting ${id} ${tableName} weren't successful\n${err.message}`);
        })
}

module.exports = {create, read, update, remove, FIELD}