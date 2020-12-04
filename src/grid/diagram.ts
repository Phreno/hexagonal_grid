import { Layout } from './layout';
import { Hex } from './hex';

type DrawContext = {
  canvasContext: CanvasRenderingContext2D
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
const HEX_CORNERS = 6;
const HEX_ORIGIN = 5;

enum Color {
  Stroke = 'black',
  GridOrigin = 'hsl(0, 50%, 0%)',
  HexQ= 'hsl(90, 70%, 35%)',
  HexR= 'hsl(200, 100%, 35%)',
  HexS= 'hsl(300, 40%, 50%)',
  Hex= 'hsl(0, 0%, 50%)'
}
export class Diagram {
  drawHex ({ canvasContext, layout, hex ,strokeStyle= Color.Stroke,lineWidth= 1 }: DrawHexContext & Partial<DrawStyle>) {
    const error = [canvasContext, layout, hex].filter(e => !e);
    if (error) {
      throw new Error('wrong args provided')
    }
    const corners = layout.polygonCorners(hex);
    canvasContext.beginPath();
    canvasContext.strokeStyle = strokeStyle;
    canvasContext.lineWidth = lineWidth;
    canvasContext.moveTo(corners[HEX_ORIGIN].x, corners[HEX_ORIGIN].y);
    [...Array(HEX_CORNERS).keys()].forEach(index => canvasContext.lineTo(corners[index].x,
    corners[index].y))
    canvasContext.stroke();
  }

  colorForHex (hex: Hex) {
    // Match the color style used in the main article
    if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
      return Color.GridOrigin;
    } else if (hex.q === 0) {
      return Color.HexQ;
    } else if (hex.r === 0) {
      return Color.HexR;
    } else if (hex.s === 0) {
      return Color.HexS;
    } else {
      return Color.Hex;
    }
  }

  drawHexLabel ({ canvasContext, layout, hex }: DrawHexContext) {
    const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
    const center = layout.hexToPixel(hex);
    canvasContext.fillStyle = this.colorForHex(hex);
    canvasContext.font = `${pointSize}px sans-serif`;
    canvasContext.textAlign = 'center';
    canvasContext.textBaseline = 'middle';
    canvasContext.fillText(hex.len() === 0 ? 'q,r,s' : (hex.q + ',' + hex.r + ',' + hex.s), center.x, center.y);
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

  shapeParallelogram (q1: number, r1: number, q2: number, r2: number, constructor: CallableFunction) {
    const hexes = [];
    for (let q = q1; q <= q2; q++) {
      for (let r = r1; r <= r2; r++) {
        hexes.push(constructor(q, r, -q - r));
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

  drawGrid (id: string, backgroundColor: string, withLabels: boolean, layout: Layout, hexes: Hex[]) {
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
      this.drawHex({ canvasContext,layout,hex });
      if (withLabels) this.drawHexLabel({ canvasContext, layout, hex });
    });
  }
}
