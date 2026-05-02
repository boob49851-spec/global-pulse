// ===== MOBILE UI - Responsive Navigation =====
// يتم تحميل هذا الملف تلقائياً عندما يكون العرض أصغر من 768px

(function() {
  'use strict';

  // كشف ما إذا كان الجهاز متنقل
  const isMobile = () => window.innerWidth <= 768;

  // إنشاء زر القائمة الجانبية
  function createMobileMenuButton() {
    const btn = document.createElement('button');
    btn.id = 'mobile-menu-btn';
    btn.innerHTML = '☰';
    btn.style.cssText = `
      position: fixed;
      top: 12px;
      left: 12px;
      z-index: 1000;
      width: 40px;
      height: 40px;
      background: rgba(10, 16, 30, 0.9);
      border: 1px solid rgba(76, 201, 240, 0.3);
      color: #4cc9f0;
      font-size: 20px;
      border-radius: 6px;
      cursor: pointer;
      display: none;
    `;
    document.body.appendChild(btn);
    return btn;
  }

  // إنشاء القائمة الجانبية
  function createMobilePanel() {
    const panel = document.createElement('div');
    panel.id = 'mobile-panel';
    panel.innerHTML = `
      <div class="mobile-header">
        <span style="font-family: var(--display); color: var(--cyan);">🌍 Global Pulse</span>
        <button id="close-mobile" style="background: none; border: none; color: #fff; font-size: 20px; cursor: pointer;">✕</button>
      </div>
      <div class="mobile-content">
        <button onclick="setView('live'); toggleMobilePanel(false)">الخريطة المباشرة</button>
        <button onclick="setView('analytics'); toggleMobilePanel(false)">التحليلات</button>
        <button onclick="toggleAutoRotate(); toggleMobilePanel(false)">تدوير الكرة</button>
        <button onclick="document.querySelector('.keyword-input')?.focus(); toggleMobilePanel(false)">بحث</button>
        <button onclick="exportToJSON(); toggleMobilePanel(false)">تصدير JSON</button>
        <button onclick="exportToCSV(); toggleMobilePanel(false)">تصدير CSV</button>
      </div>
    `;
    panel.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 260px;
      background: rgba(10, 16, 30, 0.98);
      backdrop-filter: blur(20px);
      z-index: 999;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      border-right: 1px solid rgba(76, 201, 240, 0.2);
    `;
    document.body.appendChild(panel);
    return panel;
  }

  // فتح/إغلاق القائمة الجانبية
  window.toggleMobilePanel = function(show) {
    const panel = document.getElementById('mobile-panel');
    if (panel) {
      panel.style.transform = show ? 'translateX(0)' : 'translateX(-100%)';
    }
  };

  // تعديل حجم الكرة للهواتف
  function adjustGlobeForMobile() {
    const globeEl = document.getElementById('globe');
    if (!globeEl || !globe) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width <= 768) {
      globe.width(width);
      globe.height(height - 120);
    } else {
      globe.width(globeEl.clientWidth);
      globe.height(globeEl.clientHeight);
    }
  }

  // تهيئة الواجهة المتنقلة
  function initMobileUI() {
    if (!isMobile()) {
      document.getElementById('mobile-menu-btn')?.remove();
      document.getElementById('mobile-panel')?.remove();
      return;
    }

    const menuBtn = createMobileMenuButton();
    const panel = createMobilePanel();

    menuBtn.style.display = 'block';
    menuBtn.onclick = () => toggleMobilePanel(true);
    document.getElementById('close-mobile').onclick = () => toggleMobilePanel(false);

    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target !== menuBtn) {
        toggleMobilePanel(false);
      }
    });

    adjustGlobeForMobile();
  }

  // مراقبة تغيير حجم النافذة
  window.addEventListener('resize', () => {
    adjustGlobeForMobile();
    if (!isMobile()) {
      document.getElementById('mobile-menu-btn')?.remove();
      document.getElementById('mobile-panel')?.remove();
    } else {
      initMobileUI();
    }
  });

  // تشغيل عند التحميل
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileUI);
  } else {
    initMobileUI();
  }

  // تصدير الوظائف للنطاق العالمي
  window.isMobile = isMobile;

})();
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