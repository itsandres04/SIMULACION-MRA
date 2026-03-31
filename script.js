const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const g1 = document.getElementById("graph1").getContext("2d");
const g2 = document.getElementById("graph2").getContext("2d");
const g3 = document.getElementById("graph3").getContext("2d");

let dt = 0.03;

// 🟢 EDIFICIO CON AMORTIGUADOR
let x_damped = 0, v_damped = 0;

// 🔴 EDIFICIO SIN AMORTIGUADOR
let x_free = 0, v_free = 0;

let pos1 = [], pos2 = [];
let vel1 = [], vel2 = [];
let kinE = [], potE = [];

function getValues() {
    let m = parseFloat(document.getElementById("m").value);
    let k = parseFloat(document.getElementById("k").value);
    let c = parseFloat(document.getElementById("c").value);

    document.getElementById("mVal").innerText = m;
    document.getElementById("kVal").innerText = k;
    document.getElementById("cVal").innerText = c;

    return { m, k, c };
}

function update() {
    let { m, k, c } = getValues();

    let t = Date.now() / 1000;
    let F = 30 * Math.sin(2 * t) + 10 * Math.sin(5 * t);

    // 🟢 CON AMORTIGUADOR
    let a1 = (F - c * v_damped - k * x_damped) / m;
    v_damped += a1 * dt;
    x_damped += v_damped * dt;

    // 🔴 SIN AMORTIGUADOR
    let a2 = (F - k * x_free) / m;
    v_free += a2 * dt;
    x_free += v_free * dt;

    // energía (solo sistema amortiguado)
    let kinetic = 0.5 * m * v_damped * v_damped;
    let potential = 0.5 * k * x_damped * x_damped;

    pos1.push(x_damped);
    pos2.push(x_free);
    vel1.push(v_damped);
    vel2.push(v_free);
    kinE.push(kinetic);
    potE.push(potential);

    if (pos1.length > 200) {
        pos1.shift(); pos2.shift();
        vel1.shift(); vel2.shift();
        kinE.shift(); potE.shift();
    }
}

function drawSingleBuilding(x, baseY, color, label) {
    // cuerpo
    ctx.fillStyle = color;
    ctx.fillRect(x - 20, baseY - 120, 40, 120);

    // ventanas
    ctx.fillStyle = "#38bdf8";
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(x - 12, baseY - 110 + i * 20, 8, 8);
        ctx.fillRect(x + 4, baseY - 110 + i * 20, 8, 8);
    }

    // etiqueta
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText(label, x - 50, baseY + 40);
}

function drawBuilding() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let baseY = 260;

    let posX1 = 150 + x_damped * 20;
    let posX2 = 300 + x_free * 20;

    // base
    ctx.fillStyle = "#475569";
    ctx.fillRect(80, baseY, 340, 25);

    // 🟢 edificio amortiguado
    drawSingleBuilding(posX1, baseY, "#22c55e", "Con amortiguador");

    // 🔴 edificio sin amortiguador
    drawSingleBuilding(posX2, baseY, "#ef4444", "Sin amortiguador");
}

function drawGraph(ctx, data1, data2, label) {
    let w = ctx.canvas.width;
    let h = ctx.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // curva verde
    ctx.beginPath();
    for (let i = 0; i < data1.length; i++) {
        let x = i * 2;
        let y = h / 2 - data1[i] * 4;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#22c55e";
    ctx.stroke();

    // curva roja
    ctx.beginPath();
    for (let i = 0; i < data2.length; i++) {
        let x = i * 2;
        let y = h / 2 - data2[i] * 4;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#ef4444";
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.fillText(label, 10, 15);
}

function drawEnergyGraph() {
    let ctx = g3;
    let h = ctx.canvas.height;

    ctx.clearRect(0, 0, ctx.canvas.width, h);

    ctx.beginPath();
    for (let i = 0; i < kinE.length; i++) {
        let x = i * 2;
        let y = h - kinE[i] * 0.1;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#3b82f6";
    ctx.stroke();
}

function resetSim() {
    x_damped = x_free = 0;
    v_damped = v_free = 0;
    pos1 = []; pos2 = [];
    vel1 = []; vel2 = [];
    kinE = []; potE = [];
}

function loop() {
    update();
    drawBuilding();

    drawGraph(g1, pos1, pos2, "Desplazamiento");
    drawGraph(g2, vel1, vel2, "Velocidad");
    drawEnergyGraph();

    requestAnimationFrame(loop);
}

loop();