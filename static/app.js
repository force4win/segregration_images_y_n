const state = {
    images: [],
    currentIndex: 0,
    directory: ''
};

const elements = {
    image: document.getElementById('current-image'),
    wrapper: document.getElementById('image-wrapper'),
    countLabel: document.getElementById('progress-label'),
    dirLabel: document.getElementById('directory-label'),
    btnNo: document.getElementById('btn-no'),
    btnSi: document.getElementById('btn-si'),
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
    } catch (err) {
        console.error("Initialization failed:", err);
        alert("Error connecting to backend.");
    }
}

async function refreshImages() {
    elements.spinner.classList.remove('hidden');
    const res = await fetch('/api/images');
    state.images = await res.json();
    state.currentIndex = 0;
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

    const filename = state.images[state.currentIndex];
    elements.image.src = `/file/${encodeURIComponent(filename)}`;
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

    // Optimistic UI update: Wait for animation then move to next, 
    // meanwhile send request in background
    setTimeout(() => {
        state.currentIndex++;
        render(); // Load next image
    }, 300); // Matches CSS animation duration mostly

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

function setupEventListeners() {
    elements.btnNo.addEventListener('click', () => handleDecision('NO'));
    elements.btnSi.addEventListener('click', () => handleDecision('SI'));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') handleDecision('SI');
        if (e.key === 'ArrowLeft') handleDecision('NO');
    });
}

init();
