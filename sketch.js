let notes = [];
let scrX = 0;
let scrY = -400;
let beforeMouseX;
let beforeMouseY;
let noteMag = 300; //小節の大きさ
const keySize = 13;
const tabSize = 25;
let monoSynth = [];
for(let i=0; i<132; i++) monoSynth.push(new p5.MonoSynth());
let synthI = 0;
let length;
let noteNum = 0;
const link = document.createElement('a');
let vShow = 0;

class Note {
  constructor(p, v, t, l) {
    this.p = p;
    this.v = v;
    this.t = t;
    this.l = l;
    this.n = noteNum;
    noteNum ++;
  }
  
  draw() {
    if(this.p != -1) {
      fill(134, 164, 249, 128);
      stroke(18, 22, 33);
      strokeWeight(0.5);
      rect(timeToX(this.t), pitchToY(this.p), this.l*noteMag/4, keySize);
      if(vShow%2 == 0) {
        textSize(10);
        fill(255, 255, 255, 64);
        noStroke();
        text(this.v, timeToX(this.t)+2, pitchToY(this.p-1)-2)
      }
    }
  }
  
  click(t, p, m) {
    if(floor(this.t*4)/4 == t && this.p == p) {
      if(m == 90) { //z
        this.p = -1;
      } else if(m == 88) { //x
        this.l += 0.25;
      } else if(m == 67) { //c
        this.l *= 0.5;
      } else if(m == 86) { //v
        this.v -= 10;
      } else if(m == 66) { //b
        this.t += 1/24;
      }
    }
  }
}

