import type {
  WorldLocation
} from "./WorldLocation";

export class WorldLocationSystem {

  private locations =
    new Map<
      string,
      WorldLocation
    >();

  add(
    location: WorldLocation
  ) {

    this.locations.set(
      location.id,
      location
    );
  }

  remove(
    id: string
  ) {

    this.locations.delete(
      id
    );
  }

  get(
    id: string
  ) {

    return this.locations.get(
      id
    );
  }

  getAll() {

    return [
      ...this.locations.values()
    ];
  }
}
