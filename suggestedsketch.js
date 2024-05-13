// suggestedsketch.js

// Function to generate drawing suggestions based on the current canvas state and the last command executed
window.generateDrawingSuggestions = function(drawingCmds) {
  // for now we just use highest averages
  let shapeCounts = {};
  let colourCounts = {};

  drawingCmds.forEach(command => {
    shapeCounts[command.type] = (shapeCounts[command.type] || 0) + 1;
    colourCounts[command.colour] = (colourCounts[command.colour] || 0) + 1;
  });
  //most common shape and colour
  let mostCommonShape = Object.keys(shapeCounts).reduce((a, b) => shapeCounts[a] > shapeCounts[b] ? a : b);
  let mostCommonColour = Object.keys(colourCounts).reduce((a, b) => colourCounts[a] > colourCounts[b] ? a : b);
  //suggestion generation
  let suggestions = [];
  let suggestion = {
    type: mostCommonShape,
    colour: mostCommonColour,
    x: random(width),
    y: random(height),
    size: random(10, 50),
    strokeWeightVal: 1
  };
  suggestions.push(suggestion);
  return suggestions;
};

// Function to display suggestions visually as thumbnails
window.displaySuggestionsThumbnails = function(suggestions, drawingCmds) {
  let thumbnailsContainer = document.getElementById("suggestions-thumbnails");
  thumbnailsContainer.innerHTML = ""; // Clear previous thumbnails
  
  suggestions.forEach(suggestion => {
    let thumbnailCanvas = createCanvas(100, 100); // Create a small canvas for the thumbnail
    thumbnailCanvas.parent("suggestions-thumbnails"); // Append it to the container
    
    // Apply the suggestion command to the thumbnail canvas
    let tempDrawingCmds = drawingCmds.slice(); // Create a copy of drawing commands
    tempDrawingCmds.push(suggestion); // Apply the suggestion to the copy
    redrawThumbnailCanvas(tempDrawingCmds);
    
    // Add event listener to apply the suggestion when clicked
    thumbnailCanvas.mouseClicked(() => applySuggestion(suggestion));
  });
};

// Function to redraw the thumbnail canvas with the applied commands
function redrawThumbnailCanvas(drawingCmds) {
  let thumbnailCanvas = document.getElementById("defaultCanvas0");
  let thumbnailCtx = thumbnailCanvas.getContext("2d");
  thumbnailCtx.clearRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);

  drawingCmds.forEach(command => {
    thumbnailCtx.fillStyle = command.color;

  });
}

// Function to apply a suggestion to the main canvas
function applySuggestion(suggestion) {
}
