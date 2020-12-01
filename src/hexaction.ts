// From http://www.redblobgames.com/grids/hexagons/implementation.html
// Copyright 2015 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

import { Layout } from "./grid/layout";
import { Hex } from "./grid/hex";

// This code is used to generate the diagrams on implementation.html

/* global Hex, Layout, Point */
export class Hexaction {
  drawHex(ctx: CanvasRenderingContext2D, layout: Layout, hex: Hex) {
    const corners = layout.polygonCorners(hex);
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.moveTo(corners[5].x, corners[5].y);
    for (let i = 0; i < 6; i++) {
      ctx.lineTo(corners[i].x, corners[i].y);
    }
    ctx.stroke();
  }


  colorForHex(hex: Hex) {
    // Match the color style used in the main article
    if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
      return "hsl(0, 50%, 0%)";
    } else if (hex.q === 0) {
      return "hsl(90, 70%, 35%)";
    } else if (hex.r === 0) {
      return "hsl(200, 100%, 35%)";
    } else if (hex.s === 0) {
      return "hsl(300, 40%, 50%)";
    } else {
      return "hsl(0, 0%, 50%)";
    }
  }


  drawHexLabel(ctx: CanvasRenderingContext2D, layout: Layout, hex: Hex) {
    const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
    const center = layout.hexToPixel(hex);
    ctx.fillStyle = this.colorForHex(hex);
    ctx.font = `${pointSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(hex.len() === 0 ? "q,r,s" : (hex.q + "," + hex.r + "," + hex.s), center.x, center.y);
  }


  permuteQRS(q: number, r: number, s: number) {
    return new Hex(q, r, s);
  }

  permuteSRQ(s: number, r: number, q: number) {
    return new Hex(q, r, s);
  }

  permuteSQR(s: number, q: number, r: number) {
    return new Hex(q, r, s);
  }

  permuteRQS(r: number, q: number, s: number) {
    return new Hex(q, r, s);
  }

  permuteRSQ(r: number, s: number, q: number) {
    return new Hex(q, r, s);
  }

  permuteQSR(q: number, s: number, r: number) {
    return new Hex(q, r, s);
  }

  shapeParallelogram(q1: number, r1: number, q2: number, r2: number, constructor: CallableFunction) {
    const hexes = [];
    for (let q = q1; q <= q2; q++) {
      for (let r = r1; r <= r2; r++) {
        hexes.push(constructor(q, r, -q - r));
      }
    }
    return hexes;
  }


  shapeTriangle1(size: number) {
    const hexes = [];
    for (let q = 0; q <= size; q++) {
      for (let r = 0; r <= size - q; r++) {
        hexes.push(new Hex(q, r, -q - r));
      }
    }
    return hexes;
  }


  shapeTriangle2(size: number) {
    const hexes = [];
    for (let q = 0; q <= size; q++) {
      for (let r = size - q; r <= size; r++) {
        hexes.push(new Hex(q, r, -q - r));
      }
    }
    return hexes;
  }


  shapeHexagon(size: number) {
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


  shapeRectangle(w: number, h: number, constructor: CallableFunction) {
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


  drawGrid(id: string, backgroundColor: string, withLabels: boolean, layout: Layout, hexes: Hex[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    const width = canvas.width;
    const height = canvas.height;
    if (window.devicePixelRatio && window.devicePixelRatio !== 1) {
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    if (hexes === undefined) {
      hexes = this.shapeRectangle(15, 15, this.permuteQRS);
    }

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    ctx.translate(width / 2, height / 2);
    hexes.forEach((hex) => {
      this.drawHex(ctx, layout, hex);
      if (withLabels) this.drawHexLabel(ctx, layout, hex);
    });
  }
}