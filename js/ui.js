// ===== ReadFlow — UI Module =====

RF.setupSidebarToggle = function () {
    const btn = document.getElementById('toggleSidebar');
    if (!btn) return;
    btn.addEventListener('click', function () {
        if (window.innerWidth <= 900) {
            RF.els.sidebar.classList.toggle('mobile-open');
            RF.els.overlay.classList.toggle('show');
            setTimeout(() => RF.els.overlay.classList.toggle('visible'), 10);
        } else {
            RF.els.sidebar.classList.toggle('collapsed');
            RF.els.mainContent.classList.toggle('expanded');
        }
    });
};

RF.closeSidebarMobile = function () {
    RF.els.sidebar.classList.remove('mobile-open');
    RF.els.overlay.classList.remove('visible');
    setTimeout(() => RF.els.overlay.classList.remove('show'), 300);
};

RF.setupFocusMode = function () {
    const btn = document.getElementById('focusMode');
    if (!btn) return;
    btn.addEventListener('click', RF.toggleFocusMode);
};

RF.toggleFocusMode = function () {
    RF.state.focusMode = !RF.state.focusMode;
    document.body.classList.toggle('focus-mode', RF.state.focusMode);
    document.getElementById('focusMode').classList.toggle('active', RF.state.focusMode);
    RF.showToast(RF.state.focusMode ? 'Modo foco ativado' : 'Modo foco desativado',
        RF.state.focusMode ? 'center_focus_strong' : 'center_focus_weak');
};

RF.setupFullscreen = function () {
    const btn = document.getElementById('fullscreenBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
            btn.classList.add('active');
        } else {
            document.exitFullscreen();
            btn.classList.remove('active');
        }
    });
};

RF.setupDarkUi = function () {
    const btn = document.getElementById('darkUiToggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
        RF.state.darkUi = !RF.state.darkUi;
        document.body.classList.toggle('dark-ui', RF.state.darkUi);
        btn.classList.toggle('active', RF.state.darkUi);
        localStorage.setItem('readflow_darkUi', RF.state.darkUi);
        RF.showToast(RF.state.darkUi ? 'Interface escura ativada' : 'Interface clara ativada', 'dark_mode');
    });
};

RF.setupResponsive = function () {
    window.addEventListener('resize', function () {
        if (window.innerWidth > 900) {
            RF.els.sidebar.classList.remove('mobile-open');
            RF.els.overlay.classList.remove('show', 'visible');
        }
        if (RF.updateMinimapViewport) RF.updateMinimapViewport();
    });
};

RF.setupTimerVisibility = function () {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (RF.state.readingTimer) clearInterval(RF.state.readingTimer);
        } else if (RF.state.currentText) {
            if (RF.startReadingTimer) RF.startReadingTimer();
        }
    });
};

RF.showToast = function (msg, icon = 'check_circle') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="material-icons-round">${icon}</span>${msg}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 500);
    }, 3200);
};

RF.updateCharCount = function () {
    const len = RF.els.textInput.value.length;
    const charCountEl = document.getElementById('charCount');
    if (charCountEl) {
        charCountEl.textContent = len.toLocaleString('pt-BR') + ' caracteres';
    }
};
