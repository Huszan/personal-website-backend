import { AppDataSource } from "../../data-source";
import { Chapter } from "../../entity/Chapter";
import * as PageTable from "./page-table";
import { ChapterType } from "../../types/chapter.type";
import { Page } from "../../entity/Page";
import { PageType } from "../../types/page.type";
import { RepositoryFindOptions } from "../../types/repository-find-options";
import { TableManager } from "./table-manager";

const repository = AppDataSource.manager.getRepository(Chapter);

export async function create(data: Chapter) {
    return repository.save(data);
}

export async function read(options?: RepositoryFindOptions) {
    let query = repository.createQueryBuilder("chapter");
    if (options) TableManager.applyOptionsToQuery(query, options);

    return query.getMany();
}

export async function update(data: Chapter, id?: number) {
    let entry = await repository.findOneBy({ id: id });
    if (entry) {
        for (let para in data) {
            if (JSON.stringify(entry[para]) !== JSON.stringify(data[para])) {
                entry[para] = data[para];
            }
        }
        return repository.save(entry);
    }
}

export async function remove(id: number) {
    let entry = await repository.findOneBy({ id: id });
    if (entry) {
        return repository.remove(entry);
    }
}

export async function getChapterCount(options?: RepositoryFindOptions) {
    let query = await repository
        .createQueryBuilder("chapter")
        .select("COUNT(*)", "count");
    query = TableManager.applyWhereOptions(query, options);

    let result = await query.getRawOne();
    return parseInt(result.count);
}

export function convertDataToTableEntry(data: ChapterType): Chapter {
    let entry = new Chapter();
    let pages: Page[] = [];
    for (let page of data.pages) {
        pages.push(PageTable.convertDataToTableEntry(page));
    }
    if (data.id) entry.id = data.id;
    entry.name = data.name;
    entry.pages = pages;
    return entry;
}

export function convertTableEntryToData(entry: Chapter): ChapterType {
    let data: ChapterType = {
        id: entry.id,
        name: entry.name,
        mangaId: entry.manga_id,
    };
    if (entry.pages) {
        let pages: PageType[] = [];
        for (let page of entry.pages) {
            pages.push(PageTable.convertTableEntryToData(page));
        }
        data = {
            ...data,
            pages: pages,
        };
    }
    return data;
}
