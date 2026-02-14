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
    if (!this.app) {
      console.warn(`Cannot set variable '${name}': Spline app not loaded`);
      return;
    }

    try {
      const variables = this.app.getVariables();
      if (!variables) {
        console.warn(`Cannot set variable '${name}': No variables available in Spline scene`);
        return;
      }

      const currentValue = this.getVariableValue(variables, name);
      if (currentValue === undefined) {
        console.warn(`Variable '${name}' not found in Spline scene`);
        return;
      }

      this.app.setVariable(name, value);
      console.log(`Spline variable '${name}' set to:`, value);
    } catch (e) {
      console.error(`Failed to set variable '${name}':`, e);
    }
  }

  ensureSync(targetState, variableName = null) {
    const varName = variableName || this.config.SPLINE.THEME_STATE_VAR;
    
    if (!this.app) {
      console.warn(`Cannot sync variable '${varName}': Spline app not loaded`);
      return;
    }

    const variables = this.app.getVariables();
    if (!variables) {
      console.warn(`Cannot sync variable '${varName}': No variables available`);
      return;
    }

    let currentValue = this.getVariableValue(variables, varName);

    if (currentValue === undefined) {
      console.warn(`Variable '${varName}' not found in Spline scene.`);
      return;
    }

    if (currentValue !== targetState) {
      this.app.setVariable(varName, targetState);
      console.log(`Spline variable '${varName}' synced to:`, targetState);
    } else {
      console.log(`Spline variable '${varName}' already in sync:`, targetState);
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
