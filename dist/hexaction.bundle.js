(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoubledCoord = void 0;
const hex_1 = require("./hex");
class DoubledCoord {
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
        return new hex_1.Hex(q, r, s);
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
        return new hex_1.Hex(q, r, s);
    }
}
exports.DoubledCoord = DoubledCoord;

},{"./hex":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hex = void 0;
class Hex {
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
exports.Hex = Hex;
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];

},{}],3:[function(require,module,exports){
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

},{"./hex":2,"./orientation":5,"./point":6}],4:[function(require,module,exports){
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

},{"./hex":2}],5:[function(require,module,exports){
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

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DoubleOffsetCoord = require("./grid/double-offset-coord");
exports.Hex = require("./grid/hex");
exports.Layout = require("./grid/layout");
exports.OffsetCoord = require("./grid/offset-coord");
exports.Orientation = require("./grid/orientation");
exports.Point = require("./grid/point"); // import DoubleOffsetCoord = require('./grid/double-offset-coord');
// import Hex = require('./grid/hex');
// import Layout = require('./grid/layout');
// import OffsetCoord = require('./grid/offset-coord');
// import Orientation = require('./grid/orientation');
// import Point = require('./grid/point');
// (window as any).hexaction = {
//   DoubleOffsetCoord,
//   Hex,
//   Layout,
//   Orientation,
//   Point
// }

},{"./grid/double-offset-coord":1,"./grid/hex":2,"./grid/layout":3,"./grid/offset-coord":4,"./grid/orientation":5,"./grid/point":6}]},{},[7])(7)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoubledCoord = void 0;
const hex_1 = require("./hex");
class DoubledCoord {
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
        return new hex_1.Hex(q, r, s);
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
        return new hex_1.Hex(q, r, s);
    }
}
exports.DoubledCoord = DoubledCoord;

},{"./hex":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hex = void 0;
class Hex {
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
exports.Hex = Hex;
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];

},{}],3:[function(require,module,exports){
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

},{"./hex":2,"./orientation":5,"./point":6}],4:[function(require,module,exports){
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

},{"./hex":2}],5:[function(require,module,exports){
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

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DoubleOffsetCoord = require("./grid/double-offset-coord");
exports.Hex = require("./grid/hex");
exports.Layout = require("./grid/layout");
exports.OffsetCoord = require("./grid/offset-coord");
exports.Orientation = require("./grid/orientation");
exports.Point = require("./grid/point"); // import DoubleOffsetCoord = require('./grid/double-offset-coord');
// import Hex = require('./grid/hex');
// import Layout = require('./grid/layout');
// import OffsetCoord = require('./grid/offset-coord');
// import Orientation = require('./grid/orientation');
// import Point = require('./grid/point');
// (window as any).hexaction = {
//   DoubleOffsetCoord,
//   Hex,
//   Layout,
//   Orientation,
//   Point
// }

},{"./grid/double-offset-coord":1,"./grid/hex":2,"./grid/layout":3,"./grid/offset-coord":4,"./grid/orientation":5,"./grid/point":6}]},{},[7])(7)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoubledCoord = void 0;
const hex_1 = require("./hex");
class DoubledCoord {
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
        return new hex_1.Hex(q, r, s);
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
        return new hex_1.Hex(q, r, s);
    }
}
exports.DoubledCoord = DoubledCoord;

},{"./hex":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hex = void 0;
class Hex {
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
exports.Hex = Hex;
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];

},{}],3:[function(require,module,exports){
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

},{"./hex":2,"./orientation":5,"./point":6}],4:[function(require,module,exports){
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

},{"./hex":2}],5:[function(require,module,exports){
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

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DoubleOffsetCoord = require("./grid/double-offset-coord");
exports.Hex = require("./grid/hex");
exports.Layout = require("./grid/layout");
exports.OffsetCoord = require("./grid/offset-coord");
exports.Orientation = require("./grid/orientation");
exports.Point = require("./grid/point"); // import DoubleOffsetCoord = require('./grid/double-offset-coord');
// import Hex = require('./grid/hex');
// import Layout = require('./grid/layout');
// import OffsetCoord = require('./grid/offset-coord');
// import Orientation = require('./grid/orientation');
// import Point = require('./grid/point');
// (window as any).hexaction = {
//   DoubleOffsetCoord,
//   Hex,
//   Layout,
//   Orientation,
//   Point
// }

},{"./grid/double-offset-coord":1,"./grid/hex":2,"./grid/layout":3,"./grid/offset-coord":4,"./grid/orientation":5,"./grid/point":6}]},{},[7])(7)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hex = void 0;
class Hex {
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
exports.Hex = Hex;
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];

},{}],2:[function(require,module,exports){
"use strict";
// From http://www.redblobgames.com/grids/hexagons/implementation.html
// Copyright 2015 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hexaction = void 0;
const hex_1 = require("./grid/hex");
// This code is used to generate the diagrams on implementation.html
/* global Hex, Layout, Point */
class Hexaction {
    drawHex(ctx, layout, hex) {
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
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return "hsl(0, 50%, 0%)";
        }
        else if (hex.q === 0) {
            return "hsl(90, 70%, 35%)";
        }
        else if (hex.r === 0) {
            return "hsl(200, 100%, 35%)";
        }
        else if (hex.s === 0) {
            return "hsl(300, 40%, 50%)";
        }
        else {
            return "hsl(0, 0%, 50%)";
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(hex.len() === 0 ? "q,r,s" : (hex.q + "," + hex.r + "," + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Hexaction = Hexaction;

},{"./grid/hex":1}]},{},[2])(2)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hex = void 0;
class Hex {
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
exports.Hex = Hex;
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];

},{}],2:[function(require,module,exports){
"use strict";
// From http://www.redblobgames.com/grids/hexagons/implementation.html
// Copyright 2015 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hexaction = void 0;
const hex_1 = require("./grid/hex");
// This code is used to generate the diagrams on implementation.html
/* global Hex, Layout, Point */
class Hexaction {
    drawHex(ctx, layout, hex) {
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
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return "hsl(0, 50%, 0%)";
        }
        else if (hex.q === 0) {
            return "hsl(90, 70%, 35%)";
        }
        else if (hex.r === 0) {
            return "hsl(200, 100%, 35%)";
        }
        else if (hex.s === 0) {
            return "hsl(300, 40%, 50%)";
        }
        else {
            return "hsl(0, 0%, 50%)";
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(hex.len() === 0 ? "q,r,s" : (hex.q + "," + hex.r + "," + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Hexaction = Hexaction;

},{"./grid/hex":1}]},{},[2])(2)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hex = void 0;
class Hex {
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
exports.Hex = Hex;
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];

},{}],2:[function(require,module,exports){
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

},{"./hex":1,"./orientation":3,"./point":4}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
"use strict";
// From http://www.redblobgames.com/grids/hexagons/implementation.html
// Copyright 2015 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = exports.Hex = exports.Layout = void 0;
const hex_1 = require("./grid/hex");
exports.Layout = __importStar(require("./grid/layout"));
exports.Hex = __importStar(require("./grid/hex"));
class Diagram {
    drawHex(ctx, layout, hex) {
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
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return "hsl(0, 50%, 0%)";
        }
        else if (hex.q === 0) {
            return "hsl(90, 70%, 35%)";
        }
        else if (hex.r === 0) {
            return "hsl(200, 100%, 35%)";
        }
        else if (hex.s === 0) {
            return "hsl(300, 40%, 50%)";
        }
        else {
            return "hsl(0, 0%, 50%)";
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(hex.len() === 0 ? "q,r,s" : (hex.q + "," + hex.r + "," + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Diagram = Diagram;

},{"./grid/hex":1,"./grid/layout":2}]},{},[5])(5)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hex = void 0;
class Hex {
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
exports.Hex = Hex;
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];

},{}],2:[function(require,module,exports){
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

},{"./hex":1,"./orientation":3,"./point":4}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
"use strict";
// From http://www.redblobgames.com/grids/hexagons/implementation.html
// Copyright 2015 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = exports.Point = exports.Hex = exports.Layout = void 0;
const hex_1 = require("./grid/hex");
exports.Layout = __importStar(require("./grid/layout"));
exports.Hex = __importStar(require("./grid/hex"));
exports.Point = __importStar(require("./grid/point"));
class Diagram {
    drawHex(ctx, layout, hex) {
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
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return "hsl(0, 50%, 0%)";
        }
        else if (hex.q === 0) {
            return "hsl(90, 70%, 35%)";
        }
        else if (hex.r === 0) {
            return "hsl(200, 100%, 35%)";
        }
        else if (hex.s === 0) {
            return "hsl(300, 40%, 50%)";
        }
        else {
            return "hsl(0, 0%, 50%)";
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(hex.len() === 0 ? "q,r,s" : (hex.q + "," + hex.r + "," + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Diagram = Diagram;

},{"./grid/hex":1,"./grid/layout":2,"./grid/point":4}]},{},[5])(5)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hex = void 0;
class Hex {
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
exports.Hex = Hex;
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];

},{}],2:[function(require,module,exports){
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

},{"./hex":1,"./orientation":3,"./point":4}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
"use strict";
// From http://www.redblobgames.com/grids/hexagons/implementation.html
// Copyright 2015 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = exports.Point = exports.Hex = exports.Layout = void 0;
const hex_1 = require("./grid/hex");
exports.Layout = __importStar(require("./grid/layout"));
exports.Hex = __importStar(require("./grid/hex"));
exports.Point = __importStar(require("./grid/point"));
class Diagram {
    drawHex(ctx, layout, hex) {
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
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return "hsl(0, 50%, 0%)";
        }
        else if (hex.q === 0) {
            return "hsl(90, 70%, 35%)";
        }
        else if (hex.r === 0) {
            return "hsl(200, 100%, 35%)";
        }
        else if (hex.s === 0) {
            return "hsl(300, 40%, 50%)";
        }
        else {
            return "hsl(0, 0%, 50%)";
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(hex.len() === 0 ? "q,r,s" : (hex.q + "," + hex.r + "," + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Diagram = Diagram;

},{"./grid/hex":1,"./grid/layout":2,"./grid/point":4}]},{},[5])(5)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hex = void 0;
class Hex {
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
exports.Hex = Hex;
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];

},{}],2:[function(require,module,exports){
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

},{"./hex":1,"./orientation":3,"./point":4}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
"use strict";
// From http://www.redblobgames.com/grids/hexagons/implementation.html
// Copyright 2015 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = exports.Point = exports.Hex = exports.Layout = void 0;
const hex_1 = require("./grid/hex");
exports.Layout = __importStar(require("./grid/layout"));
exports.Hex = __importStar(require("./grid/hex"));
exports.Point = __importStar(require("./grid/point"));
class Diagram {
    drawHex(ctx, layout, hex) {
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
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return "hsl(0, 50%, 0%)";
        }
        else if (hex.q === 0) {
            return "hsl(90, 70%, 35%)";
        }
        else if (hex.r === 0) {
            return "hsl(200, 100%, 35%)";
        }
        else if (hex.s === 0) {
            return "hsl(300, 40%, 50%)";
        }
        else {
            return "hsl(0, 0%, 50%)";
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(hex.len() === 0 ? "q,r,s" : (hex.q + "," + hex.r + "," + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Diagram = Diagram;

},{"./grid/hex":1,"./grid/layout":2,"./grid/point":4}]},{},[5])(5)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hex = void 0;
class Hex {
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
exports.Hex = Hex;
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];

},{}],2:[function(require,module,exports){
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

},{"./hex":1,"./orientation":3,"./point":4}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
"use strict";
// From http://www.redblobgames.com/grids/hexagons/implementation.html
// Copyright 2015 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = void 0;
const hex_1 = require("./grid/hex");
__exportStar(require("./grid/layout"), exports);
__exportStar(require("./grid/hex"), exports);
__exportStar(require("./grid/point"), exports);
class Diagram {
    drawHex(ctx, layout, hex) {
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
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return "hsl(0, 50%, 0%)";
        }
        else if (hex.q === 0) {
            return "hsl(90, 70%, 35%)";
        }
        else if (hex.r === 0) {
            return "hsl(200, 100%, 35%)";
        }
        else if (hex.s === 0) {
            return "hsl(300, 40%, 50%)";
        }
        else {
            return "hsl(0, 0%, 50%)";
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(hex.len() === 0 ? "q,r,s" : (hex.q + "," + hex.r + "," + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Diagram = Diagram;

},{"./grid/hex":1,"./grid/layout":2,"./grid/point":4}]},{},[5])(5)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hex = void 0;
class Hex {
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
exports.Hex = Hex;
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];

},{}],2:[function(require,module,exports){
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

},{"./hex":1,"./orientation":3,"./point":4}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
"use strict";
// From http://www.redblobgames.com/grids/hexagons/implementation.html
// Copyright 2015 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = exports.Point = exports.Hex = exports.Layout = void 0;
const hex_1 = require("./grid/hex");
var layout_1 = require("./grid/layout");
Object.defineProperty(exports, "Layout", { enumerable: true, get: function () { return layout_1.Layout; } });
var hex_2 = require("./grid/hex");
Object.defineProperty(exports, "Hex", { enumerable: true, get: function () { return hex_2.Hex; } });
var point_1 = require("./grid/point");
Object.defineProperty(exports, "Point", { enumerable: true, get: function () { return point_1.Point; } });
class Diagram {
    drawHex(ctx, layout, hex) {
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
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return "hsl(0, 50%, 0%)";
        }
        else if (hex.q === 0) {
            return "hsl(90, 70%, 35%)";
        }
        else if (hex.r === 0) {
            return "hsl(200, 100%, 35%)";
        }
        else if (hex.s === 0) {
            return "hsl(300, 40%, 50%)";
        }
        else {
            return "hsl(0, 0%, 50%)";
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(hex.len() === 0 ? "q,r,s" : (hex.q + "," + hex.r + "," + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Diagram = Diagram;

},{"./grid/hex":1,"./grid/layout":2,"./grid/point":4}]},{},[5])(5)
});
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = void 0;
const hex_1 = require("./hex");
class Diagram {
    drawHex(ctx, layout, hex) {
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
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return "hsl(0, 50%, 0%)";
        }
        else if (hex.q === 0) {
            return "hsl(90, 70%, 35%)";
        }
        else if (hex.r === 0) {
            return "hsl(200, 100%, 35%)";
        }
        else if (hex.s === 0) {
            return "hsl(300, 40%, 50%)";
        }
        else {
            return "hsl(0, 0%, 50%)";
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(hex.len() === 0 ? "q,r,s" : (hex.q + "," + hex.r + "," + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Diagram = Diagram;

},{"./hex":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hex = void 0;
class Hex {
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
exports.Hex = Hex;
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];

},{}],3:[function(require,module,exports){
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

},{"./hex":2,"./orientation":4,"./point":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
"use strict";
// From http://www.redblobgames.com/grids/hexagons/implementation.html
// Copyright 2015 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
Object.defineProperty(exports, "__esModule", { value: true });
const layout_1 = require("./grid/layout");
const hex_1 = require("./grid/hex");
const point_1 = require("./grid/point");
const diagram_1 = require("./grid/diagram");
window.hexaction = {
    Layout: layout_1.Layout,
    Hex: hex_1.Hex,
    Point: point_1.Point,
    Diagram: diagram_1.Diagram
};

},{"./grid/diagram":1,"./grid/hex":2,"./grid/layout":3,"./grid/point":5}]},{},[6]);
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = void 0;
const hex_1 = require("./hex");
class Diagram {
    drawHex(ctx, layout, hex) {
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
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return "hsl(0, 50%, 0%)";
        }
        else if (hex.q === 0) {
            return "hsl(90, 70%, 35%)";
        }
        else if (hex.r === 0) {
            return "hsl(200, 100%, 35%)";
        }
        else if (hex.s === 0) {
            return "hsl(300, 40%, 50%)";
        }
        else {
            return "hsl(0, 0%, 50%)";
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(hex.len() === 0 ? "q,r,s" : (hex.q + "," + hex.r + "," + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Diagram = Diagram;

},{"./hex":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hex = void 0;
class Hex {
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
exports.Hex = Hex;
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];

},{}],3:[function(require,module,exports){
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

},{"./hex":2,"./orientation":4,"./point":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
"use strict";
// From http://www.redblobgames.com/grids/hexagons/implementation.html
// Copyright 2015 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
Object.defineProperty(exports, "__esModule", { value: true });
const layout_1 = require("./grid/layout");
const hex_1 = require("./grid/hex");
const point_1 = require("./grid/point");
const diagram_1 = require("./grid/diagram");
window.hexaction = {
    Layout: layout_1.Layout,
    Hex: hex_1.Hex,
    Point: point_1.Point,
    Diagram: diagram_1.Diagram
};

},{"./grid/diagram":1,"./grid/hex":2,"./grid/layout":3,"./grid/point":5}]},{},[6])(6)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = void 0;
const hex_1 = require("./hex");
class Diagram {
    drawHex(ctx, layout, hex) {
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
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return "hsl(0, 50%, 0%)";
        }
        else if (hex.q === 0) {
            return "hsl(90, 70%, 35%)";
        }
        else if (hex.r === 0) {
            return "hsl(200, 100%, 35%)";
        }
        else if (hex.s === 0) {
            return "hsl(300, 40%, 50%)";
        }
        else {
            return "hsl(0, 0%, 50%)";
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(hex.len() === 0 ? "q,r,s" : (hex.q + "," + hex.r + "," + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Diagram = Diagram;

},{"./hex":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hex = void 0;
class Hex {
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
exports.Hex = Hex;
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];

},{}],3:[function(require,module,exports){
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

},{"./hex":2,"./orientation":4,"./point":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
"use strict";
// From http://www.redblobgames.com/grids/hexagons/implementation.html
// Copyright 2015 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hexaction = void 0;
const layout_1 = require("./grid/layout");
const hex_1 = require("./grid/hex");
const point_1 = require("./grid/point");
const diagram_1 = require("./grid/diagram");
class Hexaction {
    constructor() {
        this.grid = {
            Layout: layout_1.Layout,
            Hex: hex_1.Hex,
            Point: point_1.Point,
            Diagram: diagram_1.Diagram
        };
    }
}
exports.Hexaction = Hexaction;

},{"./grid/diagram":1,"./grid/hex":2,"./grid/layout":3,"./grid/point":5}]},{},[6])(6)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = void 0;
const hex_1 = require("./hex");
class Diagram {
    drawHex(ctx, layout, hex) {
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
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return "hsl(0, 50%, 0%)";
        }
        else if (hex.q === 0) {
            return "hsl(90, 70%, 35%)";
        }
        else if (hex.r === 0) {
            return "hsl(200, 100%, 35%)";
        }
        else if (hex.s === 0) {
            return "hsl(300, 40%, 50%)";
        }
        else {
            return "hsl(0, 0%, 50%)";
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(hex.len() === 0 ? "q,r,s" : (hex.q + "," + hex.r + "," + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Diagram = Diagram;

},{"./hex":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hex = void 0;
class Hex {
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
exports.Hex = Hex;
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];

},{}],3:[function(require,module,exports){
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

},{"./hex":2,"./orientation":4,"./point":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
"use strict";
// From http://www.redblobgames.com/grids/hexagons/implementation.html
// Copyright 2015 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
Object.defineProperty(exports, "__esModule", { value: true });
const layout_1 = require("./grid/layout");
const hex_1 = require("./grid/hex");
const point_1 = require("./grid/point");
const diagram_1 = require("./grid/diagram");
exports.default = {
    Layout: layout_1.Layout,
    Hex: hex_1.Hex,
    Point: point_1.Point,
    Diagram: diagram_1.Diagram
};

},{"./grid/diagram":1,"./grid/hex":2,"./grid/layout":3,"./grid/point":5}]},{},[6])(6)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = void 0;
const hex_1 = require("./hex");
class Diagram {
    drawHex(ctx, layout, hex) {
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
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return "hsl(0, 50%, 0%)";
        }
        else if (hex.q === 0) {
            return "hsl(90, 70%, 35%)";
        }
        else if (hex.r === 0) {
            return "hsl(200, 100%, 35%)";
        }
        else if (hex.s === 0) {
            return "hsl(300, 40%, 50%)";
        }
        else {
            return "hsl(0, 0%, 50%)";
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(hex.len() === 0 ? "q,r,s" : (hex.q + "," + hex.r + "," + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Diagram = Diagram;

},{"./hex":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hex = void 0;
class Hex {
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
exports.Hex = Hex;
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];

},{}],3:[function(require,module,exports){
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

},{"./hex":2,"./orientation":4,"./point":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"./grid/diagram":1,"./grid/hex":2,"./grid/layout":3,"./grid/point":5}]},{},[6])(6)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = void 0;
const hex_1 = require("./hex");
class Diagram {
    drawHex(ctx, layout, hex) {
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
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return "hsl(0, 50%, 0%)";
        }
        else if (hex.q === 0) {
            return "hsl(90, 70%, 35%)";
        }
        else if (hex.r === 0) {
            return "hsl(200, 100%, 35%)";
        }
        else if (hex.s === 0) {
            return "hsl(300, 40%, 50%)";
        }
        else {
            return "hsl(0, 0%, 50%)";
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(hex.len() === 0 ? "q,r,s" : (hex.q + "," + hex.r + "," + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Diagram = Diagram;

},{"./hex":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hex = void 0;
class Hex {
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
exports.Hex = Hex;
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];

},{}],3:[function(require,module,exports){
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

},{"./hex":2,"./orientation":4,"./point":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"./grid/diagram":1,"./grid/hex":2,"./grid/layout":3,"./grid/point":5}]},{},[6])(6)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = void 0;
const hex_1 = require("./hex");
class Diagram {
    drawHex(ctx, layout, hex) {
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
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return "hsl(0, 50%, 0%)";
        }
        else if (hex.q === 0) {
            return "hsl(90, 70%, 35%)";
        }
        else if (hex.r === 0) {
            return "hsl(200, 100%, 35%)";
        }
        else if (hex.s === 0) {
            return "hsl(300, 40%, 50%)";
        }
        else {
            return "hsl(0, 0%, 50%)";
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(hex.len() === 0 ? "q,r,s" : (hex.q + "," + hex.r + "," + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Diagram = Diagram;

},{"./hex":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hex = void 0;
class Hex {
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
exports.Hex = Hex;
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];

},{}],3:[function(require,module,exports){
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

},{"./hex":2,"./orientation":4,"./point":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"./grid/diagram":1,"./grid/hex":2,"./grid/layout":3,"./grid/point":5}]},{},[6])(6)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = void 0;
const hex_1 = require("./hex");
class Diagram {
    drawHex(ctx, layout, hex) {
        const corners = layout.polygonCorners(hex);
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.moveTo(corners[5].x, corners[5].y);
        for (let i = 0; i < 6; i++) {
            ctx.lineTo(corners[i].x, corners[i].y);
        }
        ctx.stroke();
    }
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return 'hsl(0, 50%, 0%)';
        }
        else if (hex.q === 0) {
            return 'hsl(90, 70%, 35%)';
        }
        else if (hex.r === 0) {
            return 'hsl(200, 100%, 35%)';
        }
        else if (hex.s === 0) {
            return 'hsl(300, 40%, 50%)';
        }
        else {
            return 'hsl(0, 0%, 50%)';
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hex.len() === 0 ? 'q,r,s' : (hex.q + ',' + hex.r + ',' + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
        if (!hexes) {
            hexes = this.shapeRectangle(15, 15, this.permuteQRS);
        }
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        ctx.translate(width / 2, height / 2);
        hexes.forEach((hex) => {
            this.drawHex(ctx, layout, hex);
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Diagram = Diagram;

},{"./hex":2}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"./hex":2,"./orientation":4,"./point":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"./grid/diagram":1,"./grid/hex":2,"./grid/layout":3,"./grid/point":5}]},{},[6])(6)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = void 0;
const hex_1 = require("./hex");
class Diagram {
    drawHex(ctx, layout, hex) {
        const corners = layout.polygonCorners(hex);
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.moveTo(corners[5].x, corners[5].y);
        for (let i = 0; i < 6; i++) {
            ctx.lineTo(corners[i].x, corners[i].y);
        }
        ctx.stroke();
    }
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return 'hsl(0, 50%, 0%)';
        }
        else if (hex.q === 0) {
            return 'hsl(90, 70%, 35%)';
        }
        else if (hex.r === 0) {
            return 'hsl(200, 100%, 35%)';
        }
        else if (hex.s === 0) {
            return 'hsl(300, 40%, 50%)';
        }
        else {
            return 'hsl(0, 0%, 50%)';
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hex.len() === 0 ? 'q,r,s' : (hex.q + ',' + hex.r + ',' + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
        if (!hexes) {
            hexes = this.shapeRectangle(15, 15, this.permuteQRS);
        }
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        ctx.translate(width / 2, height / 2);
        hexes.forEach((hex) => {
            this.drawHex(ctx, layout, hex);
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Diagram = Diagram;

},{"./hex":2}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"./hex":2,"./orientation":4,"./point":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"./grid/diagram":1,"./grid/hex":2,"./grid/layout":3,"./grid/point":5}]},{},[6])(6)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = void 0;
const hex_1 = require("./hex");
class Diagram {
    drawHex(ctx, layout, hex) {
        const corners = layout.polygonCorners(hex);
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.moveTo(corners[5].x, corners[5].y);
        for (let i = 0; i < 6; i++) {
            ctx.lineTo(corners[i].x, corners[i].y);
        }
        ctx.stroke();
    }
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return 'hsl(0, 50%, 0%)';
        }
        else if (hex.q === 0) {
            return 'hsl(90, 70%, 35%)';
        }
        else if (hex.r === 0) {
            return 'hsl(200, 100%, 35%)';
        }
        else if (hex.s === 0) {
            return 'hsl(300, 40%, 50%)';
        }
        else {
            return 'hsl(0, 0%, 50%)';
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hex.len() === 0 ? 'q,r,s' : (hex.q + ',' + hex.r + ',' + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
        if (!hexes) {
            hexes = this.shapeRectangle(15, 15, this.permuteQRS);
        }
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        ctx.translate(width / 2, height / 2);
        hexes.forEach((hex) => {
            this.drawHex(ctx, layout, hex);
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Diagram = Diagram;

},{"./hex":2}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"./hex":2,"./orientation":4,"./point":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"./grid/diagram":1,"./grid/hex":2,"./grid/layout":3,"./grid/point":5}]},{},[6])(6)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = void 0;
const hex_1 = require("./hex");
class Diagram {
    drawHex(ctx, layout, hex) {
        const corners = layout.polygonCorners(hex);
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.moveTo(corners[5].x, corners[5].y);
        for (let i = 0; i < 6; i++) {
            ctx.lineTo(corners[i].x, corners[i].y);
        }
        ctx.stroke();
    }
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return 'hsl(0, 50%, 0%)';
        }
        else if (hex.q === 0) {
            return 'hsl(90, 70%, 35%)';
        }
        else if (hex.r === 0) {
            return 'hsl(200, 100%, 35%)';
        }
        else if (hex.s === 0) {
            return 'hsl(300, 40%, 50%)';
        }
        else {
            return 'hsl(0, 0%, 50%)';
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hex.len() === 0 ? 'q,r,s' : (hex.q + ',' + hex.r + ',' + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
        if (!hexes) {
            hexes = this.shapeRectangle(15, 15, this.permuteQRS);
        }
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        ctx.translate(width / 2, height / 2);
        hexes.forEach((hex) => {
            this.drawHex(ctx, layout, hex);
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Diagram = Diagram;

},{"./hex":2}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"./hex":2,"./orientation":4,"./point":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"./grid/diagram":1,"./grid/hex":2,"./grid/layout":3,"./grid/point":5}]},{},[6])(6)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = void 0;
const hex_1 = require("./hex");
class Diagram {
    drawHex(ctx, layout, hex) {
        const corners = layout.polygonCorners(hex);
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.moveTo(corners[5].x, corners[5].y);
        for (let i = 0; i < 6; i++) {
            ctx.lineTo(corners[i].x, corners[i].y);
        }
        ctx.stroke();
    }
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return 'hsl(0, 50%, 0%)';
        }
        else if (hex.q === 0) {
            return 'hsl(90, 70%, 35%)';
        }
        else if (hex.r === 0) {
            return 'hsl(200, 100%, 35%)';
        }
        else if (hex.s === 0) {
            return 'hsl(300, 40%, 50%)';
        }
        else {
            return 'hsl(0, 0%, 50%)';
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hex.len() === 0 ? 'q,r,s' : (hex.q + ',' + hex.r + ',' + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
        if (!hexes) {
            hexes = this.shapeRectangle(15, 15, this.permuteQRS);
        }
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        ctx.translate(width / 2, height / 2);
        hexes.forEach((hex) => {
            this.drawHex(ctx, layout, hex);
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Diagram = Diagram;

},{"./hex":2}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"./hex":2,"./orientation":4,"./point":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"./grid/diagram":1,"./grid/hex":2,"./grid/layout":3,"./grid/point":5}]},{},[6])(6)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = void 0;
const hex_1 = require("./hex");
class Diagram {
    drawHex(ctx, layout, hex) {
        const corners = layout.polygonCorners(hex);
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.moveTo(corners[5].x, corners[5].y);
        for (let i = 0; i < 6; i++) {
            ctx.lineTo(corners[i].x, corners[i].y);
        }
        ctx.stroke();
    }
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return 'hsl(0, 50%, 0%)';
        }
        else if (hex.q === 0) {
            return 'hsl(90, 70%, 35%)';
        }
        else if (hex.r === 0) {
            return 'hsl(200, 100%, 35%)';
        }
        else if (hex.s === 0) {
            return 'hsl(300, 40%, 50%)';
        }
        else {
            return 'hsl(0, 0%, 50%)';
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hex.len() === 0 ? 'q,r,s' : (hex.q + ',' + hex.r + ',' + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
        if (!hexes) {
            hexes = this.shapeRectangle(15, 15, this.permuteQRS);
        }
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        ctx.translate(width / 2, height / 2);
        hexes.forEach((hex) => {
            this.drawHex(ctx, layout, hex);
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Diagram = Diagram;

},{"./hex":2}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"./hex":2,"./orientation":4,"./point":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"./grid/diagram":1,"./grid/hex":2,"./grid/layout":3,"./grid/point":5}]},{},[6])(6)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = void 0;
const hex_1 = require("./hex");
class Diagram {
    drawHex(ctx, layout, hex) {
        const corners = layout.polygonCorners(hex);
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.moveTo(corners[5].x, corners[5].y);
        for (let i = 0; i < 6; i++) {
            ctx.lineTo(corners[i].x, corners[i].y);
        }
        ctx.stroke();
    }
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return 'hsl(0, 50%, 0%)';
        }
        else if (hex.q === 0) {
            return 'hsl(90, 70%, 35%)';
        }
        else if (hex.r === 0) {
            return 'hsl(200, 100%, 35%)';
        }
        else if (hex.s === 0) {
            return 'hsl(300, 40%, 50%)';
        }
        else {
            return 'hsl(0, 0%, 50%)';
        }
    }
    drawHexLabel(ctx, layout, hex) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        ctx.fillStyle = this.colorForHex(hex);
        ctx.font = `${pointSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hex.len() === 0 ? 'q,r,s' : (hex.q + ',' + hex.r + ',' + hex.s), center.x, center.y);
    }
    permuteQRS(q, r, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSRQ(s, r, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteSQR(s, q, r) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRQS(r, q, s) {
        return new hex_1.Hex(q, r, s);
    }
    permuteRSQ(r, s, q) {
        return new hex_1.Hex(q, r, s);
    }
    permuteQSR(q, s, r) {
        return new hex_1.Hex(q, r, s);
    }
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
    drawGrid(id, backgroundColor, withLabels, layout, hexes) {
        const canvas = document.getElementById(id);
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
        if (!hexes) {
            hexes = this.shapeRectangle(15, 15, this.permuteQRS);
        }
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        ctx.translate(width / 2, height / 2);
        hexes.forEach((hex) => {
            this.drawHex(ctx, layout, hex);
            if (withLabels)
                this.drawHexLabel(ctx, layout, hex);
        });
    }
}
exports.Diagram = Diagram;

},{"./hex":2}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"./hex":2,"./orientation":4,"./point":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"./grid/diagram":1,"./grid/hex":2,"./grid/layout":3,"./grid/point":5}]},{},[6])(6)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hexaction = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = void 0;
const hex_1 = require("./hex");
const HEX_CORNERS = 6;
const HEX_ORIGIN = 5;
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
    drawHex({ canvasContext, layout, hex, strokeStyle = Color.Stroke, lineWidth = 1 }) {
        const error = [canvasContext, layout, hex].filter(e => !e);
        if (error) {
            throw new Error('wrong args provided');
        }
        const corners = layout.polygonCorners(hex);
        canvasContext.beginPath();
        canvasContext.strokeStyle = strokeStyle;
        canvasContext.lineWidth = lineWidth;
        canvasContext.moveTo(corners[HEX_ORIGIN].x, corners[HEX_ORIGIN].y);
        [...Array(HEX_CORNERS).keys()].forEach(index => canvasContext.lineTo(corners[index].x, corners[index].y));
        canvasContext.stroke();
    }
    colorForHex(hex) {
        // Match the color style used in the main article
        if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
            return Color.GridOrigin;
        }
        else if (hex.q === 0) {
            return Color.HexQ;
        }
        else if (hex.r === 0) {
            return Color.HexR;
        }
        else if (hex.s === 0) {
            return Color.HexS;
        }
        else {
            return Color.Hex;
        }
    }
    drawHexLabel({ canvasContext, layout, hex }) {
        const pointSize = Math.round(0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y)));
        const center = layout.hexToPixel(hex);
        canvasContext.fillStyle = this.colorForHex(hex);
        canvasContext.font = `${pointSize}px sans-serif`;
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'middle';
        canvasContext.fillText(hex.len() === 0 ? 'q,r,s' : (hex.q + ',' + hex.r + ',' + hex.s), center.x, center.y);
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
    shapeParallelogram(q1, r1, q2, r2, constructor) {
        const hexes = [];
        for (let q = q1; q <= q2; q++) {
            for (let r = r1; r <= r2; r++) {
                hexes.push(constructor(q, r, -q - r));
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
    shapeRectangle(w, h, constructor) {
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
            this.drawHex({ canvasContext, layout, hex });
            if (withLabels)
                this.drawHexLabel({ canvasContext, layout, hex });
        });
    }
}
exports.Diagram = Diagram;

},{"./hex":2}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"./hex":2,"./orientation":4,"./point":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"./grid/diagram":1,"./grid/hex":2,"./grid/layout":3,"./grid/point":5}]},{},[6])(6)
});
