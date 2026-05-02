function initMobileUI(){

  // إنشاء الهيكل
  document.body.innerHTML += `
  <div id="mobile-app">

    <div class="m-header">
      <span class="logo">🌍 GLOBAL PULSE</span>
      <span id="mobile-threat" class="threat">--</span>
    </div>

    <div id="mobile-map" class="m-map"></div>

    <div class="m-tabs">
      <button onclick="switchTab('feed')">📰</button>
      <button onclick="switchTab('map')">🌍</button>
      <button onclick="switchTab('live')">📺</button>
    </div>

    <div id="mobile-feed" class="m-feed"></div>

    <div id="mobile-live" class="m-live" style="display:none">
      <iframe id="mobile-player" width="100%" height="200"></iframe>
      <button onclick="switchStream()">تبديل</button>
    </div>

  </div>
  `;

  renderMobileFeed();
}
function renderMobileFeed(){
  const container = document.getElementById('mobile-feed');
  if(!container) return;

  container.innerHTML = events.slice(0,20).map(e => `
    <div class="m-item">
      <b>${e.cat}</b>
      <div>${e.title}</div>
      <small>${e.source}</small>
    </div>
  `).join('');
}