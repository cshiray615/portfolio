/**
 * Theme initialization — called both:
 * (1) inline in <head> before first paint, to prevent flash-of-wrong-theme
 * (2) by the DarkToggle component when the user manually flips
 */

const STORAGE_KEY = 'casey-theme';
type Theme = 'light' | 'dark';

export function resolveTheme(prefersDark: boolean): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return prefersDark ? 'dark' : 'light';
}

export function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.dataset.theme = 'dark';
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

export function persistTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme);
}

export function toggleTheme(): Theme {
  const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  const next: Theme = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  persistTheme(next);
  return next;
}

/**
 * Self-executing inline script body. This is the string that gets stamped
 * into <head> via a <script is:inline> tag in Base.astro.
 *
 * It runs synchronously before first paint, so visitors never see a
 * flash-of-wrong-theme.
 */
export const inlineScript = `
(function() {
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = (stored === 'dark' || stored === 'light') ? stored : (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') {
      document.documentElement.dataset.theme = 'dark';
    }
  } catch (e) { /* no-op: fall back to default light */ }
})();
`.trim();
