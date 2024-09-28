// Create the SVG element
let svgNS = "http://www.w3.org/2000/svg";
let svg1 = document.createElementNS(svgNS, "svg");
let svg2 = document.createElementNS(svgNS, "svg");

let path1 = document.createElementNS(svgNS, "path");
let path2 = document.createElementNS(svgNS, "path");

svg1.appendChild(path1);
svg2.appendChild(path2);

document.querySelector(".svgContainer").appendChild(svg1);
document.querySelector(".svgContainer").appendChild(svg2);

class SineWave {
  constructor(progress = 0, delta = 1.0 / 50000.0) {
    this.progress = progress;
    this.delta = delta;
  }

  getValue() {
    const value = Math.sin(this.progress * Math.PI * 2.0);
    this.progress += this.delta;
    return value;
  }
}

const freq = 250.0;
const SineOsc = new SineWave(0, 1.0 / freq, 4.0);
const SineOsc2 = new SineWave(100, 1.0 / 500.0, 4.0);

function createWobblyCircle(cx, cy, r, segments, wobbleFactor, SineOsc) {
  let d = "";
  let firstX, firstY;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    // let wobble = Math.sin(progressSine * Math.PI * 2.0) * wobbleFactor * (Math.sin(progress) * 0.2) * (Math.sin(progress) * 10);
    let wobble = SineOsc.getValue() * wobbleFactor;

    const x = cx + (r + wobble) * Math.cos(angle);
    const y = cy + (r + wobble) * Math.sin(angle);

    if (i === 0) {
      firstX = x;
      firstY = y;
      d += `M ${x} ${y}`;
    } else if (i === segments) {
      d += ` L ${firstX} ${firstY}`;
    } else {
      d += ` L ${x} ${y}`;
    }
  }
  d += " Z"; // Close the path
  return d;
}

function animate() {
  const wobblyPath = createWobblyCircle(50, 50, 150, 500, 8, SineOsc); // 100 segments for smoothness, wobble factor of 5
  const wobblyPath2 = createWobblyCircle(50, 50, 150, 500, 6, SineOsc2); // 100 segments for smoothness, wobble factor of 5
  path1.setAttribute("d", wobblyPath);
  path2.setAttribute("d", wobblyPath2);
  requestAnimationFrame(animate); // Continuously update the path
}

animate();
