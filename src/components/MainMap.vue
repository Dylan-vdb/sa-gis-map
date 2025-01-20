<script setup>
import "ol/ol.css";

import "ol-ext/dist/ol-ext.css";
import "ol-ext/style/FontMakiDef.js";
import { onMounted, ref } from "vue";

import { initializeMap, addCattleMarkers } from "@/helpers/openlayers";

import { generateSACoordinates } from "@/helpers/generateSACoordinatess";

import { useAppStore } from "@/stores/app";
const store = useAppStore();

// Reference to hold the map instance
const mapElement = ref(null);
const markers = generateSACoordinates(100);

onMounted(() => {
  initializeMap(mapElement);
  addCattleMarkers(markers);
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
.ol-control.ol-layerswitcher .panel-container {
  background-color: #55434361;
}
</style>
