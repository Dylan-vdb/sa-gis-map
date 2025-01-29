<template>
  <div ref="mapElement" class="map"></div>
  <div id="popup-container" ref="popupContainer"></div>
  <HouseFloorPlan ref="houseFloorPlan" />
</template>

<script setup>
import "ol/ol.css";

import "ol-ext/dist/ol-ext.css";
import "ol-ext/style/FontMakiDef.js";
import { onMounted, ref, watch, createApp, h } from "vue";
import PopupComponent from "@/components/MarkerPopup.vue";
import mapData from "@/assets/Western_Cape.json";

import {
  initializeMap,
  addCattleMarkers,
  addPopups,
  generateRandomPoints,
  replaceMarkers,
  addSvgLayer,
} from "@/helpers/openlayers";

import { useAppStore } from "@/stores/app";
import HouseFloorPlan from "@/assets/house-floor-plan.svg";
import { FLOOR_PLAN_EXTENTS } from "@/helpers/constants";

const houseFloorPlan = ref(null);

const store = useAppStore();

watch(
  () => store.markers,
  (markers) => {
    replaceMarkers(markers);
    addPopups(PopupComponent, popupContainer, createApp, h);
  }
);

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
  addSvgLayer(houseFloorPlan.value.$el, FLOOR_PLAN_EXTENTS);
});
</script>

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
  max-width: 500px;
}
</style>
