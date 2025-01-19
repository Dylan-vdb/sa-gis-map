<template>
  <v-app id="inspire">
    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-app-bar-title>Example Map Application</v-app-bar-title>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" :style="{ padding: '12px' }">
      <FileDropZone />
    </v-navigation-drawer>
    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from "vue";
import FileDropZone from "@/components/FileDropZone.vue";

const drawer = ref(null);
</script>
