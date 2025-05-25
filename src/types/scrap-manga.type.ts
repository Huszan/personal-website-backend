import { HtmlLocateType } from './html-locate.type';

export interface ScrapMangaType {
    id?: number;
    beforeUrl?: string;
    htmlLocateList: HtmlLocateType[];
}
