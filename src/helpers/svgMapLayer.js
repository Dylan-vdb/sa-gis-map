import { transform, transformExtent } from "ol/proj";

export function drawCircle(svg, pixelCoord, color, radius) {
  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  circle.setAttribute("cx", pixelCoord[0]);
  circle.setAttribute("cy", pixelCoord[1]);
  circle.setAttribute("r", radius);
  circle.setAttribute("fill", color);
  svg.appendChild(circle);
}

export function drawRectangle(svg, x, y, width, height, color) {
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", x);
  rect.setAttribute("y", y);
  rect.setAttribute("width", width);
  rect.setAttribute("height", height);
  rect.setAttribute("fill", color);
  rect.setAttribute("fill-opacity", 0.3); // Add some transparency
  rect.setAttribute("stroke", color);
  rect.setAttribute("stroke-width", 2);
  svg.appendChild(rect);
}

export function placeSvgOnMap(svg, childSvg, map, extentCoords) {
  // Transform extent coordinates to pixel coordinates
  const extentPixels = extentCoords.map((coord) =>
    map.getPixelFromCoordinate(transform(coord, "EPSG:4326", "EPSG:3857"))
  );

  // Ensure all pixels are valid
  if (extentPixels.every((pixel) => pixel !== null)) {
    // Calculate rectangle dimensions

    const x = Math.min(...extentPixels.map((p) => p[0]));
    let y = Math.max(...extentPixels.map((p) => p[1])); // Invert y for SVG
    const width = Math.max(...extentPixels.map((p) => p[0])) - x;
    const height = Math.abs(Math.min(...extentPixels.map((p) => p[1])) - y); // Positive height
    y = y - height;
    // Create and style the rectangle
    // const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    // rect.setAttribute("x", x);
    // rect.setAttribute("y", y);
    // rect.setAttribute("width", width);
    // rect.setAttribute("height", height);
    // rect.setAttribute("fill", "rgba(255, 0, 0, 0.5)");
    // rect.setAttribute("stroke", "red");
    // rect.setAttribute("stroke-width", 2);

    // svg.appendChild(rect);

    drawSvg(svg, childSvg, x, y, width, height);
  }
}

export function drawSvg(parentSvg, childSvg, x, y, width, height) {
  // Get original width and height of the child SVG
  const originalWidth =
    childSvg.viewBox.baseVal.width || childSvg.width.baseVal.value;
  const originalHeight =
    childSvg.viewBox.baseVal.height || childSvg.height.baseVal.value;

  // Set x and y for positioning
  childSvg.setAttribute("x", x);
  childSvg.setAttribute("y", y);

  // Set the viewBox to the original dimensions
  childSvg.setAttribute("viewBox", `0 0 ${originalWidth} ${originalHeight}`);

  // Set width and height to 100% so it scales to the parent's coordinate system
  childSvg.setAttribute("width", width);
  childSvg.setAttribute("height", height);

  parentSvg.appendChild(childSvg);
}
