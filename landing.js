function openModal() {
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function startGame(mode) {
    localStorage.setItem('gameMode', mode);

    if (mode === 'friend') {
        window.location.href = "main.html";
    } else {
        window.location.href = "game.ai.html";
    }
}

// Close modal when clicking outside
window.onclick = function(e) {
    const modal = document.getElementById('modal');
    if (e.target === modal) {
        closeModal();
    }
};