let myModal;
let canvas;
let context;

function showModal() {
    myModal.style.display = 'block';
}

function closeModal() {
    myModal.style.display = 'none';
}

let wwidth = () => { return window.innerWidth; }
let wheight = () => { return window.innerHeight; }

function initialDraw() {
    // Draw background
    context.
}

window.onload = () => {
    myModal = document.getElementById('myModal');
    canvas = document.getElementById('gameCanvas');
    context = canvas.getContext('2d');
    showModal();
}
