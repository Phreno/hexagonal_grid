"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffsetCoord = void 0;
const hex_1 = require("./hex");
class OffsetCoord {
    constructor(col, row) {
        this.col = col;
        this.row = row;
    }
    static qoffsetFromCube(offset, h) {
        const col = h.q;
        const row = h.r + (h.q + offset * (h.q & 1)) / 2;
        if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
            throw Error("offset must be EVEN (+1) or ODD (-1)");
        }
        return new OffsetCoord(col, row);
    }
    static qoffsetToCube(offset, h) {
        const q = h.col;
        const r = h.row - (h.col + offset * (h.col & 1)) / 2;
        const s = -q - r;
        if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
            throw Error("offset must be EVEN (+1) or ODD (-1)");
        }
        return new hex_1.Hex(q, r, s);
    }
    static roffsetFromCube(offset, h) {
        const col = h.q + (h.r + offset * (h.r & 1)) / 2;
        const row = h.r;
        if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
            throw Error("offset must be EVEN (+1) or ODD (-1)");
        }
        return new OffsetCoord(col, row);
    }
    static roffsetToCube(offset, h) {
        const q = h.col - (h.row + offset * (h.row & 1)) / 2;
        const r = h.row;
        const s = -q - r;
        if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
            throw Error("offset must be EVEN (+1) or ODD (-1)");
        }
        return new hex_1.Hex(q, r, s);
    }
}
exports.OffsetCoord = OffsetCoord;
OffsetCoord.EVEN = 1;
OffsetCoord.ODD = -1;
