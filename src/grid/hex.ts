export class Hex {
  constructor(public q: number, public r: number, public s: number) {
    if (Math.round(q + r + s) !== 0) throw Error("q + r + s must be 0");
  }

  public add(b: Hex): Hex {
    return new Hex(this.q + b.q, this.r + b.r, this.s + b.s);
  }


  public subtract(b: Hex): Hex {
    return new Hex(this.q - b.q, this.r - b.r, this.s - b.s);
  }


  public scale(k: number): Hex {
    return new Hex(this.q * k, this.r * k, this.s * k);
  }


  public rotateLeft(): Hex {
    return new Hex(-this.s, -this.q, -this.r);
  }


  public rotateRight(): Hex {
    return new Hex(-this.r, -this.s, -this.q);
  }

  public static directions: Hex[] = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];

  public static direction(direction: number): Hex {
    return Hex.directions[direction];
  }


  public neighbor(direction: number): Hex {
    return this.add(Hex.direction(direction));
  }

  public static diagonals: Hex[] = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];

  public diagonalNeighbor(direction: number): Hex {
    return this.add(Hex.diagonals[direction]);
  }


  public len(): number {
    return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s)) / 2;
  }


  public distance(b: Hex): number {
    return this.subtract(b).len();
  }


  public round(): Hex {
    let qi: number = Math.round(this.q);
    let ri: number = Math.round(this.r);
    let si: number = Math.round(this.s);
    const qDiff: number = Math.abs(qi - this.q);
    const rDiff: number = Math.abs(ri - this.r);
    const sDiff: number = Math.abs(si - this.s);
    if (qDiff > rDiff && qDiff > sDiff) {
      qi = -ri - si;
    }
    else
      if (rDiff > sDiff) {
        ri = -qi - si;
      }
      else {
        si = -qi - ri;
      }
    return new Hex(qi, ri, si);
  }


  public lerp(b: Hex, t: number): Hex {
    return new Hex(this.q * (1.0 - t) + b.q * t, this.r * (1.0 - t) + b.r * t, this.s * (1.0 - t) + b.s * t);
  }


  public linedraw(b: Hex): Hex[] {
    const N: number = this.distance(b);
    const aNudge: Hex = new Hex(this.q + 1e-06, this.r + 1e-06, this.s - 2e-06);
    const bNudge: Hex = new Hex(b.q + 1e-06, b.r + 1e-06, b.s - 2e-06);
    const results: Hex[] = [];
    const step: number = 1.0 / Math.max(N, 1);
    for (let i = 0; i <= N; i++) {
      results.push(aNudge.lerp(bNudge, step * i).round());
    }
    return results;
  }

}