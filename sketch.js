let myWord = "cat"
let myVec = [0,0,0,0,0]
let dictionary;

function preload() {
  raw_words = loadJSON("words.json");
  font = loadFont('Avenir.otf');
}

function setup() {
  createDictionary()
  print(dictionary)
  setWord("cat")
  createCanvas(windowWidth, windowHeight);
  hopCnt = 100
  cnt = 200
  cnt2 = 400
  newWord = false
  myRec = new p5.SpeechRec('en-US'); // new P5.SpeechRec object
  myRec.continuous = true; // do continuous recognition
  myRec.interimResults = false
  myRec.onResult=parseResult;
  myRec.start();
  myRec.onResult=parseResult;
  test = new wordBox(font.textBounds(
    'test', 0, 0, 200), font.textToPoints(
    'test', 0,0, 200, {
      sampleFactor: 1,
      simplifyThreshold: 0
    }));
  boxes = [test];
  
  cursor(CROSS);
  fill(255, 127);
  noStroke();
  let particleSum = 10000
  allParticles = []
  for (let i = 0; i < particleSum; i++) {
    allParticles.push(new particle());
  }
  

}

function setWord(word) {
  print(word)
  myWord = word.toUpperCase()
  //wordData = dictionary[myWord]
  //print(wordData)
}


function findCloseWords(word) {
  
}

function draw() {
  
  background(220);
  background(0);
  
  stroke(51);
  line(width / 2, 0, width / 2, height);
  line(0, height / 2, width, height / 2);
  noStroke();
  
  let centerDist = dist(mouseX, mouseY, width / 2, height / 2);

  let transparency = map(centerDist, 0, width / 2, 200, 50);
  transparency = constrain(transparency, 50, 200);
	fill(255, transparency);
  let jiggle = map(centerDist, 0, width, 1, 300);
  
  if(hopCnt>-1000){
    for(i=0;i<allParticles.length;i++){
      allParticles[i].move()
      allParticles[i].display()
    }
    hopCnt -= 1
  }
  else{
    for(i=0;i<allParticles.length;i++){
      allParticles[i].display()
    }
  }
  
  
  
}

function draw2() {
  background(220);
  background(0);
  
  stroke(51);
  line(width / 2, 0, width / 2, height);
  line(0, height / 2, width, height / 2);
  noStroke();
  
  let centerDist = dist(mouseX, mouseY, width / 2, height / 2);

  let transparency = map(centerDist, 0, width / 2, 200, 50);
  transparency = constrain(transparency, 50, 200);
	fill(255, transparency);
  
  let jiggle = map(centerDist, 0, width, 1, 300);
  
  
  
// 	stroke(255, 0, 0);
//   rect(bounds.x, bounds.y, bounds.w, bounds.h);
  
//   console.log("x: " + bounds.x 
//               + ", y: " + bounds.y
//               + ", w: " + bounds.w
//               + ", h: " + bounds.h);
  
  for (let i = 0; i<boxes.length; i++){
    bounds = boxes[i].bounds
    
    for (let j = 0; j < boxes[i].points.length; j++) {
      let p = boxes[i].points[j];
      r = random(255); // r is a random number between 0 - 255
      g = random(0,255); // g is a random number betwen 100 - 200
      b = random(0,255); // b is a random number between 0 - 100
      a = random(0,255); // a is a random number between 200 - 255
  
      noStroke();
      fill(r, g, b, a);
    
      ellipse(p.x + cnt * randomGaussian(), 
        p.y + cnt * randomGaussian(), 5, 5);
    }
  }
  
  
  if(cnt < 0 && cnt2 > 0){
    cnt2 = cnt2 - 2
  }
  else if(newWord) {
    cnt = cnt-2
  }
  if(cnt <= -200){
    cnt = 200
    cnt2 = 400
    newWord = false
  }
}

function createDictionary() {
//   Oh no, p5 mangles the dictionary
  dictionary = {}
  allWords = []
  for (var index in raw_words) {
    w = raw_words[index]
    
    word = {
      word:w[0],
      freqS:w[1],
      freqW:w[2],
      syllables:w[3].split(" "),
      vecP:w[4].split(" ").map(s => float(s)),
      vecM:w[5].split(" ").map(s => float(s)),
    }
    dictionary[w[0]] = word
    allWords.push(word)
  }
 
}

function parseResult(){
  mostrecentword = myRec.resultString;
  chunk = mostrecentword.split(" ")
  freqDict = {}
  for(i=0;i<chunk.length; i++){
    print(chunk[i])
    myWord = chunk[i].toUpperCase().split(".").join("")
    print(myWord)
    try{
      wordData = dictionary[myWord]
      if(Object.keys(freqDict).length>0){
        maxNum = 0
        for (let k in freqDict){
          if(freqDict[k]>maxNum){
            maxKey = k
            maxNum = freqDict[k]
          }
        }
        if(wordData.freqS < maxNum){
          delete freqDict[maxKey]
          freqDict[wordData.word] = wordData.freqS
        }
      }
      else{
        print("Adding")
        print(wordData)
        freqDict[wordData.word] = wordData.freqS
      }
    }
    catch{
      print("No result for " + chunk[i])
    }
  }
  print("FREQUENCY DICT:")
  print(freqDict)
  newWord = true
  tot = []
  for (let k in freqDict){
    print("GOT IN HERE")
    points = font.textToPoints(
    k,(width - abs(boxes[0].bounds.w)) / 2, 
            (height + abs(boxes[0].bounds.h)) / 2, 200, {
      sampleFactor: 1,
      simplifyThreshold: 0
    });
    
    
    temp = new wordBox(font.textBounds(k, 0, 0, 200), points)
    tot.push(temp)
  }
  boxes = tot
  k = 0
  
  for(i=0;i<boxes.length;i++){
    for(j=k; j< k+boxes[i].points.length; j++){
      boxPoint = j-k
      allParticles[j].direction = createVector((boxes[i].points[boxPoint].x)-allParticles[j].pos.x, (boxes[0].points[boxPoint].y)-allParticles[j].pos.y).div(50)
    }
    k=k+boxes[i].points.length
  }
  console.log(boxes)
  translate((width - abs(boxes[0].bounds.w)) / 2, 
            (height + abs(boxes[0].bounds.h)) / 2);
  
  
  

}

class wordBox{
  constructor(bounds, points){
    this.bounds = bounds
    this.points = points
  }
  
}

class particle{
  constructor(loc){
    this.pos = createVector(Math.floor(Math.random() * width), Math.floor(Math.random() * height));
    this.direction = createVector(Math.random() * 1.5, Math.random() * 1.5);
    this.r = random(255); // r is a random number between 0 - 255
    this.g = random(0,255); // g is a random number betwen 100 - 200
    this.b = random(0,255); // b is a random number between 0 - 100
    this.a = random(0,255); // a is a random number between 200 - 255
  }
  
  move() {
    this.pos = this.pos.add(this.direction);
    if (this.pos.x <= 0) this.direction.x *= -1;
    if (this.pos.x > width) this.direction.x *= -1;
    if (this.pos.y <= 0) this.direction.y *= -1;
    if (this.pos.y > height) this.direction.y *= -1;
  }
  display() {
    noStroke();
    
    fill(this.r, this.g, this.b, this.a);
    ellipse(this.pos.x, this.pos.y, 7)
  }
}
  