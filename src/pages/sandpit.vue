<template>
  <div id="app">
    <div id="map"></div>
    <div id="popup-container" ref="popupContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import PopupComponent from "@/components/MarkerPopup.vue";
import { createApp, h } from "vue";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Overlay from "ol/Overlay";
import { fromLonLat } from "ol/proj";

const myMarkers = [
  { name: "Marker 1", description: "Description 1", coordinates: [0, 0] },
  { name: "Marker 2", description: "Description 2", coordinates: [1, 1] },
  // Add more markers as needed
];

const map = ref(null);
const popup = ref(null);
const popupContainer = ref(null);

function addPopups(PopupComponent, popupContainer, createApp, h) {
  popup.value = new Overlay({
    element: popupContainer.value,
    positioning: "bottom-center",
    stopEvent: false,
  });

  map.value.addOverlay(popup.value);

  map.value.on("click", (evt) => {
    const feature = map.value.forEachFeatureAtPixel(evt.pixel, (feature) => {
      return feature;
    });
    if (feature) {
      const coordinates = feature.getGeometry().getCoordinates();
      popup.value.setPosition(coordinates);

      // Render the popup component dynamically
      const app = createApp({
        render() {
          return h(PopupComponent, {
            name: feature.get("name"),
            description: feature.get("description"),
          });
        },
      });

      app.mount(popupContainer.value);
    } else {
      popup.value.setPosition(undefined);
    }
  });
}

onMounted(() => {
  map.value = new Map({
    target: "map",
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      center: fromLonLat([0, 0]),
      zoom: 2,
    }),
  });

  const vectorSource = new VectorSource();
  myMarkers.forEach((marker) => {
    const feature = new Feature({
      geometry: new Point(fromLonLat(marker.coordinates)),
      name: marker.name,
      description: marker.description,
    });
    vectorSource.addFeature(feature);
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });

  map.value.addLayer(vectorLayer);

  addPopups(PopupComponent, popupContainer, createApp, h);
});
</script>

<style>
#map {
  height: 90vh;
  width: 100%;
}

#popup-container {
  margin-bottom: 20px;
}
</style>
