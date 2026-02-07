/**
 * ThemeManager - Handles theme persistence and application
 */
export class ThemeManager {
  constructor() {
    this.body = document.body;
    this.savedTheme = localStorage.getItem("theme");
    this.systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    this.isDark = this.savedTheme
      ? this.savedTheme === "dark"
      : this.systemPrefersDark;
  }

  /**
   * Get current theme state
   */
  getIsDark() {
    return this.isDark;
  }

  /**
   * Apply theme to DOM and persist preference
   */
  applyTheme(darkModeActive) {
    this.isDark = darkModeActive;
    const theme = darkModeActive ? "dark" : "light";
    this.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }

  /**
   * Toggle theme and return new state
   */
  toggleTheme() {
    this.applyTheme(!this.isDark);
    return this.isDark;
  }
}
