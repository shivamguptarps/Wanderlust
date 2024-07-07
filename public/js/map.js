mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style : "mapbox://styles/mapbox/streets-v12",
    center: JSON.parse(coordinates), // starting position [lng, lat]
    zoom: 9 // starting zoom
    });

const marker = new mapboxgl.Marker()
.setLngLat(JSON.parse(coordinates)) //info.geometry.coordinates
.setPopup(new mapboxgl.Popup({offset:25}).setHTML(`<h4>${title}</h4><p>Exact location will be provided after booking</p>`))
.addTo(map);

