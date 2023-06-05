import {HtmlLocate} from "../../entity/HtmlLocate";
import {AppDataSource} from "../../data-source";
import {HtmlLocateType} from "../../types/html-locate.type";
import {Manga} from "../../entity/Manga";

const repository = AppDataSource.manager.getRepository(HtmlLocate);

export async function create(data: HtmlLocate) {
    return repository.save(data);
}

export async function read(id?: number) {
    if (id) { return repository.findOneBy({ id: id }) }
    else { return repository.find(); }
}

export async function update(data: HtmlLocate, id?: number) {
    let entry = await repository.findOneBy({id: id});
    if (entry) {
        for (let para in data) {
            if (entry[para] !== data[para]) { entry[para] = data[para]; }
        }
        return repository.save(entry);
    }
}

export async function remove(id?: number) {
    let entry = await repository.findOneBy({id: id});
    if (entry) { return repository.remove(entry) }
}

export function convertDataToTableEntry(data: HtmlLocateType): HtmlLocate {
    let entry = new HtmlLocate();
    if(data.id) entry.id = data.id;
    if(data.urls) entry.urls = JSON.parse(JSON.stringify(data.urls));
    if(data.positions) entry.positions =  JSON.parse(JSON.stringify(data.positions));
    entry.looked_type = data.lookedType;
    entry.looked_attr = data.lookedAttr;
    return entry;
}

export function convertTableEntryToData(entry: HtmlLocate): HtmlLocateType {
    let data: HtmlLocateType = {
        id: entry.id,
        urls: JSON.parse(JSON.stringify(entry.urls)),
        positions: JSON.parse(JSON.stringify(entry.positions)),
        lookedType: entry.looked_type,
        lookedAttr: entry.looked_attr
    }
    return data;
}
