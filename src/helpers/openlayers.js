import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";
import LayerGroup from "ol/layer/Group";

import LayerSwitcher from "ol-ext/control/LayerSwitcher";
import AnimatedCluster from "ol-ext/layer/AnimatedCluster";
import Shadow from "ol-ext/style/Shadow";

// Import clustering related modules
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorSource from "ol/source/Vector";
import Cluster from "ol/source/Cluster";
import {
  Circle as CircleStyle,
  Fill,
  Stroke,
  Style,
  Icon,
  Text,
} from "ol/style";

import markerCattle from "@/assets/marker-cattle.svg";
import { generateSACoordinates } from "./generateSACoordinatess";

let map;
// Create sample marker data (replace with your actual data)

// Create features from marker data
export const createFeatures = (markers) => {
  return markers.map((marker) => {
    const feature = new Feature({
      geometry: new Point(fromLonLat([marker.lon, marker.lat])),
      name: marker.name,
    });
    return feature;
  });
};

export const addCattleMarkers = (markers) => {
  // Create vector source with features
  const vectorSource = new VectorSource({
    features: createFeatures(markers),
  });

  // Create cluster source
  const clusterSource = new Cluster({
    distance: 40,
    source: vectorSource,
  });

  const markerStyle = [
    new Style({
      image: new Icon({
        anchor: [0.5, 1],
        anchorXUnits: "fraction",
        anchorYUnits: "fraction",
        src: markerCattle,
        scale: 0.04,
        displacement: [0, 0],
      }),
    }),
    new Style({
      image: new Shadow({
        radius: 15,
        blur: 5,
        offsetX: 100,
        offsetY: 100,
        fill: new Fill({
          color: "rgba(0,0,0,0.5)",
        }),
      }),
    }),
  ];

  // Style function for clusters
  const styleCache = {};
  const clusterStyle = (feature) => {
    const size = feature.get("features").length;
    let style = styleCache[size];

    if (!style) {
      if (size === 1) {
        // Single marker style
        return markerStyle;
      }
      // Cluster style
      style = new Style({
        image: new CircleStyle({
          radius: 15,
          stroke: new Stroke({
            color: "#fff",
          }),
          fill: new Fill({
            color: "#3399CC",
          }),
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({
            color: "#fff",
          }),
        }),
      });
      styleCache[size] = style;
    }
    return style;
  };

  const animatedClusterLayer = new AnimatedCluster({
    source: clusterSource,
    animationDuration: 700,
    style: clusterStyle,
    title: "Markers",
    distance: 20,
  });
  map.addLayer(animatedClusterLayer);
};

export function initializeMap(mapElement) {
  // Create base layers
  const osmLayer = new TileLayer({
    source: new OSM(),
    title: "OpenStreetMap",
    type: "base",
    visible: true,
  });

  const satelliteLayer = new TileLayer({
    source: new XYZ({
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      maxZoom: 19,
      attributions: "Powered by ESRI",
    }),
    title: "Satellite",
    type: "base",
    visible: false,
  });

  const topoLayer = new TileLayer({
    source: new XYZ({
      url: "https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png",
      maxZoom: 17,
    }),
    title: "Topographic",
    type: "base",
    visible: false,
  });

  // Create a layer group for base layers
  const baseLayerGroup = new LayerGroup({
    title: "Base Maps",
    layers: [osmLayer, satelliteLayer, topoLayer],
  });

  map = new Map({
    target: mapElement.value,
    layers: [baseLayerGroup],
    view: new View({
      center: fromLonLat([0, 0]),
      zoom: 2,
    }),
  });

  // Add the LayerSwitcher control
  const layerSwitcher = new LayerSwitcher({
    collapsed: false,
    mouseover: true,
  });

  map.addControl(layerSwitcher);
}
