import {PageType} from "./page.type";

export interface ChapterType {
    id?: number,
    name: string,
    pages?: PageType[],
}
