import { CONFIG } from "./config.js";
import { safeCall, validateDOM } from "./utils.js";

export class SplineManager {
  constructor(canvasId, config = CONFIG) {
    this.config = config;
    this.canvas = validateDOM(canvasId) || document.getElementById(canvasId);
    this.app = null;
    this.isLoaded = false;
  }

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

  getApp() {
    return this.app;
  }

  isSceneLoaded() {
    return this.isLoaded;
  }

  setVariable(name, value) {
    if (this.app) {
      this.app.setVariable(name, value);
    }
  }

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

  getVariableValue(variables, variableName) {
    if (Array.isArray(variables)) {
      const v = variables.find((v) => v.name === variableName);
      return v ? v.value : undefined;
    } else if (typeof variables === "object") {
      return variables[variableName];
    }
    return undefined;
  }

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
