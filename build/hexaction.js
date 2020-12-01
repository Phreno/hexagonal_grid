"use strict";
// export import DoubleOffsetCoord = require('./grid/double-offset-coord');
// export import Hex = require('./grid/hex');
// export import Layout = require('./grid/layout');
// export import OffsetCoord = require('./grid/offset-coord');
// export import Orientation = require('./grid/orientation');
// export import Point = require('./grid/point');
Object.defineProperty(exports, "__esModule", { value: true });
const DoubleOffsetCoord = require("./grid/double-offset-coord");
const Hex = require("./grid/hex");
const Layout = require("./grid/layout");
const Orientation = require("./grid/orientation");
const Point = require("./grid/point");
window.hexaction = {
    DoubleOffsetCoord,
    Hex,
    Layout,
    Orientation,
    Point
};
