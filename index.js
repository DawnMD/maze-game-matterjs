const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const height = window.innerHeight;
const width = window.innerWidth;
const cellsHorizontal = 10;
const cellsVertical = 10;

const unitLength = width / cellsHorizontal;
const unitHeight = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		wireframes: false,
		width,
		height,
	},
});

Render.run(render);
Runner.run(Runner.create(), engine);

//Walls
const walls = [
	Bodies.rectangle(width / 2, 0, width, 5, { isStatic: true }),
	Bodies.rectangle(width / 2, height, width, 5, { isStatic: true }),
	Bodies.rectangle(0, height / 2, 5, height, { isStatic: true }),
	Bodies.rectangle(width, height / 2, 5, height, { isStatic: true }),
];
World.add(world, walls);

//Maze shuffle func
const shuffle = (arr) => {
	let counter = arr.length;

	while (counter > 0) {
		const index = Math.floor(Math.random() * counter);
		counter--;
		const temp = arr[counter];
		arr[counter] = arr[index];
		arr[index] = temp;
	}
	return arr;
};

const grid = Array(cellsVertical)
	.fill(null)
	.map(() => {
		return Array(cellsHorizontal).fill(false);
	});

const horizontals = Array(cellsVertical - 1)
	.fill(null)
	.map(() => {
		return Array(cellsHorizontal).fill(false);
	});

const verticles = Array(cellsVertical)
	.fill(null)
	.map(() => {
		return Array(cellsHorizontal - 1).fill(false);
	});

//Random start cell
const startRow = Math.floor(Math.random() * cellsVertical);
const startCol = Math.floor(Math.random() * cellsHorizontal);
//grid create fucntion(random)
const recurseIterate = (row, col) => {
	//Checking visited
	if (grid[row][col]) {
		return;
	}
	//Set true if visited
	grid[row][col] = true;
	//Checking neighbours
	//Genrate random neighbours
	const neighbours = shuffle([
		[row - 1, col, "up"],
		[row, col + 1, "right"],
		[row + 1, col, "down"],
		[row, col - 1, "left"],
	]);
	//Check neighbour out of bounds
	for (const neighbour of neighbours) {
		const [nextRow, nextCol, direction] = neighbour;
		//check oob
		if (
			nextRow < 0 ||
			nextRow >= cellsVertical ||
			nextCol < 0 ||
			nextCol >= cellsHorizontal
		) {
			continue;
		}
		//check visited
		if (grid[nextRow][nextCol]) {
			continue;
		}
		//remove wall
		if (direction === "left") {
			verticles[row][col - 1] = true;
		} else if (direction === "right") {
			verticles[row][col] = true;
		} else if (direction === "up") {
			horizontals[row - 1][col] = true;
		} else if (direction === "down") {
			horizontals[row][col] = true;
		}
		recurseIterate(nextRow, nextCol);
	}
};
recurseIterate(startRow, startCol);

//Horizontal boundary
horizontals.forEach((row, rowIndex) => {
	row.forEach((isOpen, colIndex) => {
		if (isOpen) {
			return;
		}

		const wall = Bodies.rectangle(
			colIndex * unitLength + unitLength / 2,
			rowIndex * unitHeight + unitHeight,
			unitLength,
			5,
			{
				label: "wall",
				isStatic: true,
				render: {
					fillStyle: "red",
				},
			}
		);
		World.add(world, wall);
	});
});

//Verticle boundary
verticles.forEach((row, rowIndex) => {
	row.forEach((isOpen, colIndex) => {
		if (isOpen) {
			return;
		}

		const wall = Bodies.rectangle(
			colIndex * unitLength + unitLength,
			rowIndex * unitHeight + unitHeight / 2,
			5,
			unitHeight,
			{
				label: "wall",
				isStatic: true,
				render: {
					fillStyle: "red",
				},
			}
		);
		World.add(world, wall);
	});
});

//Goal
const goal = Bodies.rectangle(
	width - unitLength / 2,
	height - unitHeight / 2,
	unitLength * 0.5,
	unitHeight * 0.5,
	{
		label: "goal",
		isStatic: true,
		render: {
			fillStyle: "green",
		},
	}
);
World.add(world, goal);

//start ball
const ball = Bodies.circle(
	unitLength / 2,
	unitHeight / 2,
	Math.min(unitHeight, unitLength) / 4,
	{
		label: "ball",
	}
);
World.add(world, ball);

//keyboard event
document.addEventListener("keydown", (e) => {
	const { x, y } = ball.velocity;
	if (e.keyCode === 87) {
		Body.setVelocity(ball, { x, y: y - 5 });
	}
	if (e.keyCode === 68) {
		Body.setVelocity(ball, { x: x + 5, y });
	}
	if (e.keyCode === 83) {
		Body.setVelocity(ball, { x, y: y + 5 });
	}
	if (e.keyCode === 65) {
		Body.setVelocity(ball, { x: x - 5, y });
	}
});

//Win event
Events.on(engine, "collisionStart", (event) => {
	event.pairs.forEach((collision) => {
		const labels = ["ball", "goal"];

		if (
			labels.includes(collision.bodyA.label) &&
			labels.includes(collision.bodyB.label)
		) {
			world.gravity.y = 1;
			world.bodies.forEach((segment) => {
				if (segment.label === "wall") {
					Body.setStatic(segment, false);
				}
			});
		}
	});
});
