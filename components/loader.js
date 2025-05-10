/**
 * Component Loader
 * Dynamically loads HTML components into the page
 */

class ComponentLoader {
    /**
     * Load a component into a target element
     * @param {string} componentPath - Path to the component HTML file
     * @param {string} targetSelector - CSS selector for the target element
     * @returns {Promise} - Promise that resolves when the component is loaded
     */
    static async loadComponent(componentPath, targetSelector) {
        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`Failed to fetch component: ${response.statusText}`);
            }
            
            const html = await response.text();
            const targetElement = document.querySelector(targetSelector);
            
            if (targetElement) {
                targetElement.innerHTML = html;
                return true;
            } else {
                console.error(`Target element not found: ${targetSelector}`);
                return false;
            }
        } catch (error) {
            console.error('Error loading component:', error);
            return false;
        }
    }
    
    /**
     * Load a CSS file and append it to the head
     * @param {string} cssPath - Path to the CSS file
     */
    static loadCSS(cssPath) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssPath;
        document.head.appendChild(link);
    }
    
    /**
     * Load a JavaScript file and append it to the body
     * @param {string} jsPath - Path to the JavaScript file
     * @returns {Promise} - Promise that resolves when the script is loaded
     */
    static loadScript(jsPath) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = jsPath;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }
}

// Export for use in other scripts
window.ComponentLoader = ComponentLoader;