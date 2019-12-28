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
    const rect = canvas.getBoundingClientRect();
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
let player2; // AI Player

function physicsInit() {
	world = Matter.World.create();
	world.gravity.scale = 0;
	engine = Matter.Engine.create();
	engine.world = world;
	console.log('physics init');

	// ball
	const radius = 0.02 * canvas.width;
	ball = Matter.Bodies.circle(0.5*canvas.width, 0.5*canvas.height, radius, {
		mass: 1,
        friction: 0,
        restitution: 1
	});
	Matter.World.addBody(world, ball);
    ball.collisionFilter.group = 1;
    Matter.Body.applyForce(ball, ball.position, Matter.Vector.create(0.0005, 0.0005));

	// bounds
	const bold = 0.05*canvas.width;
	const rect1 = Matter.Bodies.rectangle(bold/2, 0.165*canvas.height, bold, 0.33*canvas.height)
	const rect2 = Matter.Bodies.rectangle(bold/2, 0.825*canvas.height, bold, 0.33*canvas.height);
	const rect3 = Matter.Bodies.rectangle(0.50*canvas.width, bold/2, canvas.width, bold);
	const rect4 = Matter.Bodies.rectangle(canvas.width - bold/2, 0.165*canvas.height, bold, 0.33*canvas.height);
	const rect5 = Matter.Bodies.rectangle(canvas.width - bold/2, 0.825*canvas.height, bold, 0.33*canvas.height);
	const rect6 = Matter.Bodies.rectangle(0.50*canvas.width, canvas.height - bold/2, canvas.width, bold);
	const bounds = [rect1, rect2, rect3, rect4, rect5, rect6];
	bounds.forEach(r=>{
        Matter.Body.setStatic(r, true);
		r.collisionFilter.group = 1;
        r.slop = 0.01;
        Matter.World.addBody(world, r);
        console.log(r);
	});

    // player
    mouseInstance = Matter.Mouse.create(canvas);
    const playerradius = 0.025 * canvas.width;
    player1 = Matter.Bodies.circle(0.25*canvas.width, 0.5*canvas.height, playerradius, {
        mass: 1,
        friction: 1,
        frictionAir: 1,
        restitution: 1
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

	// player 2
    player2 = Matter.Bodies.circle(0.75*canvas.width, 0.5*canvas.height, playerradius, {
        mass: 1,
        restitution: 1
    });
    player2.collisionFilter.group = 1;
    Matter.World.addBody(world, player2);
    //Matter.Body.applyForce(player2, player2.position, Matter.Vector.create(0.0001, 0));
}

let lastTime;
function updatePhysics() {
	const deltaMillis = Date.now() - lastTime;
    restrictPlayerMove();
    aiMove();
	Matter.Engine.update(engine, deltaMillis);
}

function restrictPlayerMove() {
    if (player1.position.x > canvas.width / 2) {
        Matter.Body.setPosition(player1, {x: canvas.width / 2 - 1, y: player1.position.y})
    }
}

function aiMove() {
    const Vec = Matter.Vector;
    const maxVel = 25;
    if (ball.position.x < canvas.width / 2) {
        const myX = 0.8 * canvas.width;
        const tc = Math.abs((myX - ball.position.x) / ball.velocity.x);
        const expectY = ball.position.y + ball.velocity.y * tc;
        let aiPlan = Vec.create((myX - player2.position.x) / tc, (expectY - player2.position.y) / tc);
        aiPlan = Vec.mult(Vec.div(aiPlan, Vec.magnitude(aiPlan)), Math.min(Vec.magnitude(aiPlan), maxVel));
        Matter.Body.setVelocity(player2, aiPlan);
    } else {
        const ballTarget = Vec.add(ball.position, Vec.create(0.04*canvas.width, 0));
        const rv = Vec.sub(ball.velocity, player2.velocity);
        const rp = Vec.sub(ballTarget, player2.position);
        const tc = Vec.magnitude(rp) / Vec.magnitude(rv);
        if (!Number.isFinite(tc)) return;

        const target = Vec.add(ballTarget, Vec.mult(ball.velocity, tc));
        const targetVel = Vec.sub(target, player2.position);
        let aiPlan = Vec.div(targetVel, tc);
        aiPlan = Vec.mult(Vec.div(aiPlan, Vec.magnitude(aiPlan)), Math.min(Vec.magnitude(aiPlan), maxVel));
        Matter.Body.setVelocity(player2, aiPlan);
    }
}

function initialDraw() {
    // Draw background
    context.strokeStyle = 'rgb(0, 0, 0)';
    context.fillStyle = 'rgb(0, 0, 0)';
    const bold = 0.05*canvas.width;
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
    const radius = 0.025 * canvas.width;
    // player 1
    context.beginPath();
    context.strokeStyle = 'rgb(50, 50, 255)';
    context.fillStyle = 'rgba(50, 50, 255, 0.5)';
    context.arc(player1.position.x, player1.position.y, radius, 0, 2*Math.PI);
    context.fill();
    context.closePath();

    //player 2
    context.beginPath();
    context.strokeStyle = 'rgb(50, 255, 50)';
    context.fillStyle = 'rgba(50, 255, 50, 0.5)';
    context.arc(player2.position.x, player2.position.y, radius, 0, 2*Math.PI);
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
