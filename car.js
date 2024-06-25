class Car {
  constructor(x, y, width, height, controlType, maxSpeed = 8) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.id = 0;
    this.score = 0;

    this.boostStrength = 1.5;
    this.brakeStrengh = 1.2;
    this.cooldown = 2000;

    this.speed = 0;
    this.acceleration = 0.2;
    this.maxSpeed = maxSpeed;
    this.friction = 0.05;
    this.angle = 0;
    this.damaged = false;

    this.useBrain = controlType == "AI";

    this.isBoosting = false;
    this.isBraking = false;

    if (controlType !== "DUMMY") {
      this.sensor = new Sensor(this);
      this.brain = new NeuralNetwork([this.sensor.rayCount, 15, 30, 30, 15, 4]);
    }
    this.controls = new Controls(controlType);
  }

  update(roadBorders, traffic) {
    if (!this.damaged) {
      this.#move();
      this.polygon = this.#createPolygon();
      this.damaged = this.#assessDamage(roadBorders, traffic);
    }
    if (this.sensor) {
      this.sensor.update(roadBorders, traffic);
      const offsets = this.sensor.readings.map((s) =>
        s == null ? 0 : 1 - s.offset
      );
      const outputs = NeuralNetwork.feedForward(offsets, this.brain);

      if (this.useBrain) {
        this.controls.forward = 1;
        // randomly generate "left" and "right" outputs
        this.controls.left = outputs[0];
        this.controls.right = outputs[1];

        if (outputs[2] == 1) {
          this.controls.boost(this);
        }
        if (outputs[3] == 1) {
          this.controls.brake(this);
        }
      }
    }
  }

  #assessDamage(roadBorders, traffic) {
    for (let i = 0; i < roadBorders.length; i++) {
      if (!this.polygon || !roadBorders[i]) {
        console.error("Missing polygon data", {
          carPolygon: this.polygon,
          roadBorder: roadBorders[i],
        });
        continue; // Skip this iteration if polygon data is missing
      }
      if (polysIntersect(this.polygon, roadBorders[i])) {
        onCarDamaged(this);
        return true;
      }
    }
    for (let i = 0; i < traffic.length; i++) {
      if (!this.polygon || !traffic[i].polygon) {
        console.error("Missing polygon data", {
          carPolygon: this.polygon,
          trafficPolygon: traffic[i].polygon,
        });
        continue; // Skip this iteration if polygon data is missing
      }
      if (polysIntersect(this.polygon, traffic[i].polygon)) {
        onCarDamaged(this);
        return true;
      }
    }
    return false;
  }

  #createPolygon() {
    const points = [];
    const rad = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);
    points.push({
      x: this.x - Math.sin(this.angle - alpha) * rad,
      y: this.y - Math.cos(this.angle - alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * rad,
      y: this.y - Math.cos(this.angle + alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
    });
    return points;
  }

  #move() {
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }
    if (this.controls.reverse) {
      this.speed -= this.acceleration;
    }

    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }

    if (this.speed > 0) {
      this.speed -= this.friction;
    }
    if (this.speed < 0) {
      this.speed += this.friction;
    }
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    if (this.speed != 0) {
      const flip = this.speed > 0 ? 1 : -1;
      if (this.controls.left) {
        this.angle += 0.03 * flip;
      }
      if (this.controls.right) {
        this.angle -= 0.03 * flip;
      }
    }

    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }

  draw(ctx, color, drawSensor = false) {
    if (this.damaged) {
      ctx.fillStyle = "gray";
    } else {
      ctx.fillStyle = color;
    }
    ctx.beginPath();
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
    for (let i = 1; i < this.polygon.length; i++) {
      ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
    }
    ctx.fill();

    if (this.sensor && drawSensor) {
      this.sensor.draw(ctx);
    }
    this.score = Math.floor(-this.y);
  }
}