import { HtmlLocateType } from "./html-locate.type";
import { ScrapChapterType } from "./scrap-chapter.type";

export interface ScrapMangaType {
    id?: number;
    name: string;
    pic: string;
    authors: string[];
    tags: string[];
    description: string;
    beforeUrl?: string;

    chaptersScrap: ScrapChapterType;
    pagesLocate: HtmlLocateType;
}
