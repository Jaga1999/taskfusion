"use strict";
class PreloadScript {
    constructor() {
        this.platform = process.platform;
    }
    // Expose platform to the renderer process
    exposePlatform() {
        window.electron = {
            platform: this.platform
        };
    }
    // Initialize preload script
    init() {
        this.exposePlatform();
    }
}
// Instantiate and initialize the PreloadScript class
const preloadScript = new PreloadScript();
preloadScript.init();
