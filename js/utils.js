function RectangleContainsPoint(rectangle, point) {
    return (point.x >= (rectangle.x - rectangle.width / 2) && point.x <= (rectangle.x + rectangle.width / 2) && point.y >= (rectangle.y - rectangle.height / 2) && point.y <= (rectangle.y + rectangle.height / 2));
}

function TriangleContainsPoint(triangle, point) {
    // Convert local coordinates to world coordinates
    const x1 = triangle.x - triangle.width / 2 + triangle.geom.x1;
    const x2 = triangle.x - triangle.width / 2 + triangle.geom.x2;
    const x3 = triangle.x - triangle.width / 2 + triangle.geom.x3;
    const y1 = triangle.y - triangle.height / 2 + triangle.geom.y1;
    const y2 = triangle.y - triangle.height / 2 + triangle.geom.y2;
    const y3 = triangle.y - triangle.height / 2 + triangle.geom.y3;

    const A = 0.5 * (-y2 * x3 + y1 * (-x2 + x3) + x1 * (y2 - y3) + x2 * y3);
    const sign = A < 0 ? -1 : 1;
    const s = (y1 * x3 - x1 * y3 + (y3 - y1) * point.x + (x1 - x3) * point.y) * sign;
    const t = (x1 * y2 - y1 * x2 + (y1 - y2) * point.x + (x2 - x1) * point.y) * sign;

    return s >= 0 && t >= 0 && (s + t) <= 2 * A * sign;
}

function PolygonContainsPoint(polygon, point) {
    let pointsArray = polygon.geom.points;
    // Add first point again as the last point since the algorithm requires a fully closed polygon
    pointsArray.push(pointsArray[0]);

    let inside = false;
    for(let i = 0; i < (pointsArray.length - 1); i++) {
        // Convert local coordinates to world coordinates
        const p1_x = polygon.x - polygon.width / 2 + pointsArray[i].x;
        const p1_y = polygon.y - polygon.height / 2 + pointsArray[i].y;
        const p2_x = polygon.x - polygon.width / 2 + pointsArray[i + 1].x;
        const p2_y = polygon.y - polygon.height / 2 + pointsArray[i + 1].y;
        if ((p1_y < point.y && p2_y >= point.y) || (p2_y < point.y && p1_y >= point.y)) {
            if ((p1_x + (point.y - p1_y) / (p2_y - p1_y) * (p2_x - p1_x)) < point.x) {
                inside = !inside;
            }
        }
    }
    return inside;
}

export default { RectangleContainsPoint, TriangleContainsPoint, PolygonContainsPoint };