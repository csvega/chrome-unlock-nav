document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('buttons-container');
    const editPanel = document.getElementById('edit-panel');
    const editList = document.getElementById('edit-list');
    const editBtn = document.getElementById('edit-mode-btn');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const addBtn = document.getElementById('add-btn');
    const toggleUnblock = document.getElementById('toggle-unblock');
    const toggleLabel = document.getElementById('toggle-label');

    const MAX_BUTTONS = 30;
    let currentShortcuts = [];
    let isDraggingShortcut = false;
    let draggedShortcutIndex = null;
    let draggedShortcutEl = null;
    let shortcutPlaceholder = null;

    chrome.storage.sync.get(['unblockEnabled'], (result) => {
        const enabled = result.unblockEnabled === true;
        toggleUnblock.checked = enabled;
        updateLabel(enabled);
    });

    toggleUnblock.addEventListener('change', () => {
        const enabled = toggleUnblock.checked;
        chrome.storage.sync.set({ unblockEnabled: enabled });
        updateLabel(enabled);
    });

    function updateLabel(enabled) {
        toggleLabel.textContent = enabled ? "Unblocker ON" : "Unblocker OFF";
        toggleLabel.style.color = enabled ? "green" : "#888";
    }

    chrome.storage.sync.get(['shortcuts'], (result) => {
        let shortcuts = result.shortcuts;
        if (!Array.isArray(shortcuts)) {
            shortcuts = [];
        }
        renderButtons(shortcuts);
        renderEditInputs(shortcuts);
    });

    function renderButtons(shortcuts) {
        container.innerHTML = '';
        const validShortcuts = shortcuts.filter(s => s.name && s.url);
        currentShortcuts = validShortcuts.slice();

        if (validShortcuts.length === 0) {
            const msg = document.createElement('div');
            msg.textContent = "No shortcuts set.";
            msg.style.gridColumn = "span 2";
            msg.style.textAlign = "center";
            msg.style.color = "#888";
            msg.style.fontSize = "12px";
            msg.style.padding = "10px";
            container.appendChild(msg);
        } else {
            validShortcuts.forEach((item, index) => {
                const btn = document.createElement('button');
                btn.className = 'shortcut-btn';
                btn.draggable = true;
                btn.dataset.index = String(index);

                let domain = item.url;
                try {
                    const urlStr = item.url.startsWith('http') ? item.url : `https://${item.url}`;
                    domain = new URL(urlStr).hostname;
                } catch (e) {
                }

                const img = document.createElement('img');
                img.alt = "";
                img.className = 'favicon';
                img.draggable = false;

                const urlStr = item.url.startsWith('http') ? item.url : `https://${item.url}`;

                img.src = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(urlStr)}&size=64`;

                img.onerror = () => {
                    img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                    img.onerror = () => {
                        img.style.display = 'none';
                    };
                };

                const span = document.createElement('span');
                span.textContent = item.name;
                span.draggable = false;

                btn.appendChild(img);
                btn.appendChild(span);

                btn.onclick = () => {
                    if (isDraggingShortcut) {
                        return;
                    }
                    let url = item.url;
                    if (!url.startsWith('http')) {
                        url = 'https://' + url;
                    }
                    chrome.tabs.create({ url: url });
                };

                btn.addEventListener('dragstart', handleShortcutDragStart);
                btn.addEventListener('dragend', handleShortcutDragEnd);
                btn.addEventListener('drop', handleShortcutDrop);
                container.appendChild(btn);
            });
        }
    }

    function renderEditInputs(shortcuts) {
        editList.innerHTML = '';
        shortcuts.forEach((item, index) => {
            addEditRow(item.name, item.url);
        });

        updateAddButtonState();
    }

    function addEditRow(name = '', url = '') {
        const row = document.createElement('div');
        row.className = 'edit-row';

        const dragHandle = document.createElement('span');
        dragHandle.className = 'drag-handle';
        dragHandle.textContent = '☰';
        dragHandle.draggable = true;

        const nameInput = document.createElement('input');
        nameInput.placeholder = 'Name';
        nameInput.value = name;
        nameInput.className = 'edit-name';

        const urlInput = document.createElement('input');
        urlInput.placeholder = 'URL';
        urlInput.value = url;
        urlInput.className = 'edit-url';

        const removeBtn = document.createElement('button');
        removeBtn.className = 'icon-btn remove-btn';
        removeBtn.textContent = '×';
        removeBtn.onclick = () => {
            row.remove();
            updateAddButtonState();
        };

        dragHandle.addEventListener('dragstart', (e) => handleDragStart.call(row, e));
        dragHandle.addEventListener('dragend', (e) => handleDragEnd.call(row, e));
        row.addEventListener('dragover', handleDragOver);
        row.addEventListener('dragenter', handleDragEnter);
        row.addEventListener('dragleave', handleDragLeave);
        row.addEventListener('drop', handleDrop);

        row.appendChild(dragHandle);
        row.appendChild(nameInput);
        row.appendChild(urlInput);
        row.appendChild(removeBtn);
        editList.appendChild(row);

        const listContainer = document.getElementById('edit-list-container');
        listContainer.scrollTop = listContainer.scrollHeight;
    }

    function updateAddButtonState() {
        const currentCount = editList.querySelectorAll('.edit-row').length;
        addBtn.disabled = currentCount >= MAX_BUTTONS;
    }

    let draggedRow = null;

    function handleDragStart(e) {
        draggedRow = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);

        const dragImage = this.cloneNode(true);
        dragImage.style.opacity = '0';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        setTimeout(() => dragImage.remove(), 0);
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
        const rows = editList.querySelectorAll('.edit-row');
        rows.forEach(row => {
            row.classList.remove('drag-over-top', 'drag-over-bottom');
        });
        draggedRow = null;
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (this === draggedRow) return;

        const rect = this.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;

        this.classList.remove('drag-over-top', 'drag-over-bottom');
        if (e.clientY < midY) {
            this.classList.add('drag-over-top');
        } else {
            this.classList.add('drag-over-bottom');
        }

        return false;
    }

    function handleDragEnter(e) {
    }

    function handleDragLeave(e) {
        this.classList.remove('drag-over-top', 'drag-over-bottom');
    }

    function handleDrop(e) {
        e.stopPropagation();
        e.preventDefault();

        if (draggedRow !== this) {
            const rect = this.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;

            if (e.clientY < midY) {
                this.parentNode.insertBefore(draggedRow, this);
            } else {
                this.parentNode.insertBefore(draggedRow, this.nextSibling);
            }
        }

        this.classList.remove('drag-over-top', 'drag-over-bottom');
        return false;
    }

    function ensureShortcutPlaceholder(sizeFrom) {
        if (!shortcutPlaceholder) {
            shortcutPlaceholder = document.createElement('div');
            shortcutPlaceholder.className = 'shortcut-placeholder';
        }
        if (sizeFrom) {
            const rect = sizeFrom.getBoundingClientRect();
            shortcutPlaceholder.style.width = `${Math.round(rect.width)}px`;
            shortcutPlaceholder.style.height = `${Math.round(rect.height)}px`;
        }
        return shortcutPlaceholder;
    }

    function clearShortcutPlaceholder() {
        if (shortcutPlaceholder && shortcutPlaceholder.parentNode) {
            shortcutPlaceholder.parentNode.removeChild(shortcutPlaceholder);
        }
    }

    function handleShortcutDragStart(e) {
        draggedShortcutIndex = Number(this.dataset.index);
        isDraggingShortcut = true;
        draggedShortcutEl = this;
        this.classList.add('dragging');
        container.classList.add('dragging-mode');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', 'drag');

        setTimeout(() => {
            const placeholder = ensureShortcutPlaceholder(this);
            if (this.parentNode) {
                this.parentNode.insertBefore(placeholder, this);
            }
            if (draggedShortcutEl) {
                draggedShortcutEl.classList.add('drag-hidden');
            }
        }, 0);
    }

    function handleShortcutDragEnd() {
        this.classList.remove('dragging');
        this.classList.remove('drag-hidden');
        container.classList.remove('dragging-mode');
        container.querySelectorAll('.shortcut-btn.drag-over').forEach((btn) => {
            btn.classList.remove('drag-over');
        });
        draggedShortcutIndex = null;
        draggedShortcutEl = null;
        clearShortcutPlaceholder();
        setTimeout(() => {
            isDraggingShortcut = false;
        }, 0);
    }

    function handleShortcutDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        applyShortcutDrop();
    }

    function getDragAfterElement(container, x, y) {
        const draggableElements = [...container.querySelectorAll('.shortcut-btn:not(.dragging):not(.drag-hidden)')];

        const found = draggableElements.find(child => {
            const box = child.getBoundingClientRect();
            const childMiddleX = box.left + box.width / 2;

            if (y < box.top) return true;

            if (y > box.bottom) return false;

            if (x < childMiddleX) {
                return true;
            }

            return false;
        });

        return found;
    }

    container.addEventListener('dragover', (e) => {
        if (!isDraggingShortcut) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const afterElement = getDragAfterElement(container, e.clientX, e.clientY);
        const placeholder = ensureShortcutPlaceholder(draggedShortcutEl);

        if (afterElement) {
            container.insertBefore(placeholder, afterElement);
        } else {
            container.appendChild(placeholder);
        }
    });

    container.addEventListener('drop', (e) => {
        if (!isDraggingShortcut) return;
        e.preventDefault();
        applyShortcutDrop();
    });

    function applyShortcutDrop() {
        if (draggedShortcutIndex === null) {
            return;
        }
        const items = Array.from(container.children).filter((el) => {
            if (el.classList.contains('shortcut-placeholder')) {
                return true;
            }
            if (!el.classList.contains('shortcut-btn')) {
                return false;
            }
            return !el.classList.contains('drag-hidden');
        });
        const placeholderIndex = items.indexOf(shortcutPlaceholder);
        if (placeholderIndex === -1) {
            clearShortcutPlaceholder();
            return;
        }

        const updated = currentShortcuts.slice();
        const [moved] = updated.splice(draggedShortcutIndex, 1);
        const insertIndex = Math.min(placeholderIndex, updated.length);
        updated.splice(insertIndex, 0, moved);

        chrome.storage.sync.set({ shortcuts: updated }, () => {
            clearShortcutPlaceholder();
            renderButtons(updated);
        });
    }

    addBtn.onclick = () => {
        const currentCount = editList.querySelectorAll('.edit-row').length;
        if (currentCount < MAX_BUTTONS) {
            addEditRow();
            updateAddButtonState();
        }
    };

    editBtn.onclick = () => {
        if (editPanel.classList.contains('hidden')) {
            chrome.storage.sync.get(['shortcuts'], (result) => {
                const shortcuts = result.shortcuts || [];
                renderEditInputs(shortcuts);
                editPanel.classList.remove('hidden');
            });
        } else {
            editPanel.classList.add('hidden');
        }
    };

    saveBtn.onclick = () => {
        const rows = editList.querySelectorAll('.edit-row');
        const newShortcuts = [];

        rows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            const name = inputs[0].value.trim();
            const url = inputs[1].value.trim();
            if (name || url) {
                newShortcuts.push({ name, url });
            }
        });

        chrome.storage.sync.set({ shortcuts: newShortcuts }, () => {
            renderButtons(newShortcuts);
            editPanel.classList.add('hidden');
        });
    };

    cancelBtn.onclick = () => {
        editPanel.classList.add('hidden');
    };
});
