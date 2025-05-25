import { AppDataSource } from '../../data-source';
import { ScrapManga } from '../../entity/ScrapManga';
import * as HtmlLocateTable from '../tables/html-locate-table';
import { ScrapMangaType } from '../../types/scrap-manga.type';

const repository = AppDataSource.manager.getRepository(ScrapManga);

export async function create(data: ScrapManga) {
    return repository.save(data);
}

export async function read(id?: number) {
    if (id) {
        return repository.findOneBy({ id: id });
    } else {
        return repository.find();
    }
}

export async function update(data: ScrapManga, id?: number) {
    let entry = await repository.findOneBy({ id: id });
    if (entry) {
        for (let para in data) {
            if (entry[para] !== data[para]) {
                entry[para] = data[para];
            }
        }
        return repository.save(entry);
    }
}

export async function remove(id?: number) {
    let entry = await repository.findOneBy({ id: id });
    if (entry) {
        return repository.remove(entry);
    }
}

export function convertDataToTableEntry(data: ScrapMangaType): ScrapManga {
    let entry = new ScrapManga();
    if (data.id) entry.id = data.id;
    entry.beforeUrl = data.beforeUrl;
    entry.htmlLocateList = data.htmlLocateList.map((locate) =>
        HtmlLocateTable.convertDataToTableEntry(locate)
    );
    return entry;
}

export function convertTableEntryToData(entry: ScrapManga): ScrapMangaType {
    let data: ScrapMangaType = {
        id: entry.id,
        beforeUrl: entry.beforeUrl,
        htmlLocateList: entry.htmlLocateList.map((locate) =>
            HtmlLocateTable.convertTableEntryToData(locate)
        ),
    };
    return data;
}
