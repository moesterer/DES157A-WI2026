(function () {
  "use strict";
  console.log("reading js");

  // use only querySelector / querySelectorAll
  const introScreen = document.querySelector("#introScreen");
  const mainScreen = document.querySelector("#mainScreen");
  const goBtn = document.querySelector("#goBtn");

  const imgA = document.querySelector("#imgA");
  const imgB = document.querySelector("#imgB");
  const mainText = document.querySelector("#mainText");

  const toast = document.querySelector("#toast");
  const toastText = document.querySelector("#toastText");

  // each state has different content
  const STATE_CONFIG = {
    work: {
      img: "images/work.jpg",
      text: "WORKING... CALCULATING... WRITING...\nWow this worksheet is pretty tough."
    },
    show: {
      img: "images/show.jpg",
      text: "WATCHING... ENJOYING...\nOMG what a twist!"
    },
    text: {
      img: "images/text.jpg",
      text: "TYPING...\nHow should I phrase this? Hey I..."
    },
    snack: {
      img: "images/snack.jpg",
      text: "SNACKING... MUNCHING...\nYum. I should buy this again."
    },
    drink: {
      img: "images/drink.jpg",
      text: "DRINKING... SIPPING...\nHmm, quite refreshing."
    }
  };

  const VALID_STATES = new Set(Object.keys(STATE_CONFIG));

  let currentState = "main";
  let hasLeftMainOnce = false;
  let activeImageIsA = true;

  // intro to main screen
  if (goBtn) {
    goBtn.addEventListener("click", function () {
      if (introScreen) introScreen.classList.remove("screen--active");
      if (mainScreen) mainScreen.classList.add("screen--active");

      goBtn.style.display = "none";
      startNotificationLoop();
    });
  }

  // click handling for SVG (or anything with data-state)
  document.addEventListener("click", function (e) {
    const target = e.target.closest("[data-state]");
    if (!target) return;

    const nextState = target.getAttribute("data-state");
    if (!VALID_STATES.has(nextState)) return;

    // you can't go back to main after beginning leave
    if (hasLeftMainOnce && nextState === "main") return;

    if (currentState === "main" && nextState !== "main") {
      hasLeftMainOnce = true;
    }

    if (nextState === currentState) return;

    goToState(nextState);
  });

  function goToState(stateName) {
  const cfg = STATE_CONFIG[stateName];
  if (!cfg) return;

  const incoming = activeImageIsA ? imgB : imgA;
  const outgoing = activeImageIsA ? imgA : imgB;
  if (!incoming || !outgoing) return;


  if (mainText) mainText.textContent = cfg.text;


  const preloader = new Image();
  preloader.onload = function () {

    incoming.src = cfg.img;


    incoming.classList.remove("scene-img--active");
    outgoing.classList.add("scene-img--active");


    requestAnimationFrame(function () {
      incoming.classList.add("scene-img--active");
      outgoing.classList.remove("scene-img--active");
    });


    const onDone = function (evt) {
      if (evt.propertyName !== "opacity") return;

      incoming.removeEventListener("transitionend", onDone);

      activeImageIsA = !activeImageIsA;
      currentState = stateName;

      outgoing.src = cfg.img;
    };

    incoming.addEventListener("transitionend", onDone);
  };

  preloader.src = cfg.img;
}

  const NOTIFICATIONS = [
    "Hmm... I’m a bit parched.",
    "Wait, did I reply to that text?",
    "I'm kind of hungry...",
    "Wait I've just missed the last 5 min of the show, what just happened?",
    "I need to get more work done."
  ];

  let notifyIntervalId = null;
  let notifyTimeoutHideId = null;

  function startNotificationLoop() {
    if (notifyIntervalId) return;

    notifyIntervalId = setInterval(function () {
      showRandomToast();
    }, 10000);
  }

  function showRandomToast() {
    if (!toast || !toastText) return;

    const msg = NOTIFICATIONS[Math.floor(Math.random() * NOTIFICATIONS.length)];
    toastText.textContent = msg;

    toast.classList.remove("toast--out");
    toast.classList.add("toast--in");

    if (notifyTimeoutHideId) {
      clearTimeout(notifyTimeoutHideId);
    }

    // slide in and stay for 5 sec
    notifyTimeoutHideId = setTimeout(function () {
      toast.classList.remove("toast--in");
      toast.classList.add("toast--out");
    }, 360 + 5000);
  }
})();