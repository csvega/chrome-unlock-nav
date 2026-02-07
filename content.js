let isEnabled = false;

const updateState = (enabled) => {
    isEnabled = enabled;
    if (enabled) {
        document.documentElement.classList.add('unblock-active');
    } else {
        document.documentElement.classList.remove('unblock-active');
    }
};

chrome.storage.sync.get(['unblockEnabled'], (result) => {
    const enabled = result.unblockEnabled === true;
    updateState(enabled);
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.unblockEnabled) {
        updateState(changes.unblockEnabled.newValue);
    }
});

const unblockEvents = ['selectstart', 'copy', 'cut', 'paste', 'dragstart', 'contextmenu'];

unblockEvents.forEach(type => {
    document.addEventListener(type, (e) => {
        if (!isEnabled) return;
        e.stopPropagation();
    }, true);
});

document.addEventListener('contextmenu', (e) => {
    if (!isEnabled) return;
    e.stopImmediatePropagation();
}, true);

const clearDocumentHandlers = () => {
    if (!isEnabled) return;

    document.onselectstart = null;
    document.oncopy = null;
    document.oncut = null;
    document.onpaste = null;
    document.ondragstart = null;
    document.oncontextmenu = null;
};

const removeInlineHandlers = () => {
    if (!isEnabled) return;

    const selectors = [
        '[onselectstart]',
        '[oncopy]',
        '[oncut]',
        '[onpaste]',
        '[ondragstart]',
        '[oncontextmenu]'
    ].join(', ');

    document.querySelectorAll(selectors).forEach(el => {
        el.onselectstart = null;
        el.oncopy = null;
        el.oncut = null;
        el.onpaste = null;
        el.ondragstart = null;
        el.oncontextmenu = null;

        el.removeAttribute('onselectstart');
        el.removeAttribute('oncopy');
        el.removeAttribute('oncut');
        el.removeAttribute('onpaste');
        el.removeAttribute('ondragstart');
        el.removeAttribute('oncontextmenu');
    });

    if (document.body) {
        document.body.onselectstart = null;
        document.body.oncopy = null;
        document.body.ondragstart = null;
        document.body.oncontextmenu = null;
    }
};

const init = () => {
    clearDocumentHandlers();
    removeInlineHandlers();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

let debounceTimer = null;
const observer = new MutationObserver(() => {
    if (!isEnabled) return;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        clearDocumentHandlers();
        removeInlineHandlers();
    }, 100);
});

observer.observe(document.documentElement, {
    childList: true,
    subtree: true
});
