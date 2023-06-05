import {AdvancedScrapper} from "./advanced-scrapper";
import {getUrlWithToken, HtmlLocateType} from "../../types/html-locate.type";
import {Manga} from "../../entity/Manga";
import {Chapter} from "../../entity/Chapter";
import {HtmlLocate} from "../../entity/HtmlLocate";
import * as MangaTable from "../tables/manga-table";

const mangaLocations: HtmlLocateType[] = [
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/0-9?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/A?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/B?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/C?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/D?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/E?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/F?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/G?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/H?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/I?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/J?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/K?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/L?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/M?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/N?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/O?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/P?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/Q?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/R?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/S?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/T?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/U?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/W?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/X?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/Y?page=!!!']
    },
    {
        positions: ['.manga_list-sbs > .mls-wrap > div'],
        lookedType: 'a',
        lookedAttr: 'href',
        urls: ['https://mangareader.to/az-list/Z?page=!!!']
    },
]

const fs = require('fs');

export class BTTScrapper {

    async getEntries(amount = undefined) {
        let entries: any = [];
        await this.loadEntries()
            .then((jsonData) => {
                entries = jsonData;
                console.log('Entries loaded');
            })
            .catch((err) => {
                console.log(err);
            })

        if (entries.length <= 0) {
            for (let location of mangaLocations) {
                let pass = true;
                let i = 1;
                do {
                    let lastLength = entries.length;
                    process.stdout.write(`\rGathering entries ${location.urls[0]}. Progress -> ${entries.length} entries`);
                    let locateClone = JSON.parse(JSON.stringify(location));
                    locateClone.urls = [getUrlWithToken(locateClone.urls[0], i)];
                    let current = await AdvancedScrapper.gatherEntries(locateClone);
                    entries.push(...current);
                    pass = entries.length > lastLength;
                    i++;
                    if (amount && entries.length >= amount) break;
                } while (pass);
                console.log('');
            }

            if (amount) entries = entries.slice(0, amount);
            entries = this.giveEntriesProperHttp(entries);
            this.saveEntries(JSON.stringify(entries));
        }

        return entries;
    }

    saveEntries(data: string) {
        fs.writeFile("entries.json", data, () => {
            console.log('Entries saved as entries.json');
        });
    }

    async loadEntries() {
        return new Promise((resolve, reject) => {
            fs.readFile("entries.json", 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (parseError) {
                    reject(parseError);
                }
            });
        });
    }

    private giveEntriesProperHttp(entries: any[]) {
        entries.forEach((el, index) => {
            entries[index] = `https://mangareader.to/${encodeURIComponent(el.slice(1))}`;
        })
        return entries;
    }

    async getEntryIndex(url: string) {
        let entries: any = [];
        await this.loadEntries()
            .then((jsonData) => {
                entries = jsonData;
                console.log('Entries loaded');
            })
            .catch((err) => {
                console.log(err);
            })
        return entries.findIndex(el => el == url);
    }

    async getMangaData(entry: any) {
        const data = await AdvancedScrapper.getMangaData({
            name: {
                positions: ['#ani_detail > div > div > div.anis-content > div.anisc-detail'],
                lookedType: 'h2',
                lookedAttr: 'content',
                urls: [entry],
            },
            pic: {
                positions: ['#ani_detail > div > div > div.anis-content > div.anisc-poster > div'],
                lookedType: 'img',
                lookedAttr: 'src',
                urls: [entry]
            },
            authors: {
                positions: ['#ani_detail > div > div > div.anis-content > div.anisc-detail > div.sort-desc > div.anisc-info-wrap > div.anisc-info > div:nth-child(3)'],
                lookedType: 'a',
                lookedAttr: 'content',
                urls: [entry],
            },
            genres: {
                positions: ['#ani_detail > div > div > div.anis-content > div.anisc-detail > div.sort-desc > div.genres'],
                lookedType: 'a',
                lookedAttr: 'content',
                urls: [entry],
            },
            description: {
                positions: ['#ani_detail > div > div > div.anis-content > div.anisc-detail > div.sort-desc'],
                lookedType: '.description',
                lookedAttr: 'content',
                urls: [entry],
            },
            chapters: {
                name: {
                    positions: ['#en-chapters > li'],
                    lookedType: 'a',
                    lookedAttr: 'title',
                    urls: [entry],
                },
                link: {
                    positions: ['#en-chapters > li'],
                    lookedType: 'a',
                    lookedAttr: 'href',
                    urls: [entry],
                }
            },
            pages: {
                positions: ['#main-wrapper > div.container > div.container-reader-chapter'],
                lookedType: 'div',
                lookedAttr: 'data-url',
                urls: [entry],
            }
        });
        data.description = data.description.trim().replace(/\n\s*/g, '');
        data.chapters.forEach((chapter, i) => {
            data.chapters[i].name = chapter.name.replace('\n', '').trim();
            data.chapters[i].htmlLocate.urls[0] = `https://mangareader.to${chapter.htmlLocate.urls[0]}`;
        })
        if (data.chapters.length < 1) return null;
        return data;
    }

    async sendMangaToDatabase(data: any, manga?: Manga) {
        let dbManga = manga ? manga : new Manga();
        dbManga.name = data.name;
        dbManga.pic = data.pic;
        dbManga.description = data.description;
        dbManga.genres = JSON.parse(JSON.stringify(data.genres));
        dbManga.authors = JSON.parse(JSON.stringify(data.authors));
        dbManga.description = data.description;
        let dbChapters: Chapter[] = manga ? manga.chapters : [];
        for (let chapter of data.chapters) {
            if (!dbChapters.some((el) => el.name === chapter.name)) {
                let dbChapter = new Chapter();
                dbChapter.name = chapter.name;
                let dbHtmlLocate = new HtmlLocate();
                dbHtmlLocate.urls = JSON.parse(JSON.stringify(chapter.htmlLocate.urls));
                dbHtmlLocate.positions = JSON.parse(JSON.stringify(chapter.htmlLocate.positions));
                dbHtmlLocate.looked_attr = chapter.htmlLocate.looked_attr;
                dbHtmlLocate.looked_type = chapter.htmlLocate.looked_type;
                dbHtmlLocate.chapter = dbChapter;
                dbChapter.pages_html_locate = dbHtmlLocate;
                dbChapter.manga = dbManga;
                dbChapters.push(dbChapter);
            }
        }
        dbManga.chapters = dbChapters;
        if (manga) return MangaTable.update(dbManga, dbManga.id);
        return MangaTable.create(dbManga);
    }

    async sendSpider(entryAmount?: number, skipTo?: number) {
        let entries: any[] = await this.getEntries(
            entryAmount ? entryAmount : undefined);
        if (skipTo && entries.length > skipTo) { entries = entries.slice(skipTo, entries.length); }
        for (const entry of entries) {
            let data = await this.getMangaData(entry);
            if (data) {
                let manga = await MangaTable.read({
                    where: {
                        name: data.name
                    }
                });
                this.sendMangaToDatabase(data, manga && manga[0] ? manga[0] : undefined).then(res => {
                    console.log(res.name + ' added to database. ' + res.chapters.length + ' chapter count');
                });
            }
        }
    }

}
