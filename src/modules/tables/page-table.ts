import { AppDataSource } from "../../data-source";
import { FindManyOptions } from "typeorm";
import { Page } from "../../entity/Page";
import { PageType } from "../../types/page.type";

const repository = AppDataSource.manager.getRepository(Page);

export async function create(data: Page) {
    return repository.save(data);
}

export async function read(options?: FindManyOptions<Page>) {
    let query = repository.createQueryBuilder("page");

    if (options) {
        query = query.setFindOptions(options);
    }
    return query.getMany();
}

export async function update(data: Page, id?: number) {
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

export function convertDataToTableEntry(data: PageType): Page {
    let entry = new Page();
    if (data.id) entry.id = data.id;
    entry.url = data.url;
    return entry;
}

export function convertTableEntryToData(entry: Page): PageType {
    let data: PageType = {
        id: entry.id,
        url: entry.url,
        chapterId: entry.chapter_id,
    };
    return data;
}
