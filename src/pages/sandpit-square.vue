<template>
  <div ref="mapElement" style="height: 400px; width: 100%"></div>
  <HouseFloorPlan ref="houseFloorPlan" />
</template>

<script setup>
import { onMounted, ref, onUnmounted } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import Layer from "ol/layer/Layer";
import HouseFloorPlan from "@/assets/house-floor-plan2.svg";

const mapElement = ref(null);
const map = ref(null);
const houseFloorPlan = ref(null);
let svgLayer = null;
let svg = null;

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
      center: [2498739.8649976677, -4024022.7826994895],
      zoom: 12,
    }),
  });

  svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.style.position = "absolute";
  svg.style.top = "0";
  svg.style.left = "0";
  svg.style.pointerEvents = "none";

  svgLayer = new Layer({
    render: function (frameState) {
      const canvas = mapElement.value.querySelector(".ol-layer > canvas");
      if (!canvas) return svg;

      if (!svg.parentNode) {
        canvas.parentNode.appendChild(svg);
      }

      svg.setAttribute("width", canvas.width);
      svg.setAttribute("height", canvas.height);

      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }

      const centerMercator = [2498739.8649976677, -4024022.7826994895];

      landSquare(svg, map.value, centerMercator, 0.5); // Draw a 5km square
      //   landSquare(
      //     svg,
      //     map.value,
      //     [2500000, -4000000],
      //     10,
      //     "rgba(0, 0, 255, 0.5)"
      //   ); // Draw a 10km blue square

      return svg;
    },
  });

  map.value.addLayer(svgLayer);
});

onUnmounted(() => {
  if (map.value) {
    map.value.setTarget(undefined);
    map.value = null;
    svgLayer = null;
    if (svg && svg.parentNode) {
      svg.parentNode.removeChild(svg);
      svg = null;
    }
  }
});

function drawSvg(parentSvg, childSvg, x, y, width, height) {
  childSvg.setAttribute("x", x);
  childSvg.setAttribute("y", y);
  childSvg.setAttribute("width", width);
  childSvg.setAttribute("height", height);
  parentSvg.appendChild(childSvg);
}

function landSquare(
  svg,
  mapInstance,
  centerMercator,
  sizeKm,
  color = "rgba(255, 0, 0, 0.5)"
) {
  const halfSide = (sizeKm * 1000) / 2; // Half side in meters

  const extentMercator = [
    centerMercator[0] - halfSide,
    centerMercator[1] - halfSide,
    centerMercator[0] + halfSide,
    centerMercator[1] + halfSide,
  ];

  const topLeftPixel = mapInstance.getPixelFromCoordinate([
    extentMercator[0],
    extentMercator[3],
  ]);
  const bottomRightPixel = mapInstance.getPixelFromCoordinate([
    extentMercator[2],
    extentMercator[1],
  ]);

  if (topLeftPixel && bottomRightPixel) {
    const x = topLeftPixel[0];
    const y = topLeftPixel[1];
    const width = bottomRightPixel[0] - topLeftPixel[0];
    const height = bottomRightPixel[1] - topLeftPixel[1];

    drawRectangle(svg, x, y, width, height, color);

    const view = map.value.getView();
    const resolution = view.getResolution();

    // Dimensions of the rectangle in meters (width and height)
    const rectWidthMeters = 500; // 20km wide
    const rectHeightMeters = 500; // 10km high

    // Dimensions in pixels
    const rectWidthPixels = rectWidthMeters / resolution;
    const rectHeightPixels = rectHeightMeters / resolution;

    // Calculate top-left corner of the rectangle
    // const rectX = durbanPixel[0] - rectWidthPixels / 2;
    // const rectY = durbanPixel[1] - rectHeightPixels / 2;

    drawSvg(svg, houseFloorPlan.value.$el, x, y, width, height);

    // drawSvg(svg, houseFloorPlan.value.$el, x, y, width, height);
  }
}

function drawRectangle(svg, x, y, width, height, color) {
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", x);
  rect.setAttribute("y", y);
  rect.setAttribute("width", width);
  rect.setAttribute("height", height);
  rect.setAttribute("fill", color);
  rect.setAttribute("fill-opacity", 0.3);
  rect.setAttribute("stroke", color);
  rect.setAttribute("stroke-width", 2);
  svg.appendChild(rect);
}
</script>
