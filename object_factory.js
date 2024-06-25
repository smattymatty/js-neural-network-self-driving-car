// This would be similar in structure to your Car class but simpler.
class PowerUp {
  constructor(x, y, width, height, effect) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.effect = effect; // Describe the power-up effect (e.g., speed boost)
  }

  // Power-ups might not move, but you could animate them or have them interact with cars.
  update() {
    // Specific update logic for power-ups if necessary
  }

  draw(ctx) {
    ctx.fillStyle = "yellow"; // Assume power-ups are yellow
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class GameObjectFactory {
  createObject(type, y, lane) {
    switch (type) {
      case "bigCar":
        return new Car(road.getLaneCenter(lane), y, 40, 100, "DUMMY", 4);
      case "car":
        return new Car(road.getLaneCenter(lane), y, 30, 45, "DUMMY", 4);
      case "fastCar":
        return new Car(road.getLaneCenter(lane), y, 10, 30, "DUMMY", 6);
      default:
        throw new Error("Unknown type", type);
    }
  }
}

function generateCarLine(y, laneIndex, factory, objects) {
  for (let j = 0; j < road.laneCount; j++) {
    if (j == laneIndex) continue;
    const gameObject = factory.createObject("car", y, j);
    objects.push(gameObject);
  }
}
