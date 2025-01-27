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
import { SphericalMercator } from "@mapbox/sphericalmercator";

const mapElement = ref(null);
let map = null;
let svgLayer = null;
let svg = null;
const mercator = new SphericalMercator({ size: 256 });

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
      zoom: 1,
    }),
  });

  // Calculate full Web Mercator extent in meters, but avoid exact +/- 85.05112878
  const maxLat = 85.05112877980659; // Slightly less than the limit
  const minLat = -maxLat;

  const fullExtent = mercator.bbox(-180, minLat, 180, maxLat);

  svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.style.position = "absolute";
  svg.style.top = "0";
  svg.style.left = "0";
  svg.setAttribute("width", Math.abs(fullExtent[2] - fullExtent[0]));
  svg.setAttribute("height", Math.abs(fullExtent[3] - fullExtent[1]));
  svg.style.pointerEvents = "none";

  svgLayer = new Layer({
    render: function (frameState) {
      const view = map.getView();
      const extent = view.calculateExtent();

      const canvas = mapElement.value.querySelector(".ol-layer > canvas");
      if (!canvas) return svg;

      if (!svg.parentNode) {
        canvas.parentNode.appendChild(svg);
      }

      const viewBoxX = extent[0];
      const viewBoxY = -extent[3];
      const viewBoxWidth = extent[2] - extent[0];
      const viewBoxHeight = Math.abs(extent[3] - extent[1]);

      svg.setAttribute(
        "viewBox",
        `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`
      );

      const durbanCoord = [31.02, -29.86];
      const durbanMerc = mercator.forward(durbanCoord);
      drawCircle(svg, durbanMerc[0], -durbanMerc[1], 10000, "green");

      return svg;
    },
  });

  map.addLayer(svgLayer);
});

onUnmounted(() => {
  if (map) {
    map.setTarget(undefined);
    map = null;
    svgLayer = null;
    if (svg && svg.parentNode) {
      svg.parentNode.removeChild(svg);
      svg = null;
    }
  }
});

function drawCircle(svg, cx, cy, r, color) {
  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  circle.setAttribute("cx", cx);
  circle.setAttribute("cy", cy);
  circle.setAttribute("r", r);
  circle.setAttribute("fill", color);
  circle.setAttribute("fill-opacity", 0.3);
  circle.setAttribute("stroke", color);
  circle.setAttribute("stroke-width", 2);
  svg.appendChild(circle);
}
</script>
