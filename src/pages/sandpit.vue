<template>
  <div ref="mapElement" style="height: 400px; width: 100%"></div>
</template>

<script setup>
import { onMounted, ref, onUnmounted } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import Layer from "ol/layer/Layer";
import { transform } from "ol/proj";

const mapElement = ref(null);
let map = null;
let svgLayer = null;
let svg = null;

onMounted(() => {
  if (!mapElement.value) return;

  map = new Map({
    target: mapElement.value,
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      center: [0, 0],
      zoom: 2,
    }),
  });

  // Create the SVG element (outside the render function for efficiency)
  svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.style.position = "absolute";
  svg.style.top = "0";
  svg.style.left = "0";

  svgLayer = new Layer({
    render: function (frameState) {
      // console.log("frameState ", frameState);

      svg.setAttribute("width", frameState.size[0]);
      svg.setAttribute("height", frameState.size[1]);

      // Clear previous SVG content
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }

      // Example 2: Circle over George (for specific location testing)
      const georgeCoord = [22.46, -33.96]; // Longitude, Latitude for George
      const georgePixel = map.getPixelFromCoordinate(
        transform(georgeCoord, "EPSG:4326", "EPSG:3857")
      );
      if (georgePixel) {
        drawCircle(svg, georgePixel, "blue", 15); // Larger, blue circle
      }

      const durbanCoord = [31.02, -29.86];
      const durbanPixel = map.getPixelFromCoordinate(
        transform(durbanCoord, "EPSG:4326", "EPSG:3857")
      );

      if (durbanPixel) {
        const view = map.getView();
        const resolution = view.getResolution();

        // Dimensions of the rectangle in meters (width and height)
        const rectWidthMeters = 20000; // 20km wide
        const rectHeightMeters = 10000; // 10km high

        // Dimensions in pixels
        const rectWidthPixels = rectWidthMeters / resolution;
        const rectHeightPixels = rectHeightMeters / resolution;

        // Calculate top-left corner of the rectangle
        const rectX = durbanPixel[0] - rectWidthPixels / 2;
        const rectY = durbanPixel[1] - rectHeightPixels / 2;

        drawRectangle(
          svg,
          rectX,
          rectY,
          rectWidthPixels,
          rectHeightPixels,
          "blue"
        );
      }
      return svg; // Return the canvas (important for OpenLayers internal rendering)
    },
  });

  map.addLayer(svgLayer);
});

function drawCircle(svg, pixelCoord, color, radius) {
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

function drawRectangle(svg, x, y, width, height, color) {
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

onUnmounted(() => {
  if (map) {
    map.setTarget(undefined);
    map = null;
    svgLayer = null;
    if (svg && svg.parentNode) {
      svg.parentNode.removeChild(svg); //Remove the svg element from the DOM
      svg = null;
    }
  }
});
</script>
