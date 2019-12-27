let myModal;
let canvas;
let context;

const fps = 30;
const mspf = 1000 / fps;

function showModal() {
    myModal.style.display = 'block';
}

let updateHandler;

function closeModal() {
    myModal.style.display = 'none';
    lastTime = Date.now();
    updateHandler = setInterval(() => {updatePhysics(); updateDraw(); }, mspf);
}

function resizeCanvas() {
	canvas.width = window.innerWidth*0.95;
	canvas.height = window.innerHeight*0.95;
}

function clearCanvas() {
	context.clearRect(0, 0, canvas.width, canvas.height);
}

let world;
let engine;
let ball;
let bounds;

function physicsInit() {
	world = Matter.World.create();
	world.gravity.scale = 0;
	engine = Matter.Engine.create();
	engine.world = world;
	console.log('physics init');

	// ball
	let radius = 0.02 * canvas.width;
	ball = Matter.Bodies.circle(0.5*canvas.width, 0.5*canvas.height, radius, {
		mass: 1.0
	});
	Matter.World.addBody(world, ball);
	ball.collisionFilter.group = 1;

	// bounds
	let bold = 0.01*canvas.width;
	let rect1 = Matter.Bodies.rectangle(0.01*canvas.width, 0.01*canvas.height, bold, 0.33*canvas.height)
	let rect2 = Matter.Bodies.rectangle(0.01*canvas.width, 0.66*canvas.height, bold, 0.33*canvas.height);
	let rect3 = Matter.Bodies.rectangle(0.01*canvas.width, 0.01*canvas.height, 0.98*canvas.width, bold);
	let rect4 = Matter.Bodies.rectangle(0.98*canvas.width, 0.01*canvas.height, bold, 0.33*canvas.height);
	let rect5 = Matter.Bodies.rectangle(0.98*canvas.width, 0.66*canvas.height, bold, 0.33*canvas.height);
	let rect6 = Matter.Bodies.rectangle(0.01*canvas.width, 0.98*canvas.height, 0.98*canvas.width, bold);
	let bounds = [rect1, rect2, rect3, rect4, rect5, rect6];
	bounds.forEach(r=>{
		Matter.Body.setStatic(r);
		Matter.World.addBody(world, r);
		r.collisionFilter.group = 1;
		console.log(r)
	});

	Matter.Body.applyForce(ball, ball.position, Matter.Vector.create(0.0015, 0.0015));
}

let lastTime;
function updatePhysics() {
	let deltaMillis = Date.now() - lastTime;
	Matter.Engine.update(engine, deltaMillis);
}

function initialDraw() {
    // Draw background
    context.strokeStyle = 'rgb(0, 0, 0)';
    context.fillStyle = 'rgb(0, 0, 0)';
    let bold = 0.01*canvas.width;
    context.fillRect(0.01*canvas.width, 0.01*canvas.height, bold, 0.33*canvas.height);
    context.fillRect(0.01*canvas.width, 0.66*canvas.height, bold, 0.33*canvas.height);
    context.fillRect(0.01*canvas.width, 0.01*canvas.height, 0.98*canvas.width, bold);
    context.fillRect(0.98*canvas.width, 0.01*canvas.height, bold, 0.33*canvas.height);
    context.fillRect(0.98*canvas.width, 0.66*canvas.height, bold, 0.33*canvas.height);
    context.fillRect(0.01*canvas.width, 0.98*canvas.height, 0.98*canvas.width, bold);
}

function drawBall() {
	let radius = 0.02 * canvas.width;
	context.beginPath();
	context.strokeStyle = 'rgb(255, 50, 50)';
	context.fillStyle = 'rgb(255, 50, 50)';
	context.arc(ball.position.x, ball.position.y, radius, 0, 2*Math.PI);
	context.fill();
	context.closePath();
	console.log(ball.position);
}

function updateDraw() {
	clearCanvas();
	initialDraw();
	drawBall();
}


window.onload = () => {
    myModal = document.getElementById('myModal');
    canvas = document.getElementById('gameCanvas');
    context = canvas.getContext('2d');

    /*window.addEventListener('resize', () => {
    	resizeCanvas();
    	updateDraw();
    }, false);*/
    resizeCanvas();
    physicsInit();
    updateDraw();
    showModal();
}
