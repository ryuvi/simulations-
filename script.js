// Definições iniciais
let maxBalls;
let centralMass;
const G = 6.6743e-3; // Constante gravitacional (ajustada para simulação)
const ellipseRadius = 10; // Raio das elipses (para detectar colisões)

// Lista de elipses com suas propriedades
let ellipses = [];
let particles = []; // Lista para armazenar partículas de explosão

// Posições do Sol
let centralX, centralY;

// Função pra checar se saiu da tela
function isOutOfBounds(e) {
	return ((e.x > width || e.x < 0) || (e.y > height || e.y < 0))
}

// Função setup é chamada uma vez no início
function setup() {
	createCanvas(windowWidth, windowHeight);
	centralX = width / 2;
	centralY = height / 2;

	// Inicializar variáveis a partir dos inputs
	updateVariables();

	// Adicionar o Sol no centro
	ellipses.push({
		x: centralX,
		y: centralY,
		color: [60, 100, 100], // Cor do Sol (amarelo)
		mass: centralMass,
		vx: 0,
		vy: 0,
		ax: 0,
		ay: 0,
		orbitalStartTime: 0,
		state: "orbital",
	});

	addEllipse()

	// Adicionar eventos de atualização dos inputs
	document
		.getElementById("bodyNumber")
		.addEventListener("input", updateVariables);
	document
		.getElementById("centralMass")
		.addEventListener("input", updateVariables);

	setInterval(addEllipse, 5000);
}

function addNumber(id) {
	let numberEl = document.getElementById(id);
	numberEl.innerText = parseFloat(numberEl.innerText) + 1;
	updateVariables();
	if (id === "bodyNumber") {
		addEllipse();
	}
}

function subNumber(id) {
	let numberEl = document.getElementById(id);
	if (parseFloat(numberEl.innerText) > 0) {
		let numberToSub = id==='bodyNumber' ? 1 : .1
		console.log(parseFloat(numberEl.innerText) - numberToSub);
		numberEl.innerText = parseFloat(numberEl.innerText) - numberToSub;

		updateVariables();
		if (id === "bodyNumber") {
			ellipses.pop();
		}
	}
}

// Função para atualizar as variáveis com base nos inputs do usuário
function updateVariables() {
	maxBalls = parseInt(document.getElementById("bodyNumber").innerText);
	centralMass =
		parseFloat(document.getElementById("centralMass").innerText) * 1e5;

	// Atualiza a massa do Sol (primeira elipse na lista)
	if (ellipses.length > 0) {
		ellipses[0].mass = centralMass;
	}
}

// Função para gerar um número aleatório
function randomNumber(refNumber) {
	return Math.floor(Math.random() * refNumber);
}

// Função para gerar uma cor aleatória
function generateColor() {
	let h = randomNumber(360);
	let s = randomNumber(100);
	let l = randomNumber(100);
	return [h, s, l];
}

// Função para adicionar uma nova elipse com propriedades aleatórias (planeta)
function addEllipse() {
	console.log(ellipses.length)
	if (ellipses.length < maxBalls) {
		let angle = randomNumber(360) + 15;
		let distance = randomNumber(150) + 50;
		let x = centralX + distance * cos(radians(angle));
		let y = centralY + distance * sin(radians(angle));
		let mass = randomNumber(1e5) + 10; // Evita massa 0
		if (ellipses.length === 1)
			mass = 10

		// Calcular a velocidade orbital inicial
		let r = distance;
		let velocity = sqrt((G * centralMass) / r);

		// Determinar a direção da velocidade (perpendicular ao vetor posição)
		let anglePerpendicular = angle + 90;
		let isOrbital = document.getElementById("forceOrbital").checked;
		let vx = randomNumber(2) + 1;
		let vy = randomNumber(2) + 1;
		if (isOrbital) {
			vx = velocity * cos(radians(anglePerpendicular));
			vy = velocity * sin(radians(anglePerpendicular));
		}

		// Adiciona a nova elipse (planeta) com a velocidade calculada
		ellipses.push({
			x: x,
			y: y,
			color: generateColor(),
			mass: mass,
			vx: vx,
			vy: vy,
			ax: 0,
			ay: 0,
			orbitalStartTime: millis(), // Armazena o tempo de criação
			state: "orbital", // Define o estado inicial como orbital
		});
	}
}

