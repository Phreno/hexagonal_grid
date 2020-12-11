import { Diagram, Layout } from '../hexaction'
import { Point } from '../grid/point'

const diagram = new Diagram();

diagram.drawGrid('layout-test-orientation-pointy', 'hsl(60, 10%, 90%)', true,
  new Layout(Layout.pointy, new Point(25, 25), new Point(0, 0)));
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
