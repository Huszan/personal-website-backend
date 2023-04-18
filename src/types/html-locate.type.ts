const URL_TOKEN = '!!!';

export interface HtmlLocateType {
    id: number,
    positions: string[],
    lookedType: string,
    lookedAttr: string,
    urls: string[],
}

export function getUrlWithToken(url: string, chapter: number) {
    return url.replace(URL_TOKEN, chapter.toString());
}
