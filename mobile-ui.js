// ===== PROFESSIONAL MOBILE UI v3.0 =====

(function() {
  'use strict';

  // ===== MOBILE DETECTION =====
  const isMobileDevice = () => {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // ===== STATE MANAGEMENT =====
  let mobileState = {
    autoRotate: true,
    notifications: true
  };

  // ===== DRAWER MENU =====
  function toggleDrawer() {
    const drawer = document.getElementById('drawer-menu');
    const overlay = document.getElementById('drawer-overlay');
    if (drawer && overlay) {
      drawer.classList.toggle('open');
      overlay.classList.toggle('show');
    }
  }

  // ===== INITIALIZE MOBILE GLOBE =====
  function initMobileGlobe() {
    const globeContainer = document.getElementById('mobile-globe');
    if (!globeContainer || !window.Globe) return;

    const mobileGlobe = Globe()(globeContainer)
      .width(window.innerWidth)
      .height(window.innerHeight * 0.4)
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

    window.mobileGlobe = mobileGlobe;

    mobileGlobe.pointOfView({ lat: 20, lng: 20, altitude: 2.5 }, 0);

    setTimeout(() => {
      if (mobileGlobe.controls) {
        mobileGlobe.controls().autoRotate = true;
        mobileGlobe.controls().autoRotateSpeed = 0.15;
      }
    }, 500);
  }

  // ===== RENDER NEWS CARDS =====
  function renderNews() {
    const newsList = document.getElementById('news-list');
    if (!newsList) return;

    const eventsData = window.events || [];
    if (eventsData.length === 0) {
      newsList.innerHTML = '<div class="news-loading">لا توجد أخبار حالياً</div>';
      return;
    }

    const catColors = {
      conflict: '#ff3860',
      dispute: '#ffbc42',
      political: '#b565ff',
      economic: '#06d6a0',
      combat: '#ff6b35',
      telegram: '#0088cc'
    };

    const items = eventsData.slice(0, 20).map((e, i) => {
      const cat = e.cat || 'political';
      const color = catColors[cat] || '#4cc9f0';
      const time = new Date(e.publishedAt || e.timestamp || Date.now()).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'});
      return `
        <div class="news-card" onclick="showDetail(${i})">
          <div class="news-indicator" style="background:${color};box-shadow:0 0 8px ${color}"></div>
          <div class="news-content">
            <div class="news-title">${e.title || 'خبر بدون عنوان'}</div>
            <div class="news-time">منذ ${time}</div>
          </div>
          <img src="https://picsum.photos/seed/${i}/50" alt="thumb" class="news-thumb" loading="lazy" />
        </div>
      `;
    }).join('');

    newsList.innerHTML = items;
  }

  // ===== RENDER COUNTRIES SLIDER =====
  function renderCountries() {
    const slider = document.getElementById('countries-slider');
    if (!slider) return;

    const countryData = [
      {name: 'سوريا', flag: '🇸🇾', score: 95, active: true},
      {name: 'أوكرانيا', flag: '🇺🇦', score: 82, active: true},
      {name: 'إسرائيل', flag: '🇮🇱', score: 78, active: true},
      {name: 'فلسطين', flag: '🇵🇸', score: 72, active: false},
      {name: 'يمن', flag: '🇾🇪', score: 65, active: true},
      {name: 'ليبيا', flag: '🇱🇾', score: 58, active: false},
      {name: 'إيران', flag: '🇮🇷', score: 52, active: false}
    ];

    const items = countryData.map(c => `
      <div class="country-card">
        <span class="country-flag">${c.flag}</span>
        <span class="country-name">${c.name}</span>
        <span class="country-score">${c.score}</span>
        <span class="country-dot" style="background:${c.active ? '#ff3860' : '#06d6a0'}"></span>
      </div>
    `).join('');

    slider.innerHTML = items;
  }

  // ===== UPDATE THREAT INDICATOR =====
  function updateThreat() {
    const threatEl = document.getElementById('global-threat');
    const threatBar = document.getElementById('threat-bar-fill');
    const threatLabel = document.getElementById('threat-section')?.querySelector('.threat-label span');
    const drawerThreat = document.getElementById('drawer-threat');

    if (threatEl) {
      const threat = threatEl.textContent || 'LOW';
      const percentage = threat === 'LOW' ? 25 : threat === 'ELEVATED' ? 45 : threat === 'HIGH' ? 70 : 90;
      
      if (threatBar) {
        threatBar.style.width = percentage + '%';
      }
      
      if (threatLabel) {
        threatLabel.textContent = threat === 'LOW' ? 'هادئ' : threat === 'ELEVATED' ? 'متوسط' : threat === 'HIGH' ? 'مرتفع' : 'حرج';
      }

      if (drawerThreat) {
        drawerThreat.textContent = threat;
      }
    }
  }

  // ===== SHOW NEWS DETAIL =====
  window.showDetail = function(index) {
    const eventsData = window.events || [];
    if (eventsData[index]) {
      alert(eventsData[index].title || 'الخبر');
    }
  };

  // ===== DRAWER ACTIONS =====
  window.toggleAutoRotateDrawer = function() {
    mobileState.autoRotate = !mobileState.autoRotate;
    if (window.mobileGlobe?.controls) {
      window.mobileGlobe.controls().autoRotate = mobileState.autoRotate;
    }
    toggleDrawer();
  };

  window.toggleNotificationsDrawer = function() {
    mobileState.notifications = !mobileState.notifications;
    toggleDrawer();
  };

  window.exportJSONDrawer = function() {
    window.exportToJSON?.();
    toggleDrawer();
  };

  window.exportCSVDrawer = function() {
    window.exportToCSV?.();
    toggleDrawer();
  };

  window.clearFeedDrawer = function() {
    if (confirm('هل أنت متأكد من مسح جميع الأخبار؟')) {
      window.events = [];
      renderNews();
    }
    toggleDrawer();
  };

  // ===== INITIALIZATION =====
  function initMobileUI() {
    if (!isMobileDevice()) {
      document.getElementById('mobile-ui')?.remove();
      return;
    }

    // Initialize globe
    setTimeout(initMobileGlobe, 200);

    // Render content
    renderNews();
    renderCountries();
    updateThreat();

    // Event listeners
    document.getElementById('menu-btn')?.addEventListener('click', toggleDrawer);
    document.getElementById('drawer-close')?.addEventListener('click', toggleDrawer);
    document.getElementById('drawer-overlay')?.addEventListener('click', toggleDrawer);
    document.getElementById('notifications-btn')?.addEventListener('click', function() {
      this.querySelector('.notification-badge').style.display = 'none';
    });

    // Bottom nav
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const nav = this.dataset.nav;
        // Handle navigation
        if (nav === 'map') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (nav === 'news') {
          document.getElementById('news-section')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Globe buttons
    document.getElementById('settings-btn')?.addEventListener('click', toggleDrawer);
    document.getElementById('layers-btn')?.addEventListener('click', function() {
      // Toggle atmosphere visibility
      if (window.mobileGlobe) {
        const current = window.mobileGlobe.atmosphereColor();
        window.mobileGlobe.atmosphereColor(current ? null : '#4cc9f0');
      }
    });
    document.getElementById('fullscreen-btn')?.addEventListener('click', function() {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    });
  }

  // Wait for data to load
  function waitForData() {
    if (window.events && Array.isArray(window.events)) {
      initMobileUI();
    } else {
      setTimeout(waitForData, 500);
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForData);
  } else {
    waitForData();
  }

  // Handle resize
  window.addEventListener('resize', () => {
    if (!isMobileDevice()) {
      document.getElementById('mobile-ui')?.remove();
    } else if (!document.getElementById('mobile-ui')) {
      waitForData();
    }
  });

  // Export for global access
  window.initMobileUI = initMobileUI;
  window.renderNews = renderNews;
  window.renderCountries = renderCountries;
})();

// ===== DESKTOP TO MOBILE ADAPTER =====
(function() {
  // Listen for news updates
  window.addEventListener('news-update', () => {
    if (window.renderNews) window.renderNews();
    if (window.renderCountries) window.renderCountries();
    if (window.updateThreat) window.updateThreat();
  });
})();