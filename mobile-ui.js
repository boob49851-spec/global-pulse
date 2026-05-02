// ===== MOBILE UI v2.0 - Professional Mobile Interface =====

(function() {
  'use strict';

  // ===== MOBILE DETECTION =====
  const isMobileDevice = () => {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // ===== MOBILE STATE MANAGEMENT =====
  let mobileState = {
    activeTab: 'map',
    autoRotate: true,
    notifications: true
  };

  // ===== CREATE MOBILE HEADER =====
  function createMobileHeader() {
    const header = document.createElement('div');
    header.id = 'mobile-header';
    header.innerHTML = `
      <div class="mh-left">
        <button id="mobile-menu-btn" class="mh-btn">☰</button>
      </div>
      <div class="mh-center">
        <span class="mh-title">GLOBAL PULSE</span>
        <span id="mobile-threat-badge" class="mh-badge">LOW</span>
      </div>
      <div class="mh-right">
        <button id="mobile-search-btn" class="mh-btn">🔍</button>
      </div>
    `;
    return header;
  }

  // ===== CREATE MOBILE NAVIGATION =====
  function createMobileNav() {
    const nav = document.createElement('div');
    nav.id = 'mobile-nav';
    nav.innerHTML = `
      <button class="mobile-tab active" data-tab="map">🌍<span>الخريطة</span></button>
      <button class="mobile-tab" data-tab="feed">📰<span>الأخبار</span></button>
      <button class="mobile-tab" data-tab="live">📺<span>بث</span></button>
      <button class="mobile-tab" data-tab="stats">📊<span>إحصاءات</span></button>
    `;
    return nav;
  }

  // ===== CREATE MOBILE PANELS =====
  function createMobilePanels() {
    const panels = document.createElement('div');
    panels.id = 'mobile-panels';
    panels.innerHTML = `
      <!-- Map Panel -->
      <div id="panel-map" class="mobile-panel active">
        <div id="mobile-globe"></div>
        <div class="mobile-globe-overlay">
          <div class="mobile-live-indicator">مباشر · ${new Date().toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
      </div>

      <!-- Feed Panel -->
      <div id="panel-feed" class="mobile-panel">
        <div class="mobile-feed-header">
          <input type="text" id="mobile-search-input" placeholder="بحث في الأخبار..." />
          <button id="mobile-clear-btn">✕</button>
        </div>
        <div id="mobile-feed-list" class="mobile-feed-list"></div>
      </div>

      <!-- Live Panel -->
      <div id="panel-live" class="mobile-panel">
        <div class="mobile-live-container">
          <iframe id="mobile-video-player" src="https://www.youtube.com/embed/bNyUyrR0PHo?autoplay=1" 
                  frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
          <div class="mobile-channel-selector">
            <button onclick="switchStream()">قناة التالية ⟳</button>
          </div>
        </div>
      </div>

      <!-- Stats Panel -->
      <div id="panel-stats" class="mobile-panel">
        <div class="mobile-stats-grid">
          <div class="stat-card">
            <div class="stat-label">أحداث 24س</div>
            <div class="stat-value" id="mobile-stat-events">0</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">مناطق نشطة</div>
            <div class="stat-value" id="mobile-stat-regions">0</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">مستوى التهديد</div>
            <div class="stat-value" id="mobile-stat-threat">LOW</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">البتصالات</div>
            <div class="stat-value" id="mobile-stat-clients">0</div>
          </div>
        </div>
        <div class="mobile-watchlist">
          <div class="watchlist-title">⚠️ مناطق الانتباه</div>
          <div id="mobile-watchlist-content"></div>
        </div>
      </div>
    `;
    return panels;
  }

  // ===== CREATE MOBILE SIDEBAR =====
  function createMobileSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'mobile-sidebar';
    sidebar.innerHTML = `
      <div class="sidebar-header">
        <span>GLOBAL PULSE</span>
        <button id="sidebar-close">✕</button>
      </div>
      <div class="sidebar-content">
        <button onclick="toggleMobileAutoRotate()">🔄 تدوير الكرة</button>
        <button onclick="toggleMobileNotifications()">🔔 الإشعارات</button>
        <button onclick="exportToJSON()">📥 تصدير JSON</button>
        <button onclick="exportToCSV()">📊 تصدير CSV</button>
        <button onclick="clearMobileFeed()">🗑️ مسح الأخبار</button>
        <button onclick="location.reload()">🔄 إعادة تحميل</button>
      </div>
    `;
    return sidebar;
  }

  // ===== INITIALIZE MOBILE GLOBE =====
  function initMobileGlobe() {
    const globeContainer = document.getElementById('mobile-globe');
    if (!globeContainer || !window.Globe) return;

    const mobileGlobe = Globe()(globeContainer)
      .width(window.innerWidth)
      .height(window.innerHeight - 120)
      .backgroundColor('#00000000')
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .showAtmosphere(true)
      .atmosphereColor('#4cc9f0')
      .atmosphereAltitude(0.32);

    mobileGlobe
      .pointColor('color')
      .pointAltitude(0)
      .pointRadius('radius')
      .arcColor('color')
      .arcStroke(0.5)
      .arcDashLength(0.4)
      .arcDashGap(0.2);

    // Store reference globally
    window.mobileGlobe = mobileGlobe;

    // Auto rotate
    mobileGlobe.pointOfView({ lat: 20, lng: 20, altitude: 2.5 }, 0);
    
    setTimeout(() => {
      if (mobileGlobe.controls) {
        mobileGlobe.controls().autoRotate = true;
        mobileGlobe.controls().autoRotateSpeed = 0.15;
      }
    }, 500);
  }

  // ===== RENDER MOBILE FEED =====
  function renderMobileFeed() {
    const feedList = document.getElementById('mobile-feed-list');
    if (!feedList) return;

    const items = events.slice(0, 50).map(e => `
      <div class="mobile-feed-item" onclick="showDetailMobile(${JSON.stringify(e).replace(/"/g, '&quot;')})">
        <div class="feed-item-header">
          <span class="feed-category" style="color: ${CATS[e.cat]?.color || '#4cc9f0'}">${CATS[e.cat]?.label || e.cat}</span>
          <span class="feed-time">${new Date(e.publishedAt || e.timestamp).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</span>
        </div>
        <div class="feed-title">${e.title}</div>
        <div class="feed-summary">${(e.sum || '').substring(0, 100)}...</div>
      </div>
    `).join('');

    feedList.innerHTML = items || '<div class="mobile-empty">لا توجد أخبار حالياً</div>';
  }

  // ===== UPDATE STATS =====
  function updateMobileStats() {
    const eventCount = events.length;
    const regionCount = new Set(events.map(e => e.from)).size;

    document.getElementById('mobile-stat-events').textContent = eventCount;
    document.getElementById('mobile-stat-regions').textContent = regionCount;
    document.getElementById('mobile-stat-threat').textContent = document.getElementById('global-threat')?.textContent || 'LOW';
    document.getElementById('mobile-stat-clients').textContent = window.connectedClients?.length || 0;

    // Update threat badge
    const threatBadge = document.getElementById('mobile-threat-badge');
    if (threatBadge) {
      const threat = document.getElementById('global-threat')?.textContent;
      threatBadge.textContent = threat || 'LOW';
      threatBadge.className = 'mh-badge ' + (threat?.toLowerCase() || 'low');
    }
  }

  // ===== TAB SWITCHING =====
  function switchMobileTab(tab) {
    mobileState.activeTab = tab;
    
    // Update tabs
    document.querySelectorAll('.mobile-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update panels
    document.querySelectorAll('.mobile-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `panel-${tab}`);
    });
  }

  // ===== INITIALIZATION =====
  function initMobileUI() {
    if (!isMobileDevice()) {
      // Remove mobile elements if not mobile
      document.getElementById('mobile-ui')?.remove();
      return;
    }

    // Create mobile interface
    const mobileContainer = document.createElement('div');
    mobileContainer.id = 'mobile-ui';
    mobileContainer.appendChild(createMobileHeader());
    mobileContainer.appendChild(createMobilePanels());
    mobileContainer.appendChild(createMobileNav());
    mobileContainer.appendChild(createMobileSidebar());
    document.body.appendChild(mobileContainer);

    // Initialize globe
    setTimeout(initMobileGlobe, 100);

    // Event listeners
    document.getElementById('mobile-menu-btn').onclick = () => {
      document.getElementById('mobile-sidebar').classList.add('open');
    };

    document.getElementById('sidebar-close').onclick = () => {
      document.getElementById('mobile-sidebar').classList.remove('open');
    };

    document.getElementById('mobile-search-btn').onclick = () => {
      switchMobileTab('feed');
      document.getElementById('mobile-search-input').focus();
    };

    // Tab switching
    document.querySelectorAll('.mobile-tab').forEach(btn => {
      btn.onclick = () => switchMobileTab(btn.dataset.tab);
    });

    // Search functionality
    document.getElementById('mobile-search-input')?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      filterMobileFeed(query);
    });

    document.getElementById('mobile-clear-btn').onclick = () => {
      clearMobileFeed();
    };

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
      if (!document.getElementById('mobile-sidebar')?.contains(e.target) && 
          e.target.id !== 'mobile-menu-btn') {
        document.getElementById('mobile-sidebar')?.classList.remove('open');
      }
    });

    // Update stats periodically
    setInterval(updateMobileStats, 5000);
    
    // Initial render
    renderMobileFeed();
    updateMobileStats();
  }

  // ===== FILTER FEED =====
  function filterMobileFeed(query) {
    const items = document.querySelectorAll('.mobile-feed-item');
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(query) ? '' : 'none';
    });
  }

  // ===== CLEAR FEED =====
  function clearMobileFeed() {
    events.length = 0;
    renderMobileFeed();
  }

  // ===== EXPORT FUNCTIONS =====
  window.exportToJSON = function() {
    const data = {
      exportedAt: new Date().toISOString(),
      totalEvents: events.length,
      events: events.map(e => ({
        title: e.title,
        category: e.cat,
        summary: e.sum,
        source: e.source,
        threat: e.threat
      }))
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `global-pulse-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  window.exportToCSV = function() {
    const headers = ['title', 'category', 'summary', 'source', 'threat'];
    const rows = events.map(e => [e.title, e.cat, e.sum, e.source, e.threat]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `global-pulse-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  window.toggleMobileAutoRotate = function() {
    mobileState.autoRotate = !mobileState.autoRotate;
    if (window.mobileGlobe?.controls) {
      window.mobileGlobe.controls().autoRotate = mobileState.autoRotate;
    }
  };

  window.clearMobileFeed = clearMobileFeed;

  // ===== UPDATE WHEN NEW NEWS ARRIVE =====
  window.addEventListener('news-update', () => {
    if (mobileState.activeTab === 'feed') {
      renderMobileFeed();
    }
    updateMobileStats();
  });

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileUI);
  } else {
    initMobileUI();
  }

  // Handle resize
  window.addEventListener('resize', () => {
    if (!isMobileDevice()) {
      document.getElementById('mobile-ui')?.remove();
    } else {
      initMobileUI();
    }
  });

  // Export for global access
  window.initMobileUI = initMobileUI;
  window.switchMobileTab = switchMobileTab;
  window.renderMobileFeed = renderMobileFeed;
  window.updateMobileStats = updateMobileStats;

})();