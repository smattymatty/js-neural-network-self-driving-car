const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 400;

const carCTX = carCanvas.getContext("2d");
const networkCTX = networkCanvas.getContext("2d");
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

const mutateRate = 0.0005; // how much to mutate the network, 1 is 100%
const N = 100; // number of cars to generate
const cars = generateCars(N);
let bestCar = cars[0]; // the car with the highest fitness
let currentCar = bestCar;
let autoUpdateCurrentCar = true;
updateCurrentCarID(currentCar.id);

if (localStorage.getItem("bestBrain")) {
  setBestBrainScore(localStorage.getItem("bestBrainScore"));
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
    if (i != 0) {
      NeuralNetwork.mutate(cars[i].brain, mutateRate);
    } // don't mutate the first car
  } // mutate the rest
} // if there is a best brain in local storage

let lastGeneratedObjectY = -200;

const objectFactory = new GameObjectFactory();

const numInitialObjects = 50; // Number of objects to generate

const traffic = [];

for (i = 0; i < road.laneCount; i++) {
  generateCarLine(lastGeneratedObjectY, i, objectFactory, traffic);
  lastGeneratedObjectY -= Math.floor(Math.random() * 300) + 200;
  console.log("generated carline", traffic);
}
generateRandomGameObjects(objectFactory, numInitialObjects);

onSimulationStart(N);
animate();

function save() {
  setBestBrainScore(bestCar.score);
  localStorage.setItem("bestBrainScore", bestCar.score);
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
  localStorage.removeItem("bestBrain");
  localStorage.setItem("bestBrainScore", 0);
}

function generateRandomGameObjects(factory, numObjects) {
  const objects = [];
  const objectTypes = ["carLine", "bigCar"];
  for (let i = 0; i < numObjects; i++) {
    const type = objectTypes[Math.floor(Math.random() * objectTypes.length)];
    const laneIndex = Math.floor(Math.random() * road.laneCount);
    lastGeneratedObjectY -= Math.floor(Math.random() * 400) + 200; // Adjust as needed
    switch (type) {
      case "carLine":
        generateCarLine(lastGeneratedObjectY, laneIndex, factory, objects);
        break;
      default:
        const gameObject = factory.createObject(
          type,
          lastGeneratedObjectY,
          laneIndex
        );
        objects.push(gameObject);
    }
  }
  traffic.push(...objects);
  return objects;
}

function generateCars(N) {
  const cars = [];
  for (let i = 1; i <= N; i++) {
    const laneIndex = 2; //Math.floor(Math.random() * road.laneCount);
    const generatedCar = new Car(
      road.getLaneCenter(laneIndex),
      100,
      30,
      45,
      "AI",
      8
    );
    generatedCar.id = i;
    cars.push(generatedCar);
  }
  return cars;
}

function switchToBestCar() {
  bestCar = cars.find((c) => c.score == Math.max(...cars.map((c) => c.score)));
  currentCar = bestCar;
}

function animate(time) {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
  }
  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic);
  }

  if (autoUpdateCurrentCar) {
    switchToBestCar();
  }

  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;

  carCTX.save();
  carCTX.translate(0, -currentCar.y + carCanvas.height * 0.7);

  road.draw(carCTX);
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCTX, "red");
  }
  carCTX.globalAlpha = 0.2;
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(carCTX, "blue");
  }
  carCTX.globalAlpha = 1;
  bestCar.draw(carCTX, "blue", true);

  carCTX.restore();

  networkCTX.lineDashOffset = -time / 100;
  Visualizer.drawNetwork(networkCTX, bestCar.brain);
  requestAnimationFrame(animate);

  setCurrentCarScore(currentCar.score);
}
