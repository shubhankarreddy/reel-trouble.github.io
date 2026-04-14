// Runtime layout guardrails for browsers that do not honor the desktop flex
// height chain consistently. This keeps the results pane visible after Run.

(function () {
  const MOBILE_BREAKPOINT = 820;
  let scheduled = false;

  function isMobileViewport() {
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
  }

  function syncViewportHeight() {
    const viewportHeight = Math.round(window.visualViewport?.height || window.innerHeight);
    document.documentElement.style.setProperty("--app-height", `${viewportHeight}px`);
  }

  function applyDesktopLayoutPatch() {
    scheduled = false;
    syncViewportHeight();

    const root = document.getElementById("root");
    const game = document.getElementById("game");
    const mainLayout = document.querySelector(".main-layout");
    const rightPanel = document.querySelector(".right-panel");
    const editorSection = document.querySelector(".editor-section");
    const editorWrapper = document.querySelector(".sql-editor-wrapper");
    const resultsSection = document.querySelector(".results-section");

    if (!root || !game || !mainLayout || !rightPanel || !editorSection) {
      return;
    }

    if (isMobileViewport()) {
      [root, game, mainLayout, rightPanel, editorSection, editorWrapper, resultsSection]
        .filter(Boolean)
        .forEach((element) => {
          element.style.removeProperty("height");
          element.style.removeProperty("min-height");
          element.style.removeProperty("flex");
          element.style.removeProperty("max-height");
        });
      return;
    }

    root.style.minHeight = "var(--app-height)";
    root.style.height = "var(--app-height)";
    game.style.minHeight = "var(--app-height)";
    game.style.height = "var(--app-height)";

    mainLayout.style.flex = "1 1 auto";
    mainLayout.style.minHeight = "0";
    mainLayout.style.height = "0px";

    rightPanel.style.minHeight = "0";
    rightPanel.style.height = "100%";

    editorSection.style.minHeight = "0";
    editorSection.style.height = "100%";

    if (editorWrapper) {
      editorWrapper.style.flex = "0 0 min(42%, 380px)";
      editorWrapper.style.minHeight = "180px";
      editorWrapper.style.maxHeight = "min(42%, 380px)";
    }

    if (resultsSection) {
      resultsSection.style.flex = "1 1 0";
      resultsSection.style.minHeight = "140px";
      resultsSection.style.maxHeight = "none";
    }
  }

  function scheduleLayoutPatch() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(applyDesktopLayoutPatch);
  }

  function revealResults() {
    window.setTimeout(() => {
      const resultsSection = document.querySelector(".results-section");
      if (!resultsSection || isMobileViewport()) return;

      scheduleLayoutPatch();
      window.requestAnimationFrame(() => {
        const rect = resultsSection.getBoundingClientRect();
        if (rect.bottom > window.innerHeight || rect.height < 80) {
          resultsSection.scrollIntoView({ block: "end", inline: "nearest", behavior: "smooth" });
        }
      });
    }, 80);
  }

  function handleRunIntent(event) {
    const button = event.target.closest(".btn-run, .btn-submit");
    if (!button) return;
    revealResults();
  }

  function handleKeyboardRun(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      revealResults();
    }
  }

  function startObservers() {
    if (!document.body) return;

    const observer = new MutationObserver(() => {
      scheduleLayoutPatch();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"]
    });
  }

  document.addEventListener("click", handleRunIntent, true);
  document.addEventListener("keydown", handleKeyboardRun, true);
  window.addEventListener("resize", scheduleLayoutPatch);
  window.visualViewport?.addEventListener("resize", scheduleLayoutPatch);
  window.visualViewport?.addEventListener("scroll", scheduleLayoutPatch);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      startObservers();
      scheduleLayoutPatch();
    }, { once: true });
  } else {
    startObservers();
    scheduleLayoutPatch();
  }
})();
