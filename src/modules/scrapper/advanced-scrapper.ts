import {Cheerio, CheerioAPI, Element} from "cheerio";
import {HtmlLocateType} from "../../types/html-locate.type";
import {MangaType} from "../../types/manga.type";

const axios = require("axios");
const cheerio = require("cheerio");

export class AdvancedScrapper {

    static async gatherEntries(locate: HtmlLocateType) {
        const gathered = [];
        const $ = await this.getPageData(locate.urls);
        const elements = await this.localiseElements($, locate);
        gathered.push(...elements);
        return gathered;
    }

    static async getMangaData(
        localisation: {
            name?: HtmlLocateType,
            pic?: HtmlLocateType,
            authors?: HtmlLocateType,
            genres?: HtmlLocateType,
            description?: HtmlLocateType,
            chapters?: {
                name: HtmlLocateType,
                link: HtmlLocateType,
            },
            pages?: HtmlLocateType,
        }
    ): Promise<MangaType | any> {
        try {
            let chapters: any = [];
            if (localisation.chapters) {
                let chapterNames = await this.gatherEntries(localisation.chapters.name);
                let chapterLinks = await this.gatherEntries(localisation.chapters.link);
                for (let i = 0; i < chapterNames.length; i++) {
                    let clonedPages = JSON.parse(JSON.stringify(localisation.pages));
                    clonedPages.urls = [chapterLinks[i]];
                    chapters.push({
                        name: chapterNames[i],
                        htmlLocate: clonedPages,
                    })
                }
            }
            let manga = {
                name: localisation.name ? await this.gatherEntries(localisation.name) : null,
                pic: localisation.pic ? await this.gatherEntries(localisation.pic) : null,
                authors: localisation.authors ? await this.gatherEntries(localisation.authors) : null,
                genres: localisation.genres ? await this.gatherEntries(localisation.genres) : null,
                description: localisation.description ? await this.gatherEntries(localisation.description) : null,
                chapters: chapters,
            }
            if (manga.name) manga.name = manga.name[0];
            if (manga.pic) manga.pic = manga.pic[0];
            if (manga.description) manga.description = manga.description[0];
            return manga;
        }
        catch (error) {
            console.log('Something went wrong during getting manga data.');
            throw error;
        }
    }

    private static async localiseElements($: CheerioAPI, locate: HtmlLocateType) {
        const elements = [];
        for(let i = 0; i < locate.positions.length; i++) {
            let localisation = $(locate.positions[i]);
            let htmlElements = localisation.children(locate.lookedType);
            this.applyFilters(htmlElements, locate);
            htmlElements.each((index, value) => {
                let inner$ = $(value);
                let el = locate.lookedAttr === 'content'
                    ? inner$.text()
                    : inner$.attr(locate.lookedAttr);
                if (el) { elements.push(el) }
            })
            if(elements.length > 0) break;
        }
        return elements;
    }

    private static applyFilters(htmlElements: Cheerio<Element>, locate: HtmlLocateType) {
        if (locate.filter && locate.filter.outer) {
            if (locate.filter.outer.from) htmlElements = htmlElements.filter((i) => i >= locate.filter.outer.from);
            if (locate.filter.outer.to) htmlElements = htmlElements.filter((i) => i <= locate.filter.outer.to);
        }
        if (locate.filter && locate.filter.inner) {
            htmlElements.each((i, el) => {
                if (locate.filter.inner.from) el.children = el.children.filter(
                    (value, index) => index >= locate.filter.inner.from);
                if (locate.filter.inner.to) el.children = el.children.filter(
                    (value, index) => index <= locate.filter.inner.to);
            })
        }
    }

    private static async getPageData(urls: string[]): Promise<CheerioAPI> {
        try {
            for (let i = 0; i < urls.length; i++) {
                const response = await axios.get(urls[i]);
                const data = cheerio.load(response.data);
                if (data && response.status === 200) return data;
            }
            return null;
        } catch (error) {
            console.error("Error fetching page HTML:", error);
            throw error;
        }
    }

}
