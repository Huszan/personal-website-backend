import { Cheerio, CheerioAPI, Element } from "cheerio";
import { HtmlLocateType } from "../../types/html-locate.type";
import { MangaType } from "../../types/manga.type";
import { PageType } from "../../types/page.type";
import { AxiosInstance } from "axios";

const axios = require("axios");
const { ConcurrencyManager } = require("axios-concurrency");
const cheerio = require("cheerio");

export class AdvancedScrapper {
    private static axiosInstance: AxiosInstance;
    private static manager;

    static axiosSetup() {
        this.axiosInstance = axios.create();
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                const { config, response } = error;
                const retryCount = config.retryCount || 0;

                if (!response && retryCount < 5) {
                    config.retryCount = retryCount + 1;

                    const delay = retryCount * 1000;
                    return new Promise((resolve) =>
                        setTimeout(
                            () => resolve(this.axiosInstance(config)),
                            delay
                        )
                    );
                }

                throw error;
            }
        );
        this.manager = ConcurrencyManager(this.axiosInstance, 5);
    }

    static async gatherEntries(locate: HtmlLocateType) {
        const gathered = [];
        const $ = await this.getPageData(locate.urls);
        const elements = await this.localiseElements($, locate);
        gathered.push(...elements);
        return gathered;
    }

    static async getMangaData(
        localisation: {
            name?: HtmlLocateType;
            pic?: HtmlLocateType;
            authors?: HtmlLocateType;
            genres?: HtmlLocateType;
            description?: HtmlLocateType;
            chapters?: {
                name: HtmlLocateType;
                url: HtmlLocateType;
            };
            pages?: HtmlLocateType;
        },
        beforeUrl?: string
    ): Promise<MangaType | any> {
        try {
            let chapters: any = [];
            if (localisation.chapters) {
                let [chapterNames, chapterLinks] = await Promise.all([
                    this.gatherEntries(localisation.chapters.name),
                    this.gatherEntries(localisation.chapters.url),
                ]);

                await Promise.all(
                    chapterNames.map(async (chapterName, i) => {
                        process.stdout.write(
                            `\rProcessing ${i + 1}/${chapterNames.length}\r`
                        );
                        let pagesLocate = JSON.parse(
                            JSON.stringify(localisation.pages)
                        );
                        if (beforeUrl) {
                            pagesLocate.urls = [
                                `${beforeUrl}${chapterLinks[i]}`,
                            ];
                        } else {
                            pagesLocate.urls = [chapterLinks[i]];
                        }
                        let pages: PageType[] = [];
                        let pageEntries = await this.gatherEntries(pagesLocate);
                        for (let page of pageEntries) {
                            pages.push({
                                url: page,
                            });
                        }
                        if (pages.length > 0) {
                            chapters.push({
                                name: chapterName,
                                pages: pages,
                                index: i,
                            });
                        }
                    })
                );
            }

            if (chapters.length === 0) {
                return null;
            }
            chapters.sort((a, b) => a.index - b.index);

            let manga = {
                name: localisation.name
                    ? await this.gatherEntries(localisation.name)
                    : null,
                pic: localisation.pic
                    ? await this.gatherEntries(localisation.pic)
                    : null,
                authors: localisation.authors
                    ? await this.gatherEntries(localisation.authors)
                    : null,
                genres: localisation.genres
                    ? await this.gatherEntries(localisation.genres)
                    : null,
                description: localisation.description
                    ? await this.gatherEntries(localisation.description)
                    : null,
                chapters: chapters,
            };
            if (manga.name) manga.name = manga.name[0];
            if (manga.pic) manga.pic = manga.pic[0];
            if (manga.description) manga.description = manga.description[0];
            return manga;
        } catch (error) {
            console.log(
                "Something went wrong during getting manga data.\n",
                error
            );
            return null;
        }
    }

    private static async localiseElements(
        $: CheerioAPI,
        locate: HtmlLocateType
    ) {
        const elements = [];
        for (let i = 0; i < locate.positions.length; i++) {
            let localisation = $(locate.positions[i]);
            let htmlElements = localisation.children(locate.lookedType);
            this.applyFilters(htmlElements, locate);
            htmlElements.each((index, value) => {
                let inner$ = $(value);
                let el =
                    locate.lookedAttr === "content"
                        ? inner$.text()
                        : inner$.attr(locate.lookedAttr);
                if (el) {
                    elements.push(el);
                }
            });
            if (elements.length > 0) break;
        }
        return elements;
    }

    private static applyFilters(
        htmlElements: Cheerio<Element>,
        locate: HtmlLocateType
    ) {
        if (locate.filter && locate.filter.outer) {
            if (locate.filter.outer.from)
                htmlElements = htmlElements.filter(
                    (i) => i >= locate.filter.outer.from
                );
            if (locate.filter.outer.to)
                htmlElements = htmlElements.filter(
                    (i) => i <= locate.filter.outer.to
                );
        }
        if (locate.filter && locate.filter.inner) {
            htmlElements.each((i, el) => {
                if (locate.filter.inner.from)
                    el.children = el.children.filter(
                        (value, index) => index >= locate.filter.inner.from
                    );
                if (locate.filter.inner.to)
                    el.children = el.children.filter(
                        (value, index) => index <= locate.filter.inner.to
                    );
            });
        }
    }

    private static async getPageData(urls: string[]): Promise<CheerioAPI> {
        try {
            for (let i = 0; i < urls.length; i++) {
                const response = await this.axiosInstance.get(urls[i]);
                const data = cheerio.load(response.data);
                if (data && response.status === 200) return data;
            }
            return null;
        } catch (error) {
            console.error("Error fetching page HTML:", error);
            throw error;
        }
    }

    private static getLocalisations(htmlLocate: HtmlLocateType): string[] {
        const localisations = [];
        htmlLocate.positions.forEach((pos) => {
            localisations.push(`${pos} > ${htmlLocate.lookedType}`);
        });
        return localisations;
    }

    static async getMangaPages(locate: HtmlLocateType) {
        let pages: any = [];
        if (locate === null) return pages;
        for (let i = 0; i < locate.urls.length; i++) {
            await axios(locate.urls[i])
                .then((res: any) => {
                    const html = res.data;
                    const $ = cheerio.load(html);
                    let localisations = this.getLocalisations(locate);
                    for (let i = 0; i < localisations.length; i++) {
                        $(localisations[i]).each((index, value) => {
                            let page = $(value).attr(locate.lookedAttr);
                            if (page) {
                                pages.push(page);
                            }
                        });
                        if (pages.length > 0) break;
                        else pages = [];
                    }
                })
                .catch((err: any) => console.log(err.message));
            if (pages.length > 0) break;
        }
        if (pages <= 0) console.log(`${locate.id} was unable to get pages`);
        return pages;
    }
}
