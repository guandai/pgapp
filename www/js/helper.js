 ///////////////////////////////////////////////////
 var Birdfly = function() {};
 //  debug:  debug is very important to progrmming
 function tr() {
   console.log.apply(console, arguments)
 }

 //  helper: I need add many images into the stage
 //  this function help me do it automatically 
 Birdfly.prototype.addobj = function(name, sty) {
   if (!sty) sty = {}
   var gamearea = document.getElementById('gamearea')
   var div
   var child
     // prepare parent/base
   if (sty.base) {
     div = sty.base
   } else {
     div = document.createElement('div');
     div.name = name;
     div.id = name;
     div.style.position = "absolute";
     if (sty.class) div.className = sty.class
     var stycount = 0
     for (var i in sty) {
       var key = Object.keys(sty)[stycount];
       stycount++
       div.style[key] = sty[i] ? sty[i] : 0;
     }
     div.style.zIndex = sty.zIndex ? sty.zIndex : gamearea.childNodes.length + 1;
     gamearea.appendChild(div);
   }
   // create child 
   if (sty.imgfile) {
     child = document.createElement('img');
     child.src = "./img/" + sty.imgfile;
     child.style.width = sty.imgWidth ? sty.imgWidth : 'initial' ;
     child.style.height = sty.imgHeight ? sty.imgHeight : 'initial';
     
   } else if (sty.text) {
     child = document.createElement('span');
     child.innerHTML = sty.text;
   } else {
     child = document.createElement('div');
   }
   child.name = name;
   child.id = "child_" + name;

   switch (sty.halign) {
     case "left":
       div.style.right = "initial";
       div.style.left = 0;
       break;
     case "right":
       div.style.left = "initial";
       div.style.right = 0;
       break;
     case "center":
       div.style.right = "initial";
       div.style.width = "100%"
       div.style.marginLeft = "auto"
       div.style.marginRight = "auto"
       break;
     default:
       break;
   }
   div.appendChild(child)
 }

 // helper: random 
 Birdfly.prototype.getRandomInt = function(min, max) {
   return Math.floor(Math.random() * (max - min)) + min;
 }

 // helper  get 4 dig time based random
 Birdfly.prototype.timestr = function() {
   return Date.now().toString().substring(9)
 }

 // helper  first captical 
 Birdfly.prototype.upperFirst = function(string) {
   return string.charAt(0).toUpperCase() + string.slice(1);
 }

 // helper detect two obj touched
 Birdfly.prototype.overlay = function(ele1, ele2) {
   var arr = [ele1, ele2];
   var points = []

   // loop two elems
   for (var e = 0; e < arr.length; e++) {
     var ele = arr[e];
     var ele_left_top, ele_right_top, ele_left_bottom, ele_right_bottom
     var x = ele.offsetLeft
     var y = ele.offsetTop
     ele_left_top = [x, y]
     ele_right_top = [x + ele.offsetWidth, y]
     ele_left_bottom = [x, y + ele.offsetHeight]
     ele_right_bottom = [x + ele.offsetWidth, y + ele.offsetHeight]
     points[e] = [ele_left_top, ele_right_top, ele_left_bottom, ele_right_bottom]
   }

   var ele1pts = points[0],
     ele2pts = points[1],
     ltx = ele2pts[0][0],
     rbx = ele2pts[3][0],
     lty = ele2pts[0][1],
     rby = ele2pts[3][1]

   // test 4 pt in bird
   for (var p in ele1pts) {
     var pt = ele1pts[p]
     var x = pt[0],
       y = pt[1]

     if (x > ltx && x < rbx && y > lty && y < rby) {
       tr("touched")
       return true
     }
   }
   return false
 }

 // helper stepmove
 HTMLDivElement.prototype.stepmove = function(prop, offset) {
   var orgprop = this.getpos(prop)
   this.style.position = "absolute"
   this.style[prop] = orgprop + offset + "px"
 }

 // helper getpos
 HTMLDivElement.prototype.getpos = function(prop) {
   return orgprop = parseFloat(this["offset" + prop.charAt(0).toUpperCase() + prop.slice(1)])
 }
