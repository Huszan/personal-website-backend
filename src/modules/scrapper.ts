import {HtmlLocateType} from "../types/html-locate.type";
import {MangaType} from "../types/manga.type";
import * as HtmlLocateTable from "./tables/html-locate-table";

const axios = require("axios");
const cheerio = require("cheerio");
const { getUrlWithToken } = require("../types/html-locate.type");

export async function getMangaPages(idHtmlLocate: number | null, chapter: number, htmlLocate: HtmlLocateType | null = null) {
    let pages: any = [];
    let locate: HtmlLocateType | null = htmlLocate;
    if(!locate) {
        await HtmlLocateTable.read(idHtmlLocate)
            .then((res: any) => {
                locate = HtmlLocateTable.convertTableEntryToData(res);
            })
    }
    if (locate === null) return pages;
    for(let i = 0; i < locate.urls.length; i++) {
        let url = getUrlWithToken(locate.urls[i], chapter);
        await axios(url)
            .then((res: any) => {
                const html = res.data;
                const $ = cheerio.load(html);
                for(let i = 0; i < locate!.positions.length; i++) {
                    $(locate!.positions[i], html)
                        .each(function () {
                            try {
                                // @ts-ignore
                                let obj = $(this).find(locate!.lookedType);
                                let pass = true;
                                const src = obj.attr(locate!.lookedAttr);
                                if (!src) pass = false;
                                if (pass) pages.push(src);
                            } catch (err: any) {
                                console.log(err.message);
                            }
                        })
                    if(pages.length > 3) break;
                    else pages = [];
                }
            })
            .catch((err: any) => console.log(err.message));
        if(pages.length > 0)
            break;
    }
    if(pages <= 0) console.log(`id: ${idHtmlLocate}, ${chapter} chapter was unable to get pages`);
    return pages;
}

export async function testMangaForm(manga: MangaType) {
    let failedChapters: number[] = [];
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
    if(!passed) return {
        success: false,
        failedChapters: failedChapters,
    };
    else return {
        success: true
    };
}