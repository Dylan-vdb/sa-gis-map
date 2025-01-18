<script setup>
import "ol/ol.css";
import "ol-layerswitcher/dist/ol-layerswitcher.css";

import { onMounted, ref } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";
import LayerGroup from "ol/layer/Group";
import LayerSwitcher from "ol-layerswitcher";

// Reference to hold the map instance
const mapElement = ref(null);

// Create the base layers with titles
const osmLayer = new TileLayer({
  source: new OSM(),
  title: "OpenStreetMap",
  type: "base",
  visible: true,
});

const satelliteLayer = new TileLayer({
  source: new XYZ({
    // Using ESRI World Imagery
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 19,
    attributions: "Powered by ESRI",
  }),
  title: "Satellite",
  type: "base",
  visible: false,
});

const topoLayer = new TileLayer({
  source: new XYZ({
    url: "https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png",
    maxZoom: 17,
  }),
  title: "Topographic",
  type: "base",
  visible: false,
});

// Create a layer group for base layers
const baseLayerGroup = new LayerGroup({
  title: "Base Maps",
  layers: [osmLayer, satelliteLayer, topoLayer],
});

onMounted(() => {
  const map = new Map({
    target: mapElement.value,
    layers: [baseLayerGroup],
    view: new View({
      center: fromLonLat([0, 0]),
      zoom: 2,
    }),
  });

  // Add the LayerSwitcher control
  const layerSwitcher = new LayerSwitcher({
    tipLabel: "Layer Switcher", // Optional: Tooltip text
    groupSelectStyle: "group", // Optional: 'group' or 'none' - determines whether entire groups can be toggled
    startActive: true, // Optional: Whether the control should be open when first added to the map
  });

  map.addControl(layerSwitcher);
});
</script>

<template>
  <div ref="mapElement" class="map"></div>
</template>

<style scoped>
.map {
  width: 100%;
  height: 90vh;
}
</style>

<style>
.layer-switcher .panel {
  margin: 0;
  border: 4px solid #eee;
  border-radius: 4px;
  background-color: #55434361;
  display: none;
  max-height: inherit;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}
</style>
