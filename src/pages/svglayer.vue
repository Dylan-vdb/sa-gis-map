<template>
  <div class="map-wrapper">
    <svg ref="svgElement" :width="width" :height="height">
      <rect
        x="0"
        y="0"
        :width="width"
        :height="height"
        stroke="black"
        fill="transparent"
        stroke-width="4"
      />
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted, onUpdated } from "vue";

const svgElement = ref(null);
const width = ref(0);
const height = ref(0);

const updateDimensions = () => {
  if (svgElement.value && svgElement.value.parentElement) {
    width.value = svgElement.value.parentElement.clientWidth;
    height.value = svgElement.value.parentElement.clientHeight;
  }
};

onMounted(() => {
  updateDimensions();
  window.addEventListener("resize", updateDimensions);
});

onUpdated(() => {
  updateDimensions();
});
</script>

<style scoped>
svg {
  width: 100%;
  height: 100%;
}

.map-wrapper {
  width: 100%;
  height: 80vh;
}
</style>
