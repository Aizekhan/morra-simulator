export interface WorldEvent {

  id: string;

  title: string;

  description: string;

  locationId: string;

  absoluteHour: number;

  createdAt: number;
}

export function createWorldEvent(
  title: string,
  description: string,
  locationId: string,
  absoluteHour: number
): WorldEvent {

  return {
    id:
      crypto.randomUUID(),

    title:
      title.trim(),

    description:
      description.trim(),

    locationId:
      locationId.trim(),

    absoluteHour,

    createdAt:
      Date.now()
  };
}
