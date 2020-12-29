const {
	Engine,
	Render,
	Runner,
	World,
	Bodies,
	Mouse,
	MouseConstraint,
} = Matter;
const height = 600;
const width = 800;
const engine = Engine.create();
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
World.add(
	world,
	MouseConstraint.create(engine, {
		mouse: Mouse.create(render.canvas),
	})
);
//Walls
const walls = [
	Bodies.rectangle(width / 2, 0, width, 50, { isStatic: true }),
	Bodies.rectangle(width / 2, height, width, 50, { isStatic: true }),
	Bodies.rectangle(0, height / 2, 50, height, { isStatic: true }),
	Bodies.rectangle(width, height / 2, 50, height, { isStatic: true }),
];
World.add(world, walls);
//Random shapes
for (let index = 0; index < 50; index++) {
	if (Math.random() > 0.5) {
		World.add(
			world,
			Bodies.rectangle(Math.random() * width, Math.random() * height, 50, 50)
		);
	} else {
		World.add(
			world,
			Bodies.circle(Math.random() * width, Math.random() * height, 40)
		);
	}
}
