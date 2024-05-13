let canvas;
let drawingCmds = []; // array to store drawing cmds
let gifFrames = [];
let undoStack = []; //undo stack
let redoStack = []; //redo stack
let mousePos = null;
let colour = "#ff0000";
let strokeWeightVal = 1;
let pencil;

class Pencil {
  constructor() {
    this.markings = [];
  }

  draw(x1, y1, x2, y2) {
    strokeWeight(strokeWeightVal);
    stroke(colour);
    line(x1, y1, x2, y2);
    this.markings.push({ x1, y1, x2, y2 });
    let command = {
      type: "line",
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      color: colour,
      strokeWeightVal: strokeWeightVal
    };
    exeCmd(command); // Execute the command for undo/redo
  }
  showMarkings() {
    for (let i = 0; i < this.markings.length; i++) {
      let { x1, y1, x2, y2 } = this.markings[i];
      strokeWeight(strokeWeightVal);
      stroke(colour);
      line(x1, y1, x2, y2);
    }
  }
}

function setup() {
  console.log("setup started");
  canvas = createCanvas(500, 500);
  canvas.parent("canvas-container");
  background(240);
  console.log("canvas setup finished");
//button setup
  select("#shapes-btn").mousePressed(toggleShapesMenu);
  select("#colour-btn").mousePressed(() => {
    select("#colour-picker").elt.click();
  });
  select("#colour-picker").changed(() => {
    colour = select("#colour-picker").value();
  });
  select("#thickness-btn").mousePressed(() => {
    let thicknessPicker = select("#thickness-picker");
    if (thicknessPicker) {
      thicknessPicker.elt.hidden = !thicknessPicker.elt.hidden;
    } else {
      console.error("thickness picker not found");
    }
  });
  select("#thickness-picker").changed(() => {
    strokeWeightVal = select("#thickness-picker").value();
  });

  console.log("button setup finished");

  pencil = new Pencil();
}

function mousePressed() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    mousePos = { x: mouseX, y: mouseY };
    document.getElementById(
      "mouse-position"
    ).innerText = `Mouse Position: (${mouseX}, ${mouseY})`;
    pencil.isDrawing = true;
  }
}

function getCurrentCanvasState() {
  return {
    drawingCmds: drawingCmds.slice(), //get copy of the drawing commands array
    colour: colour, // current color
    strokeWeightVal: strokeWeightVal // current stroke weight
  };
}

function restoreCanvasState(state) {
  drawingCmds = state.drawingCmds;
  colour = state.colour;
  strokeWeightVal = state.strokeWeightVal;
}

function exeCmd(command) {
  console.log(drawingCmds);
  drawingCmds.push(command);
  let prevState = getCurrentCanvasState(); //were about to change so we should save the current state to get prev
  undoStack.push(prevState); //store state before change for undo
  redoStack = []; //clear redo stack
  drawCommand(command); 
}

function redrawCanvas() {
  background(240);
  if (undoStack.length > 0) {
    let currentState = undoStack[undoStack.length - 1];
    for (let j = 0; j < currentState.drawingCmds.length; j++) {
      drawCommand(currentState.drawingCmds[j]);
    }
  }
}

function undo() {
  if (undoStack.length > 0) {
    let lastState = undoStack.pop(); //get last state
    redoStack.push(lastState);
    console.log("undoStack", undoStack);
    redrawCanvas();
  }
}

function redo() {
  if (redoStack.length > 0) {
    let nextState = redoStack.pop(); //get next canvas state
    undoStack.push(nextState); //store current state for undos if needed
    restoreCanvasState(nextState);
    console.log("redoStack", redoStack);
    redrawCanvas(); //redraw the canvas
  }
}

function toggleShapesMenu() {
  //dropdown shapes menu
  console.log("toggleShapesMenu called");
  var shapesMenu = document.getElementById("shapes-menu");
  if (shapesMenu.classList.contains("hidden")) {
    shapesMenu.classList.remove("hidden");
  } else {
    shapesMenu.classList.add("hidden");
  }
}

function drawCommand(command) {
  fill(command.color);
  strokeWeight(command.strokeWeightVal);
  if (command.type == "circle") {
    circle(command.x, command.y, command.size);
  } else if (command.type == "square") {
    rect(command.x, command.y, command.size, command.size);
  } else if (command.type == "line") {
    line(command.x1, command.y1, command.x2, command.y2);
  } else if (command.type == "clear") {
    clearCanvas();
  }
}

// Function to draw a circle
window.drawCircle = function () {
  if (mousePos) {
    let colour = document.getElementById("colour-picker").value;
    let command = {
      type: "circle",
      x: mousePos.x,
      y: mousePos.y,
      size: 50,
      color: colour,
      strokeWeightVal: strokeWeightVal
    };
    exeCmd(command);
  }
};

// Function to draw a square
window.drawSquare = function () {
  if (mousePos) {
    let colour = document.getElementById("colour-picker").value;
    let command = {
      type: "square",
      x: mousePos.x,
      y: mousePos.y,
      size: 50,
      color: colour,
      strokeWeightVal: strokeWeightVal
    };
    exeCmd(command);
  }
};

window.pencilDraw = function() {
  if (pencil.isDrawing) {
    pencil.draw(pmouseX, pmouseY, mouseX, mouseY);
    pencil.showMarkings();
  }
}

// Function to clear the canvas
window.clearCanvas = function () {
  let command = { type: "clear" };
  background(240);
};

function saveCanvasImg() {
  saveCanvas(canvas, "myCanvas", "png");
};

function saveCanvasGif() {
  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: canvas.width,
    height: canvas.height
  });

  // Function to draw each command and add it as a frame to the GIF
  function drawFrame() {
    // Loop through each command
    for (let i = 0; i < drawingCmds.length; i++) {
      let command = drawingCmds[i];
      // Clear the canvas
      background(240);
      // Draw all commands up to the current one
      for (let j = 0; j <= i; j++) {
        let cmd = drawingCmds[j];
        fill(cmd.color);
        strokeWeight(cmd.strokeWeightVal);
        if (cmd.type == "circle") {
          circle(cmd.x, cmd.y, cmd.size);
        } else if (cmd.type == "square") {
          rect(cmd.x, cmd.y, cmd.size, cmd.size);
        }
      }
      // Add the current canvas content as a frame to the GIF
      gif.addFrame(canvas.elt, { copy: true, delay: 100 });
    }
  }

  // Draw each frame
  drawFrame();

  // Render the GIF and open it in a new tab when finished
  gif.on('finished', function(blob) {
    window.open(URL.createObjectURL(blob));
  });
  gif.render();
}
