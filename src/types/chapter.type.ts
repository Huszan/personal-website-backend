import { PageType } from "./page.type";

export interface ChapterType {
    id?: number;
    name: string;
    mangaId: number;
    pages?: PageType[];
}
