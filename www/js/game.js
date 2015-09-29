(function() {
  var bdf = new Birdfly(),
    movetime = 5000,
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



  cleanscreen();
  addpics();
  waitstart();
  registers();


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
    bdf.addobj("bird", {
      imgfile: "avatar.png",
      zIndex: 100,
      left: bird_left_line + "px",
      top: bgheight / 2 + "px",
    });
    bird = document.getElementById("bird")

    bdf.addobj("bg1", {
      imgfile: "background.png",
      left: "0px",
    });
    bg1 = document.getElementById("bg1")

    document.getElementById("child_bg1").style.height = bgheight + "px"
    document.getElementById("child_bg1").style.width = bgwidth + "px"

    bdf.addobj("clickrun", {
      imgfile: "clickrun.png",
      top: bgheight / 2 - 60 + "px",
      zIndex: 50,
      halign: "center"
    });

    bdf.addobj("instructions", {
      imgfile: "instructions.png",
      top: bgheight / 2 + 20 + "px",
      halign: "center"

    });

    bdf.addobj("gameover", {
      imgfile: "gameover.png",
      top: bgheight / 2 - 60 + "px",
      halign: "center",
      display: "none"
    });

    bdf.addobj("exit", {
      imgfile: "exit.png",
      position: "absolute",
      bottom: 20 + "px",
      halign: "center",
      display: "none"
    });

    bdf.addobj("clear", {
      imgfile: "clear.png",
      position: "absolute",
      bottom: 70 + "px",
      halign: "center",
      display: "none"
    });

    bdf.addobj("score_txt", {
      top: 30 + "px",
      halign: "center",
      zIndex: 80,
      text: "0",
      fontSize: "20px",
      color: "#FFFFFF",
      display: "none"
    });

    bdf.addobj("top_score", {
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




  function waitstart() {
    document.getElementById("clickrun").addEventListener("click", function() {
      gameEndFlag = 0;
      score = 0;
      //countdown()
      addtube()
      testIvt()
      update()


      document.getElementById("score_txt").firstChild.innerHTML = score_prefix + score
      document.getElementById("exit").style.display = "none";
      document.getElementById("clear").style.display = "none";
      document.getElementById("instructions").style.display = "none"
      document.getElementById("score_txt").style.display = "block"
      document.getElementById("top_score").style.display = "block"
      this.style.display = "none";

      document.getElementById("gamearea").addEventListener("click", activateFly);
    })
  }


  //  for countdown mode or timebased process
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

  //tube moves
  function addtube() {
    var tubemoveItv = setInterval(function() {
      if (gameEndFlag == 1) {
        clearInterval(tubemoveItv)
      } else {
        var random = bdf.getRandomInt(boarderdist, bgheight - boarderdist);
        var halfsapce = tubespace / 2
        var curno = bdf.timestr();
        var topid = "tubetop" + curno;
        var bottomid = "tubebottom" + curno;

        bdf.addobj(topid, {
          imgfile: "obstacle_top.png",
          left: bgwidth + "px",
          position: "absolute",
          bottom: bgheight - random + halfsapce + "px",
          class: "tube"
        });

        bdf.addobj(bottomid, {
          imgfile: "obstacle_bottom.png",
          left: bgwidth + "px",
          position: "absolute",
          top: random + halfsapce + "px",
          class: "tube"
        });

      }
    }, addTubeInterval)
  }


  // registe  interaction behaviour
  function registers() {
    document.getElementById("exit").addEventListener("click", quit);
    document.getElementById("clear").addEventListener("click", cleartop);
    // quite application 
    function quit() {
      if (navigator.app) {
        navigator.app.exitApp();
      } else if (navigator.device) {
        navigator.device.exitApp();
      }
    }
    // clear top score 
    function cleartop() {
      window.localStorage.clear()
      top_score = 0
      document.getElementById('top_score').firstChild.innerHTML = "Top: 0"
    }
  };


  /////////////////////////////////  big loop
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
          }
        }

        for (var i = 0; i < elems.length; i++) {
          var ele = elems[i];
          if (ele && ele.getpos('left') <= -tubewidth - 5) {
            ele.parentNode.removeChild(ele)
          }
        }
      }
    }, 1000 / fps)
  }
  ///////////////////////////////

  //////game start
  function gameend() {
    //tr("gameend")
    //reset
    gameEndFlag = 1;
    bird.style.top = bgheight / 2 + "px";
    // update top score
    //tr(score, top_score)
    //tr(score > top_score)
    if (score > top_score) {
      top_score = score
      document.getElementById("top_score").firstChild.innerHTML = top_prefix + top_score
      window.localStorage.setItem("top_score", top_score);
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
    document.getElementById("clear").style.display = "block";

    setTimeout(function() {
      document.getElementById("gameover").style.display = "none";
    }, 2500)

    setTimeout(function() {
      document.getElementById("clickrun").style.display = "block";
    }, 3500)
  }




  /////////////////////////  animation methods

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



  function testIvt() {
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


  function testtouch() {
    var elems = document.getElementsByClassName('tube')
    for (var i = 0; i < elems.length; i++) {
      var ele = elems[i];
      if (ele && ele.getpos('left') <= bgwidth / 2 && ele.getpos('left') >= bird_left_line - birdwidth) {
        var tube_right_line = ele.getpos('left') + tubewidth

        if (bdf.overlay(bird, ele)) {
          if (ele.name.indexOf('top') >= 0) toptouched = 1
          if (ele.name.indexOf('bottom') >= 0) bottomtouched = 1
        }

        // if passed 
        if (ele.name.indexOf('bottom') >= 0) {

          if (toptouched == 1 || bottomtouched == 1) {
            if (gamemode == "touchdeath") {
              gameend()
            } else {
              score = 0;
            }
          } else {
            score++
          }

          toptouched = 0
          bottomtouched = 0
        }
        document.getElementById("score_txt").firstChild.innerHTML = score_prefix + score
      }
    }
  }


})()
