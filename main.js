// Globals
let canvas = null,
    ctx = null,
    nodeWidth = null,
    nodeHeight = null,
    nodes = [],
    rows = 30,
    cols = 40,
    path = [],
    startNode = null,
    endNode = null,
    moveCost = 10,
    diagonalMoveCost = 15,
    isSearching = false;

class Node {

    constructor(x, y) {
        this.gridX = x;
        this.gridY = y;
        this.color = "white";
        this.parent = null;
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.isWall = Math.random() > 0.9;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.gridX * nodeWidth, this.gridY * nodeHeight, nodeWidth - 1, nodeHeight - 1);
    }
}

// Draws to screen
const draw = () => {

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (var x = 0; x < cols; x++) {
        for (var y = 0; y < rows; y++) {
            nodes[x][y].draw();
            nodes[x][y].color = "white";
            if(nodes[x][y].isWall){
                nodes[x][y].color = "black";
            }
        }
    }

    _.forEach(path, node => {
        node.color = "green";
        node.draw();
    });

    // Render loop
    window.requestAnimationFrame(draw);
}

const heuristic = (nodeA, nodeB) => {
    const dx = nodeA.gridX - nodeB.gridX;
    const dy = nodeA.gridY - nodeB.gridY;

    return Math.sqrt(dx * dx + dy * dy);
}

const findPath = () => {

    for(let x = 0; x < cols;x++){
        for(let y = 0; y < rows; y++){
            nodes[x][y].parent = null;
            nodes[x][y].isDiagonalMove = false;
            nodes[x][y].g = 0;
            nodes[x][y].h = 0;
            nodes[x][y].f = 0;
        }
    }

    const closedSet = [];
    const openSet = [startNode];

    isSearching = true;
    while (openSet.length > 0) {

        let currentNode = _.minBy(openSet, x => x.f);

        _.remove(openSet, currentNode);
        closedSet.push(currentNode);

        const neighbourNodes = getNeighbourNodes(currentNode);

        for (var i = 0; i < neighbourNodes.length; i++) {
            const neighbourNode = neighbourNodes[i];

            if (_.includes(closedSet, neighbourNode)) {
                continue;
            }

            neighbourNode.g = currentNode.g + (neighbourNode.isDiagonalMove ? diagonalMoveCost : moveCost);
            neighbourNode.h = heuristic(neighbourNode, endNode);
            neighbourNode.f = neighbourNode.g + neighbourNode.h;

            const index = _.indexOf(openSet, neighbourNode);
            if (index < 0) {
                openSet.push(neighbourNode);
            } else if (neighbourNode.g >= openSet[index].g) {
                continue;
            }

            neighbourNode.parent = currentNode;
        }

        if (currentNode === endNode) {

            const endPath = [currentNode];
            while (currentNode.parent !== null) {
                currentNode = currentNode.parent;
                endPath.push(currentNode);
            }
            isSearching = false;

            return endPath;
        }
    }
    isSearching = false;

    return [];
}

const getNeighbourNodes = currentNode => {

    const neighbourNodes = [];

    const x = currentNode.gridX,
        y = currentNode.gridY;

    let downLeft = true,
        upLeft = true,
        downRight = true,
        upRight = true;

    if (x > 0 && !nodes[x - 1][y].isWall) {
        neighbourNodes.push(nodes[x - 1][y]);
        nodes[x - 1][y].isDiagonalMove = false;
    } else {
        downLeft = false;
        upLeft = false;
    }

    if (x < cols - 1 && !nodes[x + 1][y].isWall) {
        neighbourNodes.push(nodes[x + 1][y]);
        nodes[x + 1][y].isDiagonalMove = false;
    } else {
        downRight = false;
        upRight = false;
    }

    if (y > 0 && !nodes[x][y - 1].isWall) {
        neighbourNodes.push(nodes[x][y - 1]);
        nodes[x][y - 1].isDiagonalMove = false;
    } else {
        upLeft = false;
        upRight = false;
    }

    if (y < rows - 1 && !nodes[x][y + 1].isWall) {
        neighbourNodes.push(nodes[x][y + 1]);
        nodes[x][y + 1].isDiagonalMove = false;
    } else {
        downLeft = false;
        downRight = false;
    }

    if (upRight && !nodes[x + 1][y - 1].isWall) {
        nodes[x + 1][y - 1].isDiagonalMove = true;
        neighbourNodes.push(nodes[x + 1][y - 1]);
    }
    if (upLeft && !nodes[x - 1][y - 1].isWall) {
        nodes[x - 1][y - 1].isDiagonalMove = true;
        neighbourNodes.push(nodes[x - 1][y - 1]);
    }
    if (downRight && !nodes[x + 1][y + 1].isWall) {
        nodes[x + 1][y + 1].isDiagonalMove = true;
        neighbourNodes.push(nodes[x + 1][y + 1]);
    }
    if (downLeft && !nodes[x - 1][y + 1].isWall) {
        nodes[x - 1][y + 1].isDiagonalMove = true;
        neighbourNodes.push(nodes[x - 1][y + 1]);
    }

    return neighbourNodes;
}

// On browser load
window.onload = () => {
    canvas = document.getElementById("render-canvas");
    ctx = canvas.getContext('2d');

    nodeWidth = canvas.width / cols;
    nodeHeight = canvas.height / rows;

    for (var x = 0; x < cols; x++) {
        nodes[x] = [];
        for (var y = 0; y < rows; y++) {
            nodes[x][y] = new Node(x, y);
        }
    }

    startNode = nodes[0][0];
    endNode = nodes[cols - 1][rows - 1];
    path = findPath();

    draw();
}

// When mouse is clicked
window.onclick = event => {

    if (isSearching) return;

    const x = event.pageX - canvas.offsetLeft;
    const y = event.pageY - canvas.offsetTop;

    const gridX = parseInt(x / nodeWidth);
    const gridY = parseInt(y / nodeHeight);

    if (nodes[gridX]) {
        if (nodes[gridX][gridY] && !nodes[gridX][gridY].isWall && startNode !== nodes[gridX][gridY]) {
            startNode = nodes[gridX][gridY];
        }
    }
}

// When mouse is moved
window.onmousemove = event => {

    if (isSearching) return;

    const x = event.pageX - canvas.offsetLeft;
    const y = event.pageY - canvas.offsetTop;

    const gridX = parseInt(x / nodeWidth);
    const gridY = parseInt(y / nodeHeight);

    if (nodes[gridX]) {
        if (nodes[gridX][gridY] && !nodes[gridX][gridY].isWall && endNode !== nodes[gridX][gridY]) {
            endNode = nodes[gridX][gridY];
            path = findPath();
        }
    }
}