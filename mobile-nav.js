/**
 * Mobile Navigation Manager for Global Pulse
 * Handles bottom navigation, drawer menu, and responsive view switching
 */

class MobileNavManager {
  constructor() {
    this.isMobile = window.innerWidth <= 768;
    this.currentView = 'live';
    this.menuOpen = false;
    this.init();
  }

  init() {
    this.createMobileElements();
    this.attachEventListeners();
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  createMobileElements() {
    // Create mobile navigation bar
    const mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav';
    mobileNav.innerHTML = `
      <button class="mobile-nav-item nav-map active" data-view="live" title="الخريطة المباشرة">
        <span>الخريطة</span>
      </button>
      <button class="mobile-nav-item nav-feed" data-view="feed" title="الأخبار المباشرة">
        <span>الأخبار</span>
      </button>
      <button class="mobile-nav-item nav-timeline" data-view="timeline" title="الجدول الزمني">
        <span>الجدول</span>
      </button>
      <button class="mobile-nav-item nav-analytics" data-view="analytics" title="التحليلات">
        <span>التحليلات</span>
      </button>
      <button class="mobile-nav-item nav-menu" id="menu-toggle" title="القائمة">
        <span>القائمة</span>
      </button>
    `;
    document.body.appendChild(mobileNav);

    // Create mobile menu drawer
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.id = 'mobile-menu';
    mobileMenu.innerHTML = `
      <div class="mobile-menu-header">
        <h2 style="font-family: var(--display); font-size: 18px; margin: 0;">Global Pulse</h2>
        <button class="mobile-menu-close" id="menu-close">✕</button>
      </div>
      
      <div class="mobile-menu-section">
        <h3 class="mobile-menu-title">العرض</h3>
        <button class="mobile-menu-item" data-view="live">🗺️ الخريطة المباشرة</button>
        <button class="mobile-menu-item" data-view="feed">📰 الأخبار المباشرة</button>
        <button class="mobile-menu-item" data-view="timeline">📅 الجدول الزمني</button>
        <button class="mobile-menu-item" data-view="analytics">📊 التحليلات</button>
      </div>

      <div class="mobile-menu-section">
        <h3 class="mobile-menu-title">الخيارات</h3>
        <button class="mobile-menu-item" id="density-toggle">🎚️ الكثافة</button>
        <button class="mobile-menu-item" id="auto-toggle">⟳ التدوير التلقائي</button>
        <button class="mobile-menu-item" id="export-menu">⬇ تصدير</button>
      </div>

      <div class="mobile-menu-section">
        <h3 class="mobile-menu-title">المساعدة</h3>
        <button class="mobile-menu-item" id="help-btn">❓ المساعدة</button>
        <button class="mobile-menu-item" id="about-btn">ℹ️ حول التطبيق</button>
      </div>
    `;
    document.body.appendChild(mobileMenu);

    // Create menu overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    overlay.id = 'menu-overlay';
    document.body.appendChild(overlay);
  }

  attachEventListeners() {
    // Navigation items
    document.querySelectorAll('.mobile-nav-item[data-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const view = btn.dataset.view;
        this.switchView(view);
      });
    });

    // Menu toggle
    document.getElementById('menu-toggle').addEventListener('click', () => {
      this.toggleMenu();
    });

    document.getElementById('menu-close').addEventListener('click', () => {
      this.closeMenu();
    });

    document.getElementById('menu-overlay').addEventListener('click', () => {
      this.closeMenu();
    });

    // Menu items
    document.querySelectorAll('#mobile-menu .mobile-menu-item[data-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const view = btn.dataset.view;
        this.switchView(view);
        this.closeMenu();
      });
    });

    // Menu options
    document.getElementById('density-toggle').addEventListener('click', () => {
      const densityBtn = document.getElementById('density-btn');
      if (densityBtn) {
        densityBtn.click();
      }
      this.closeMenu();
    });

    document.getElementById('auto-toggle').addEventListener('click', () => {
      const autoBtn = document.getElementById('auto-btn');
      if (autoBtn) {
        autoBtn.click();
      }
      this.closeMenu();
    });

    document.getElementById('export-menu').addEventListener('click', () => {
      this.showExportOptions();
    });

    document.getElementById('help-btn').addEventListener('click', () => {
      this.showHelp();
    });

    document.getElementById('about-btn').addEventListener('click', () => {
      this.showAbout();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMenu();
      }
      // Number keys for quick view switching (1-4)
      if (e.key >= '1' && e.key <= '4') {
        const views = ['live', 'feed', 'timeline', 'analytics'];
        const view = views[parseInt(e.key) - 1];
        if (view) {
          this.switchView(view);
        }
      }
    });
  }

  switchView(view) {
    this.currentView = view;

    // Update navigation active state
    document.querySelectorAll('.mobile-nav-item').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.view === view) {
        btn.classList.add('active');
      }
    });

    // Show/hide panels based on view
    const feedPanel = document.querySelector('.feed-panel');
    const streamPanel = document.querySelector('.stream-panel');
    const globeWrap = document.querySelector('.globe-wrap');
    const viewPlaceholder = document.getElementById('view-placeholder');

    // Hide all panels
    if (feedPanel) feedPanel.style.display = 'none';
    if (streamPanel) streamPanel.style.display = 'none';
    if (globeWrap) globeWrap.style.display = 'none';
    if (viewPlaceholder) viewPlaceholder.style.display = 'none';

    // Show selected view
    switch (view) {
      case 'live':
        if (globeWrap) globeWrap.style.display = 'block';
        break;
      case 'feed':
        if (feedPanel) feedPanel.style.display = 'flex';
        break;
      case 'timeline':
        if (viewPlaceholder) {
          viewPlaceholder.innerHTML = `
            <h2>الجدول الزمني</h2>
            <p>جاري التحميل...</p>
          `;
          viewPlaceholder.style.display = 'block';
        }
        break;
      case 'analytics':
        if (viewPlaceholder) {
          viewPlaceholder.innerHTML = `
            <h2>التحليلات</h2>
            <p>جاري التحميل...</p>
          `;
          viewPlaceholder.style.display = 'block';
        }
        break;
    }

    console.log('[Mobile Nav] تم التبديل إلى العرض:', view);
  }

  toggleMenu() {
    if (this.menuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
      menu.classList.add('open');
      this.menuOpen = true;
      document.body.style.overflow = 'hidden';
    }
  }

  closeMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
      menu.classList.remove('open');
      this.menuOpen = false;
      document.body.style.overflow = '';
    }
  }

  showExportOptions() {
    const feedPanel = document.querySelector('.feed-panel');
    if (feedPanel) {
      const csvBtn = feedPanel.querySelector('.csv-btn');
      const jsonBtn = feedPanel.querySelector('.json-btn');
      
      if (csvBtn || jsonBtn) {
        alert('اختر صيغة التصدير:\n\nJSON أو CSV');
      }
    }
  }

  showHelp() {
    const helpText = `
🎮 اختصارات لوحة المفاتيح:
• 1-4: التبديل بين الأعمدة
• Esc: إغلاق القائمة

📱 تلميحات الهاتف:
• اسحب الخريطة لتدويرها
• انقر على الأحداث لعرض التفاصيل
• استخدم الأزرار السفلية للتنقل
    `;
    alert(helpText);
  }

  showAbout() {
    const aboutText = `
Global Pulse v0.1
نظام مراقبة عسكري متقدم
تتبع الأحداث والنزاعات العالمية

© 2026 Hasheim
    `;
    alert(aboutText);
  }

  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;

    if (wasMobile !== this.isMobile) {
      console.log('[Mobile Nav] تغيير وضع الجهاز:', this.isMobile ? 'موبايل' : 'سطح المكتب');
      
      // Close menu when switching to desktop
      if (!this.isMobile) {
        this.closeMenu();
      }
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.mobileNav = new MobileNavManager();
  });
} else {
  window.mobileNav = new MobileNavManager();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileNavManager;
}
