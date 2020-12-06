import { Layout } from './layout';
import { Hex } from './hex';
import { Point } from '../hexaction'

type HtmlID = string;

type DrawContext = {
  canvas: CanvasRenderingContext2D | HtmlID,
  layout: Layout
}
type DrawHexContext = DrawContext & {
  hex: Hex
};
type DrawGridContext = DrawContext & {
  hexes: Hex[]
}
type DrawStyle = {
  strokeStyle: string; lineWidth: number
}
type Permutable = {q: number, r: number, s: number}
type IPermutable = (hex: Permutable) => {};

const HEX_CORNERS = 6;
const CORNER_REFERENCE = 5;
const ORIGIN = 0;

enum Color {
  Stroke = 'black',
  GridOrigin = 'hsl(0, 50%, 0%)',
  HexQ= 'hsl(90, 70%, 35%)',
  HexR= 'hsl(200, 100%, 35%)',
  HexS= 'hsl(300, 40%, 50%)',
  Hex= 'hsl(0, 0%, 50%)'
}
export class Diagram {
  /**
   * Dessine un hexagone sur le canvas
   * @param {(DrawHexContext & Partial<DrawStyle>)} { canvas, layout, hex ,strokeStyle= Color.Stroke,lineWidth= 1 }
   * @throws Error
   * @memberof Diagram
   */
  drawHex ({ canvas, layout, hex ,strokeStyle= Color.Stroke,lineWidth= 1 }: DrawHexContext & Partial<DrawStyle>) {
    const checkMissingArgs = this.checkDrawHexContextMissingArgs({ canvas,layout,hex });
    let corners: Point[];
    if (canvas instanceof CanvasRenderingContext2D) {
      corners = layout.polygonCorners(hex);
      canvas.beginPath();
      canvas.strokeStyle = strokeStyle;
      canvas.lineWidth = lineWidth;
      canvas.moveTo(corners[CORNER_REFERENCE].x, corners[CORNER_REFERENCE].y);
      [...Array(HEX_CORNERS).keys()].forEach(index => canvas.lineTo(corners[index].x,
      corners[index].y))
      canvas.stroke();
    } else {
      throw new Error('wrong canvas type')
    }
  }

  private checkDrawHexContextMissingArgs ({ canvas,layout,hex }: DrawHexContext) {
    const checkMissingArgs = [canvas,layout,hex].every(e => e);
    if (!checkMissingArgs) {
      throw new Error('missing args')
    }
  }

  /**
   * Défini la couleur d'un hexagone en fonction
   * de sa position
   *
   * @param {Hex} hex
   * @returns
   * @memberof Diagram
   */
  colorForHex (hex: Hex) {
    if (!hex) {
      throw new Error('missing args')
    }
    // Match the color style used in the main article
    if (hex.q === ORIGIN && hex.r === ORIGIN && hex.s === ORIGIN) {
      return Color.GridOrigin;
    } else if (hex.q === ORIGIN) {
      return Color.HexQ;
    } else if (hex.r === ORIGIN) {
      return Color.HexR;
    } else if (hex.s === ORIGIN) {
      return Color.HexS;
    } else {
      return Color.Hex;
    }
  }

  drawHexLabel ({ canvas, layout, hex }: DrawHexContext) {
    this.checkDrawHexContextMissingArgs({ canvas, layout, hex })
    if (canvas instanceof CanvasRenderingContext2D) {
      const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
      const center = layout.hexToPixel(hex);
      canvas.fillStyle = this.colorForHex(hex);
      canvas.font = `${pointSize}px sans-serif`;
      canvas.textAlign = 'center';
      canvas.textBaseline = 'middle';
      canvas.fillText(hex.len() === 0 ? 'q,r,s' : (hex.q + ',' + hex.r + ',' + hex.s), center.x, center.y);
    } else {
      throw new Error('wrong canvas type')
    }
  }

  permuteQRS ({ q, r, s }: Hex) {
    return new Hex(q, r, s);
  }

  permuteSRQ ({ q, r, s }: Hex) {
    return new Hex(s, r, q);
  }

  permuteSQR ({ q, r, s }: Hex) {
    return new Hex(s,q,r);
  }

  permuteRQS ({ q, r, s }: Hex) {
    return new Hex(r,q,s);
  }

  permuteRSQ ({ q, r, s }: Hex) {
    return new Hex(r,s,q);
  }

  permuteQSR ({ q, r, s }: Hex) {
    return new Hex(q,s,r);
  }

  shapeParallelogram (q1: number, r1: number, q2: number, r2: number, permute: IPermutable) {
    const hexes = [];
    for (let q = q1; q <= q2; q++) {
      for (let r = r1; r <= r2; r++) {
        hexes.push(permute({ q, r, s: -q - r }));
      }
    }
    return hexes;
  }

  shapeTriangle1 (size: number) {
    const hexes = [];
    for (let q = 0; q <= size; q++) {
      for (let r = 0; r <= size - q; r++) {
        hexes.push(new Hex(q, r, -q - r));
      }
    }
    return hexes;
  }

  shapeTriangle2 (size: number) {
    const hexes = [];
    for (let q = 0; q <= size; q++) {
      for (let r = size - q; r <= size; r++) {
        hexes.push(new Hex(q, r, -q - r));
      }
    }
    return hexes;
  }

  shapeHexagon (size: number) {
    const hexes = [];
    for (let q = -size; q <= size; q++) {
      const r1 = Math.max(-size, -q - size);
      const r2 = Math.min(size, -q + size);
      for (let r = r1; r <= r2; r++) {
        hexes.push(new Hex(q, r, -q - r));
      }
    }
    return hexes;
  }

  shapeRectangle (w: number, h: number, constructor: CallableFunction) {
    const hexes = [];
    const i1 = -Math.floor(w / 2);
    const i2 = i1 + w;
    const j1 = -Math.floor(h / 2);
    const j2 = j1 + h;
    for (let j = j1; j < j2; j++) {
      const jOffset = -Math.floor(j / 2);
      for (let i = i1 + jOffset; i < i2 + jOffset; i++) {
        hexes.push(constructor(i, j, -i - j));
      }
    }
    return hexes;
  }

  drawGrid (id: string, backgroundColor: string, withLabels: boolean, layout: Layout, hexes?: Hex[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) {
      return;
    }
    const canvasContext = canvas.getContext('2d');
    if (!canvasContext) {
      return;
    }
    const width = canvas.width;
    const height = canvas.height;
    if (window.devicePixelRatio && window.devicePixelRatio !== 1) {
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvasContext.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    if (!hexes) {
      hexes = this.shapeRectangle(15, 15, this.permuteQRS);
    }

    canvasContext.fillStyle = backgroundColor;
    canvasContext.fillRect(0, 0, width, height);
    canvasContext.translate(width / 2, height / 2);
    hexes.forEach((hex) => {
      this.drawHex({ canvas: canvasContext,layout,hex });
      if (withLabels) this.drawHexLabel({ canvas: canvasContext, layout, hex });
    });
  }
}
