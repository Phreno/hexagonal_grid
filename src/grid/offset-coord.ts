import { Hex } from "./hex";

export class OffsetCoord {
  constructor(public col: number, public row: number) { }
  public static EVEN: number = 1;
  public static ODD: number = -1;

  public static qoffsetFromCube(offset: number, h: Hex): OffsetCoord {
    const col: number = h.q;
    const row: number = h.r + (h.q + offset * (h.q & 1)) / 2;
    if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
      throw Error("offset must be EVEN (+1) or ODD (-1)");
    }
    return new OffsetCoord(col, row);
  }


  public static qoffsetToCube(offset: number, h: OffsetCoord): Hex {
    const q: number = h.col;
    const r: number = h.row - (h.col + offset * (h.col & 1)) / 2;
    const s: number = -q - r;
    if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
      throw Error("offset must be EVEN (+1) or ODD (-1)");
    }
    return new Hex(q, r, s);
  }


  public static roffsetFromCube(offset: number, h: Hex): OffsetCoord {
    const col: number = h.q + (h.r + offset * (h.r & 1)) / 2;
    const row: number = h.r;
    if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
      throw Error("offset must be EVEN (+1) or ODD (-1)");
    }
    return new OffsetCoord(col, row);
  }


  public static roffsetToCube(offset: number, h: OffsetCoord): Hex {
    const q: number = h.col - (h.row + offset * (h.row & 1)) / 2;
    const r: number = h.row;
    const s: number = -q - r;
    if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
      throw Error("offset must be EVEN (+1) or ODD (-1)");
    }
    return new Hex(q, r, s);
  }

}