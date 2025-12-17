const state = {
    images: [],
    currentIndex: 0,
    directory: '',
    history: [] // Stack to reuse undo actions: { filename, decision }
};

const elements = {
    image: document.getElementById('current-image'),
    wrapper: document.getElementById('image-wrapper'),
    countLabel: document.getElementById('progress-label'),
    dirLabel: document.getElementById('directory-label'),
    btnNo: document.getElementById('btn-no'),
    btnSi: document.getElementById('btn-si'),
    btnUndo: document.getElementById('btn-undo'),
    spinner: document.getElementById('spinner'),
    emptyState: document.getElementById('empty-state')
};

async function init() {
    try {
        // Get Config
        const configRes = await fetch('/api/config');
        const config = await configRes.json();
        state.directory = config.directory;
        elements.dirLabel.textContent = `Carpeta: ${state.directory}`;

        // Get Images
        await refreshImages();

        setupEventListeners();
        updateUndoButton();
    } catch (err) {
        console.error("Initialization failed:", err);
        alert("Error connecting to backend.");
    }
}

async function refreshImages() {
    elements.spinner.classList.remove('hidden');
    const res = await fetch('/api/images');
    state.images = await res.json();

    // If we have history, we need to respect the current index based on length
    // Actually, simplest strategy for this app:
    // If we refresh, we might lose track if external changes happen.
    // But assuming the user is the only one operating, state.currentIndex is truthy.

    elements.spinner.classList.add('hidden');
    render();
}

function render() {
    if (state.currentIndex >= state.images.length) {
        // Finished
        elements.image.classList.add('hidden');
        elements.emptyState.classList.remove('hidden');
        elements.countLabel.textContent = `${state.images.length} / ${state.images.length}`;
        return;
    }

    elements.emptyState.classList.add('hidden');
    const filename = state.images[state.currentIndex];
    elements.image.src = `/file/${encodeURIComponent(filename)}?t=${Date.now()}`; // Add timestamp to force reload if needed
    elements.image.onload = () => {
        elements.image.classList.remove('hidden');
        elements.wrapper.classList.remove('animate-left', 'animate-right');
    };

    // Reset animation classes for the next frame
    elements.wrapper.classList.remove('animate-left', 'animate-right');

    elements.countLabel.textContent = `${state.currentIndex + 1} / ${state.images.length}`;
}

async function handleDecision(decision) {
    if (state.currentIndex >= state.images.length) return;

    const filename = state.images[state.currentIndex];

    // Animation
    if (decision === 'SI') {
        elements.wrapper.classList.add('animate-right');
    } else {
        elements.wrapper.classList.add('animate-left');
    }

    // Add to history
    state.history.push({ filename, decision });
    updateUndoButton();

    // Optimistic UI update
    setTimeout(() => {
        state.currentIndex++;
        render(); // Load next image
    }, 300);

    try {
        await fetch('/api/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, decision })
        });
    } catch (err) {
        console.error("Move failed:", err);
        alert("Error al mover la imagen. Revisa la consola.");
    }
}

async function handleUndo() {
    if (state.history.length === 0) return;

    const lastAction = state.history.pop();
    updateUndoButton();

    // Decrement index immediately to show "processing" state or just the old image
    if (state.currentIndex > 0) {
        state.currentIndex--;
    }

    try {
        const res = await fetch('/api/undo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filename: lastAction.filename,
                previous_decision: lastAction.decision
            })
        });

        if (!res.ok) {
            throw new Error(await res.text());
        }

        // Re-render the restored image
        render();

    } catch (err) {
        console.error("Undo failed:", err);
        alert("Error al deshacer. La imagen podría haberse perdido o movido manualmente.");
        // Put it back in history just in case? Or refresh all.
        // Let's reload everything to be safe.
        window.location.reload();
    }
}

function updateUndoButton() {
    elements.btnUndo.disabled = state.history.length === 0;
    elements.btnUndo.style.opacity = state.history.length === 0 ? '0.5' : '1';
}

function setupEventListeners() {
    elements.btnNo.addEventListener('click', () => handleDecision('NO'));
    elements.btnSi.addEventListener('click', () => handleDecision('SI'));
    elements.btnUndo.addEventListener('click', () => handleUndo());

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') handleDecision('SI');
        if (e.key === 'ArrowLeft') handleDecision('NO');
        if (e.key === 'ArrowDown') handleUndo();
    });
}

init();
