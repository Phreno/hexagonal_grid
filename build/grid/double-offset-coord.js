import { Hex } from "./hex";
export class DoubledCoord {
    constructor(col, row) {
        this.col = col;
        this.row = row;
    }
    static qdoubledFromCube(h) {
        const col = h.q;
        const row = 2 * h.r + h.q;
        return new DoubledCoord(col, row);
    }
    qdoubledToCube() {
        const q = this.col;
        const r = (this.row - this.col) / 2;
        const s = -q - r;
        return new Hex(q, r, s);
    }
    static rdoubledFromCube(h) {
        const col = 2 * h.q + h.r;
        const row = h.r;
        return new DoubledCoord(col, row);
    }
    rdoubledToCube() {
        const q = (this.col - this.row) / 2;
        const r = this.row;
        const s = -q - r;
        return new Hex(q, r, s);
    }
}
