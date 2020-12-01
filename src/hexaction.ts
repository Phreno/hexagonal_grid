// From http://www.redblobgames.com/grids/hexagons/implementation.html
// Copyright 2015 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

import { Layout } from "./grid/layout";
import { Hex } from "./grid/hex";
import { Point } from "./grid/point"
import { Diagram } from "./grid/diagram"

export class Hexaction {
  grid = {
    Layout,
    Hex,
    Point,
    Diagram
  }
}