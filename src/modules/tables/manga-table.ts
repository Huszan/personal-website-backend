import {AppDataSource} from "../../data-source";
import {Manga} from "../../entity/Manga";
import {MangaType} from "../../types/manga.type";
import * as HtmlLocateTable from "../tables/html-locate-table";
import * as LikeTable from "../tables/like-table";
import {FindManyOptions, Like} from "typeorm";

const repository = AppDataSource.manager.getRepository(Manga);

export async function create(data: Manga) {
    data.added_date = new Date();
    data.last_update_date = new Date();
    return repository.save(data);
}

export async function read(options?: FindManyOptions<Manga>, bigSearch?: string) {
    let query = repository
        .createQueryBuilder("manga")
        .leftJoinAndSelect("manga.likes", "likes")
        .leftJoinAndSelect("manga.chapters", "chapters")
        .loadRelationCountAndMap('manga.like_count', 'manga.likes')
        .loadRelationCountAndMap('manga.chapter_count', 'manga.chapters')

    if (options) {
        if (bigSearch) {
            options.where = {
                name: Like(`%${bigSearch}%`),
            }
        }
        query = query.setFindOptions(options);
    }
    return query
        .getMany();
}

export async function update(data: Manga, id?: number, updateDate = false) {
    let entry = await repository.findOneBy({id: id});
    if (entry) {
        for (let para in data) {
            if (entry[para] !== data[para]) { entry[para] = data[para]; }
        }
        if (updateDate) { entry.last_update_date = new Date(); }
        return repository.save(entry);
    }
}

export async function remove(manga: Manga) {
    for (let chapter of manga.chapters) {
        await HtmlLocateTable.remove(chapter.pages_html_locate_id);
    }
    if (manga) { return repository.remove(manga) }
}

export function convertDataToTableEntry(data: MangaType): Manga {
    let entry = new Manga();
    if(data.id) entry.id = data.id;
    entry.name = data.name;
    entry.pic = data.pic;
    if (data.authors) entry.authors = JSON.parse(JSON.stringify(data.authors))
    if (data.genres) entry.genres = JSON.parse(JSON.stringify(data.genres));
    entry.last_update_date = data.lastUpdateDate;
    entry.added_date = data.addedDate;
    entry.view_count = data.viewCount;
    entry.description = data.description;
    entry.starting_chapter = data.startingChapter;
    entry.chapter_count = data.chapterCount;
    return entry;
}

export function convertTableEntryToData(entry: Manga): MangaType {
    const likes = [];
    entry.likes.forEach(like => {
        likes.push(LikeTable.convertTableEntryToData(like));
    })
    let data: MangaType = {
        id: entry.id,
        name: entry.name,
        pic: entry.pic,
        authors: JSON.parse(JSON.stringify(entry.authors)),
        genres: JSON.parse(JSON.stringify(entry.genres)),
        lastUpdateDate: entry.last_update_date,
        addedDate: entry.added_date,
        viewCount: entry.view_count,
        likes: likes,
        description: entry.description,
        startingChapter: entry.starting_chapter,
        chapterCount: entry.chapter_count,
    }
    return data;
}
