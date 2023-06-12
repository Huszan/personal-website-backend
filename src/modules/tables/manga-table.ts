import {AppDataSource} from "../../data-source";
import {Manga} from "../../entity/Manga";
import {MangaType} from "../../types/manga.type";
import * as LikeTable from "../tables/like-table";
import * as ChapterTable from "../tables/chapter-table";
import {RepositoryFindOptions} from "../../types/repository-find-options";
import {In, Like} from "typeorm";

const repository = AppDataSource.manager.getRepository(Manga);

export async function create(data: Manga) {
    if (data.likes) data.like_count = data.likes.length;
    if (data.chapters) data.chapter_count = data.chapters.length;
    data.added_date = new Date();
    data.last_update_date = new Date();
    return repository.save(data);
}

export async function read(options?: RepositoryFindOptions) {
    let query = repository
        .createQueryBuilder("manga")
        .leftJoinAndSelect("manga.chapters", "chapter")
        .leftJoinAndSelect("manga.likes", "like")
        .loadRelationCountAndMap('manga.chapter_count', 'manga.chapters')
        .loadRelationCountAndMap('manga.like_count', 'manga.likes')

    if (options) {
        let i = 0;
        if (options.where) {
            for (let option of options.where) {
                if (option.specialType)  {

                    switch (option.specialType) {
                        case 'like': {
                            query.andWhere(
                                `${option.element} LIKE :search${i}`,
                                { [`search${i}`]: `%${option.value}%` }
                            );
                            i++;
                            break;
                        }
                    }
                } else {
                    query.andWhere(
                        `${option.element} = ${option.value}`
                    )
                }
            }
        }
        if (options.order) {
            query.orderBy(
                options.order.element,
                options.order.sort,
            );
        }
        if (options.take) query.take(options.take);
        if (options.skip) query.skip(options.skip);
    }
    return query.getMany();
}

export async function update(id: number, data?: Manga, updateDate = false) {
    let entries = await read({
        where: [
            {
                element: 'manga.id',
                value: id,
            }
        ]
    });
    let entry = entries[0];
    if (entry) {
        for (let para in data) {
            if (JSON.stringify(entry[para]) !== JSON.stringify(data[para])) {
                entry[para] = data[para];
            }
        }
        if (updateDate) { entry.last_update_date = new Date(); }
        return repository.save(entry);
    }
}

export async function remove(manga: Manga) {
    if (manga) { return repository.remove(manga) }
}

export async function increaseViewCount(id: number) {
    let entry = await repository.findOneBy({id: id});
    entry.view_count = entry.view_count+1;
    return update(id, entry);
}

async function getMangaCount() {
    let result = await repository
        .createQueryBuilder()
        .select("COUNT(*)", "count")
        .getRawOne();
    return parseInt(result.count);
}

export async function updateCounts(amountPerRead = 1000) {
    let count = await getMangaCount();
    for (let i = 0; i < count; i += amountPerRead) {
        let entries = await read({take: amountPerRead, skip: i})
        for (const entry of entries) {
            await update(entry.id, entry);
            process.stdout.write(`Updated ${i}/${count}, ${Math.round(i / count * 100)}%\r`);
        }
    }
}

export async function readTags(amountPerRead = 1000) {
    let count = await getMangaCount();
    let tags = [];
    for (let i = 0; i < count; i += amountPerRead) {
        let entries = await read({take: amountPerRead, skip: i})
        for (const entry of entries) {
            let genres = entry.tags;
            for (const tag of genres) {
                if (!tags.includes(tag.trim().toLowerCase())) {
                    tags.push(tag.trim().toLowerCase());
                }
            }
        }
        process.stdout.write(`Read ${i}/${count}, ${Math.round(i / count * 100)}%\r`);
    }
    return tags;
}

export function convertDataToTableEntry(data: MangaType): Manga {
    let entry = new Manga();
    if(data.id) entry.id = data.id;
    entry.name = data.name;
    entry.pic = data.pic;
    if (data.authors) entry.authors = data.authors;
    if (data.tags) entry.tags = data.tags;
    entry.last_update_date = data.lastUpdateDate;
    entry.added_date = data.addedDate;
    entry.view_count = data.viewCount;
    entry.description = data.description;
    entry.chapter_count = data.chapterCount;
    return entry;
}

export function convertTableEntryToData(entry: Manga): MangaType {
    const likes = [];
    entry.likes.forEach(like => {
        likes.push(LikeTable.convertTableEntryToData(like));
    })
    const chapters = [];
    entry.chapters.forEach(chapter => {
        chapters.push(ChapterTable.convertTableEntryToData(chapter));
    })
    let data: MangaType = {
        id: entry.id,
        name: entry.name,
        pic: entry.pic,
        authors: entry.authors,
        tags: entry.tags,
        lastUpdateDate: entry.last_update_date,
        addedDate: entry.added_date,
        viewCount: entry.view_count,
        likes: likes,
        description: entry.description,
        chapterCount: entry.chapter_count,
        chapters: chapters,
    }
    return data;
}
