const axios = require("axios");
const cheerio = require("cheerio");
const dbTables = require("./database/dbTables");
const {getUrlWithToken} = require("../classes/htmlLocate");

async function getMangaPages(idHtmlLocate, chapter, htmlLocate = null) {
    let pages = [];
    let locate = htmlLocate;
    if(!locate) {
        await dbTables.htmlLocate.read(idHtmlLocate)
            .then(res => {
                locate = res;
            })
    }
    for(let i = 0; i < locate.urls.length; i++) {
        let url = getUrlWithToken(locate.urls[i], chapter);
        await axios(url)
            .then(res => {
                const html = res.data;
                const $ = cheerio.load(html);
                for(let i = 0; i < locate.positions.length; i++) {
                    $(locate.positions[i], html)
                        .each(function () {
                            try {
                                let obj = $(this).find(locate.lookedType);
                                let pass = true;
                                let found = false;
                                locate.reqComparisons.forEach(el => {
                                    if (obj.attr(el[0]) === el[1])
                                        found = true;
                                })
                                if(locate.reqComparisons.length > 0 && !found)
                                    pass = false;
                                const src = obj.attr(locate.lookedAttr);
                                if (pass)
                                    pages.push(src);
                            } catch (err) {
                                console.log(err);
                            }
                        })
                    if(pages.length > 0) break;
                }
            }).catch(err => console.log(err));
        if(pages > 0)
            break;
    }
    if(pages <= 0)
        console.log(`id: ${idHtmlLocate}, ${chapter} chapter was unable to get pages`);
    return pages;
}

async function testMangaForm(manga) {
    let failedChapters = [];
    for(let i = manga.startingChapter; i <= manga.chapterCount; i++) {
        console.log(`Testing ${manga.name} ${i}/${manga.chapterCount}`);
        await getMangaPages(null, i, manga.htmlLocate)
            .then(res => {
                if(res.length <= 1)
                    failedChapters.push(i);
            });
    }
    let passed = failedChapters.length === 0;
    console.log(`Scrapping manga tests results => ${passed ? 'positive' : 'negative'}`);
    if(passed) return true;
    else return failedChapters;
}

module.exports = {getMangaPages, testMangaForm};