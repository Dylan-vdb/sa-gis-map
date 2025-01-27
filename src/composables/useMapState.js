import { ref, onMounted, watch } from "vue";
import { transform } from "ol/proj"; // Import the transform function

export function useMapState(map) {
  const zoomLevel = ref(null);
  const mapBounds = ref(null);
  const mapCenter = ref({ lon: null, lat: null });

  watch(
    () => map.value, // Watch the map reference
    (newMap) => {
      if (newMap) {
        const view = newMap.getView();

        // Update zoom level when it changes
        view.on("change", () => {
          zoomLevel.value = view.getZoom();
          // Transform the center from Mercator to lon/lat
          const center = view.getCenter();
          const transformedCenter = transform(center, "EPSG:3857", "EPSG:4326");
          mapCenter.value = {
            lon: transformedCenter[0],
            lat: transformedCenter[1],
          };

          // Transform the bounds from Mercator to lon/lat
          const extent = view.calculateExtent();
          const transformedBounds = [
            transform([extent[0], extent[1]], "EPSG:3857", "EPSG:4326"), // Bottom Left
            transform([extent[2], extent[1]], "EPSG:3857", "EPSG:4326"), // Bottom Right
            transform([extent[2], extent[3]], "EPSG:3857", "EPSG:4326"), // Top Right
            transform([extent[0], extent[3]], "EPSG:3857", "EPSG:4326"), // Top Left
          ];
          mapBounds.value = transformedBounds;

          mapCenter.value = { lon: center[0], lat: center[1] };
        });

        map.value.on("click", (event) => {
          console.log("zoom: ", zoomLevel.value);
          console.log("center: ", mapCenter.value);
          console.log("bounds: ", mapBounds.value);
        });
      }
    },
    { immediate: true } // Run the watcher immediately with the current value
  );

  return {
    zoomLevel,
    mapBounds,
    mapCenter,
  };
}
