<script setup>
import "ol/ol.css";

import "ol-ext/dist/ol-ext.css";
import "ol-ext/style/FontMakiDef.js";
import { onMounted, ref, createApp, h } from "vue";
import PopupComponent from "@/components/MarkerPopup.vue";
import mapData from "@/assets/Western_Cape.json";

import {
  initializeMap,
  addCattleMarkers,
  addPopups,
  generateRandomPoints,
} from "@/helpers/openlayers";

import { useAppStore } from "@/stores/app";
const store = useAppStore();

// Reference to hold the map instance
const mapElement = ref(null);
const markers = generateRandomPoints(mapData, 100).map((marker, index) => {
  return {
    description: "Description " + index,
    name: "Title " + index,
    ...marker,
  };
});

const popupContainer = ref(null);

onMounted(() => {
  initializeMap(mapElement);
  addCattleMarkers(markers);
  addPopups(PopupComponent, popupContainer, createApp, h);
});
</script>
<template>
  <div ref="mapElement" class="map"></div>
  <div id="popup-container" ref="popupContainer"></div>
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

#popup-container {
  margin-bottom: 50px;
}
</style>
