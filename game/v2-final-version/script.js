(function () {
  "use strict";
  console.log("reading js");


  // helper functions to select elements and pause timing
  // use for: scene transitions, dice results, animations
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
      setTimeout(resolve, ms); 
    });
  }


  // DOM ref: connect to visible game elements: screens, buttons, players, health displays, dice
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

  var fighterP1 = $(".fighter--p1");
  var fighterP2 = $(".fighter--p2");

  var victoryTitle = $(".js-victory-title");
  var victoryFighter =  $(".js-victory-fighter");

  var BKG = {
    intro: "images/introBkg.jpg",
    battle: "images/battleBkg.jpg",
    victoryP1: "images/magicGirlVictoryBkg.jpg",
    victoryP2: "images/monsterVictoryBkg.jpg"
  };

  // asset paths: store imag paths for scene backrounds and different dice for each player

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

  // sound: audio files support feedback for button clicks, dice rolls, differen actions, looping background music
  var sfx = {
    bkgMusic: new Audio("sounds/bkgMusic.mp3"),
    click: new Audio("sounds/click.mp3"),
    dicePop: new Audio("sounds/dicePop.mp3"),
    attack: new Audio("sounds/attack.mp3"),
    heal: new Audio("sounds/heal.mp3")
  };

  sfx.bkgMusic.loop = true;
  sfx.bkgMusic.volume = 0.22;

  // play sound from beginning at the chosen volume
  function playSound(audioObj, volume) {
    try {
      audioObj.pause();
      audioObj.currentTime = 0;
      if (typeof volume === "number") { 

        audioObj.volume = volume;
      }
      audioObj.play().catch(function () {});
    } catch (err) {
    
    }
  }

  // start looping background music after pressing play button
  function startBkgMusic() {
    sfx.bkgMusic.play().catch(function () {}); 
  }

  // game state:
  // store chaning vals: turns, health, action, rolling states
  var MAX_HP = 30;
  var BASE_ATTACK = 2;
  var BASE_HEAL = 2;

  var state = {
    screen: "intro",
    turn: "p1",
    p1HP: MAX_HP,
    p2HP: MAX_HP,
    pendingAction: null,
    canRoll: false

  };

  // background transition system:
  // handle blurred crossfade between the 3 different scenes
  var bkgFront = "a";
  var backgroundQueue = Promise.resolve();

  function setBackground(url) {
    backgroundQueue = backgroundQueue.then(function () {
      return new Promise(function (resolve) { 
        var nextLayer = bkgFront  === "a" ? bkgB : bkgA;
        nextLayer.style.backgroundImage = 'url("' + url + '")';

        bkg.classList.add("is-swapping"); 

        setTimeout(function () {
          var frontLayer = bkgFront === "a" ? bkgA : bkgB;
          var backLayer = bkgFront === "a" ? bkgB : bkgA;
 
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

  // screen transitions:
  // keep correct scene vicisble and interactive
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
              if (s !== next) {
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

  // ui updates:
  // refresh battle interface so correct turn and health vales, and dice img shown
  function setTurnUI() {
    turnCard.dataset.turn = state.turn;

    hint.textContent = "Choose an action.";
    turnCard.style.display = "grid";
    diceBtn.style.display = "none";

    state.pendingAction = null;
    state.canRoll = false;

    if (state.turn === "p1") { 
      diceImg.src = DICE.p1(1);

    } else {
      diceImg.src = DICE.p2(1);
    }
  }

  // update displayed hp
  function renderHP() {
    hpP1.textContent = String(state.p1HP);

    hpP2.textContent = String(state.p2HP); 
  }

  // keep val indie valid range (don't update hp to be above 30)
  function clamp(v, min, max) { 
    return Math.max(min, Math.min(max, v));
  }

  // remove any current animation
  function clearFighterAnimationClasses() { 
    fighterP1.classList.remove("fighter-hit-left", "fighter-hit-right", "fighter-heal");
    fighterP2.classList.remove("fighter-hit-left", "fighter-hit-right", "fighter-heal");
  }

  // control attack and heal animations
  function animateAttack(target) {
    clearFighterAnimationClasses();

    if (target === "p1") {
      fighterP1.classList.add("fighter-hit-left"); 
      playSound(sfx.attack, 0.8);

    } else {
      fighterP2.classList.add("fighter-hit-right");
      playSound(sfx.attack, 0.8);
    }
  }

  function animateHeal(actor) {
    clearFighterAnimationClasses();

    if (actor === "p1") {
      fighterP1.classList.add("fighter-heal"); 
      playSound(sfx.heal, 0.8);

    } else {
      fighterP2.classList.add("fighter-heal");
      playSound(sfx.heal, 0.8);
    }
  }

  // Battle flowL
  // reset mathch so new battle starts with 30 full health, player 1's turn, default battle ui
  function startBattle() {
    document.body.removeAttribute("data-winner");
    state.turn = "p1";
    state.p1HP = MAX_HP;
    state.p2HP = MAX_HP;

    state.pendingAction = null;
    state.canRoll = false; 

    clearFighterAnimationClasses();
    renderHP(); 

    setTurnUI();
  }

  // record if player chose to attack or heal, then switch center ui choice buttons to dice
  // save chosen action, show dice roll
  function chooseAction(action) {
    state.pendingAction = action;

    turnCard.style.display = "none";
    diceBtn.style.display = "inline-block";
    hint.textContent = "Click the dice to roll.";
    state.canRoll = true;
  }

  // use rolled number to appply damage or heal
  // play matching animation, show text feedback, switch turns or go to corresponding victory screen
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
        animateAttack(target);
      } else {
        var healAmount = BASE_HEAL * roll;

        if (actor === "p1") {
          state.p1HP = clamp(state.p1HP + healAmount, 0, MAX_HP);
        } else {
          state.p2HP = clamp(state.p2HP + healAmount, 0, MAX_HP);
        }

        hint.textContent = "Heal! x" + roll; 
        animateHeal(actor);

      } 


      renderHP();


      setTimeout(function () {
        clearFighterAnimationClasses();

        if (state.p1HP <= 0 || state.p2HP <= 0) {
          var winner = state.p1HP > 0 ? "p1" : "p2";

          goVictory(winner).then(function () {
            resolve();
          });
          return;
        }

        state.turn = state.turn === "p1" ? "p2" : "p1";

        setTimeout(function () {
          setTurnUI();
          resolve();
        }, 350);
      }, 1200);
    });
  }

  // choose random num 1-6, update dice image, play dice sound, trigger selected action
  function rollDice() {
    if (!state.canRoll) {
      return;
    }

    state.canRoll = false;
    playSound(sfx.dicePop, 0.8);

    var n = Math.floor(Math.random() * 6) + 1;

    if (state.turn === "p1") {
      diceImg.src = DICE.p1(n);
    } else {
      diceImg.src = DICE.p2(n);

    }

    applyRoll(n);
  }

  // vicotry screen
  // decide winner, swap to correct victory art (bkround and player), allow player to restart game
  function goVictory(winner) {
    document.body.dataset.winner = winner;

    clearFighterAnimationClasses();

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

  // Events:
  // start match, choose moves, roll dice, restart after win all connected to buttons
  introPlayBtn.addEventListener("click", function () {
    playSound(sfx.click, 0.7);
    startBkgMusic();
    startBattle(); 
    showScreen("battle", BKG.battle);
  });

  choiceBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var action = btn.dataset.action;

      playSound(sfx.click, 0.7);
      chooseAction(action);
    });
  });

  diceBtn.addEventListener("click", function () {
    rollDice();
  });

  againBtn.addEventListener("click", function () {
    playSound(sfx.click, 0.7);
    restartFromVictory();
  });

  // load intro background and make sure it is first visible screen when the page opens
  bkgA.style.backgroundImage = 'url("' + BKG.intro + '")';
  bkgB.style.backgroundImage = 'url("' + BKG.intro + '")';

  state.screen = "intro";
  screens.forEach(function (s) {
    s.classList.remove("screen--active");
  });
  getScreenEl("intro").classList.add("screen--active");
}());






