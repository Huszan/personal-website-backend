
const REPLACEMENT_TOKEN = '!!!';

class HtmlLocate {
    constructor(
        positions,
        lookedType,
        lookedAttr,
        reqComparisons,
        urls,
    ) {
        this.positions = positions;
        this.lookedType = lookedType;
        this.lookedAttr = lookedAttr;
        this.reqComparisons = reqComparisons;
        this.urls = urls;
    }
}

function getUrlWithToken(url, chapter) {
    return url.replace(REPLACEMENT_TOKEN, chapter);
}

module.exports = {HtmlLocate, getUrlWithToken};