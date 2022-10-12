
class HtmlLocate {
    constructor(
        positions,
        lookedType,
        lookedAttr,
        reqComparisons,
    ) {
        this.positions = positions;
        this.lookedType = lookedType;
        this.lookedAttr = lookedAttr;
        this.reqComparisons = reqComparisons;
    }
}

module.exports = {HtmlLocate};