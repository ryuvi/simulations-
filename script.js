let numBodies; // Número de corpos (elipses)
let bodySize;
let bodies = []; // Array para armazenar as propriedades dos corpos orbitantes
let angle = 0; // Ângulo para calcular a órbita
const k = 0.5; // Constante que controla a relação entre a distância e a velocidade, aumentada para tornar as órbitas mais rápidas
const v = 3;

function setup() {
	createCanvas(windowWidth, windowHeight); // Cria uma tela com o tamanho total da janela
	noStroke(); // Remove o contorno das elipses

	// Pega o número de corpos do span
	numBodies = int(document.getElementById("bodyNumber").innerText);
	bodySize = int(document.getElementById("bodySize").innerText);

	// Cria os corpos iniciais com propriedades aleatórias
	createBodies(numBodies);
}

function draw() {
	background(255); // Define o fundo da tela como branco (cor 255)

	// Desenha o sol no centro da tela com 50x50 pixels
	fill(255, 255, 0); // Cor amarela para o sol
	ellipse(width / 2, height / 2, 50, 50); // Elipse no centro da tela com 50 de largura e altura

	// Desenha os corpos orbitando o sol
	for (let i = 0; i < bodies.length; i++) {
		let body = bodies[i]; // Pega o objeto correspondente ao corpo
		let prevX = width / 2 + cos(body.angle) * body.distance; // Posição anterior X
		let prevY = height / 2 + sin(body.angle) * body.distance; // Posição anterior Y

		body.angle += body.speed; // Atualiza o ângulo do corpo com base na sua velocidade
		let x = width / 2 + cos(body.angle) * body.distance; // Nova posição X
		let y = height / 2 + sin(body.angle) * body.distance; // Nova posição Y

		// Desenha o rastro (linha) entre a posição anterior e a nova posição
		fill(body.color); // Cor da bolinha (cor aleatória gerada)
		ellipse(x, y, bodySize, bodySize); // Corpo (elipse) orbitando o sol

		// Desenha o rastro
		body.trail.push({ x: prevX, y: prevY }); // Armazena a posição anterior

		// Desenha o rastro até o limite de 50 pontos
		for (let j = 0; j < body.trail.length; j++) {
			let t = body.trail[j];
			stroke(
				body.color.levels[0],
				body.color.levels[1],
				body.color.levels[2],
				map(j, 0, body.trail.length, 50, 255)
			); // Cor do rastro com transparência
			line(
				t.x,
				t.y,
				body.trail[j + 1]?.x || x,
				body.trail[j + 1]?.y || y
			); // Conecta o ponto anterior ao atual
		}

		// Limita o rastro para não acumular demais
		if (body.trail.length > 50) {
			body.trail.shift(); // Remove o primeiro ponto do rastro
		}
	}
}

function createBodies(num) {
	// Cria um número inicial de corpos
	for (let i = 0; i < num; i++) {
		let distance = uniqueDistance(); // Garante que a distância seja única
		let speed = (k / distance) * v; // Aumentando a velocidade multiplicando por 100 para um movimento mais visível

		// Adiciona um objeto para cada corpo, incluindo a posição anterior e a cor aleatória
		bodies.push({
			distance: distance,
			speed: speed, // A velocidade agora depende da distância
			angle: random(TWO_PI), // Ângulo aleatório inicial
			trail: [], // Array para armazenar as posições do rastro
			color: randomColor(), // Cor aleatória para cada bolinha
		});
	}
}

function addNumber(id) {
	if (id === "bodyNumber") {
		// Incrementa o número de corpos e atualiza o valor exibido
		let bodyCount = document.getElementById(id);
		bodyCount.innerText = parseInt(bodyCount.innerText) + 1;

		// Atualiza o número de corpos e adiciona um novo corpo à simulação
		numBodies = parseInt(bodyCount.innerText);

		// Adiciona um corpo novo à lista de corpos existentes
		let distance = uniqueDistance(); // Garante que a distância seja única
		let speed = (k / distance) * v; // Aumentando a velocidade multiplicando por 100 para um movimento mais visível

		bodies.push({
			distance: distance,
			speed: speed, // A velocidade agora depende da distância
			angle: random(TWO_PI), // Ângulo aleatório inicial
			trail: [], // Array para armazenar as posições do rastro
			color: randomColor(), // Cor aleatória para cada bolinha
		});
	} else if (id === "bodySize") {
		let bodyS = document.getElementById(id);
		bodyS.innerText = parseInt(bodyS.innerText) + 1;

		bodySize = parseInt(bodyS.innerText);
	}
}

function subNumber(id) {
	if (id === "bodyNumber") {
		// Decrementa o número de corpos e atualiza o valor exibido
		let bodyCount = document.getElementById(id);
		let newCount = parseInt(bodyCount.innerText) - 1;

		if (newCount > 0) {
			bodyCount.innerText = newCount;

			// Atualiza o número de corpos e remove o último corpo da simulação
			numBodies = newCount;
			bodies.pop(); // Remove o último corpo do array
		}
	} else if (id === "bodySize") {
		let bodyS = document.getElementById(id);
		bodyS.innerText = parseInt(bodyS.innerText) - 1;

		bodySize = parseInt(bodyS.innerText);
	}
}

// Função para redimensionar o canvas quando a janela for redimensionada
function windowResized() {
	resizeCanvas(windowWidth, windowHeight); // Ajusta o tamanho do canvas para o tamanho da janela
}

// Função para gerar uma cor aleatória
function randomColor() {
	// Gera uma cor RGB aleatória
	return color(random(255), random(255), random(255));
}

// Função para garantir que cada distância seja única
function uniqueDistance() {
	let distance;
	let unique = false;
	let attempts = 0; // Contador para o número de tentativas
	const maxAttempts = 50; // Limite máximo de tentativas para encontrar uma distância única

	// Continua gerando uma nova distância até encontrar uma que seja única ou até atingir o limite de tentativas
	while (!unique && attempts < maxAttempts) {
		distance = random(50, 300); // Distância aleatória do sol (de 50 a 300)
		unique = true; // Assume que a distância é única, a menos que uma duplicata seja encontrada

		// Verifica se a distância já foi usada
		for (let i = 0; i < bodies.length; i++) {
			// Verifica se a distância é próxima de qualquer corpo existente
			if (abs(bodies[i].distance - distance) < 10) {
				unique = false;
				break; // Sai do loop, pois já existe uma distância próxima
			}
		}

		attempts++; // Incrementa o número de tentativas
	}

	// Se o limite de tentativas for atingido e não encontrar uma distância única, aceita a última distância gerada
	if (attempts === maxAttempts) {
		console.log(
			"Limite de tentativas atingido, aceitando a última distância gerada."
		);
	}

	return distance; // Retorna a distância única (ou a última gerada após o limite de tentativas)
}
