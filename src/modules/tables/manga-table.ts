import {AppDataSource} from "../../data-source";
import {Manga} from "../../entity/Manga";
import {MangaType} from "../../types/manga.type";
import * as HtmlLocateTable from "../tables/html-locate-table";

const repository = AppDataSource.manager.getRepository(Manga);

export async function create(data: Manga) {
    data.added_date = new Date();
    data.last_update_date = new Date();
    await repository.save(data);
    return HtmlLocateTable.create(data.html_locate);
}

export async function read(id?: number) {
    if (id) {
        return repository
            .createQueryBuilder("manga")
            .where(`manga.id = ${id}`)
            .innerJoinAndSelect("manga.html_locate", "html_locate")
            .getMany();
    }
    else {
        return repository
            .createQueryBuilder("manga")
            .innerJoinAndSelect("manga.html_locate", "html_locate")
            .getMany();
    }
}

export async function update(data: Manga, id?: number) {
    let entry = await repository.findOneBy({id: id});
    if (entry) {
        for (let para in data) {
            if (entry[para] !== data[para]) { entry[para] = data[para]; }
        }
        entry.last_update_date = new Date();
        return repository.save(entry);
    }
}

export async function remove(id?: number) {
    let entry = await repository.findOneBy({id: id});
    if (entry) { return repository.remove(entry) }
}

export function convertDataToTableEntry(data: MangaType): Manga {
    let entry = new Manga();
    entry.name = data.name;
    entry.pic = data.pic;
    if (data.authors) entry.authors = JSON.parse(JSON.stringify(data.authors))
    if (data.genres) entry.genres = JSON.parse(JSON.stringify(data.genres));
    entry.last_update_date = data.lastUpdateDate;
    entry.added_date = data.addedDate;
    entry.view_count = data.viewCount;
    entry.like_count = data.likeCount;
    entry.description = data.description;
    entry.starting_chapter = data.startingChapter;
    entry.chapter_count = data.chapterCount;
    entry.html_locate = HtmlLocateTable.convertDataToTableEntry(data.htmlLocate, entry);
    return entry;
}

export function convertTableEntryToData(entry: Manga): MangaType {
    let data: MangaType = {
        id: entry.id,
        name: entry.name,
        pic: entry.pic,
        authors: JSON.parse(JSON.stringify(entry.authors)),
        genres: JSON.parse(JSON.stringify(entry.genres)),
        lastUpdateDate: entry.last_update_date,
        addedDate: entry.added_date,
        viewCount: entry.view_count,
        likeCount: entry.like_count,
        description: entry.description,
        startingChapter: entry.starting_chapter,
        chapterCount: entry.chapter_count,
        htmlLocate: HtmlLocateTable.convertTableEntryToData(entry.html_locate),
    }
    return data;
}
