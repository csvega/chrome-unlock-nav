(function () {
    const originalPreventDefault = Event.prototype.preventDefault;
    const unblockTypes = new Set([
        'selectstart', 'copy', 'cut', 'paste',
        'dragstart', 'contextmenu', 'mousedown'
    ]);

    Event.prototype.preventDefault = function () {
        if (document.documentElement.classList.contains('unblock-active') && unblockTypes.has(this.type)) {
            return;
        }
        return originalPreventDefault.call(this);
    };

    const originalReturnValue = Object.getOwnPropertyDescriptor(Event.prototype, 'returnValue');
    if (originalReturnValue) {
        Object.defineProperty(Event.prototype, 'returnValue', {
            get: originalReturnValue.get,
            set(val) {
                if (document.documentElement.classList.contains('unblock-active') && unblockTypes.has(this.type) && val === false) {
                    return;
                }
                return originalReturnValue.set.call(this, val);
            },
            configurable: true,
            enumerable: true
        });
    }
})();
