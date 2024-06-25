class Controls {
  constructor(type) {
    this.forward = false;
    this.left = false;
    this.right = false;
    this.reverse = false;

    switch (type) {
      case "KEYS":
        this.#addKeyboardListeners();
        break;
      case "DUMMY":
        this.forward = true;
        break;
    }
  }

  #addKeyboardListeners() {
    document.onkeydown = (event) => {
      switch (event.key) {
        case "ArrowLeft":
          this.left = true;
          break;
        case "ArrowRight":
          this.right = true;
          break;
        case "ArrowUp":
          this.forward = true;
          break;
        case "ArrowDown":
          this.reverse = true;
          break;
      }
    };
    document.onkeyup = (event) => {
      switch (event.key) {
        case "ArrowLeft":
          this.left = false;
          break;
        case "ArrowRight":
          this.right = false;
          break;
        case "ArrowUp":
          this.forward = false;
          break;
        case "ArrowDown":
          this.reverse = false;
          break;
      }
    };
  }

  boost(car) {
    if (car.isBoosting || car.isBraking) {
      return;
    }
    const originalMaxSpeed = car.maxSpeed;
    const originalAcceleration = car.acceleration;
    car.isBoosting = true;
    car.maxSpeed = originalMaxSpeed * car.boostStrength;
    car.acceleration = originalAcceleration * car.boostStrength;
    setTimeout(() => {
      car.maxSpeed = originalMaxSpeed;
      car.speed = car.maxSpeed;
      car.acceleration = originalAcceleration;
    }, car.cooldown);
    setTimeout(() => {
      car.isBoosting = false;
    }, car.cooldown);
  }

  brake(car) {
    if (car.isBraking || car.isBoosting) {
      return;
    }
    const originalMaxSpeed = car.maxSpeed;
    const originalAcceleration = car.acceleration;
    car.isBraking = true;
    car.maxSpeed = originalMaxSpeed / car.brakeStrengh;
    car.speed = car.maxSpeed;
    car.acceleration = originalAcceleration / car.brakeStrengh;
    setTimeout(() => {
      car.maxSpeed = originalMaxSpeed;
      car.acceleration = originalAcceleration;
    }, car.cooldown);
    setTimeout(() => {
      car.isBraking = false;
    }, car.cooldown);
  }
}