function writeFile(arr, fileName) {
  const blob = new Blob(arr, {type: 'text/plain'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
}

function playSound(p, v) {
  monoSynth[synthI].play(p, v/100);
  if(synthI == 31) synthI = 0;
  else synthI += 1;
}

function xToTime(x) {
  let t = (x-48-scrX)/(noteMag/4);
  return floor(t*4)/4;
}

function timeToX(t) {
  let x = 48+t*noteMag/4+scrX
  return x;
}

function yToPitch(y) {
  let p = 131-floor((y-scrY)/keySize);
  return p;
}

function pitchToY(p) {
  let y = (131-p)*keySize+scrY;
  return y;
}

function pitchToScale(p) {
  let a;
  if(p%12 == 0) a = "C"
  else if(p%12 == 1) a = "Db"
  else if(p%12 == 2) a = "D"
  else if(p%12 == 3) a = "Eb"
  else if(p%12 == 4) a = "E"
  else if(p%12 == 5) a = "F"
  else if(p%12 == 6) a = "Gb"
  else if(p%12 == 7) a = "G"
  else if(p%12 == 8) a = "Ab"
  else if(p%12 == 9) a = "A"
  else if(p%12 == 10) a = "Bb"
  else if(p%12 == 11) a = "B"
  let b = floor((p+4)/12)-1;
  return a+b;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("monospace");
  userStartAudio();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if(scrY+mouseY-beforeMouseY < -132*keySize+height) scrY = -132*keySize+height;
}

function mouseClicked() {
  if(keyIsDown(16) && mouseX > 45 && mouseY > tabSize) {
    notes.push(new Note(yToPitch(mouseY), 100, xToTime(mouseX), 0.25));
    playSound(pitchToScale(notes.at(-1).p), notes.at(-1).v, 0, notes.at(-1).l);
    console.log(notes);
  } else if(keyIsDown(90) || keyIsDown(88) || keyIsDown(67) || keyIsDown(86) || keyIsDown(66)){
    for(let i of notes) {
      i.click(xToTime(mouseX), yToPitch(mouseY), keyCode);
    }
  }
}

function keyPressed() {
  if(keyIsDown(83)) {
    //ソート
    notes.sort((a, b) => {
      if(a.t < b.t) return -1;
      if(a.t > b.t) return 1;
      return 0;
    });

    console.log(notes);
    
    //書き出し
    let pList = [];
    let vList = [];
    let tList = [];
    let lList = [];
    for(let i of notes) {
      pList.push(i.p);
      vList.push(i.v);
      tList.push(i.t);
      lList.push(i.l);
    }
    writeFile(pList.map(x => x + "\n"), "p.txt");
    writeFile(vList.map(x => x + "\n"), "v.txt");
    writeFile(tList.map(x => x + "\n"), "t.txt");
    writeFile(lList.map(x => x + "\n"), "l.txt");
  }
  
  if(keyIsDown(13)) vShow++
}

function draw() {
  background(92, 96, 112);
  
  //スクロール
  if(keyIsDown(18)) {
    if(keyIsDown(16)) {
      if(scrY+mouseY-beforeMouseY > tabSize) {
        scrY = tabSize;
      } else if(scrY+mouseY-beforeMouseY < -132*keySize+height) {
        scrY = -132*keySize+height;
      } else {
        scrY += mouseY-beforeMouseY;
      }
    }
    if(scrX+mouseX-beforeMouseX > 0) {
      scrX = 0;
    } else {
      scrX += mouseX-beforeMouseX;
    }
  }
  beforeMouseX = mouseX;
  beforeMouseY = mouseY;
  
  //拡大
  if(keyIsDown(186)) noteMag *= 1.01;
  if(keyIsDown(189)) noteMag *= 0.99;
  
  //黒鍵の影
  fill(43, 47, 59, 48);
  noStroke();
  let lastY = scrY;
  for(let i=0; i<11; i++) {
    for(let y=0; y<3; y++) {
      rect(0, lastY + keySize + y*keySize*2, width, keySize, 0, 3, 3, 0);
    }
    for(let y=0; y<2; y++) {
      rect(0, lastY + keySize*8 + y*keySize*2, width, keySize, 0, 3, 3, 0);
    }
    lastY += keySize*12;
  }
  
  //枠線
  for(let y=0; y<132; y++) {
    stroke(43, 47, 59, 192);
    strokeWeight(y%12 == 0 ? 1 : 0.5);
    line(0, y*keySize+scrY, width, y*keySize+scrY);
  }
  for(let x=0; x<1000; x++) {
    push();
    stroke(43, 47, 59, 64);
    strokeWeight(2);
    line(48+x*noteMag+scrX, 0, 48+x*noteMag+scrX, height);
    pop();
    for(let x2=0; x2<4; x2++) {
      line(48+(x+x2/4)*noteMag+scrX, 0, 48+(x+x2/4)*noteMag+scrX, height);
    }
    strokeWeight(0.3);
    for(let x2=0; x2<16; x2++) {
      line(48+(x+x2/16)*noteMag+scrX, 0, 48+(x+x2/16)*noteMag+scrX, height);
    }
  }
  
  //ノート
  for(let i of notes) i.draw();
  
  //白鍵
  stroke(67, 73, 86);
  strokeWeight(0.5);
  fill(240, 241, 244);
  lastY = scrY;

  for(let i=0; i<11; i++){
    for(let y=0; y<4; y++) {
      rect(0, lastY+y*keySize*(7/4), 45, keySize*(7/4)*0.97, 0, 3, 3, 0);
    }
    lastY = lastY+4*keySize*(7/4);
    for(let y=0; y<3; y++) {
      rect(0, lastY+y*keySize*(5/3), 45, keySize*(5/3)*0.97, 0, 3, 3, 0);
    }
    lastY = lastY+3*keySize*(5/3);
    
    //数字
    push();
    stroke(98, 105, 132);
    strokeWeight(1);
    fill(98, 105, 132);
    textSize(10.5);
    let txt = ((10-i)*12).toString()
    text(txt, 37-txt.length*4, lastY-5);
    pop();
  }
  
  //黒鍵
  fill(43, 47, 59);
  noStroke();
  lastY = scrY;
  for(let i=0; i<11; i++) {
    for(let y=0; y<3; y++) {
      rect(0, lastY + keySize + y*keySize*2, 25, keySize, 0, 3, 3, 0);
    }
    for(let y=0; y<2; y++) {
      rect(0, lastY + keySize*8 + y*keySize*2, 25, keySize, 0, 3, 3, 0);
    }
    lastY += keySize*12;
  }
  
  //タブ
  fill(92, 96, 112);
  stroke(43, 47, 59, 128);
  strokeWeight(1);
  rect(0, 0, width, tabSize);
  fill(43, 47, 59, 128);
  noStroke();
  rect(0, 0, width, tabSize);
  fill(43, 47, 59, 192)
  for(let x=0; x<1000; x++) {
    stroke(43, 47, 59, 192);
    strokeWeight(1.5);
    line(48+x*noteMag+scrX, 0, 48+x*noteMag+scrX, tabSize-0.75);
    strokeWeight(1);
    for(let x2=0; x2<4; x2++) {
      line(48+(x+x2/4)*noteMag+scrX, tabSize-10, 48+(x+x2/4)*noteMag+scrX, tabSize-0.5);
    }
    noStroke();
    textSize(16);
    text((noteMag < 50) ? "" : x+1, 48+x*noteMag+scrX+2, tabSize-2);
  }
  fill(92, 96, 112);
  noStroke();
  rect(0, 0, 47, tabSize);
  fill(43, 47, 59, 128);
  rect(0, 0, 47, tabSize);
}
