<template>
  <div ref="mapElement" style="height: 88vh; width: 100%"></div>
  <DurbanSvg ref="durbanSvg" />
  <HouseFloorPlan ref="houseFloorPlan" />
</template>

<script setup>
import "ol/ol.css";
import { onMounted, ref, onUnmounted, watchEffect } from "vue";

import { SVG } from "@svgdotjs/svg.js";

import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import Layer from "ol/layer/Layer";
import { transform, transformExtent } from "ol/proj";
import { useGeographic } from "ol/proj";
import DurbanSvg from "@/assets/durban.svg";
import HouseFloorPlan from "@/assets/house-floor-plan2.svg";

import { useMapState } from "@/composables/useMapState"; // Adjust the path as necessary

const mapElement = ref(null);
const durbanSvg = ref(null);
const houseFloorPlan = ref(null);
let map = ref(null);
let svgLayer = null;
let svg = null;

const extentCoords = [
  [22.446124238475733, -33.964624445302995],
  [22.446999996847353, -33.964624445302995],
  [22.446999996847353, -33.964175042701186],
  [22.446124238475733, -33.964175042701186],
];

onMounted(() => {
  if (!mapElement.value) return;

  map.value = new Map({
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

  const extentPixels = extentCoords.map((coord) =>
    map.value.getPixelFromCoordinate(transform(coord, "EPSG:4326", "EPSG:3857"))
  );
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
      drawExtentRectangle(svg, map.value, extentCoords);
      // Transform extent coordinates to pixel coordinates

      // const extentPixels = extentCoords.map((coord) =>
      //   map.value.getPixelFromCoordinate(
      //     transform(coord, "EPSG:4326", "EPSG:3857")
      //   )
      // );

      // // Draw extent rectangle
      // if (extentPixels.every((pixel) => pixel !== null)) {
      //   debugger;
      //   const x = Math.min(...extentPixels.map((p) => p[0]));
      //   const y = Math.min(...extentPixels.map((p) => p[1]));
      //   const width = Math.max(...extentPixels.map((p) => p[0])) - x;
      //   const height = Math.max(...extentPixels.map((p) => p[1])) - y;

      //   drawRectangle(svg, x, y, width, height, "rgba(255, 0, 0, 0.5)");
      //   drawSvg(svg, houseFloorPlan.value.$el, x, y, width, height);
      // }

      // Example 2: Circle over George (for specific location testing)
      const georgeCoord = [22.46, -33.96]; // Longitude, Latitude for George
      const georgePixel = map.value.getPixelFromCoordinate(
        transform(georgeCoord, "EPSG:4326", "EPSG:3857")
      );
      if (georgePixel) {
        drawCircle(svg, georgePixel, "blue", 15); // Larger, blue circle
      }

      const durbanCoord = [31.02, -29.86];
      const durbanPixel = map.value.getPixelFromCoordinate(
        transform(durbanCoord, "EPSG:4326", "EPSG:3857")
      );

      if (durbanPixel) {
        const view = map.value.getView();
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
        if (durbanSvg.value) {
          drawSvg(
            svg,
            durbanSvg.value.$el,
            rectX,
            rectY,
            rectWidthPixels,
            rectHeightPixels
          );
        }

        if (extentPixels.every((pixel) => pixel !== null)) {
          // Check if all pixels are valid
          const x = Math.min(...extentPixels.map((p) => p[0]));
          const y = -Math.max(...extentPixels.map((p) => p[1])); // Invert y for SVG
          const width = Math.max(...extentPixels.map((p) => p[0])) - x;
          const height = Math.abs(
            Math.min(...extentPixels.map((p) => p[1])) - -y
          ); // Positive height

          drawRectangle(svg, x, y, width, height, "rgba(255, 0, 0, 0.5)"); // Red with transparency
        }
      }
      return svg; // Return the canvas (important for OpenLayers internal rendering)
    },
  });

  map.value.addLayer(svgLayer);

  map.value.once("loadend", () => {
    // Correctly create the extent using an array
    const extent = [
      Math.min(...extentCoords.map((c) => c[0])), // minX
      Math.min(...extentCoords.map((c) => c[1])), // minY
      Math.max(...extentCoords.map((c) => c[0])), // maxX
      Math.max(...extentCoords.map((c) => c[1])), // maxY
    ];

    map.value.getView().fit(transformExtent(extent, "EPSG:4326", "EPSG:3857"), {
      duration: 2000,
      padding: [50, 50, 50, 50],
    });
  });
});

const { zoomLevel, mapBounds, mapCenter } = useMapState(map);

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

function drawSvg(parentSvg, childSvg, x, y, width, height) {
  childSvg.setAttribute("x", x);
  childSvg.setAttribute("y", y);
  childSvg.setAttribute("width", width);
  childSvg.setAttribute("height", height);
  parentSvg.appendChild(childSvg);
}

onUnmounted(() => {
  if (map.value) {
    map.value.setTarget(undefined);
    map.value = null;
    svgLayer = null;
    if (svg && svg.parentNode) {
      svg.parentNode.removeChild(svg); //Remove the svg element from the DOM
      svg = null;
    }
  }
});

function drawExtentRectangle(svg, map, extentCoords) {
  // Transform extent coordinates to pixel coordinates
  const extentPixels = extentCoords.map((coord) =>
    map.getPixelFromCoordinate(transform(coord, "EPSG:4326", "EPSG:3857"))
  );

  // Ensure all pixels are valid
  if (extentPixels.every((pixel) => pixel !== null)) {
    // Calculate rectangle dimensions

    const x = extentPixels[0][0];
    const y = extentPixels[0][1]; // Invert y for SVG
    const width = Math.max(...extentPixels.map((p) => p[0])) - x;
    const height = Math.abs(Math.min(...extentPixels.map((p) => p[1])) - y);

    // Create and style the rectangle
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", width);
    rect.setAttribute("height", height);
    rect.setAttribute("fill", "rgba(255, 0, 0, 0.5)");
    rect.setAttribute("stroke", "red");
    rect.setAttribute("stroke-width", 2);

    svg.appendChild(rect);
  }
}
</script>
