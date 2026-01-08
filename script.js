// ================== КАРТА ==================
const map = L.map('map').setView([49.2331, 28.4682], 9);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '© OpenStreetMap'
}).addTo(map);

// ================== ВИДІЛЕННЯ ==================
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
  draw: {
    polygon: true,
    rectangle: true,
    circle: false,
    polyline: false,
    marker: false
  },
  edit: {
    featureGroup: drawnItems
  }
});

map.addControl(drawControl);

// ================== ПОГОДА (ШВИДКО) ==================
async function loadWeather(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}` +
    `&longitude=${lon}` +
    `&current_weather=true` +
    `&daily=moon_phase` +
    `&timezone=auto`;

  const response = await fetch(url);
  const data = await response.json();

  return {
    temp: data.current_weather.temperature,
    wind: data.current_weather.windspeed,
    pressure: data.current_weather.pressure_msl,
    precipitation: data.current_weather.precipitation || 0,
    moon: data.daily.moon_phase[0]
  };
}

// ================== ФАЗА МІСЯЦЯ ==================
function moonText(value) {
  if (value < 0.03) return "🌑 Молодик";
  if (value < 0.25) return "🌒 Зростаючий серп";
  if (value < 0.27) return "🌓 Перша чверть";
  if (value < 0.48) return "🌔 Зростаючий місяць";
  if (value < 0.52) return "🌕 Повний місяць";
  if (value < 0.73) return "🌖 Спадний місяць";
  if (value < 0.77) return "🌗 Остання чверть";
  return "🌘 Старіючий серп";
}

// ================== КОЛИ ВИДІЛЯЄШ ==================
map.on(L.Draw.Event.CREATED, async function (e) {
  const layer = e.layer;
  drawnItems.clearLayers();
  drawnItems.addLayer(layer);

  const center = layer.getBounds().getCenter();

  document.getElementById('info').innerHTML =
    "⏳ Завантаження погоди...";

  const weather = await loadWeather(center.lat, center.lng);

  document.getElementById('info').innerHTML = `
    🌍 <b>Погода в обраній зоні</b><br><br>
    🌡️ Температура: ${weather.temp} °C<br>
    💨 Вітер: ${weather.wind} м/с<br>
    🧭 Тиск: ${weather.pressure} гПа<br>
    🌧 Опади: ${weather.precipitation} мм<br>
    🌙 Фаза місяця: ${moonText(weather.moon)}
  `;
});

// ================== SERVICE WORKER (НА МАЙБУТНЄ) ==================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// ===== ПОГОДА ОДРАЗУ ПРИ ЗАПУСКУ =====
window.addEventListener('load', async () => {
  document.getElementById('info').innerHTML =
    "⏳ Завантаження погоди по Вінницькій області...";

  const weather = await loadWeather(49.2331, 28.4682);

  document.getElementById('info').innerHTML = `
    🌍 <b>Вінницька область</b><br><br>
    🌡️ Температура: ${weather.temp} °C<br>
    💨 Вітер: ${weather.wind} м/с<br>
    🧭 Тиск: ${weather.pressure} гПа<br>
    🌧 Опади: ${weather.precipitation} мм<br>
    🌙 Фаза місяця: ${moonText(weather.moon)}
  `;
});

