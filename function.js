const container = document.querySelector("#game-container");
const option = document.querySelector(".option-container");
const flipBtn = document.querySelector("#flip-button");

//flip ship
let angle = 0;
function flip() {
  //get all childs of options container, make them into an array
  const optionShips = Array.from(option.children);
  if (angle === 0) {
    angle = 90;
  } else {
    angle = 0;
  }
  optionShips.forEach(
    (child) => (child.style.transform = `rotate(${angle}deg)`)
  );
}
//if you click on flip button call flip func
flipBtn.addEventListener("click", flip);

//create game boards
const width = 10;
function createBoard(color, user) {
  const gameContainer = document.createElement("div");
  gameContainer.classList.add("game-board");
  gameContainer.style.backgroundColor = color;
  gameContainer.id = user;

  for (let i = 0; i < width * width; i++) {
    const block = document.createElement("div");
    block.classList.add("block");
    block.id = i;
    gameContainer.append(block);
  }

  container.append(gameContainer);
}

createBoard("steelblue", "player");
createBoard("gray", "computer");

//ship create
class ship {
  constructor(name, length) {
    this.name = name;
    this.length = length;
  }
}

const destroyer = new ship("destroyer", 2);
const submarine = new ship("submarine", 3);
const cruiser = new ship("cruiser", 3);
const battleship = new ship("battleship", 4);
const carrier = new ship("carrier", 5);

const ships = [destroyer, submarine, cruiser, battleship, carrier];
let notDragged;

function handleValidity(allBlocks, isHorizontal, startIndex, ship) {
  let validStart = isHorizontal
    ? startIndex <= width * width - ship.length
      ? startIndex
      : width * width - ship.length
    : //vertical handling
    startIndex <= width * width - (ship.length - 1) * width
    ? startIndex
    : startIndex - ship.length * width + width;

  let shipBlocks = [];

  for (let i = 0; i < ship.length; i++) {
    if (isHorizontal) {
      shipBlocks.push(allBlocks[Number(validStart) + i]);
    } else {
      shipBlocks.push(allBlocks[Number(validStart) + i * width]);
    }
  }

  let valid;
  if (isHorizontal) {
    shipBlocks.every(
      (_shipBlock, index) =>
        (valid =
          shipBlocks[0].id % width !==
          width - (shipBlocks.length - (index + 1)))
    );
  } else {
    shipBlocks.every(
      (_shipBlock, index) =>
        (valid = shipBlocks[0].id < 90 + (width * index + 1))
    );
  }

  const notTaken = shipBlocks.every(
    (shipBlock) => !shipBlock.classList.contains("taken")
  );
  return { shipBlocks, valid, notTaken };
}

function addShipPiece(user, ship, startId) {
  //get all divs
  const allBlocks = document.querySelectorAll(`#${user} div`);
  let randomBoolean = Math.random() < 0.5;
  let isHorizontal = user === "player" ? angle === 0 : randomBoolean;
  let randomStartIndex = Math.floor(Math.random() * width * width);

  let startIndex = startId ? startId : randomStartIndex;

  const { shipBlocks, valid, notTaken } = handleValidity(
    allBlocks,
    isHorizontal,
    startIndex,
    ship
  );

  if (valid && notTaken) {
    shipBlocks.forEach((shipBlock) => {
      shipBlock.classList.add(ship.name);
      shipBlock.classList.add("taken");
    });
  } else {
    if (user === "computer") addShipPiece("computer", ship);
    if (user === "player") notDragged = true;
  }
}
ships.forEach((ship) => addShipPiece("computer", ship));

//draggable ships
let draggedShip;
const optionShips = Array.from(option.children);
optionShips.forEach((optionShip) =>
  optionShip.addEventListener("dragstart", dragStart)
);

const allPlayerBlocks = document.querySelectorAll("#player, div");
allPlayerBlocks.forEach((playerBlock) => {
  playerBlock.addEventListener("dragover", dragOver);
  playerBlock.addEventListener("drop", dropShip);
});

function dragStart(e) {
  notDragged = false;
  draggedShip = e.target;
}

function dragOver(e) {
  e.preventDefault();
  const ship = ships[draggedShip.id];
  highlightArea(e.target.id, ship);
}

function dropShip(e) {
  const startId = e.target.id;
  const ship = ships[draggedShip.id];
  addShipPiece("player", ship, startId);
  if (!notDragged) {
    draggedShip.remove();
  }
}

//add highlight
function highlightArea(startIndex, ship) {
  const allBlocks = document.querySelectorAll("#player div");
  let isHorizontal = angle === 0;
  const { shipBlocks, valid, notTaken } = handleValidity(
    allBlocks,
    isHorizontal,
    startIndex,
    ship
  );

  if (valid && notTaken) {
    shipBlocks.forEach((shipBlock) => {
      shipBlock.classList.add("hover");
      setTimeout(() => shipBlock.classList.remove("hover"), 500);
    });
  }
}
