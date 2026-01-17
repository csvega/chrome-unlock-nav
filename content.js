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

const eventTypes = ['contextmenu', 'selectstart', 'dragstart', 'copy', 'cut', 'paste', 'mousedown', 'mouseup'];

eventTypes.forEach(type => {
    window.addEventListener(type, (e) => {
        if (!isEnabled) return;
        e.stopPropagation();
    }, true);
});
