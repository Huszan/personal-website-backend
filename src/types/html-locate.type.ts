const URL_TOKEN = "!!!";

export interface HtmlLocateType {
    id?: number;
    entityName: string;
    positions: string[];
    lookedType: string;
    lookedAttr: string;
    urls: string[];
    filter?: {
        inner?: {
            from?: number;
            to?: number;
        };
        outer?: {
            from?: number;
            to?: number;
        };
    };
}

export function replaceTokensInUrls(urls: string[], chapter: number) {
    const urlsWithReplacedToken = [];
    for (let i = 0; i < urls.length; i++) {
        urlsWithReplacedToken.push(getUrlWithToken(urls[i], chapter));
    }
    return urlsWithReplacedToken;
}

export function getUrlWithToken(url: string, iteration: number) {
    return url.replace(URL_TOKEN, iteration.toString());
}
