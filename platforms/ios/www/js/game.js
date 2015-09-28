
(function() {
    var movetime = 5000,
        playtime = 3000,
        addTubeInterval = 2000,
        score = 0,
        fps = 10, // how fast of detect update event
        last_bird_pos = 0, // last bird height
        passing = 0, // bird is passing a tube
        touched = 0,
        bird_fly_dist = 50,
        bgheight = $(window).height(),
        bgwidth = $(window).width(),
        tubewidth = 50,
        birdheight = 24,
        timestart = 0,
        timeend = 0,
        gameEndFlag = 1,
        gamemode = "touchdeath";
      //gamemode = 'timecountmode'
 
    var dropline = bgheight - birdheight,
        birdtoleft = bgwidth / 4;
        boarderdist = bgheight / 4, // dist between tube and boarder
        tubespace = bgheight / 4 * 1.3 // space between tube
 
 
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
        var org = ele.css(prop).match(/-?\d+/)[0]
        amt += parseInt(org)
        ele.css(prop, amt + "px")
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
            left: birdtoleft + "px",
            top: bgheight / 2 + "px",
        });
 
        addobj("bg1", {
            imgfile: "background.png",
            left: "0px",
        });
 
        $("#child_bg1").height(bgheight)
        $("#child_bg1").width(bgwidth)
 
        addobj("bg2", {
            imgfile: "background.png",
            left: bgwidth + "px"
        });
 
        $("#child_bg2").height(bgheight)
        $("#child_bg2").width(bgwidth)
 
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
 
 
    }
 
 
    // registe  interaction behaviour
    function registers() {
        $("#gamearea").click(flybird);
        $("#exit").click(quit);
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
    function flybird() {
        $("#bird").stop(false, false);
        dropspeed = 0;
        $("#bird").animate({
            top: "-=" + bird_fly_dist,
        }, 500)
    }
 
    // bird dropdown 
    function birddrop() {
        $("#bird").animate({
            top: "+=" + dropline,
        }, 2000)
    }
 
 
    // moving functions
    // two images move in turn
    function bgmove() {
 
        bg1move()
        bg2move()
 
        function bg1move() {
            $("#bg1").animate({
                left: "-=" + bgwidth
            }, movetime, "linear", function() {
                $("#bg1").css("left", "0px");
                bg1move();
            })
        }
 
        function bg2move() {
            $("#bg2").animate({
                left: "-=" + bgwidth
            }, movetime, "linear", function() {
                $("#bg2").css("left", bgwidth + "px");
                bg2move();
            })
        }
    }
 
 
 
    // animation go every frame
    function dropmove() {
        var dropmoveItv = setInterval(function() {
            if (gameEndFlag == 1) {
                clearInterval(dropmoveItv)
            } else {
                var btop = $("#bird").offset().top
                if (btop == last_bird_pos && btop < dropline) birddrop()
                if (btop >= dropline) $("#bird").css("top", dropline + "px").stop()
                if (btop < 0) $("#bird").css("top", "0px").stop()
                testtouch()
                last_bird_pos = $("#bird").offset().top
            }
        }, 1000 / fps)
    }
 
    //tube moves
    function tubemove() {
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
                    bottom: bgheight - random + halfsapce + "px"
                });
 
 
                addobj(bottomid, {
                    imgfile: "obstacle_bottom.png",
                    left: bgwidth + "px",
                    top: random + halfsapce + "px"
                });
 
 
                // $("#child_" + topid).height(bgheight)
                // $("#child_" + bottomid).height(bgheight)
                // tubewidth = $("#child_" + topid).width()
 
                // remove useless tube
                $("#" + topid).animate({
                    left: "-=" + (bgwidth + tubewidth)
                }, movetime, "linear", function() {
                    $("#" + topid).remove()
                })
 
                $("#" + bottomid).animate({
                    left: "-=" + (bgwidth + tubewidth)
                }, movetime, "linear", function() {
                    $("#" + bottomid).remove()
                })
            }
        }, addTubeInterval)
    }
 
 
    function overlay(ele1, ele2) {
        //tr(ele2)
        //ele1.css("background-color", "black")
        var arr = [ele1, ele2];
        var points = []
        for (var e in arr) {
            var ele = arr[e];
            var ele_left_top, ele_right_top, ele_left_bottom, ele_right_bottom
            var eo = ele.offset()
            var x = eo.left
            var y = eo.top
            ele_left_top = [x, y]
            ele_right_top = [x + ele.width(), y]
            ele_left_bottom = [x, y + ele.height()]
            ele_right_bottom = [x + ele.width(), y + ele.height()]
            points[e] = [ele_left_top, ele_right_top, ele_left_bottom, ele_right_bottom]
        }
 
        var tube = points[1]
        var ltx = tube[0][0],
            rbx = tube[3][0],
            lty = tube[0][1],
            rby = tube[3][1]
 
        for (var p in points[0]) {
            var pot = points[0][p]
            var x = pot[0],
                y = pot[1]
            if (x > ltx && x < rbx && y > lty && y < rby) {
                score = 0
                $("#score_txt > span").html(score)
                touched = 1
                $("#bird").css("-webkit-filter", "hue-rotate(80deg)")
            }
 
        }
 
    }
 
    function testtouch() {
        $("div[id^=tube]").each(function(e) {
            if ($(this).offset().left <= birdtoleft + $("#bird").width() && ($(this).offset().left + tubewidth) >= birdtoleft) {
                overlay($("#bird"), $(this))
                passing = 1
            } else if (passing == 1 && ($(this).offset().left + tubewidth < birdtoleft)) {
                if (!touched) score++;
                if (gamemode == "touchdeath" && touched == 1) gameend()
                $("#score_txt > span").html(score)
                $("#bird").css("-webkit-filter", "hue-rotate(0deg)")
                passing = 0
                touched = 0
            }
        })
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
        $("#instructions").css("display", "block");
        $("#bird").stop();
        $("#bird").css("top", bgheight / 2 + "px");
        $("#bg1").stop();
        $("#bg2").stop();
        $("#bg1").css("left", "0");
        $("#bg2").css("left", bgwidth + "px");
        gameEndFlag = 1;
        $("#gamearea").off("click");
        $("div[id^=tube]").each(function() {
            $(this).remove();
        });
 
        $("#gameover").fadeIn(500).delay(2000).fadeOut(500)
        $("#exit").fadeIn(500)
 
        setTimeout(function() {
            $("#clickrun").show().fadeIn(500)
        }, 3500)
 
    }
 
    function waitstart() {
        $("#clickrun").click(function() {
            gameEndFlag = 0;
            countdown()
            //bgmove();
            tubemove()
            dropmove()
            registers();
            $("#exit").css("display", "none")
            $(this).css("display", "none")
            $("#instructions").css("display", "none")
            $("#score_txt").css("display", "block")
        })
    }
 
    cleanscreen();
    addpics();
    waitstart();
 
})()
