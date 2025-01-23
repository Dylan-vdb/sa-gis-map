<template>
  <div id="app">
    <div id="map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Feature from "ol/Feature.js";
import Layer from "ol/layer/Layer.js";
import Map from "ol/Map.js";
import VectorSource from "ol/source/Vector.js";
import View from "ol/View.js";
import { Point } from "ol/geom.js";
import { Vector } from "ol/layer.js";
import { composeCssTransform } from "ol/transform.js";

import worldSvg from "@/assets/world.svg";

onMounted(() => {
  const map = new Map({
    target: "map",
    view: new View({
      center: [0, 0],
      extent: [-180, -90, 180, 90],
      projection: "EPSG:4326",
      zoom: 2,
    }),
  });

  const svgContainer = document.createElement("div");
  const xhr = new XMLHttpRequest();
  xhr.open("GET", worldSvg);
  xhr.addEventListener("load", function () {
    const svg = xhr.responseXML.documentElement;
    svgContainer.ownerDocument.importNode(svg);
    svgContainer.appendChild(svg);
  });
  xhr.send();

  const width = 2560;
  const height = 1280;
  const svgResolution = 360 / width;
  svgContainer.style.width = width + "px";
  svgContainer.style.height = height + "px";
  svgContainer.style.transformOrigin = "top left";
  svgContainer.className = "svg-layer";
  svgContainer.style.position = "absolute";

  map.addLayer(
    new Layer({
      render: function (frameState) {
        const scale = svgResolution / frameState.viewState.resolution;
        const center = frameState.viewState.center;
        const size = frameState.size;
        const cssTransform = composeCssTransform(
          size[0] / 2,
          size[1] / 2,
          scale,
          scale,
          frameState.viewState.rotation,
          -center[0] / svgResolution - width / 2,
          center[1] / svgResolution - height / 2
        );
        svgContainer.style.transform = cssTransform;
        svgContainer.style.opacity = this.getOpacity();
        return svgContainer;
      },
    })
  );

  map.addLayer(
    new Vector({
      source: new VectorSource({
        features: [new Feature(new Point([0, 0]))],
      }),
      style: {
        "circle-fill-color": "blue",
        "circle-radius": 10,
        "circle-stroke-color": "white",
      },
    })
  );
});
</script>

<style>
#map {
  height: 90vh;
  width: 100%;
  background: black;
}

#popup-container {
  margin-bottom: 20px;
}

.svg-layer path:hover {
  opacity: 0.4;
}

.ol-layer {
  pointer-events: none;
}
</style>
