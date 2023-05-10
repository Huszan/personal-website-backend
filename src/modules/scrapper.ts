import {HtmlLocateType} from "../types/html-locate.type";
import {MangaType} from "../types/manga.type";
import * as HtmlLocateTable from "./tables/html-locate-table";
import {val} from "cheerio/lib/api/attributes";

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

export async function getMangaPages(chapter: number, locate: HtmlLocateType) {
    let pages: any = [];
    if (locate === null) return pages;
    for(let i = 0; i < locate.urls.length; i++) {
        let url = getUrlWithToken(locate.urls[i], chapter);
        await axios(url)
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
                    if(pages.length > 3) break;
                    else pages = [];
                }
            })
            .catch((err: any) => console.log(err.message));
        if(pages.length > 0)
            break;
    }
    if(pages <= 0) console.log(`${locate.id}, ${chapter} chapter was unable to get pages`);
    return pages;
}

export async function testMangaForm(manga: MangaType) {
    let failedChapters: number[] = [];
    for(let i = manga.startingChapter; i <= manga.chapterCount; i++) {
        console.log(`Testing ${manga.name} ${i}/${manga.chapterCount}`);
        await getMangaPages(i, manga.htmlLocate)
            .then(res => {
                if(res.length <= 1)
                    failedChapters.push(i);
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
        else await getMangaPages(chapter, manga.htmlLocate)
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
