var canvasContainer = $("#canvasContainer");
var colour = $("#colour");
var display = $("#display");
var tools = $("#tools");

var layers = [];

var layerSelect = $("#layers").children("ul");
var layerTools = $("#layerTools").children("ul").children();

var layerCount = 0;

var width = 700;
var height = 600;

var selectedLayer = undefined;
var selectedCanvas = undefined;

var pressed = false;
var pressedX = 0;
var pressedY = 0;


var size;

var tool;

var lastX, lastY;
/*
*
* INIT
*
*/

//Set the default canvas size
$(document).ready(function(){
  resize($("#display"));
  $("#brushSize").html($("#slider").val());
  size = $("#slider").val();
});


$("#slider").mousemove(function() {
  $("#brushSize").html($(this).val());
  size = $(this).val();
});
//Move mouse on the canvas
$("#display").mousemove(function(e) {
  updateDisplay(e);
});

//If mouse if unclicked drawing should stop
$("body").mouseup(function (e) { 
   pressed = false;
  updateIcon();
  lastX = undefined;
  lastY = undefined;
});

//When mouse is pressed, draw
canvasContainer.mousedown(function (e) { 
  pressed = true;
  pressedX = e.pageX;
  pressedX = e.pageY;
  if(tool.getAttribute("title") == "Pencil")
    draw(e);
});


tools.on("click", 'li', function(e) {
  $(tool).css("background-color","initial");
  tool = e.target;
  $(tool).css("background-color","#adadad");
});

/*
*
* UPDATE
*
*/

function draw(e) {
  if(selectedCanvas === undefined)
    return;
  var ctx = selectedCanvas.element.getContext("2d");
  var mousePos = getMousePos(selectedCanvas.element,e);
  ctx.fillStyle = colour.val();
  ctx.fillRect(mousePos.x,mousePos.y,size,size);
 
}

function updateIcon(){
  if(selectedCanvas === undefined)
    return;
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
  ctx.clearRect(0,0,getSize().x,getSize().y);
  ctx.fillStyle = colour.val();
  //ctx.fillRect(mousePos.x,mousePos.y,size,size);
  
  if(pressed && selectedCanvas === undefined){
    alert("Select a layer");
    pressed = false;
    return;
  }
    
  if(tool == undefined)
    return;
  
  switch (tool.getAttribute("title")) {
      
      case "Pencil":
        if(pressed) 
          draw(e);
        ctx.fillRect(mousePos.x,mousePos.y,size,size);
        break;
      
      case "Move":
        var currentCTX = selectedCanvas.element.getContext("2d");
        if(pressed){
          if(lastX == undefined || lastY == undefined){
            lastX = e.pageX;
            lastY = e.pageY;
          }
          var dx = lastX - e.pageX;
          var dy = lastY - e.pageY;
          lastX = e.pageX;
          lastY = e.pageY;
          currentCTX.save();
          var img = currentCTX.getImageData(0,0,getSize().x,getSize().y);
          currentCTX.clearRect(0,0,getSize().x,getSize().y);
          currentCTX.putImageData(img, -Math.round(dx), -Math.round(dy));
          currentCTX.restore();
        }
        break;
  }
  
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
  switch(e.target.getAttribute("title")){
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