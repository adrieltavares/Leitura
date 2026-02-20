// ===== ReadFlow — App Init =====

function init() {
    RF.cacheElements();
    RF.loadSettings();
    RF.applySavedSettingsToUI();
    RF.loadBookmark();
    RF.updateCharCount();

    // Setup all modules
    RF.setupSidebarToggle();
    RF.setupFocusMode();
    RF.setupFullscreen();
    RF.setupDarkUi();
    RF.setupResponsive();
    RF.setupReaderEvents();
    RF.setupDropZone();
    RF.setupExport();
    RF.setupMinimap();
    RF.setupTimerVisibility();
    RF.setupKeyboardShortcuts();
    RF.setupShortcutsPanel();
    RF.setupDynamicReading();

    // Resume button
    document.getElementById('resumeBtn').addEventListener('click', RF.resumeFromBookmark);

    // Mobile init
    if (window.innerWidth <= 900) {
        RF.els.sidebar.classList.add('collapsed');
        RF.els.mainContent.classList.add('expanded');
    }
}

init();
