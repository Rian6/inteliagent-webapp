import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
export default function RouteMap({
  visits = [],
  selected,
  onSelect,
  onMapClick,
  connect = true,
  label = "Mapa da ordem das visitas",
  height = "clamp(280px, 48vh, 520px)",
}) {
  const [routeNotice, setRouteNotice] = useState("");
  const host = useRef(null),
    map = useRef(null),
    layer = useRef(null);
  const callback = useRef(onSelect);
  callback.current = onSelect;
  const mapCallback = useRef(onMapClick);
  mapCallback.current = onMapClick;
  useEffect(() => {
    map.current = L.map(host.current).setView([-24.9555, -53.4552], 13);
    map.current.on("click", (event) =>
      mapCallback.current?.(event.latlng.lat, event.latlng.lng),
    );
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    const observer = new ResizeObserver(() => map.current?.invalidateSize());
    observer.observe(host.current);
    return () => {
      observer.disconnect();
      map.current?.remove();
      map.current = null;
    };
  }, []);
  useEffect(() => {
    if (!layer.current) return;
    layer.current.clearLayers();
    const coordinates = [];
    visits.forEach((visit, index) => {
      if (
        visit.lat == null ||
        visit.lng == null ||
        !Number.isFinite(Number(visit.lat)) ||
        !Number.isFinite(Number(visit.lng))
      )
        return;
      const position = [Number(visit.lat), Number(visit.lng)];
      coordinates.push(position);
      const label = document.createElement("span");
      label.textContent =
        index +
        1 +
        ". " +
        (visit.nome || "Imóvel") +
        ", " +
        (visit.numero || "s/n");
      const icon = L.divIcon({
        className: "route-marker",
        html: String(index + 1),
        iconSize: [32, 32],
      });
      const marker = L.marker(position, {
        icon,
        title: label.textContent,
        keyboard: true,
      })
        .addTo(layer.current)
        .bindPopup(label)
        .on("click", () => callback.current?.(visit));
      if (visit.id === selected) marker.openPopup();
    });
    const abort = new AbortController();
    let timeout;
    setRouteNotice("");
    if (connect && coordinates.length > 1) {
      if (coordinates.length > 100)
        setRouteNotice(
          "Divida a rota em até 100 paradas para calcular o trajeto pelas ruas.",
        );
      else {
        setRouteNotice("Calculando trajeto pelas ruas…");
        timeout = setTimeout(() => {
          setRouteNotice(
            "Trajeto pelas ruas indisponível. As paradas continuam visíveis.",
          );
          abort.abort();
        }, 15000);
        const key = coordinates.map(([lat, lng]) => lng + "," + lat).join(";");
        fetch(
          "https://router.project-osrm.org/route/v1/driving/" +
            key +
            "?overview=full&geometries=geojson&steps=false",
          { signal: abort.signal },
        )
          .then((r) => {
            if (!r.ok) throw Error();
            return r.json();
          })
          .then((data) => {
            if (abort.signal.aborted) return;
            if (
              data.code !== "Ok" ||
              !data.routes?.[0]?.geometry?.coordinates?.length
            )
              throw Error();
            L.polyline(
              data.routes[0].geometry.coordinates.map(([lng, lat]) => [
                lat,
                lng,
              ]),
              { color: "#0066D6", weight: 4 },
            ).addTo(layer.current);
            setRouteNotice("Trajeto viário na ordem das visitas · carro");
          })
          .finally(() => clearTimeout(timeout))
          .catch(() => {
            if (!abort.signal.aborted)
              setRouteNotice(
                "Trajeto pelas ruas indisponível. As paradas continuam visíveis.",
              );
          });
      }
    }
    if (coordinates.length && !selected)
      map.current.fitBounds(L.latLngBounds(coordinates), {
        padding: [32, 32],
        maxZoom: 16,
      });
    return () => {
      clearTimeout(timeout);
      abort.abort();
    };
  }, [visits, selected, connect]);
  return (
    <div style={{ position: "relative" }}>
      <div
        ref={host}
        role="region"
        aria-label={label}
        style={{ height, width: "100%", borderRadius: 16, zIndex: 0 }}
      />
      {!!routeNotice && (
        <div
          role="status"
          style={{ padding: 8, fontSize: 12, color: "#575760" }}
        >
          {routeNotice}
        </div>
      )}
    </div>
  );
}
