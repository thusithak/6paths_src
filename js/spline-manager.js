/**
 * SplineManager - Handles Spline 3D scene loading and management
 */
export class SplineManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.app = null;
    this.isLoaded = false;
  }

  /**
   * Load Spline scene
   */
  async load(sceneUrl) {
    try {
      const { Application } = await import(
        "https://unpkg.com/@splinetool/runtime"
      );
      this.app = new Application(this.canvas);
      await this.app.load(sceneUrl);
      this.isLoaded = true;
      sessionStorage.setItem("splineSceneLoaded", "true");
      return this.app;
    } catch (error) {
      console.error("Failed to load Spline scene:", error);
      throw error;
    }
  }

  /**
   * Get Spline app instance
   */
  getApp() {
    return this.app;
  }

  /**
   * Check if scene is loaded
   */
  isSceneLoaded() {
    return this.isLoaded;
  }

  /**
   * Set a variable in the Spline scene
   */
  setVariable(name, value) {
    if (this.app) {
      this.app.setVariable(name, value);
    }
  }

  /**
   * Ensure Spline scene is synced with target state
   */
  ensureSync(targetState, variableName = "ThemeState") {
    if (!this.app) return;

    const variables = this.app.getVariables();
    if (!variables) return;

    let currentValue = this.getVariableValue(variables, variableName);

    if (currentValue !== undefined && currentValue !== targetState) {
      this.setVariable(variableName, targetState);
    } else if (currentValue === undefined) {
      console.warn(
        `Variable '${variableName}' not found in Spline scene.`
      );
    }
  }

  /**
   * Extract variable value from variables array or object
   */
  getVariableValue(variables, variableName) {
    if (Array.isArray(variables)) {
      const v = variables.find((v) => v.name === variableName);
      return v ? v.value : undefined;
    } else if (typeof variables === "object") {
      return variables[variableName];
    }
    return undefined;
  }
}
