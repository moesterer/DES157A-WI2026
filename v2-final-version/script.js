"use strict";
console.log("reading js"); 


const introScreen = document.getElementById("introScreen");
const mainScreen = document.getElementById("mainScreen");
const goBtn = document.getElementById("goBtn");


const imgA  = document.getElementById("imgA");
const imgB = document.getElementById("imgB");
const mainText = document.getElementById("mainText");

const toast = document.getElementById("toast");
const toastText = document.getElementById("toastText");


// each state has different content
const STATE_CONFIG = {
    work: { img: "images/work.jpg",  text: "WORKING... CALCULATING... WRITING...\nWow this worksheet is pretty tough." },
    show: { img: "images/show.jpg", text: "WATCHING... ENJOYING...\nOMG what a twist!" },
    text: { img: "images/text.jpg", text: "TYPING...\nHow should I phrase this? Hey I..." },
    snack: { img: "images/snack.jpg", text: "SNACKING... MUNCHING...\nYum. I should buy this again." },
    drink: { img: "images/drink.jpg", text: "DRINKING... SIPPING...\nHmm, quite refreshing." }
};

const VALID_STATES = new Set(Object.keys(STATE_CONFIG));

let currentState = "main";
let hasLeftMainOnce = false;
let activeImageIsA = true; 

// intro to main screen
goBtn.addEventListener("click", () => {
    introScreen.classList.remove("screen--active");
    mainScreen.classList.add("screen--active");

    goBtn.style.display = "none";
    startNotificationLoop();

});

// click handling for SVG
document.addEventListener("click", (e) => { 
    const target = e.target.closest("[data-state]");
    if (!target){
        return; 
    }

    const nextState = target.getAttribute("data-state");
    if (!VALID_STATES.has(nextState)) {
        return;
    }

    // you can't go back to main after beginning leave
    if (hasLeftMainOnce && nextState === "main"){
        return;
    }

    if (currentState === "main" && nextState !== "main") {
        hasLeftMainOnce = true; 
    }

    if (nextState === currentState){
        return; 
    }

    goToState(nextState);
});

// crossfade between different tast images
function goToState(stateName) {
    const cfg = STATE_CONFIG[stateName]; 
    if (!cfg) return;

    let incoming;
    let outgoing;

    if (activeImageIsA) {
        incoming = imgB;
        outgoing = imgA;
    } else {
        incoming = imgA; 
        outgoing = imgB;
    }

    const preloader = new Image(); 
    preloader.onload = () => {
        incoming.src = cfg.img; 

        // double RAF prevents flash

        requestAnimationFrame(() => {
            incoming.classList.add("scene-img--active");
            outgoing.classList.remove("scene-img--active");
            activeImageIsA = !activeImageIsA;
            currentState = stateName; 
            mainText.textContent = cfg.text;
        });

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
    if (notifyIntervalId){
        return;
    }

    notifyIntervalId = setInterval(() => {
        showRandomToast();
    }, 10000); 
}

function showRandomToast() {
    const msg = NOTIFICATIONS[Math.floor(Math.random() * NOTIFICATIONS.length)];
    toastText.textContent = msg;

    toast.classList.remove("toast--out"); 
    toast.classList.add("toast--in");

    if (notifyTimeoutHideId){
        clearTimeout(notifyTimeoutHideId);
    }

    // slide in and stay for 5 sec
    notifyTimeoutHideId = setTimeout(() => {
        toast.classList.remove("toast--in");
        toast.classList.add("toast--out");

    }, 360 + 5000); 

} 







