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
    //canvas.addEventListener('mousemove', updatePlayerPos, false);
}

function resizeCanvas() {
	canvas.width = window.innerWidth*0.95;
	canvas.height = window.innerHeight*0.95;
}

function clearCanvas() {
	context.clearRect(0, 0, canvas.width, canvas.height);
}

/* from https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas */
function getMousePos(evt) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

let world;
let engine;
let ball;
let bounds;
let mouseInstance;
let player1;
let player1mouse;

function physicsInit() {
	world = Matter.World.create();
	world.gravity.scale = 0;
	engine = Matter.Engine.create();
	engine.world = world;
	console.log('physics init');

	// ball
	let radius = 0.02 * canvas.width;
	ball = Matter.Bodies.circle(0.5*canvas.width, 0.5*canvas.height, radius, {
		mass: 1,
        friction: 0,
        restitution: 1
	});
	Matter.World.addBody(world, ball);
	ball.collisionFilter.group = 1;

	// bounds
	let bold = 0.05*canvas.width;
	let rect1 = Matter.Bodies.rectangle(bold/2, 0.165*canvas.height, bold, 0.33*canvas.height)
	let rect2 = Matter.Bodies.rectangle(bold/2, 0.825*canvas.height, bold, 0.33*canvas.height);
	let rect3 = Matter.Bodies.rectangle(0.50*canvas.width, bold/2, canvas.width, bold);
	let rect4 = Matter.Bodies.rectangle(canvas.width - bold/2, 0.165*canvas.height, bold, 0.33*canvas.height);
	let rect5 = Matter.Bodies.rectangle(canvas.width - bold/2, 0.825*canvas.height, bold, 0.33*canvas.height);
	let rect6 = Matter.Bodies.rectangle(0.50*canvas.width, canvas.height - bold/2, canvas.width, bold);
	let bounds = [rect1, rect2, rect3, rect4, rect5, rect6];
	bounds.forEach(r=>{
        Matter.Body.setStatic(r, true);
		r.collisionFilter.group = 1;
        r.slop = 0.01;
        Matter.World.addBody(world, r);
        console.log(r);
	});

    // player
    mouseInstance = Matter.Mouse.create(canvas);
    let playerradius = 0.025 * canvas.width;
    player1 = Matter.Bodies.circle(0.25*canvas.width, 0.5*canvas.height, playerradius, {
        mass: 1,
        friction: 1,
        frictionAir: 1,
        restitution: 1,
    });
    player1.collisionFilter.group = 1;
    player1mouse = Matter.MouseConstraint.create(engine, {
        mouse: mouseInstance,
        constraint: {
            stiffness: 0.2
        },
        collisionFilter: {
            group: 1
        }
    })
    Matter.World.addBody(world, player1);
    Matter.World.add(world, player1mouse);

	//Matter.Body.applyForce(ball, ball.position, Matter.Vector.create(0.0075, 0.0075));
}

let lastTime;
function updatePhysics() {
	let deltaMillis = Date.now() - lastTime;
    restrictPlayerMove();
	Matter.Engine.update(engine, deltaMillis);
}

function restrictPlayerMove() {
    if (player1.position.x > canvas.width / 2) {
        Matter.Body.setPosition(player1, {x: canvas.width / 2 - 1, y: player1.position.y})
    }
}

function initialDraw() {
    // Draw background
    context.strokeStyle = 'rgb(0, 0, 0)';
    context.fillStyle = 'rgb(0, 0, 0)';
    let bold = 0.05*canvas.width;
    context.fillRect(0, 0, bold, 0.33*canvas.height);
    context.fillRect(0, 0.66*canvas.height, bold, 0.33*canvas.height);
    context.fillRect(0, 0, canvas.width, bold);
    context.fillRect(canvas.width-bold, 0, bold, 0.33*canvas.height);
    context.fillRect(canvas.width-bold, 0.66*canvas.height, bold, 0.33*canvas.height);
    context.fillRect(0, canvas.height-bold, canvas.width, bold);
    context.fillRect(canvas.width*0.495, 0, canvas.width*0.005, canvas.height);
}

function drawBall() {
	let radius = 0.02 * canvas.width;
	context.beginPath();
	context.strokeStyle = 'rgb(255, 50, 50)';
	context.fillStyle = 'rgb(255, 50, 50)';
	context.arc(ball.position.x, ball.position.y, radius, 0, 2*Math.PI);
	context.fill();
	context.closePath();
}

function drawPlayer() {
    let radius = 0.025 * canvas.width;
    context.beginPath();
    context.strokeStyle = 'rgb(50, 50, 255)';
    context.fillStyle = 'rgba(50, 50, 255, 0.5)';
    context.arc(player1.position.x, player1.position.y, radius, 0, 2*Math.PI);
    context.fill();
    context.closePath();
}

function updateDraw() {
	clearCanvas();
	initialDraw();
	drawBall();
    drawPlayer();
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
