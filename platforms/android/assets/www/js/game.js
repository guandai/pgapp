(function() {
  var movetime = 5000,
    playtime = 20000,
    basefps = 24,
    fps = 8, // how fast of detect update event
    addTubeInterval = 3000,
    score = 0,
    top_score = 0,
    top_prefix = "Top: ",
    score_prefix = "Score: ",
    last_bird_pos = 0, // last bird height
    bird_fly_dist = 50,
    bgheight = window.innerHeight,
    bgwidth = window.innerWidth,
    tubewidth = 50,
    birdheight = 24,
    birdwidth = 34,
    timestart = 0,
    timeend = 0,
    toptouched = 0,
    bottomtouched = 0,
    bird,
    bg1,
    bg2,
    gamemode = "touchdeath",
    //gamemode = 'timecountmode',
    gameEndFlag = 1;

  var dropline = bgheight - birdheight,
    bird_left_line = bgwidth / 4,
    bird_right_line = bgwidth / 4 + birdwidth,
    boarderdist = bgheight / 4, // dist between tube and boarder
    tubespace = bgheight / 4 * 1.3, // space between tube
    drop_velocity = 0,
    fly_velocity = 0,
    fly_velocity_init = 15,
    movespeed = 3 * basefps / fps,
    gravity = 0.8 * basefps / fps;

  

  //  debug:  debug is very important to progrmming
  var tr = function() {
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

  // first captical 
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


  //  prepare screen , clean everything 
  function cleanscreen() {
  	
    var deviceready = document.getElementById("deviceready"); // Get the <ul> element to insert a new node
    var gamearea = document.createElement('div');
    gamearea.id = "gamearea"
    var id_app = deviceready.parentElement
    id_app.id = "id_app"
    id_app.insertBefore(gamearea, deviceready);
    id_app.removeChild(deviceready)
    id_app.style.background = "url()";
    id_app.style.top = "0";
    id_app.style.left = "0";
    id_app.style.width = bgwidth + "px";
    id_app.style.height = bgheight + "px";
    id_app.style.overflow = "hidden";
    id_app.style.margin = "0";
    id_app.style.padding = "0";
  }


  // add all starting  picts
  function addpics() {
    addobj("bird", {
      imgfile: "avatar.png",
      zIndex: 100,
      left: bird_left_line + "px",
      top: bgheight / 2 + "px",
    });
    bird = document.getElementById("bird")

    addobj("bg1", {
      imgfile: "background.png",
      left: "0px",
    });
    bg1 = document.getElementById("bg1")

    document.getElementById("child_bg1").style.height = bgheight + "px"
    document.getElementById("child_bg1").style.width = bgwidth + "px"

    // addobj("bg2", {
    //   imgfile: "background.png",
    //   left: bgwidth + "px"
    // });
    // bg2 = document.getElementById("bg2")

    // document.getElementById("child_bg1").style.height = bgheight
    // document.getElementById("child_bg1").style.width = bgwidth

    addobj("clickrun", {
      imgfile: "clickrun.png",
      top: bgheight / 2 - 60 + "px",
      zIndex: 50,
      halign: "center"
    });

    addobj("instructions", {
      imgfile: "instructions.png",
      top: bgheight / 2 + 20 + "px",
      halign: "center"

    });

    addobj("gameover", {
      imgfile: "gameover.png",
      top: bgheight / 2 - 60 + "px",
      halign: "center",
      display: "none"
    });

    addobj("exit", {
      imgfile: "exit.png",
      position: "absolute",
      bottom: 20 + "px",
      halign: "center",
      display: "none"
    });

    addobj("score_txt", {
      top: 30 + "px",
      halign: "center",
      zIndex: 80,
      text: "0",
      fontSize: "20px",
      color: "#FFFFFF",
      display: "none"
    });

    addobj("top_score", {
      top: 30 + "px",
      left: "50px",
      zIndex: 70,
      fontSize: "20px",
      color: "#FFFFFF",
      display: "none"
    });

    //window.localStorage.setItem("top_score", 2)
    top_score = parseInt(window.localStorage.getItem("top_score")) || top_score
  	document.getElementById("top_score").firstChild.innerHTML = top_prefix + top_score
  	
  }

  // registe  interaction behaviour
  function registers() {
    document.getElementById("gamearea").addEventListener("click", activateFly);
    document.getElementById("exit").addEventListener("click", quit);
  };

  // quite application 
  function quit() {
    if (navigator.app) {
      navigator.app.exitApp();
    } else if (navigator.device) {
      navigator.device.exitApp();
    }
  }

  //  bird fly up
  function activateFly() {
    drop_velocity = 0;
    fly_velocity = fly_velocity_init
    birdfly()
  }

  function birdfly() {
    fly_velocity = fly_velocity - gravity
    bird.stepmove("top", -fly_velocity)
    if (bird.getpos('top') < 0) bird.style.top = "0px"
  }

  // bird dropdown 
  function birddrop() {
    drop_velocity = drop_velocity + gravity
    bird.stepmove("top", drop_velocity)
    if (bird.getpos('top') > dropline) bird.style.top = dropline + "px"
  }

  // moving functions
  // two images move in turn
  function bgmove() {
    bg1.stepmove("top", drop_velocity)
      //bg2.stepmove("left", 1)
  }




  //tube moves
  function addtube() {

    var tubemoveItv = setInterval(function() {

      if (gameEndFlag == 1) {
        clearInterval(tubemoveItv)
      } else {
        var random = getRandomInt(boarderdist, bgheight - boarderdist);
        var halfsapce = tubespace / 2
        var curno = timestr();
        var topid = "tubetop" + curno;
        var bottomid = "tubebottom" + curno;

        addobj(topid, {
          imgfile: "obstacle_top.png",
          left: bgwidth + "px",
          position: "absolute",
          bottom: bgheight - random + halfsapce + "px",
          class: "tube"
        });

        addobj(bottomid, {
          imgfile: "obstacle_bottom.png",
          left: bgwidth + "px",
          position: "absolute",
          top: random + halfsapce + "px",
          class: "tube"
        });

      }
    }, addTubeInterval)
  }


  // helper detect two obj touched
  function overlay(ele1, ele2) {
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

    // points[0] is bird , points[1] is tube
    // set tube  opposit corner
    var birdpts = points[0]
    var tubepts = points[1]

    var tube = tubepts,
      ltx = tube[0][0],
      rbx = tube[3][0],
      lty = tube[0][1],
      rby = tube[3][1]

    // test 4 pt in bird
    for (var p in birdpts) {

      var pt = birdpts[p]
      var x = pt[0],
        y = pt[1]

      
      if (x > ltx && x < rbx && y > lty && y < rby) {
        if (ele2.name.indexOf('top') >= 0)  toptouched =1
       	if (ele2.name.indexOf('bottom') >= 0)  bottomtouched =1
        tr("touched")
      }
    }
  }


  function testtouch() {
    var elems = document.getElementsByClassName('tube')
    for (var i = 0; i < elems.length; i++) {
      var ele = elems[i];
      if (ele && ele.getpos('left') <= bgwidth / 2 && ele.getpos('left') >= bird_left_line - birdwidth) {
        var tube_right_line = ele.getpos('left') + tubewidth
          // detect bird passing tube, bird bead betwwen a tube left and right
        // if (ele.name.indexOf('tubetop') >= 0) {
        //   tr(ele.getpos('left') <= bird_right_line, (tube_right_line >= bird_left_line))
        // }

        // if (ele.name.indexOf('tubebottom') >= 0) {
        //   tr(ele.getpos('left') <= bird_right_line, (tube_right_line >= bird_left_line))
        // }

        // reset and test touched	
        
     
        overlay(bird, ele)

        // if passed 
        if ( ele.name.indexOf('bottom')>=0 ){

        	if ( toptouched ==1 || bottomtouched ==1 ) {
	          if (gamemode == "touchdeath") {
	            gameend()
	          } else {
	          	score = 0;
	          }
	        }else{
	        	score ++
	        }

        	 toptouched = 0 
        	 bottomtouched = 0 
        }
        document.getElementById("score_txt").firstChild.innerHTML = score_prefix + score
      }
    }
  }

  function testIvt() {
    // tr("(bgwidth - bird_right_line + tubewidth/2)", (bgwidth - bird_right_line + tubewidth / 2))
    // tr("tubewidth/2", (tubewidth / 2))
    // tr("bird_right_line", (bird_right_line))
    // tr("bgwidth - bird_right_line)", (bgwidth - bird_right_line))
    // tr("speed", (movespeed / (1000 / fps)))
    // tr("addTubeInterval", addTubeInterval)
    // tr("time", (bgwidth - bird_right_line + tubewidth / 2) / (movespeed / (1000 / fps)))
    // tr("final time", addTubeInterval + (bgwidth - bird_right_line + tubewidth / 2) / (movespeed / (1000 / fps)))


    setTimeout(function() {
      //tr("setTestTouchIvt")
      var tubemoveItv = setInterval(function() {
        if (gameEndFlag == 1) {
          clearInterval(tubemoveItv)
        } else {
          //tr("test!")
          testtouch()
        }
      }, addTubeInterval)
    }, (bgwidth - bird_right_line + tubewidth / 2) / (movespeed / (1000 / fps)))
  }


  function countdown() {
    timestart = Date.now()
    var countdownItv = setInterval(function() {
      if (gameEndFlag == 1) {
        clearInterval(countdownItv)
      } else {
        timeend = Date.now()
        if (gamemode == "timecountmode" && (timeend - timestart >= playtime)) {
          gameend()
        }
      }
    }, 1000 / fps)
  }


  function gameend() {
    tr("gameend")
    //reset
    gameEndFlag = 1;
    bird.style.top = bgheight / 2 + "px";
    // update top score
    tr(score ,top_score)
    tr(score > top_score)
    if (score > top_score ) {
    	top_score = score
    	document.getElementById("top_score").firstChild.innerHTML = top_prefix + top_score
    	window.localStorage.setItem("top_score", top_score );
    }


    // remove all tube
    var elems = document.getElementsByClassName('tube')
    while (elems.length > 0) {
      var ele = elems[0]
      ele.parentNode.removeChild(ele);
    }

    // set animations
    document.getElementById("gamearea").removeEventListener("click", activateFly)
    document.getElementById("instructions").style.display = "block";
    document.getElementById("gameover").style.display = "block"
    document.getElementById("exit").style.display = "block"

    setTimeout(function() {
      document.getElementById("gameover").style.display = "none";
    }, 2500)

    setTimeout(function() {
      document.getElementById("clickrun").style.display = "block";
    }, 3500)
  }



  function waitstart() {
    document.getElementById("clickrun").addEventListener("click", function() {
      gameEndFlag = 0;
      score = 0;
      countdown()
      addtube()
      testIvt()
      update()

      registers();
      document.getElementById("score_txt").firstChild.innerHTML = score_prefix + score
      document.getElementById("exit").style.display = "none";
      document.getElementById("instructions").style.display = "none"
      document.getElementById("score_txt").style.display = "block"
      document.getElementById("top_score").style.display = "block"
      this.style.display = "none";
    })
  }


  // animation go every frame
  function update() {
    var dropmoveItv = setInterval(function() {
      if (gameEndFlag == 1) {
        clearInterval(dropmoveItv)
      } else {
        // BIRD DROP OR DOWN
        var btop = bird.getpos("top")
        if (btop == last_bird_pos && btop < dropline) birddrop()
        if (fly_velocity > 0) birdfly()
        last_bird_pos = bird.getpos("top")

        // tubemove
        var elems = document.getElementsByClassName('tube')
        for (var i = 0; i < elems.length; i++) {
          var ele = elems[i];
          if (ele && ele.getpos('left') > -tubewidth - 5) {
            ele.stepmove('left', -movespeed)
          } else {
            //ele.parentNode.removeChild(ele) 
            //	tubearray.splice(index,1)
          }
        }
      }
    }, 1000 / fps)
  }

  cleanscreen();
  addpics();
  waitstart();


})()
