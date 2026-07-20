/**
 * Theme Initialization Script
 * Runs before React hydrates to prevent flash of wrong theme (FOUC).
 * This is intentionally a separate, static JS file so it can be served
 * under a strict Content-Security-Policy without requiring 'unsafe-inline'.
 *
 * Allowed themes: 'dark' | 'light' | 'warm'
 * Falls back to the OS prefers-color-scheme when no preference is stored.
 */
(function () {
  try {
    var VALID_THEMES = ['dark', 'light', 'warm'];
    var theme = localStorage.getItem('theme');

    // Reject any value that is not a known theme (prevents XSS via localStorage)
    if (theme && VALID_THEMES.indexOf(theme) === -1) {
      theme = null;
    }

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else if (theme === 'warm') {
      document.documentElement.classList.add('warm');
    } else if (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }

    // Unregister stale service workers (legacy cleanup)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (var i = 0; i < registrations.length; i++) {
          registrations[i].unregister();
        }
      });
    }
  } catch (e) {
    // Silently fail — storage may be blocked in private browsing
  }
})();
