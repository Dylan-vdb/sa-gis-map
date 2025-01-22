<template>
  <div class="app-wrapper">
    <div class="dropzone">
      <div class="dropzone__inner" ref="dropzoneRef">
        <p>Drop your CSV file here</p>
        <div v-if="isDragActive">
          <p>Drop the file to start parsing</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDropZone } from "@vueuse/core";
import { ref, onMounted, onUnmounted } from "vue";
import Papa from "papaparse";

import { useAppStore } from "@/stores/app";
const store = useAppStore();

const dropzoneRef = ref(null);
const { isDragActive } = useDropZone(dropzoneRef, onDrop);

async function onDrop(files) {
  const rawData = await parseCsv(files[0], {
    skipEmptyLines: true,
  });

  store.markers = rawData.result.data.filter((row) => row?.name);
}

function parseCsv(csvFile) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvFile, {
      header: true,
      complete: (results) => {
        resolve({ name: csvFile.name, result: results });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}
</script>

<style scoped>
.dropzone {
  border: 2px dashed #ccc;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
}

.dropzone__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.dropzone__inner p {
  margin: 0;
}

.dropzone__inner p:first-child {
  font-size: 16px;
  font-weight: bold;
}

.dropzone__inner p:last-child {
  font-size: 14px;
  color: #999;
}
</style>
