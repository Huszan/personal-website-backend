import { AdvancedScrapper } from './advanced-scrapper';
import { getUrlWithToken, HtmlLocateType } from '../../types/html-locate.type';
import { Manga } from '../../entity/Manga';
import { Chapter } from '../../entity/Chapter';
import * as MangaTable from '../tables/manga-table';
import { Page } from '../../entity/Page';

const mangaLocations: HtmlLocateType[] = [
    {
        positions: ['.truyen-list > .list-truyen-item-wrap'],
        lookedType: 'a:nth-child(1)',
        lookedAttr: 'href',
        urls: [
            'https://ww5.mangakakalot.tv/manga_list/?type=topview&category=all&state=all&page=!!!',
        ],
    },
];

const fs = require('fs');

export class BTTScrapper {
    async getEntries(amount = undefined, saveEntries = true) {
        let entries: any = [];
        if (saveEntries) {
            await this.loadEntries()
                .then((jsonData) => {
                    entries = jsonData;
                    console.log('Entries loaded');
                })
                .catch((err) => {
                    console.log(err);
                });
        }

        if (entries.length <= 0) {
            for (let location of mangaLocations) {
                let pass = true;
                let i = 1;
                do {
                    let lastLength = entries.length;
                    process.stdout.write(
                        `\rGathering entries ${location.urls[0]}. Progress -> ${entries.length} entries`
                    );
                    let locateClone = JSON.parse(JSON.stringify(location));
                    locateClone.urls = [
                        getUrlWithToken(locateClone.urls[0], i),
                    ];
                    let current =
                        await AdvancedScrapper.gatherEntries(locateClone);
                    entries.push(...current);
                    pass = entries.length > lastLength;
                    i++;
                    if (amount && entries.length >= amount) break;
                } while (pass);
                console.log('');
            }

            if (amount) entries = entries.slice(0, amount);
            entries = this.giveEntriesProperHttp(entries);
            if (saveEntries) this.saveEntries(JSON.stringify(entries));
        }

        return entries;
    }

    saveEntries(data: string) {
        fs.writeFile('entries.json', data, () => {
            console.log('Entries saved as entries.json');
        });
    }

    async loadEntries() {
        return new Promise((resolve, reject) => {
            fs.readFile('entries.json', 'utf8', (err, data) => {
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
            entries[index] = `https://ww5.mangakakalot.tv/${encodeURIComponent(
                el.slice(1)
            )}`;
        });
        return entries;
    }

    async getMangaData(entry: any) {
        const data = await AdvancedScrapper.getMangaData(
            {
                name: {
                    positions: [
                        'body > div.container > div.main-wrapper > div.leftCol > div.manga-info-top > ul > li:nth-child(1)',
                    ],
                    lookedType: 'h1',
                    lookedAttr: 'content',
                    urls: [entry],
                },
                pic: {
                    positions: [
                        'body > div.container > div.main-wrapper > div.leftCol > div.manga-info-top > div',
                    ],
                    lookedType: 'img',
                    lookedAttr: 'src',
                    urls: [entry],
                },
                authors: {
                    positions: [
                        'body > div.container > div.main-wrapper > div.leftCol > div.manga-info-top > ul > li:nth-child(2)',
                    ],
                    lookedType: 'a',
                    lookedAttr: 'content',
                    urls: [entry],
                },
                genres: {
                    positions: [
                        'body > div.container > div.main-wrapper > div.leftCol > div.manga-info-top > ul > li:nth-child(7)',
                    ],
                    lookedType: 'a',
                    lookedAttr: 'content',
                    urls: [entry],
                },
                description: {
                    positions: [
                        'body > div.container > div.main-wrapper > div.leftCol',
                    ],
                    lookedType: '#noidungm',
                    lookedAttr: 'content',
                    urls: [entry],
                },
                chapters: {
                    name: {
                        positions: [
                            '#chapter > div > div.chapter-list > div.row > span',
                        ],
                        lookedType: 'a',
                        lookedAttr: 'content',
                        urls: [entry],
                    },
                    url: {
                        positions: [
                            '#chapter > div > div.chapter-list > div.row > span',
                        ],
                        lookedType: 'a',
                        lookedAttr: 'href',
                        urls: [entry],
                    },
                },
                pages: {
                    positions: ['#vungdoc'],
                    lookedType: 'img',
                    lookedAttr: 'data-src',
                    urls: [entry],
                },
            },
            'https://ww5.mangakakalot.tv'
        );
        if (!data) return null;
        data.description = data.description.trim().replace(/\n\s*/g, '');
        data.pic = `https://ww5.mangakakalot.tv${data.pic}`;
        data.chapters.forEach((chapter, i) => {
            data.chapters[i].name = chapter.name.replace('\n', '').trim();
        });
        if (data.chapters.length < 1) return null;
        return data;
    }

    async sendMangaToDatabase(data: any, manga?: Manga) {
        let dbManga = manga ? manga : new Manga();
        // Temporary solution to not create duplicates
        if (manga) {
            return MangaTable.update(dbManga.id, dbManga);
        }
        dbManga.name = data.name;
        dbManga.original_name = data.name;
        dbManga.pic = data.pic;
        dbManga.description = data.description;
        dbManga.tags = data.genres;
        dbManga.authors = data.authors;
        dbManga.description = data.description;
        let dbChapters: Chapter[] = manga ? manga.chapters : [];
        for (let chapter of data.chapters) {
            let dbChapter = new Chapter();
            dbChapter.name = chapter.name;
            dbChapter.manga = dbManga;
            let dbPages: Page[] = [];
            for (let page of chapter.pages) {
                let dbPage = new Page();
                dbPage.chapter = dbChapter;
                dbPage.url = page.url;
                dbPages.push(dbPage);
            }
            dbChapter.pages = dbPages;
            dbChapters.push(dbChapter);
        }
        dbManga.chapters = dbChapters;
        return MangaTable.create(dbManga);
    }

    async sendSpider(options: {
        entryAmount?: number;
        skipTo?: number;
        saveEntries: boolean;
    }) {
        let entries: any[] = await this.getEntries(
            options.entryAmount ? options.entryAmount : undefined,
            options.saveEntries
        );
        if (options.skipTo && entries.length > options.skipTo) {
            entries = entries.slice(
                options.skipTo,
                options.entryAmount
                    ? options.skipTo + options.entryAmount
                    : entries.length
            );
        }
        for (const entry of entries) {
            let data = await this.getMangaData(entry);
            if (data) {
                let manga = await MangaTable.read({
                    where: [
                        {
                            element: 'manga.original_name',
                            value: data.name,
                        },
                    ],
                });
                this.sendMangaToDatabase(
                    data,
                    manga && manga[0] ? manga[0] : undefined
                ).then((res) => {
                    if (!res)
                        console.log(
                            `Something went wrong during adding ${data.name} to database`
                        );
                    console.log(
                        res.name +
                            ' added to database. ' +
                            res.chapters.length +
                            ' chapter count'
                    );
                });
            }
        }
        console.log('SPIDER WORK IS DONE. HE IS GOING TO SLEEP NOW.');
    }
}
