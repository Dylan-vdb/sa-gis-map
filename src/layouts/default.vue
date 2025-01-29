<template>
  <v-app id="inspire">
    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-app-bar-title>Example Map Application</v-app-bar-title>
    </v-app-bar>
    <v-navigation-drawer class="pl-3 pt-3" v-model="drawer">
      <div class="mr-2">
        <h4>CSV File Markers</h4>
        <p class="mb-4">
          Here we can drop a csv file of locations, headings, and descriptions
          for markers on the map.
        </p>
        <FileDropZone class="mb-6" />

        <v-divider></v-divider>
        <h4 class="mt-6">Map Actions</h4>
        <p class="mb-4">
          An example of flying to a specific part of the map, and the ability we
          have to take detailed vector drawings and make them part of the map.
        </p>
        <v-btn class="mb-6" color="primary" @click="flyToHouseFloorPlan"
          >Fly to House Floor Plan</v-btn
        >
      </div>
    </v-navigation-drawer>
    <v-main class="pt-16">
      <RouterView />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from "vue";
import FileDropZone from "@/components/FileDropZone.vue";
import { FLOOR_PLAN_EXTENTS } from "@/helpers/constants";
import { flyToExtents } from "@/helpers/openlayers";

function flyToHouseFloorPlan() {
  flyToExtents(FLOOR_PLAN_EXTENTS);
}
const drawer = ref(null);
</script>
