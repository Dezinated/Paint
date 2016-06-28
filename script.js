var canvasContainer = $("#canvasContainer");
var colour = $("#colour");
var display = $("#display");
var tools = $("#tools ul").find("li");

var layers = [];

var layerSelect = $("#layers").children("ul");
var layerTools = $("#layerTools").children("ul").children();

var layerCount = 0;

var width = 700;
var height = 600;

var selectedLayer = undefined;
var selectedCanvas = undefined;

var drawing = false;


/*
*
* INIT
*
*/

//Set the default canvas size
$(document).ready(function(){
  resize($("#display"));
});

//Move mouse on the canvas
$("#display").mousemove(function(e) {
  updateDisplay(e);
});

//If mouse if unclicked drawing should stop
$("body").mouseup(function (e) { 
   drawing = false;
  updateIcon();
});

//When mouse is pressed, draw
canvasContainer.mousedown(function (e) { 
  drawing = true;
  draw(e);
});


/*
*
* UPDATE
*
*/

function draw(e) {
  var ctx = selectedCanvas.element.getContext("2d");
  var mousePos = getMousePos(selectedCanvas.element,e);
  ctx.fillStyle = colour.val();
  ctx.fillRect(mousePos.x,mousePos.y,10,10);
 
}

function updateIcon(){
  var ctx = selectedCanvas.element.getContext("2d");

  var icon = $.grep(layerSelect.children(), function(v) {
    return v.getAttribute("data-id") == selectedCanvas.id;
  });
  
  var iconCanvas = $(icon[0]).find("canvas")[0];
  var iconCtx = iconCanvas.getContext("2d");
  
  var imgData = ctx.getImageData(0, 0, getSize().x, getSize().y);
  iconCtx.putImageData(imgData,0,0);
}

/*
*
* DISPLAY LAYER
*
*/

function updateDisplay(e){
  var mousePos = getMousePos(e.target,e);
  var ctx = display.get(0).getContext("2d"); //Get the first and only result
  ctx.clearRect(0,0,getSize().x,getSize().y)
  
  if(drawing){
    if(selectedCanvas === undefined){
      alert("Select a layer");
      drawing = false;
      return;
    }
    draw(e);
    return;
  }
  ctx.fillStyle = colour.val();
  ctx.fillRect(mousePos.x,mousePos.y,10,10);
}

/*
*
* LAYERS
*
*/

var Layer  = function(){
    this.id = layerCount;
    this.name = "New Layer " + this.id;
    this.element = document.createElement("canvas");
    this.visible = true;
    canvasContainer.append(this.element);
    this.element.width = getSize().x; 
    this.element.height = getSize().y;
    this.element.setAttribute("id",this.id);
};

Layer.prototype.print = function() { 
  return this.element + ":"+ canvasContainer;
}

layerSelect.on("click", 'li', function(e) {
  if(selectedLayer !== undefined)
     selectedLayer.css( "background-color" , "initial");
  
  selectedLayer = $(e.currentTarget);
  selectedLayer.css( "background-color" , "#ccc");
  selectedCanvas = layers[selectedLayer.attr("data-id")];
});

function updateLayersList(){
  layerSelect.html("");
  //console.log(layers.length);
  for(let i=0;i<layers.length;i++){
    //console.log(i+" "+layers[i]);
    
    if(layers[i] != undefined)
      layerSelect.append("<li data-id='"+layers[i].id+"'><canvas class='layerIcon' data-id='"+layers[i].id+"' width='"+getSize().x+"' height='"+getSize().y+"'></canvas>"+ layers[i].name +"</li>");
    
  }
  layerSelect.sortable( {
    axis: "y",
    revert: true,
    scroll: false,
    placeholder: "sortable-placeholder",
    cursor: "move",
    stop:handleDragStop
  });
}

function handleDragStop() {
  
  for(let i=0;i<layerSelect.children().length;i++){
    canvasContainer.children("#"+layerSelect.children()[i].getAttribute("data-id")).css("z-index",layerSelect.children().length-i);
  }
}



/*
*
* LAYER TOOLS
*
*/

layerTools.click(function(e) {
  switch($(e.target).html()){
    case "New":
      layerCount++;
      //console.log("new layer "+layerCount);
      layers[layerCount] = new Layer();
      updateLayersList();
      handleDragStop();
      break;
  }
});

/*
*
* MISC
*
*/

function resize(canvas){
  canvas.attr("width", getSize().x);
  canvas.attr("height", getSize().y);
}

function getSize(){
  return {
    x:canvasContainer.width(),
    y:canvasContainer.height()
  };
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}