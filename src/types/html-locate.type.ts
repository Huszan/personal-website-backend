const URL_TOKEN = '!!!';

interface HtmlLocateDbType {
    id?: number,
    positions: string[],
    looked_type: string,
    looked_attr: string,
    req_comparisons: string[],
    urls: string[],
}

interface HtmlLocateType {
    id: number,
    positions: string,
    lookedType: string,
    lookedAttr: string,
    reqComparisons: string[],
    urls: string,
}

function getUrlWithToken(url: string, chapter: number) {
    return url.replace(URL_TOKEN, chapter.toString());
}

export { HtmlLocateDbType, HtmlLocateType, getUrlWithToken }
