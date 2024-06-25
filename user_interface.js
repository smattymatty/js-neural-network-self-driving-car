const currentCarDiv = document.getElementById("currentCarNum");
const currentCarScore = document.getElementById("currentCarScore");
const bestBrainScore = document.getElementById("bestBrainScore");
const carStats = document.getElementById("carStats");
const totalCars = document.getElementById("totalCars");
const aliveCars = document.getElementById("aliveCars");
const damagedCars = document.getElementById("damagedCars");

const userInterfaceDiv = document.getElementById("userInterface");

function onSimulationStart(num_cars) {
  totalCars.innerHTML = num_cars;
  aliveCars.innerHTML = num_cars;
  damagedCars.innerHTML = 0;
}

function onCarDamaged(car) {
  const currentDamagedCarsText = damagedCars.innerHTML;
  const currentDamagedCars = parseInt(currentDamagedCarsText, 10);
  const currentAliveCarsText = aliveCars.innerHTML;
  const currentAliveCars = parseInt(currentAliveCarsText, 10);

  aliveCars.innerHTML = currentAliveCars - 1;
  damagedCars.innerHTML = currentDamagedCars + 1;

  if (currentAliveCars - 1 < 1) {
    if (currentCar.score > localStorage.getItem("bestBrainScore")) {
      save();
    }
    location.reload();
  }
}

function setCurrentCarScore(amount) {
  currentCarScore.innerHTML = amount;
}

function setBestBrainScore(amount) {
  bestBrainScore.innerHTML = amount;
}

function updateCurrentCarID(id) {
  currentCarDiv.innerHTML = id;
}

function goToLowestScoreCar() {
  const firstCar = cars[0];
  console.log("firstCar", firstCar);
  currentCar = firstCar;
  updateCurrentCarID(currentCar.id);
}

function toggleModal(div) {
  if (div.style.display === "block") {
    div.style.display = "none";
  } else {
    div.style.display = "block";
  }
}

function toggleAutoUpdateCurrentCar() {
  autoUpdateCurrentCar = !autoUpdateCurrentCar;
}

function goToLowestScoreCar() {
  console.log("goToLowestScoreCar", cars);
  console.log("currentCar", currentCar);
  cars.forEach((car) => {
    if (car.score == Math.min(...cars.map((c) => c.score))) {
      currentCar = car;
    }
  });
  console.log("currentCar", currentCar);
}

// Event listener for the 'Escape' key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    const userInterfaceDiv = document.getElementById("userInterface");
    toggleModal(userInterfaceDiv);
  }
});

// Event listener for all buttons with the 'UIToggleButton' ID
document.querySelectorAll("#UIToggleButton").forEach((button) => {
  button.addEventListener("click", () => {
    const userInterfaceDiv = document.getElementById("userInterface");
    toggleModal(userInterfaceDiv);
  });
});
