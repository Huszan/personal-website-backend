import {HtmlLocateType} from "../types/html-locate.type";
import {MangaType} from "../types/manga.type";
import * as HtmlLocateTable from "./tables/html-locate-table";
import {val} from "cheerio/lib/api/attributes";
import {Manga} from "../entity/Manga";

const axios = require("axios");
const cheerio = require("cheerio");
const { getUrlWithToken } = require("../types/html-locate.type");

let testIterator = 1;
const latestTests: { id: number, failedOn: number[] }[] = [];

function getLocalisations(htmlLocate: HtmlLocateType): string[] {
    const localisations = [];
    htmlLocate.positions.forEach(pos => {
        localisations.push(`${pos} > ${htmlLocate.lookedType}`);
    })
    return localisations;
}

export async function getMangaPages(locate: HtmlLocateType) {
    let pages: any = [];
    if (locate === null) return pages;
    for(let i = 0; i < locate.urls.length; i++) {
        await axios(locate.urls[i])
            .then((res: any) => {
                const html = res.data;
                const $ = cheerio.load(html);
                let localisations = getLocalisations(locate);
                for(let i = 0; i < localisations.length; i++) {
                    $(localisations[i])
                        .each((index, value) => {
                            let page = $(value).attr(locate.lookedAttr);
                            if (page) { pages.push(page) }
                        })
                    if(pages.length > 0) break;
                    else pages = [];
                }
            })
            .catch((err: any) => console.log(err.message));
        if(pages.length > 0)
            break;
    }
    if(pages <= 0) console.log(`${locate.id} was unable to get pages`);
    return pages;
}

export async function testMangaChapter(manga: MangaType, chapter: number) {
    let passed = true;
    await getMangaPages(manga.chapters[chapter].pagesHtmlLocate)
        .then(pages => {
            if(pages.length <= 1) { passed = false }
        });
    return passed;
}

export async function testMangaForm(manga: MangaType) {
    let failedChapters: number[] = [];
    for(let i = manga.startingChapter; i <= manga.chapterCount; i++) {
        console.log(`Testing ${manga.name} ${i}/${manga.chapterCount}`);
        await getMangaPages(manga.chapters[i].pagesHtmlLocate)
            .then(res => {
                if(res.length <= 0) { failedChapters.push(i); }
            });
    }
    let passed = failedChapters.length === 0;
    console.log(`Scrapping manga tests results => ${passed ? 'positive' : 'negative'}`);
    if(!passed) {
        let test = { id: testIterator++, failedOn: failedChapters };
        latestTests.push(test);
        return {
            success: false,
            failedChapters: failedChapters,
            testId: test.id,
        };
    }
    else return {
        success: true
    };
}

export async function continueTest(manga: MangaType, testId: number) {
    const test = latestTests.filter(el => el.id === testId)[0];
    if (!test) return testMangaForm(manga);
    const failedChapters: number[] = [];
    let i = 0;
    for (const chapter of test.failedOn) {
        console.log(`Testing ${manga.name} ${chapter}/${manga.chapterCount}`);
        if (chapter > manga.chapterCount) { test.failedOn.splice(i, 1); }
        else await getMangaPages(manga.chapters[chapter].pagesHtmlLocate)
            .then(res => {
                if(res.length <= 1)
                    failedChapters.push(chapter);
            });
        i++;
    }
    let passed = failedChapters.length === 0;
    if(!passed) {
        test.failedOn = failedChapters;
        return {
            success: false,
            failedChapters: failedChapters,
            testId: testId,
        };
    }
    else {
        latestTests.splice(latestTests.indexOf(test), 1);
        return {
            success: true
        };
    }
}
