// src/components/LiveMap.tsx
// Shows an OpenStreetMap (via Leaflet inside a WebView) with two markers:
// 🏠 the delivery destination and 🛵 the delivery person.

import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export type Point = { lat: number; lng: number } | null;

const HTML = `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>
<style>
  html, body, #map { height: 100%; margin: 0; }
  .pin { font-size: 28px; line-height: 28px; }
</style>
</head><body>
<div id="map"></div>
<script>
  var map = L.map('map').setView([19.076, 72.8777], 12);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  var destMarker = null, riderMarker = null, lastCount = 0;

  function icon(emoji) {
    return L.divIcon({ html: emoji, className: 'pin', iconSize: [28, 28], iconAnchor: [14, 14] });
  }

  window.update = function (d) {
    var pts = [];
    if (d.dest) {
      var p1 = [d.dest.lat, d.dest.lng];
      if (!destMarker) destMarker = L.marker(p1, { icon: icon('🏠') }).addTo(map);
      else destMarker.setLatLng(p1);
      pts.push(p1);
    }
    if (d.rider) {
      var p2 = [d.rider.lat, d.rider.lng];
      if (!riderMarker) riderMarker = L.marker(p2, { icon: icon('🛵') }).addTo(map);
      else riderMarker.setLatLng(p2);
      pts.push(p2);
    }
    // Only re-centre when a marker first appears, so the user can still pan.
    if (pts.length !== lastCount) {
      lastCount = pts.length;
      if (pts.length > 1) map.fitBounds(pts, { padding: [60, 60] });
      else if (pts.length === 1) map.setView(pts[0], 15);
    }
  };
</script>
</body></html>`;

type Props = { dest: Point; rider: Point };

export default function LiveMap({ dest, rider }: Props) {
  const webRef = useRef<WebView>(null);
  const ready = useRef(false);

  function push() {
    if (!ready.current) return;
    webRef.current?.injectJavaScript(
      `window.update(${JSON.stringify({ dest, rider })}); true;`
    );
  }

  useEffect(() => {
    push();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dest?.lat, dest?.lng, rider?.lat, rider?.lng]);

  return (
    <View style={styles.box}>
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html: HTML, baseUrl: "https://dabbawalla.app" }}
        javaScriptEnabled
        onLoadEnd={() => {
          ready.current = true;
          push();
        }}
        style={styles.web}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, overflow: "hidden" },
  web: { flex: 1 },
});