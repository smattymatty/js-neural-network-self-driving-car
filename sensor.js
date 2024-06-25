class Sensor {
  constructor(car) {
    this.car = car;
    this.rayCount = 15;
    this.rayLength = 350;
    this.raySpread = Math.PI / 1.8;

    this.rays = [];
    this.readings = [];
  }

  update(roadBorders, traffic) {
    this.#castRays();
    this.readings = [];
    for (let i = 0; i < this.rays.length; i++) {
      this.readings.push(this.#getReading(this.rays[i], roadBorders, traffic));
    }
  }

  #getReading(ray, roadBorders, traffic) {
    let touches = [];

    // Check road borders for intersections
    roadBorders.forEach((border) => {
      const touch = getIntersection(ray[0], ray[1], border[0], border[1]);
      if (touch) {
        touches.push(touch);
      }
    });

    // Check each traffic object only if it has a polygon defined
    traffic.forEach((obj) => {
      if (obj.polygon) {
        for (let j = 0; j < obj.polygon.length; j++) {
          const touch = getIntersection(
            ray[0],
            ray[1],
            obj.polygon[j],
            obj.polygon[(j + 1) % obj.polygon.length]
          );
          if (touch) {
            touches.push(touch);
          }
        }
      } else {
        console.error("Traffic object without polygon", obj);
      }
    });

    // Find the closest intersection point
    if (touches.length === 0) {
      return null;
    } else {
      const offsets = touches.map((e) => e.offset);
      const minOffset = Math.min(...offsets);
      return touches.find((e) => e.offset === minOffset);
    }
  }

  #castRays() {
    this.rays = [];
    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle =
        lerp(
          this.raySpread / 2,
          -this.raySpread / 2,
          this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
        ) + this.car.angle;

      const start = { x: this.car.x, y: this.car.y };
      const end = {
        x: this.car.x - Math.sin(rayAngle) * this.rayLength,
        y: this.car.y - Math.cos(rayAngle) * this.rayLength,
      };
      this.rays.push([start, end]);
    }
  }

  draw(ctx) {
    this.rays.forEach((ray, i) => {
      const end = this.readings[i] ? this.readings[i] : ray[1];

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "yellow";
      ctx.moveTo(ray[0].x, ray[0].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      if (this.readings[i]) {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.moveTo(ray[1].x, ray[1].y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }
    });
  }
}
