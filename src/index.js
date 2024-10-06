const canvas = document.getElementById("frequency-canvas");
const canvasCtx = canvas ? canvas.getContext("2d") : null;


function onPageLoad() {

}

window.addEventListener("load", onPageLoad);

import Controller from "./Controller.js";
const AppController = new Controller();