// Função para criar partículas de explosão
function createExplosion(x, y) {
	for (let i = 0; i < 20; i++) {
		// Criar várias partículas
		particles.push({
			x: x,
			y: y,
			vx: random(-2, 2),
			vy: random(-2, 2),
			color: [random(0, 50), 100, 100],
			life: 100, // Duração das partículas
		});
	}
}

// Função draw é chamada continuamente em loop
function draw() {
	colorMode(RGB, 255);
	fill(255, 255, 255, 50); // Branco semitransparente para rastro
	rect(0, 0, width, height); // Desenha o retângulo de rastro

	colorMode(HSB, 360, 100, 100);

	let toRemove = [];

	for (let i = ellipses.length - 1; i >= 0; i--) {
		// Começa do final para evitar problemas de índice ao remover
		let e1 = ellipses[i];
		e1.ax = 0;
		e1.ay = 0;

		let timeInState = millis() - e1.orbitalStartTime;
		if (timeInState > 3000 && e1.state === "orbital") {
			e1.state = "gravitational";
		}

		for (let j = i - 1; j >= 0; j--) {
			// Verifica apenas pares únicos
			let e2 = ellipses[j];

			let dx = e2.x - e1.x;
			let dy = e2.y - e1.y;
			let r = sqrt(dx * dx + dy * dy);

			// Detecção de colisão
			if (r <= 2 * ellipseRadius) {
				// Cria explosão para ambas as elipses
				createExplosion(e1.x, e1.y);
				createExplosion(e2.x, e2.y);

				// Marcar para remoção após a iteração
				toRemove.push(i);
				toRemove.push(j);

				break; // Sai do loop para evitar problemas de índice
			}
		}

		if (isOutOfBounds(e1))
			toRemove.push(i)

		// Calcular forças gravitacionais e atualizar movimento
		for (let j = 0; j < ellipses.length; j++) {
			if (i !== j) {
				let e2 = ellipses[j];
				let dx = e2.x - e1.x;
				let dy = e2.y - e1.y;
				let r = sqrt(dx * dx + dy * dy);

				// Aplicar força de gravidade
				if (e1.state === "orbital") {
					let velocity = sqrt((G * centralMass) / r);
					let anglePerpendicular = atan2(dy, dx) + HALF_PI;
					e1.vx = velocity * cos(anglePerpendicular);
					e1.vy = velocity * sin(anglePerpendicular);
				} else {
					let F = (G * e1.mass * e2.mass) / (r * r);
					e1.ax += (F / e1.mass) * (dx / r);
					e1.ay += (F / e1.mass) * (dy / r);
				}
			}
		}

		// Atualizar velocidade e posição com base na aceleração
		e1.vx += e1.ax;
		e1.vy += e1.ay;
		e1.x += e1.vx;
		e1.y += e1.vy;
	}

	// Remover as elipses marcadas para remoção após a iteração
	for (let i = toRemove.length - 1; i >= 0; i--) {
		let index = toRemove[i];
		ellipses.splice(index, 1);
	}


	ellipses[0].vx =0
	ellipses[0].vy =0
	ellipses[0].x = centralX
	ellipses[0].y = centralY



	// Remover partículas antigas
	particles = particles.filter((p) => p.life > 0);

	// Atualizar e desenhar partículas de explosão
	for (let p of particles) {
		p.x += p.vx;
		p.y += p.vy;
		p.life -= 2;

		fill(p.color);
		ellipse(p.x, p.y, 5, 5);
	}

	// Desenhar as elipses
	for (let i = 0; i < ellipses.length; i++) {
		let e = ellipses[i];
		fill(e.color);
		ellipse(e.x, e.y, 2 * ellipseRadius, 2 * ellipseRadius);
	}
}



// Função para redimensionar o canvas quando a janela for redimensionada
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	centralX = width / 2;
	centralY = height / 2;

	// Atualiza a posição do Sol
	if (ellipses.length > 0) {
		ellipses[0].x = centralX;
		ellipses[0].y = centralY;
	}
}
