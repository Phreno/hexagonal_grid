(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hexaction_1 = require("../hexaction");
const point_1 = require("../grid/point");
const diagram = new hexaction_1.Diagram();
diagram.drawGrid('layout-test-orientation-pointy', 'hsl(60, 10%, 90%)', true, new hexaction_1.Layout(hexaction_1.Layout.pointy, new point_1.Point(25, 25), new point_1.Point(0, 0)));
// diagram.drawGrid('layout-test-orientation-flat', 'hsl(60, 10%, 85%)', true,
//   new Layout(Layout.flat, new Point(25, 25), new Point(0, 0)));
// diagram.drawGrid('layout-test-size-1', 'hsl(60, 10%, 85%)', false,
//   new Layout(Layout.pointy, new Point(10, 10), new Point(0, 0)));
// diagram.drawGrid('layout-test-size-2', 'hsl(60, 10%, 90%)', false,
//   new Layout(Layout.pointy, new Point(20, 20), new Point(0, 0)));
// diagram.drawGrid('layout-test-size-3', 'hsl(60, 10%, 85%)', false,
//   new Layout(Layout.pointy, new Point(40, 40), new Point(0, 0)));
// diagram.drawGrid('layout-test-size-tall', 'hsl(60, 10%, 90%)', false,
//   new Layout(Layout.flat, new Point(15, 25), new Point(0, 0)));
// diagram.drawGrid('layout-test-size-wide', 'hsl(60, 10%, 85%)', false,
//   new Layout(Layout.flat, new Point(25, 15), new Point(0, 0)));
// diagram.drawGrid('layout-test-y-down', 'hsl(60, 10%, 85%)', true,
//   new Layout(Layout.pointy, new Point(25, 25), new Point(0, 0)));
// diagram.drawGrid('layout-test-y-up', 'hsl(60, 10%, 90%)', true,
//   new Layout(Layout.pointy, new Point(25, -25), new Point(0, 0)));
// diagram.drawGrid('shape-pointy-parallelogram-qr', 'hsl(60, 10%, 85%)', true,
//   new Layout(Layout.pointy, new Point(15, 15), new Point(0, 0)),
//   diagram.shapeParallelogram(-2, -2, 2, 2, diagram.permuteQRS));
// diagram.drawGrid('shape-pointy-parallelogram-sq', 'hsl(60, 10%, 90%)', true,
//   new Layout(Layout.pointy, new Point(13, 13), new Point(0, 0)),
//   diagram.shapeParallelogram(-2, -2, 2, 2, diagram.permuteSQR));
// diagram.drawGrid('shape-pointy-parallelogram-rs', 'hsl(60, 10%, 85%)', true,
//   new Layout(Layout.pointy, new Point(15, 15), new Point(0, 0)),
//   diagram.shapeParallelogram(-2, -2, 2, 2, diagram.permuteRSQ));
// diagram.drawGrid('shape-flat-parallelogram-qr', 'hsl(60, 10%, 90%)', true,
//   new Layout(Layout.flat, new Point(15, 15), new Point(0, 0)),
//   diagram.shapeParallelogram(-2, -2, 2, 2, diagram.permuteQRS));
// diagram.drawGrid('shape-flat-parallelogram-sq', 'hsl(60, 10%, 85%)', true,
//   new Layout(Layout.flat, new Point(15, 15), new Point(0, 0)),
//   diagram.shapeParallelogram(-2, -2, 2, 2, diagram.permuteSQR));
// diagram.drawGrid('shape-flat-parallelogram-rs', 'hsl(60, 10%, 90%)', true,
//   new Layout(Layout.flat, new Point(13, 13), new Point(0, 0)),
//   diagram.shapeParallelogram(-2, -2, 2, 2, diagram.permuteRSQ));
// diagram.drawGrid('shape-pointy-triangle-1', 'hsl(60, 10%, 85%)', true,
//   new Layout(Layout.pointy, new Point(15, 15), new Point(-70, -60)),
//   diagram.shapeTriangle1(5));
// diagram.drawGrid('shape-pointy-triangle-2', 'hsl(60, 10%, 90%)', true,
//   new Layout(Layout.pointy, new Point(15, 15), new Point(-130, -60)),
//   diagram.shapeTriangle2(5));
// diagram.drawGrid('shape-flat-triangle-1', 'hsl(60, 10%, 90%)', true,
//   new Layout(Layout.flat, new Point(15, 15), new Point(-60, -70)),
//   diagram.shapeTriangle1(5));
// diagram.drawGrid('shape-flat-triangle-2', 'hsl(60, 10%, 85%)', true,
//   new Layout(Layout.flat, new Point(15, 15), new Point(-60, -130)),
//   diagram.shapeTriangle2(5));
// diagram.drawGrid('shape-pointy-hexagon', 'hsl(60, 10%, 85%)', true,
//   new Layout(Layout.pointy, new Point(15, 15), new Point(0, 0)),
//   diagram.shapeHexagon(3));
// diagram.drawGrid('shape-flat-hexagon', 'hsl(60, 10%, 90%)', true,
//   new Layout(Layout.flat, new Point(15, 15), new Point(0, 0)),
//   diagram.shapeHexagon(3));
// diagram.drawGrid('shape-pointy-rectangle-qr', 'hsl(200, 20%, 87%)', true,
//   new Layout(Layout.pointy, new Point(10, 10), new Point(0, 0)),
//   diagram.shapeRectangle(8, 6, diagram.permuteQRS));
// diagram.drawGrid('shape-pointy-rectangle-rs', 'hsl(60, 10%, 85%)', true,
//   new Layout(Layout.pointy, new Point(10, 10), new Point(0, 0)),
//   diagram.shapeRectangle(8, 6, diagram.permuteRSQ));
// diagram.drawGrid('shape-pointy-rectangle-sq', 'hsl(60, 10%, 90%)', true,
//   new Layout(Layout.pointy, new Point(10, 10), new Point(0, 0)),
//   diagram.shapeRectangle(8, 6, diagram.permuteSQR));
// diagram.drawGrid('shape-pointy-rectangle-rq', 'hsl(60, 10%, 85%)', true,
//   new Layout(Layout.pointy, new Point(10, 10), new Point(0, 0)),
//   diagram.shapeRectangle(8, 6, diagram.permuteRQS));
// diagram.drawGrid('shape-pointy-rectangle-sr', 'hsl(60, 10%, 90%)', true,
//   new Layout(Layout.pointy, new Point(10, 10), new Point(0, 0)),
//   diagram.shapeRectangle(8, 6, diagram.permuteSRQ));
// diagram.drawGrid('shape-pointy-rectangle-qs', 'hsl(60, 10%, 85%)', true,
//   new Layout(Layout.pointy, new Point(10, 10), new Point(0, 0)),
//   diagram.shapeRectangle(8, 6, diagram.permuteQSR));
// diagram.drawGrid('shape-flat-rectangle-qr', 'hsl(60, 10%, 90%)', true,
//   new Layout(Layout.flat, new Point(10, 10), new Point(0, 0)),
//   diagram.shapeRectangle(8, 6, diagram.permuteQRS));
// diagram.drawGrid('shape-flat-rectangle-rs', 'hsl(60, 10%, 85%)', true,
//   new Layout(Layout.flat, new Point(10, 10), new Point(0, 0)),
//   diagram.shapeRectangle(8, 6, diagram.permuteRSQ));
// diagram.drawGrid('shape-flat-rectangle-sq', 'hsl(60, 10%, 90%)', true,
//   new Layout(Layout.flat, new Point(10, 10), new Point(0, 0)),
//   diagram.shapeRectangle(8, 6, diagram.permuteSQR));
// diagram.drawGrid('shape-flat-rectangle-rq', 'hsl(200, 15%, 85%)', true,
//   new Layout(Layout.flat, new Point(10, 10), new Point(0, 0)),
//   diagram.shapeRectangle(8, 6, diagram.permuteRQS));
// diagram.drawGrid('shape-flat-rectangle-sr', 'hsl(60, 10%, 90%)', true,
//   new Layout(Layout.flat, new Point(10, 10), new Point(0, 0)),
//   diagram.shapeRectangle(8, 6, diagram.permuteSRQ));
// diagram.drawGrid('shape-flat-rectangle-qs', 'hsl(60, 10%, 85%)', true,
//   new Layout(Layout.flat, new Point(10, 10), new Point(0, 0)),
//   diagram.shapeRectangle(8, 6, diagram.permuteQSR));

},{"../grid/point":6,"../hexaction":7}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = void 0;
const hex_1 = require("./hex");
const HEX_CORNERS = 6;
const CORNER_REFERENCE = 5;
const ORIGIN = 0;
var Color;
(function (Color) {
    Color["Stroke"] = "black";
    Color["GridOrigin"] = "hsl(0, 50%, 0%)";
    Color["HexQ"] = "hsl(90, 70%, 35%)";
    Color["HexR"] = "hsl(200, 100%, 35%)";
    Color["HexS"] = "hsl(300, 40%, 50%)";
    Color["Hex"] = "hsl(0, 0%, 50%)";
})(Color || (Color = {}));
class Diagram {
    /**
     * Dessine un hexagone sur le canvas
     * @param {(DrawHexContext & Partial<DrawStyle>)} { canvas, layout, hex ,strokeStyle= Color.Stroke,lineWidth= 1 }
     * @throws Error
     * @memberof Diagram
     */
    drawHex({ canvas, layout, hex, strokeStyle = Color.Stroke, lineWidth = 1 }) {
        const checkMissingArgs = this.checkDrawHexContextMissingArgs({ canvas, layout, hex });
        let corners;
        if (canvas instanceof CanvasRenderingContext2D) {
            corners = layout.polygonCorners(hex);
            canvas.beginPath();
            canvas.strokeStyle = strokeStyle;
            canvas.lineWidth = lineWidth;
            canvas.moveTo(corners[CORNER_REFERENCE].x, corners[CORNER_REFERENCE].y);
            [...Array(HEX_CORNERS).keys()].forEach(index => canvas.lineTo(corners[index].x, corners[index].y));
            canvas.stroke();
        }
        else {
            throw new Error('wrong canvas type');
        }
    }
    checkDrawHexContextMissingArgs({ canvas, layout, hex }) {
        const checkMissingArgs = [canvas, layout, hex].every(e => e);
        if (!checkMissingArgs) {
            throw new Error('missing args');
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
    colorForHex(hex) {
        if (!hex) {
            throw new Error('missing args');
        }
        // Match the color style used in the main article
        if (hex.q === ORIGIN && hex.r === ORIGIN && hex.s === ORIGIN) {
            return Color.GridOrigin;
        }
        else if (hex.q === ORIGIN) {
            return Color.HexQ;
        }
        else if (hex.r === ORIGIN) {
            return Color.HexR;
        }
        else if (hex.s === ORIGIN) {
            return Color.HexS;
        }
        else {
            return Color.Hex;
        }
    }
    drawHexLabel({ canvas, layout, hex }) {
        this.checkDrawHexContextMissingArgs({ canvas, layout, hex });
        if (canvas instanceof CanvasRenderingContext2D) {
            const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
            const center = layout.hexToPixel(hex);
            canvas.fillStyle = this.colorForHex(hex);
            canvas.font = `${pointSize}px sans-serif`;
            canvas.textAlign = 'center';
            canvas.textBaseline = 'middle';
            canvas.fillText(hex.len() === 0 ? 'q,r,s' : (hex.q + ',' + hex.r + ',' + hex.s), center.x, center.y);
        }
        else {
            throw new Error('wrong canvas type');
        }
    }
    permuteQRS({ q, r, s }) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ({ q, r, s }) {
        return new hex_1.Hex(s, r, q);
    }
    permuteSQR({ q, r, s }) {
        return new hex_1.Hex(s, q, r);
    }
    permuteRQS({ q, r, s }) {
        return new hex_1.Hex(r, q, s);
    }
    permuteRSQ({ q, r, s }) {
        return new hex_1.Hex(r, s, q);
    }
    permuteQSR({ q, r, s }) {
        return new hex_1.Hex(q, s, r);
    }
    shapeParallelogram(q1, r1, q2, r2, permute) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(permute({ q, r, s: -q - r }));
            }
        }
        return hexes;
    }
    shapeTriangle1(size) {
        const hexes = [];
        for (let q = 0; q <= size; q++) {
            for (let r = 0; r <= size - q; r++) {
                hexes.push(new hex_1.Hex(q, r, -q - r));
            }
        }
        return hexes;
    }
    shapeTriangle2(size) {
        const hexes = [];
        for (let q = 0; q <= size; q++) {
            for (let r = size - q; r <= size; r++) {
                hexes.push(new hex_1.Hex(q, r, -q - r));
            }
        }
        return hexes;
    }
    shapeHexagon(size) {
        const hexes = [];
        for (let q = -size; q <= size; q++) {
            const r1 = Math.max(-size, -q - size);
            const r2 = Math.min(size, -q + size);
            for (let r = r1; r <= r2; r++) {
                hexes.push(new hex_1.Hex(q, r, -q - r));
            }
        }
        return hexes;
    }
    shapeRectangle(w, h, permute) {
        const hexes = [];
        const i1 = -Math.floor(w / 2);
        const i2 = i1 + w;
        const j1 = -Math.floor(h / 2);
        const j2 = j1 + h;
        for (let r = j1; r < j2; r++) {
            const jOffset = -Math.floor(r / 2);
            for (let q = i1 + jOffset; q < i2 + jOffset; q++) {
                hexes.push(permute({ q, r, s: -q - r }));
            }
        }
        return hexes;
    }
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
            this.drawHex({ canvas: canvasContext, layout, hex });
            if (withLabels)
                this.drawHexLabel({ canvas: canvasContext, layout, hex });
        });
    }
}
exports.Diagram = Diagram;

},{"./hex":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hex = void 0;
class Hex {
    constructor(q, r, s) {
        this.q = q;
        this.r = r;
        this.s = s;
        if (Math.round(q + r + s) !== 0)
            throw Error('q + r + s must be 0');
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
exports.Hex = Hex;
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Layout = void 0;
const orientation_1 = require("./orientation");
const point_1 = require("./point");
const hex_1 = require("./hex");
class Layout {
    constructor(orientation, size, origin) {
        this.orientation = orientation;
        this.size = size;
        this.origin = origin;
    }
    hexToPixel(h) {
        const M = this.orientation;
        const size = this.size;
        const origin = this.origin;
        const x = (M.f0 * h.q + M.f1 * h.r) * size.x;
        const y = (M.f2 * h.q + M.f3 * h.r) * size.y;
        return new point_1.Point(x + origin.x, y + origin.y);
    }
    pixelToHex(p) {
        const M = this.orientation;
        const size = this.size;
        const origin = this.origin;
        const pt = new point_1.Point((p.x - origin.x) / size.x, (p.y - origin.y) / size.y);
        const q = M.b0 * pt.x + M.b1 * pt.y;
        const r = M.b2 * pt.x + M.b3 * pt.y;
        return new hex_1.Hex(q, r, -q - r);
    }
    hexCornerOffset(corner) {
        const M = this.orientation;
        const size = this.size;
        const angle = 2.0 * Math.PI * (M.startAngle - corner) / 6.0;
        return new point_1.Point(size.x * Math.cos(angle), size.y * Math.sin(angle));
    }
    polygonCorners(h) {
        const corners = [];
        const center = this.hexToPixel(h);
        for (let i = 0; i < 6; i++) {
            const offset = this.hexCornerOffset(i);
            corners.push(new point_1.Point(center.x + offset.x, center.y + offset.y));
        }
        return corners;
    }
}
exports.Layout = Layout;
Layout.pointy = new orientation_1.Orientation(Math.sqrt(3.0), Math.sqrt(3.0) / 2.0, 0.0, 3.0 / 2.0, Math.sqrt(3.0) / 3.0, -1.0 / 3.0, 0.0, 2.0 / 3.0, 0.5);
Layout.flat = new orientation_1.Orientation(3.0 / 2.0, 0.0, Math.sqrt(3.0) / 2.0, Math.sqrt(3.0), 2.0 / 3.0, 0.0, -1.0 / 3.0, Math.sqrt(3.0) / 3.0, 0.0);

},{"./hex":3,"./orientation":5,"./point":6}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orientation = void 0;
class Orientation {
    constructor(f0, f1, f2, f3, b0, b1, b2, b3, startAngle) {
        this.f0 = f0;
        this.f1 = f1;
        this.f2 = f2;
        this.f3 = f3;
        this.b0 = b0;
        this.b1 = b1;
        this.b2 = b2;
        this.b3 = b3;
        this.startAngle = startAngle;
    }
}
exports.Orientation = Orientation;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Point = void 0;
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
exports.Point = Point;

},{}],7:[function(require,module,exports){
"use strict";
// From http://www.redblobgames.com/grids/hexagons/implementation.html
// Copyright 2015 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = exports.Point = exports.Hex = exports.Layout = void 0;
const layout_1 = require("./grid/layout");
Object.defineProperty(exports, "Layout", { enumerable: true, get: function () { return layout_1.Layout; } });
const hex_1 = require("./grid/hex");
Object.defineProperty(exports, "Hex", { enumerable: true, get: function () { return hex_1.Hex; } });
const point_1 = require("./grid/point");
Object.defineProperty(exports, "Point", { enumerable: true, get: function () { return point_1.Point; } });
const diagram_1 = require("./grid/diagram");
Object.defineProperty(exports, "Diagram", { enumerable: true, get: function () { return diagram_1.Diagram; } });

},{"./grid/diagram":2,"./grid/hex":3,"./grid/layout":4,"./grid/point":6}]},{},[1]);
