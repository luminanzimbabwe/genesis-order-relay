/**
 * PWA Install Prompt — vanilla JS version for static sites.
 * Include this script in any HTML page: <script src="pwa-install-prompt.js"></script>
 *
 * - Android/Desktop Chrome: catches beforeinstallprompt, shows Install button
 * - iPhone Safari: shows manual "Share → Add to Home Screen" instructions
 * - Already installed: does nothing
 */
(function () {
  'use strict';

  // Don't show if already running as installed PWA
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) return;
  // Don't show if dismissed this session
  if (sessionStorage.getItem('pwa_install_dismissed')) return;

  var deferredPrompt = null;
  var banner = null;

  function isIOS() {
    var ua = navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua);
  }
  function isSafari() {
    var ua = navigator.userAgent.toLowerCase();
    return /safari/.test(ua) && !/chrome|crios|fxios/.test(ua);
  }

  function createBanner(html, showInstall) {
    banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML =
      '<div style="position:fixed;top:0;left:0;right:0;z-index:999999;background:#1e293b;border-bottom:2px solid #667eea;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.3)">' +
        '<div style="display:flex;align-items:center;flex:1;min-width:0">' +
          '<span style="font-size:28px;margin-right:12px">📲</span>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="color:#fff;font-size:15px;font-weight:700;margin-bottom:3px">Install Genesis App</div>' +
            '<div style="color:#94a3b8;font-size:12px;line-height:1.5">' + html + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;margin-left:12px;flex-shrink:0">' +
          (showInstall ? '<button id="pwa-install-btn" style="background:#667eea;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;margin-right:10px">Install</button>' : '') +
          '<button id="pwa-install-dismiss" style="background:none;border:none;color:#64748b;font-size:18px;cursor:pointer;padding:6px">✕</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);

    document.getElementById('pwa-install-dismiss').addEventListener('click', function () {
      banner.style.display = 'none';
      sessionStorage.setItem('pwa_install_dismissed', '1');
    });

    if (showInstall) {
      document.getElementById('pwa-install-btn').addEventListener('click', function () {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function (result) {
          if (result.outcome === 'accepted') banner.style.display = 'none';
          deferredPrompt = null;
        });
      });
    }
  }

  // iPhone/iPad Safari — manual instructions
  if (isIOS() && isSafari()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        createBanner(
          'Tap the <b>Share</b> button (square with ↑) at the bottom, then scroll down and tap <b>Add to Home Screen</b>.',
          false
        );
      });
    } else {
      createBanner(
        'Tap the <b>Share</b> button (square with ↑) at the bottom, then scroll down and tap <b>Add to Home Screen</b>.',
        false
      );
    }
    return;
  }

  // Android / Desktop — listen for the install prompt
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (!banner) {
      createBanner('Tap below to install this app on your device.', true);
    }
  });

  // Fallback: if event never fires within 3s, show generic instructions
  setTimeout(function () {
    if (!deferredPrompt && !banner) {
      createBanner(
        'Open this page in <b>Chrome</b>, then tap the browser menu <b>(⋮)</b> → <b>Install app</b>.',
        false
      );
    }
  }, 3000);
})();