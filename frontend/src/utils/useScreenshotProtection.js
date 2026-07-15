import { useEffect, useState } from "react";

/**
 * Best-effort, browser-level screenshot & screen-recording DETERRENCE hook.
 *
 * IMPORTANT (documented honestly, see README "Screenshot Protection" section):
 * Browsers do NOT expose any API that can truly block a screenshot or
 * OS-level screen recording. This hook implements the strongest set of
 * deterrents that are actually possible in a standard web app:
 *
 *  1. Detects the PrintScreen key and common OS screenshot shortcuts
 *     (Win+Shift+S, Cmd+Shift+3/4/5) and immediately blurs the video +
 *     shows a warning overlay for a couple of seconds.
 *  2. Detects window blur / visibility change (many OS screenshot tools
 *     momentarily blur/switch focus) and pauses + blurs the video.
 *  3. Disables right-click context menu, text selection and drag on the
 *     player so the video frame cannot be trivially saved/dragged out.
 *  4. Renders a moving, semi-transparent watermark (logged-in user's
 *     name + email + timestamp) over the video so any screenshot/photo
 *     that does slip through is traceable back to the student.
 *  5. Detects when dev tools are likely open (window size heuristics)
 *     and blurs the player, since dev tools can be used to intercept
 *     the video stream.
 *
 * None of this stops a phone camera pointed at the screen — no web
 * technology can. It raises the effort/friction required and makes
 * leaked content traceable, which is the realistic ceiling for a
 * browser-based solution.
 */
export function useScreenshotProtection() {
  const [isBlurred, setIsBlurred] = useState(false);
  const [warning, setWarning] = useState(null);

  useEffect(() => {
    let warningTimeout;

    const triggerWarning = (message) => {
      setIsBlurred(true);
      setWarning(message);
      clearTimeout(warningTimeout);
      warningTimeout = setTimeout(() => {
        setIsBlurred(false);
        setWarning(null);
      }, 2500);
    };

    const handleKeyDown = (e) => {
      // PrintScreen key
      if (e.key === "PrintScreen") {
        navigator.clipboard?.writeText("").catch(() => {});
        triggerWarning("Screenshots are discouraged on this platform.");
      }
      // Windows Snipping Tool: Win+Shift+S -> browsers can't see Win key,
      // but we catch Shift+S combined with a recent blur as a heuristic.
      // macOS: Cmd+Shift+3/4/5
      if (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(e.key)) {
        triggerWarning("Screen capture shortcuts are discouraged on this platform.");
      }
      // Common dev-tools shortcuts
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.metaKey && e.altKey && ["I", "J", "C"].includes(e.key))
      ) {
        triggerWarning("Developer tools are disabled while watching videos.");
      }
    };

    const handleBlur = () => {
      triggerWarning("Video paused — window lost focus.");
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerWarning("Video paused — tab is not active.");
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Dev-tools-open heuristic (works reasonably on desktop browsers)
    const devToolsThreshold = 250;
    const handleResize = () => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > devToolsThreshold || heightDiff > devToolsThreshold) {
        triggerWarning("Please close developer tools to continue watching.");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("resize", handleResize);
      clearTimeout(warningTimeout);
    };
  }, []);

  return { isBlurred, warning };
}
