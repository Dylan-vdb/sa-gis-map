import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import LayerGroup from "ol/layer/Group";
import { fromLonLat, transform, transformExtent } from "ol/proj";
import LayerSwitcher from "ol-ext/control/LayerSwitcher";
import AnimatedCluster from "ol-ext/layer/AnimatedCluster";
import Shadow from "ol-ext/style/Shadow";
import Layer from "ol/layer/Layer";
// Import clustering related modules
import Feature from "ol/Feature";
import Overlay from "ol/Overlay";
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

import * as turf from "@turf/turf";

import { placeSvgOnMap, drawSvg, drawCircle } from "@/helpers/svgMapLayer";
import markerCattle from "@/assets/marker-cattle.svg?url";

let map, markerId, animatedClusterLayer, markerLayer, popup;

export function generateRandomPoints(polygon, numPoints) {
  const bbox = turf.bbox(polygon); // Get the bounding box of the polygon
  const points = [];

  while (points.length < numPoints) {
    const randomPoint = turf.randomPoint(1, { bbox: bbox });
    var pt = turf.point(randomPoint.features[0].geometry.coordinates);
    var poly = turf.polygon(polygon.features[0].geometry.coordinates);

    if (turf.booleanPointInPolygon(pt, poly)) {
      points.push(randomPoint.features[0]);
    }
  }
  return points.map((point) => ({
    lat: point.geometry.coordinates[1],
    lon: point.geometry.coordinates[0],
  }));
}

export async function replaceMarkers(markersData) {
  const existingMarkers = map.getLayers();
  map.removeLayer(animatedClusterLayer);
  markerId = animatedClusterLayer = markerLayer = popup = undefined;
  addCattleMarkers(markersData);
}

export const addCattleMarkers = (markers) => {
  markerLayer = new VectorSource();
  // Create vector source with features

  markers.forEach((marker) => {
    const feature = new Feature({
      geometry: new Point(fromLonLat([marker.lon, marker.lat])),
    });
    feature.setProperties({
      name: String(marker.name),
      description: marker.description,
      image: marker.image,
    });
    feature.setId(marker.name);
    markerLayer.addFeature(feature);
  });
  // Create cluster source
  const clusterSource = new Cluster({
    distance: 40,
    source: markerLayer,
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

    // Handle Popup
    const featureIds = feature.get("features").map((f) => f.getId());
    if (featureIds.includes(markerId) && size > 1 && popup && markerId) {
      popup.setPosition(undefined);
    }

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

  animatedClusterLayer = new AnimatedCluster({
    source: clusterSource,
    animationDuration: 700,
    style: clusterStyle,
    title: "Markers",
    distance: 20,
  });
  map.addLayer(animatedClusterLayer);

  // Listen for change events on the vector layer
  // animatedClusterLayer.on("change", function (event) {
  //   // console.log("Layer changed:", event);
  //   // You can call your callback function here}
  // });
};

export function addPopups(PopupComponent, popupContainer, createApp, h) {
  popup = new Overlay({
    element: popupContainer.value,
    positioning: "bottom-center",

    stopEvent: false,
  });

  map.addOverlay(popup);

  map.on("click", (evt) => {
    const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => {
      console.log("id", feature.getId());

      return feature;
    });

    const clusteredFeatures = feature?.get("features");

    if (clusteredFeatures?.length === 1) {
      const markerFeature = clusteredFeatures[0];
      markerId = markerFeature.getId();
      const coordinates = markerFeature.getGeometry().getCoordinates();
      popup.setPosition(coordinates);
      console.log(markerFeature.get("description"));
      // Render the popup component dynamically

      const app = createApp({
        render() {
          return h(PopupComponent, {
            name: markerFeature.get("name"),
            description: markerFeature.get("description"),
            image: markerFeature.get("image"),
          });
        },
      });

      app.mount(popupContainer.value);

      // Adjust the map view to ensure the popup is fully visible
      const view = map.getView();
      const offset = 0.2; // Offset factor (e.g., 20% of map height)
      const resolution = view.getResolution();
      const size = map.getSize();
      const newCenter = [
        coordinates[0],
        coordinates[1] + offset * size[1] * resolution,
      ];
      view.animate({ center: newCenter, duration: 500 });
    } else {
      popup.setPosition(undefined);
    }
  });
}

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

export function addSvgLayer(childSvg, extentCoords) {
  // Create the SVG element (outside the render function for efficiency)
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.style.position = "absolute";
  svg.style.top = "0";
  svg.style.left = "0";

  let svgLayer = new Layer({
    render: function (frameState) {
      svg.setAttribute("width", frameState.size[0]);
      svg.setAttribute("height", frameState.size[1]);

      // Clear previous SVG content
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }
      // drawExtentRectangle(svg, map.value, extentCoords);
      placeSvgOnMap(svg, childSvg, map, extentCoords);

      return svg; // Return the canvas (important for OpenLayers internal rendering)
    },
  });

  map.addLayer(svgLayer);

  map.once("loadend", () => {
    // Correctly create the extent using an array
    // flyToExtents(extentCoords);
  });
}

export function flyToExtents(extentCoords) {
  const extent = [
    Math.min(...extentCoords.map((c) => c[0])), // minX
    Math.min(...extentCoords.map((c) => c[1])), // minY
    Math.max(...extentCoords.map((c) => c[0])), // maxX
    Math.max(...extentCoords.map((c) => c[1])), // maxY
  ];

  map.getView().fit(transformExtent(extent, "EPSG:4326", "EPSG:3857"), {
    duration: 2000,
    padding: [50, 50, 50, 50],
  });
}
