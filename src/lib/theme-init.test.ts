import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resolveTheme, applyTheme } from './theme-init';

describe('resolveTheme', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns "dark" when localStorage has explicit "dark"', () => {
    localStorage.setItem('casey-theme', 'dark');
    expect(resolveTheme(true)).toBe('dark');
    expect(resolveTheme(false)).toBe('dark');
  });

  it('returns "light" when localStorage has explicit "light"', () => {
    localStorage.setItem('casey-theme', 'light');
    expect(resolveTheme(true)).toBe('light');
    expect(resolveTheme(false)).toBe('light');
  });

  it('falls back to prefers-color-scheme when no localStorage value', () => {
    expect(resolveTheme(true)).toBe('dark');
    expect(resolveTheme(false)).toBe('light');
  });

  it('ignores invalid localStorage values and falls back', () => {
    localStorage.setItem('casey-theme', 'fuchsia');
    expect(resolveTheme(true)).toBe('dark');
    expect(resolveTheme(false)).toBe('light');
  });
});

describe('applyTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('sets data-theme="dark" on documentElement when given "dark"', () => {
    applyTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('removes data-theme attribute when given "light"', () => {
    document.documentElement.dataset.theme = 'dark';
    applyTheme('light');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});
