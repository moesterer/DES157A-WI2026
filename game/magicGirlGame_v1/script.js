(function () {
  "use strict";



  function $(sel, root) {
    if (!root) {
      root = document;
    }
    return root.querySelector(sel);
  }

  function $$(sel, root) {
    if (!root) {
      root = document;
    }
    return Array.from(root.querySelectorAll(sel));
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      resolve();
    }).then(function () {
      return new Promise(function (resolveInner) {
        setTimeout(resolveInner, ms);

      });
    });
  }


  var bkg = $(".bkg");
  var bkgA = $(".bkg-a");
  var bkgB = $(".bkg-b"); 

  var screens = $$(".screen");
  var introPlayBtn = $(".js-play");
  var againBtn = $(".js-again");

  var hpP1 = $(".js-hp-p1");
  var hpP2 = $(".js-hp-p2");

  var turnCard = $(".js-turn-card"); 
  var choiceBtns = $$(".js-choice");
  var diceBtn = $(".js-dice");
  var diceImg = $(".js-dice-img");

  var hint = $(".js-hint");

  var victoryTitle = $(".js-victory-title");
  var victoryFighter = $(".js-victory-fighter");


  var BKG = {
    intro: "images/introBkg.jpg",
    battle: "images/battleBkg.jpg",
    victoryP1: "images/magicGirlVictoryBkg.jpg",
    victoryP2: "images/monsterVictoryBkg.jpg"
  };

  function getPinkDicePath(n) {
    return "images/pinkDice" + n + ".png";
  }

  function getPurpleDicePath(n) {
    return "images/purpleDice" + n + ".png";
  }

  var DICE = {
    p1: getPinkDicePath,
    p2: getPurpleDicePath
  };


  // Game State
  var MAX_HP = 30;
  var BASE_ATTACK = 2; 
  var BASE_HEAL =  2;

  var state = {
    screen: "intro",
    turn: "p1",
    p1HP: MAX_HP,
    p2HP: MAX_HP,
    pendingAction: null,
    canRoll: false
  };

  // Background swap with blur crossfade
  var bkgFront = "a";
  var backgroundQueue = Promise.resolve();

  function setBackground(url) {
    backgroundQueue = backgroundQueue.then(function () {
      return new Promise(function (resolve) {
        var nextLayer = bkgFront === "a" ? bkgB : bkgA;
        nextLayer.style.backgroundImage = 'url("' + url + '")';

        bkg.classList.add("is-swapping");

        setTimeout(function () {
          var frontLayer = bkgFront === "a" ? bkgA : bkgB;
          var backLayer = bkgFront  === "a" ? bkgB : bkgA;

          frontLayer.style.backgroundImage = 'url("' + url + '")';
          backLayer.style.opacity = "0";
          backLayer.style.filter = "blur(18px)"; 
          backLayer.style.transform = "translateY(18px)";

          bkg.classList.remove("is-swapping");
          bkgFront = bkgFront === "a" ? "b" : "a";

          bkgA.style.opacity = "";
          bkgA.style.filter = "";
          bkgA.style.transform = "";
          bkgB.style.opacity = "";
          bkgB.style.filter = "";
          bkgB.style.transform = "";


          resolve(); 
        }, 750);
      });
    });

    return backgroundQueue;
  }

  // Screen drift transitions
  function getScreenEl(name) {
    return $('.screen[data-screen="' + name + '"]'); 
  }

  function showScreen(name, backgroundUrl) {
    return new Promise(function (resolve) {
      var current = getScreenEl(state.screen);

      var next = getScreenEl(name);

      next.classList.add("enter-from-below");
      next.classList.add("screen--active");

      if (current) {
        current.classList.add("exit-up");
      }

      var backgroundPromise = Promise.resolve();

      if (backgroundUrl) {
        backgroundPromise = setBackground(backgroundUrl); 
      }

      backgroundPromise.then(function () {
        setTimeout(function () {

          next.classList.remove("enter-from-below");

          setTimeout(function () {

            screens.forEach(function (s) { 
              s.classList.remove("exit-up");
            });

            screens.forEach(function (s) {
              if (s !==  next) {
                s.classList.remove("screen--active"); 
              }
            });

            state.screen = name;
            resolve();
          }, 680); 
        }, 30);

      });
    });

  }


  // UI Updates
  function setTurnUI() {
    turnCard.dataset.turn = state.turn;

    hint.textContent = "Choose an action."; 
    turnCard.style.display = "grid";
    diceBtn.style.display = "none";

    state.pendingAction  = null;
    state.canRoll = false;

    if (state.turn  === "p1") {
      diceImg.src = DICE.p1(1);
    } else {
      diceImg.src = DICE.p2(1);
    }
  }

  function renderHP() { 
    hpP1.textContent= String(state.p1HP);
    hpP2.textContent = String(state.p2HP);
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  // Battle Flow
  function startBattle() {
    document.body.removeAttribute("data-winner");
    state.turn = "p1";
    state.p1HP = MAX_HP;
    state.p2HP = MAX_HP;
    state.pendingAction = null;
    state.canRoll = false;

    renderHP();
    setTurnUI();
  }

  function chooseAction(action) {
    state.pendingAction = action; 

    turnCard.style.display =  "none";
    diceBtn.style.display = "inline-block";
    hint.textContent = "Click the dice to roll.";

    state.canRoll = true;
  }

  function applyRoll(roll) { 
    return new Promise(function (resolve) {
      var actor = state.turn;
      var target = actor === "p1" ? "p2" : "p1";

      if (state.pendingAction === "attack") {
        var dmg = BASE_ATTACK * roll;

        if (target === "p1") {
          state.p1HP -= dmg; 

        } else {
          state.p2HP -= dmg;
        }

        hint.textContent = "Attack! x" + roll;
      } else {
        var heal = BASE_HEAL * roll;


        if (actor === "p1") {
          state.p1HP = clamp(state.p1HP + heal, 0, MAX_HP);

        } else {
          state.p2HP = clamp(state.p2HP + heal, 0, MAX_HP);
        }

        hint.textContent = "Heal! x" + roll;
      }

      renderHP();

      setTimeout(function () { 
        if (state.p1HP <= 0 || state.p2HP <= 0) {
          var winner = state.p1HP > 0 ? "p1" : "p2";

          goVictory(winner).then(function () {
            resolve();
          });
          return;
        }

        state.turn = state.turn ===  "p1" ? "p2" : "p1";

        setTimeout(function () {
          setTurnUI();
          resolve();
        }, 250);
      }, 500);
    });
  }

  function  rollDice() {
    if (!state.canRoll) {
      return;
    }

    state.canRoll = false; 

    var n = Math.floor(Math.random() * 6) + 1;

    if (state.turn === "p1") {
      diceImg.src = DICE.p1(n);

    } else {
      diceImg.src = DICE.p2(n);
    }

    applyRoll(n);
  }


  // Victory
  function goVictory(winner) { 
    document.body.dataset.winner = winner;

    if (winner === "p1") {
      victoryTitle.textContent = "Victory!";
      victoryFighter.src = "images/magicGirl.png";

      return showScreen("victory", BKG.victoryP1); 

    } else {
      victoryTitle.textContent = "Victory!";
      victoryFighter.src = "images/monsters.png";

      return showScreen("victory", BKG.victoryP2); 

    }
  }

  function restartFromVictory() {
    startBattle();
    return showScreen("battle", BKG.battle);
  }

  // events
  introPlayBtn.addEventListener("click", function () {

    startBattle();
    showScreen("battle", BKG.battle); 
  });

  choiceBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {

      var action = btn.dataset.action;
      chooseAction(action);
    });
  });

  diceBtn.addEventListener("click", function () {
    rollDice(); 
  });

  againBtn.addEventListener("click", function () {
    restartFromVictory();
  });




  bkgA.style.backgroundImage = 'url("' + BKG.intro + '")';
  bkgB.style.backgroundImage = 'url("' + BKG.intro + '")'; 

  state.screen = "intro"; 
  screens.forEach(function (s) {

    s.classList.remove("screen--active");
  });
  getScreenEl("intro").classList.add("screen--active"); 

}());
















