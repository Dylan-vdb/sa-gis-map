<template>
  <div class="popup">
    <h3>{{ name }}</h3>
    <p>{{ description }}</p>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  name: String,
  description: String,
});
</script>

<style>
.popup {
  background-color: white;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #ccc;
  min-width: 280px;
  position: relative; /* Optional: Add shadow for effect */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10; /* Ensure the popup is on top */
}
.popup::after {
  content: "";
  position: absolute;
  bottom: -20px; /* Position at the bottom of the popup */
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-width: 10px;
  /* background-color: red; Temporary */
  border-style: solid;
  border-color: white transparent transparent transparent; /* Arrow pointing up */ /* Optional: Add shadow for arrow */
  box-shadow: -1px 1px 2px rgba(0, 0, 0, 0.1);
  z-index: -1; /* Ensure the arrow is below the popup */
}
</style>
