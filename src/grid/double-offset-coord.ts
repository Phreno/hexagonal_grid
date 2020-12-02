import { Hex } from './hex';

export class DoubledCoord {
  constructor (public col: number, public row: number) { }

  public static qdoubledFromCube (h: Hex): DoubledCoord {
    const col: number = h.q;
    const row: number = 2 * h.r + h.q;
    return new DoubledCoord(col, row);
  }

  public qdoubledToCube (): Hex {
    const q: number = this.col;
    const r: number = (this.row - this.col) / 2;
    const s: number = -q - r;
    return new Hex(q, r, s);
  }

  public static rdoubledFromCube (h: Hex): DoubledCoord {
    const col: number = 2 * h.q + h.r;
    const row: number = h.r;
    return new DoubledCoord(col, row);
  }

  public rdoubledToCube (): Hex {
    const q: number = (this.col - this.row) / 2;
    const r: number = this.row;
    const s: number = -q - r;
    return new Hex(q, r, s);
  }

}
