export class Hex {
    constructor(q, r, s) {
        this.q = q;
        this.r = r;
        this.s = s;
        if (Math.round(q + r + s) !== 0)
            throw Error("q + r + s must be 0");
    }
    add(b) {
        return new Hex(this.q + b.q, this.r + b.r, this.s + b.s);
    }
    subtract(b) {
        return new Hex(this.q - b.q, this.r - b.r, this.s - b.s);
    }
    scale(k) {
        return new Hex(this.q * k, this.r * k, this.s * k);
    }
    rotateLeft() {
        return new Hex(-this.s, -this.q, -this.r);
    }
    rotateRight() {
        return new Hex(-this.r, -this.s, -this.q);
    }
    static direction(direction) {
        return Hex.directions[direction];
    }
    neighbor(direction) {
        return this.add(Hex.direction(direction));
    }
    diagonalNeighbor(direction) {
        return this.add(Hex.diagonals[direction]);
    }
    len() {
        return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s)) / 2;
    }
    distance(b) {
        return this.subtract(b).len();
    }
    round() {
        let qi = Math.round(this.q);
        let ri = Math.round(this.r);
        let si = Math.round(this.s);
        const qDiff = Math.abs(qi - this.q);
        const rDiff = Math.abs(ri - this.r);
        const sDiff = Math.abs(si - this.s);
        if (qDiff > rDiff && qDiff > sDiff) {
            qi = -ri - si;
        }
        else if (rDiff > sDiff) {
            ri = -qi - si;
        }
        else {
            si = -qi - ri;
        }
        return new Hex(qi, ri, si);
    }
    lerp(b, t) {
        return new Hex(this.q * (1.0 - t) + b.q * t, this.r * (1.0 - t) + b.r * t, this.s * (1.0 - t) + b.s * t);
    }
    linedraw(b) {
        const N = this.distance(b);
        const aNudge = new Hex(this.q + 1e-06, this.r + 1e-06, this.s - 2e-06);
        const bNudge = new Hex(b.q + 1e-06, b.r + 1e-06, b.s - 2e-06);
        const results = [];
        const step = 1.0 / Math.max(N, 1);
        for (let i = 0; i <= N; i++) {
            results.push(aNudge.lerp(bNudge, step * i).round());
        }
        return results;
    }
}
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];
