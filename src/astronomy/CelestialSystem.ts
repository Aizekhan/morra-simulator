import { CelestialBody } from "./CelestialBody";

export class CelestialSystem {

  private bodies: CelestialBody[] = [];

  add(
    body: CelestialBody
  ) {

    if(
      this.bodies.includes(body)
    ) {
      return;
    }

    this.bodies.push(
      body
    );
  }

  remove(
    body: CelestialBody
  ) {

    const index =
      this.bodies.indexOf(body);

    if(
      index === -1
    ) {
      return;
    }

    this.bodies.splice(
      index,
      1
    );
  }

  update(
    delta: number
  ) {

    for(
      const body of this.bodies
    ) {

      body.update(
        delta
      );
    }
  }

  clear() {

    this.bodies = [];
  }
}
