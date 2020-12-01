// export import DoubleOffsetCoord = require('./grid/double-offset-coord');
// export import Hex = require('./grid/hex');
// export import Layout = require('./grid/layout');
// export import OffsetCoord = require('./grid/offset-coord');
// export import Orientation = require('./grid/orientation');
// export import Point = require('./grid/point');

import DoubleOffsetCoord = require('./grid/double-offset-coord');
import Hex = require('./grid/hex');
import Layout = require('./grid/layout');
import OffsetCoord = require('./grid/offset-coord');
import Orientation = require('./grid/orientation');
import Point = require('./grid/point');

(window as any).hexaction = {
  DoubleOffsetCoord,
  Hex,
  Layout,
  Orientation,
  Point
}