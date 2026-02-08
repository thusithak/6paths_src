/**
 * SplineManager - Handles Spline 3D scene loading and management
 * Enables synchronization between app state and Spline scene variables
 * Dependencies: CONFIG, utils
 */

import { CONFIG } from "./config.js";
import { safeCall, validateDOM } from "./utils.js";

export class SplineManager {
  constructor(canvasId, config = CONFIG) {
    this.config = config;
    this.canvas = validateDOM(canvasId) || document.getElementById(canvasId);
    this.app = null;
    this.isLoaded = false;
  }

  /**
   * Load Spline scene from configuration
   */
  async load(sceneUrl = this.config.SPLINE.SCENE_URL) {
    try {
      const { Application } = await import(this.config.SPLINE.RUNTIME_URL);
      this.app = new Application(this.canvas);
      await this.app.load(sceneUrl);
      this.isLoaded = true;
      sessionStorage.setItem(this.config.STORAGE.SCENE_LOADED_KEY, "true");
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
  ensureSync(targetState, variableName = null) {
    const varName = variableName || this.config.SPLINE.THEME_STATE_VAR;
    
    if (!this.app) return;

    const variables = this.app.getVariables();
    if (!variables) return;

    let currentValue = this.getVariableValue(variables, varName);

    if (currentValue !== undefined && currentValue !== targetState) {
      this.setVariable(varName, targetState);
      console.log(`Spline variable '${varName}' set to:`, targetState);
    } else if (currentValue === undefined) {
      console.warn(`Variable '${varName}' not found in Spline scene.`);
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

  /**
   * Read a variable value from the loaded Spline app runtime.
   * Returns undefined when the app isn't loaded or the variable doesn't exist.
   */
  getVariable(variableName) {
    if (!this.app || typeof this.app.getVariables !== 'function') return undefined;
    try {
      const vars = this.app.getVariables();
      return this.getVariableValue(vars, variableName);
    } catch (e) {
      console.warn(`Failed to read variable '${variableName}' from Spline app:`, e);
      return undefined;
    }
  }
}
