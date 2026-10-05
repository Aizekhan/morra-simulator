import * as THREE from "three";

export interface MorraContinentDefinition {

  id: string;

  name: string;

  latitude: number;

  longitude: number;

  width: number;

  height: number;

  rotation: number;

  color: number;
}

export const MORRA_CONTINENTS:
  readonly MorraContinentDefinition[] = [

  {
    id: "ice-continent",
    name: "Ice Continent",
    latitude: 72,
    longitude: 25,
    width: 34,
    height: 24,
    rotation: 8,
    color: 0xcfe9f5
  },

  {
    id: "central-continent",
    name: "Central Continent",
    latitude: 18,
    longitude: -20,
    width: 58,
    height: 42,
    rotation: -14,
    color: 0x6c8f55
  },

  {
    id: "twilight-west",
    name: "Twilight Lands West",
    latitude: 14,
    longitude: -105,
    width: 42,
    height: 32,
    rotation: 22,
    color: 0x536269
  },

  {
    id: "twilight-east",
    name: "Twilight Lands East",
    latitude: 8,
    longitude: 105,
    width: 44,
    height: 30,
    rotation: -18,
    color: 0x5c6861
  },

  {
    id: "old-lands",
    name: "Old Lands",
    latitude: -42,
    longitude: 35,
    width: 62,
    height: 38,
    rotation: 12,
    color: 0x9b7041
  }
];

export function latitudeLongitudeToDirection(
  latitude: number,
  longitude: number
): THREE.Vector3 {

  const phi =
    THREE.MathUtils.degToRad(
      90 - latitude
    );

  const theta =
    THREE.MathUtils.degToRad(
      longitude
    );

  return new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta)
  ).normalize();
}
