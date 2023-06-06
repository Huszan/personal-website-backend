import {AppDataSource} from "../../data-source";
import {FindManyOptions, Like} from "typeorm";
import {Chapter} from "../../entity/Chapter";
import * as PageTable from "./page-table";
import {ChapterType} from "../../types/chapter.type";
import {Page} from "../../entity/Page";
import {PageType} from "../../types/page.type";

const repository = AppDataSource.manager.getRepository(Chapter);

export async function create(data: Chapter) {
    return repository.save(data);
}

export async function read(options?: FindManyOptions<Chapter>, bigSearch?: string) {
    let query = repository
        .createQueryBuilder("chapter")
        .leftJoinAndSelect("chapters.pages_html_locate", "pages_html_locate");

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

export async function update(data: Chapter, id?: number) {
    let entry = await repository.findOneBy({id: id});
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
    let entry = await repository.findOneBy({id: id});
    if (entry) { return repository.remove(entry) }
}

export function convertDataToTableEntry(data: ChapterType): Chapter {
    let entry = new Chapter();
    let pages: Page[] = [];
    for (let page of data.pages) {
        pages.push(PageTable.convertDataToTableEntry(page));
    }
    if(data.id) entry.id = data.id;
    entry.name = data.name;
    entry.pages = pages;
    return entry;
}

export function convertTableEntryToData(entry: Chapter): ChapterType {
    let pages: PageType[] = [];
    for (let page of entry.pages) {
        pages.push(PageTable.convertTableEntryToData(page));
    }
    let data: ChapterType = {
        id: entry.id,
        name: entry.name,
        pages: pages,
    }
    return data;
}
