import { useEffect } from "react";

/**
 * SecurityProvider - Protects the application from common DevTools access methods in production.
 * - Disables Right-click (Context Menu)
 * - Disables F12, Ctrl+Shift+I, etc.
 * - Adds a debugger trap to pause execution if DevTools are opened.
 */
const SecurityProvider = ({ children }) => {
    useEffect(() => {
        // Only apply security measures in production environment
        if (!import.meta.env.PROD) {
            console.log("[SECURITY] Development mode detected: DevTools protection disabled.");
            return;
        }

        console.log("[SECURITY] Production mode detected: DevTools protection active.");

        // 1. Disable Right-click (Context Menu)
        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U)
        const handleKeyDown = (e) => {
            // Disable F12
            if (e.key === "F12") {
                e.preventDefault();
                return false;
            }

            // Disable Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Elements)
            if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C" || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
                e.preventDefault();
                return false;
            }

            // Disable Cmd+Opt+I (Mac)
            if (e.metaKey && e.altKey && (e.key === "i" || e.key === "I" || e.keyCode === 73)) {
                e.preventDefault();
                return false;
            }

            // Disable Ctrl+U (View Source)
            if (e.ctrlKey && (e.key === "u" || e.key === "U" || e.keyCode === 85)) {
                e.preventDefault();
                return false;
            }
        };

        // 3. Debugger Trap
        // This will trigger whenever DevTools are opened, pausing execution.
        const debuggerTrap = setInterval(() => {
            (function () {
                (function a() {
                    try {
                        (function b(i) {
                            if (("" + i / i).length !== 1 || i % 20 === 0) {
                                (function () {}.constructor("debugger")());
                            } else {
                                debugger;
                            }
                            b(++i);
                        })(0);
                    } catch (e) {
                        setTimeout(a, 5000);
                    }
                })();
            })();
        }, 2000);

        // Add event listeners
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);

        // Cleanup on unmount
        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
            clearInterval(debuggerTrap);
        };
    }, []);

    return children;
};

export default SecurityProvider;
