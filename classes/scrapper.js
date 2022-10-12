const axios = require("axios");
const cheerio = require("cheerio");
const {mangaList} = require("./manga");

async function getManga(manga, chapter) {
    let pages = [];
    let locate = manga.htmlLocate;

    for(let i = 0; i < manga.urls.length; i++) {
        let url = manga.getUrlWithToken(manga.urls[i], chapter);
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
        console.log(`${manga.name} ${chapter} chapter was unable to get pages`);
    return pages;
}

async function testMangas() {
    let passed = true;
    console.log(`Started testing mangas`);
    for (const el of mangaList) {
        for(let i = el.startingChapter; i <= el.chapterCount; i++) {
            console.log(`Testing ${el.name} ${i}/${el.chapterCount}`);
            await getManga(el, i)
                .then(res => {
                    if(res.length <= 0)
                        passed = false;
                });
        }
    }
    let rText = passed ? 'positive' : 'negative';
    console.log(`Scrapping manga tests results => ${rText}`);
}

module.exports = {getManga, testMangas};