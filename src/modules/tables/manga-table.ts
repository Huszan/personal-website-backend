import { AppDataSource } from "../../data-source";
import { Manga } from "../../entity/Manga";
import { MangaType } from "../../types/manga.type";
import * as LikeTable from "../tables/like-table";
import * as ChapterTable from "../tables/chapter-table";
import * as HtmlLocateTable from "../tables/html-locate-table";
import { RepositoryFindOptions } from "../../types/repository-find-options";
import { TableManager } from "./table-manager";
import { removeImage, saveImageFromUrl } from "../../helper/scrapper.helper";
import { HtmlLocateType } from "../../types/html-locate.type";

const repository = AppDataSource.manager.getRepository(Manga);

export async function create(data: Manga) {
    if (data.likes) data.like_count = data.likes.length;
    if (data.chapters) data.chapter_count = data.chapters.length;
    data.added_date = new Date();
    data.last_update_date = new Date();
    data.imagePath = await saveImageFromUrl(data.pic, data.name);
    return repository.save(data);
}

export async function read(options?: RepositoryFindOptions) {
    let query = repository
        .createQueryBuilder("manga")
        .leftJoinAndSelect("manga.likes", "like")
        .loadRelationCountAndMap("manga.like_count", "manga.likes");

    query = TableManager.applyOptionsToQuery(query, options);
    return query.getMany();
}

export async function update(id: number, data?: Manga, updateDate = false) {
    let entries = await read({
        where: [
            {
                element: "manga.id",
                value: id,
            },
        ],
    });
    let entry = entries[0];
    if (entry) {
        for (let para in data) {
            if (JSON.stringify(entry[para]) !== JSON.stringify(data[para])) {
                entry[para] = data[para];
            }
        }
        if (updateDate) {
            entry.last_update_date = new Date();
        }
        if (!entry.imagePath) {
            entry.imagePath = await saveImageFromUrl(entry.pic, entry.name);
        }
        return repository.save(entry);
    }
}

export async function remove(manga: Manga) {
    if (manga) {
        const removedManga = await repository.remove(manga);
        if (removedManga) {
            if (removedManga.imagePath) removeImage(removedManga.imagePath);
            return removedManga;
        }
        return null;
    }
}

export async function increaseViewCount(id: number) {
    let entry = await repository.findOneBy({ id: id });
    entry.view_count = entry.view_count + 1;
    return update(id, entry);
}

export async function getMangaCount(options?: RepositoryFindOptions) {
    let query = await repository
        .createQueryBuilder("manga")
        .select("COUNT(*)", "count");
    query = TableManager.applyWhereOptions(query, options);

    let result = await query.getRawOne();
    return parseInt(result.count);
}

export async function getMangaList(options?: RepositoryFindOptions) {
    let mangaList = await read(options);
    let mangaCount = await getMangaCount(options);
    return {
        list: mangaList,
        count: mangaCount,
    };
}

export async function updateCounts(amountPerRead = 1000) {
    let count = await getMangaCount();
    for (let i = 0; i < count; i += amountPerRead) {
        let entries = await read({ take: amountPerRead, skip: i });
        for (const entry of entries) {
            await update(entry.id, entry);
            process.stdout.write(
                `Updated ${i}/${count}, ${Math.round((i / count) * 100)}%\r`
            );
        }
    }
}

export async function readTags(amountPerRead = 1000) {
    let count = await getMangaCount();
    let tags = [];
    for (let i = 0; i < count; i += amountPerRead) {
        let entries = await read({ take: amountPerRead, skip: i });
        for (const entry of entries) {
            let genres = entry.tags;
            for (const tag of genres) {
                if (!tags.includes(tag.trim().toLowerCase())) {
                    tags.push(tag.trim().toLowerCase());
                }
            }
        }
        process.stdout.write(
            `Read ${i}/${count}, ${Math.round((i / count) * 100)}%\r`
        );
    }
    return tags;
}

export function convertDataToTableEntry(
    data: MangaType,
    htmlLocateList?: HtmlLocateType[]
): Manga {
    let entry = new Manga();
    if (data.id) entry.id = data.id;
    entry.name = data.name;
    entry.original_name = data.name;
    entry.pic = data.pic;
    if (data.authors) entry.authors = data.authors;
    if (data.tags) entry.tags = data.tags;
    if (data.chapters)
        entry.chapters = data.chapters.map((chapter) =>
            ChapterTable.convertDataToTableEntry(chapter)
        );
    entry.last_update_date = data.lastUpdateDate;
    entry.added_date = data.addedDate;
    entry.view_count = data.viewCount;
    entry.description = data.description;
    entry.chapter_count = data.chapterCount;
    if (htmlLocateList) {
        entry.htmlLocateList = htmlLocateList.map((locate) =>
            HtmlLocateTable.convertDataToTableEntry(locate)
        );
    }
    return entry;
}

export function convertTableEntryToData(entry: Manga): MangaType {
    const likes = [];
    entry.likes.forEach((like) => {
        likes.push(LikeTable.convertTableEntryToData(like));
    });
    let data: MangaType = {
        id: entry.id,
        name: entry.name,
        pic: entry.pic,
        imagePath: entry.imagePath,
        authors: entry.authors,
        tags: entry.tags,
        lastUpdateDate: entry.last_update_date,
        addedDate: entry.added_date,
        viewCount: entry.view_count,
        likes: likes,
        description: entry.description,
        chapterCount: entry.chapter_count,
    };
    return data;
}
