const input = document.getElementsByClassName('input')[0];
const makeShapeBtn = document.getElementById('shape');
const invertBtn = document.getElementById('invert');

const ctx = document.getElementById("canvas").getContext("2d");
const center = { x: ctx.canvas.width / 2, y: ctx.canvas.height / 2 };
const rotate = - Math.PI / 2;
const TAU = Math.PI * 2;
const radius = center.y * 0.8;

const shapes = [];

const createShape = (sides) => {
    const shape = [];
    let i = sides;
    while (i-- > 0) {
        const ang = (i / sides) * TAU;
        shape.push({ x: Math.cos(ang) * radius, y: Math.sin(ang) * radius });
    }

    return shape;
};

const pathShape = (sides, points) => {
    const path = new Path2D();
    let i = sides, j, p1, p2;
    while (i-- > 0) {
        j = i;
        p1 = points[i];
        while (j-- > 0) {
            p2 = points[j];
            path.moveTo(p1.x, p1.y);
            path.lineTo(p2.x, p2.y);
        }
    }

    return path;
};

const drawShape = (ctx, path, pos, rotate) => {
    ctx.setTransform(1, 0, 0, 1, pos.x, pos.y);
    ctx.rotate(rotate);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke(path);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
};

const clearCanvas = _ => {
    ctx.fillStyle = "#181A1B";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const updateShapes = _ => {
    const sides = input.value;

    if (!shapes[sides]) shapes[sides] = pathShape(sides, createShape(sides));
    clearCanvas();
    drawShape(ctx, shapes[sides], center, rotate);
};

makeShapeBtn.addEventListener('click', updateShapes);
document.addEventListener('keypress', (input) => {
    if (input.key == 'Enter') updateShapes();
});

let invert;
invertBtn.addEventListener('click', _ => {
    document.body.style['-webkit-filter'] = `invert(${invert ? 0 : 1})`;
    invert = !invert;
});