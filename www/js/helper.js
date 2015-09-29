
  //  debug:  debug is very important to progrmming
  function tr() {
    console.log.apply(console, arguments)
  }

  //  helper: I need add many images into the stage
  //  this function help me do it automatically 
  function addobj(name, sty) {
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

  //  helper :  objects move left
  function moveobj(ele, prop, amt) {
    var org = ele.style[prop].match(/-?\d+/)[0]
    amt += parseInt(org)
    ele.style[prop] = amt + "px"
  }

  // helper: random 
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  // helper clearAllIV
  function clearAllIntervals() {
    (function(w) {
      w = w || window;
      var i = w.setInterval(function() {}, 100000);
      while (i >= 0) {
        w.clearInterval(i--);
      }
    })( /*window*/ );
  }


  // helper  get 4 dig time based random
  function timestr() {
    return Date.now().toString().substring(9)
  }

  // helper  first captical 
  function upperFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // helper stepmove
  HTMLDivElement.prototype.stepmove = function(prop, offset) {
    var orgprop = this.getpos(prop)
    this.style.position = "absolute"
    this.style[prop] = orgprop + offset + "px"
  }

  // helper getpos
  HTMLDivElement.prototype.getpos = function(prop) {
    return orgprop = parseFloat(this["offset" + upperFirst(prop)])
  }
