export const MORRA_CONFIG = {

  // =========================
  // MORRA
  // =========================

  MORRA_RADIUS: 120,

  MORRA_COLOR: 0x3366ff,

  MORRA_VISIBLE: true,

  AXIS_TILT: 23,

  ROTATION_SPEED: 0.01,

  // =========================
  // TIME
  // =========================

  TIME_SPEED: 1,

  HOURS_IN_DAY: 120,

  DAYS_IN_MONTH: 40,

  MONTHS_IN_YEAR: 12,

  // =========================
  // LIGHTING
  // =========================

  LIGHTS: {

    ambient: 0.15,

    LARGE: {

      color: 0xffcc88,

      intensity: 50,

      distance: 10000

    },

    MEDIUM: {

      color: 0xffaa55,

      intensity: 30,

      distance: 10000

    },

    SMALL: {

      color: 0xffffcc,

      intensity: 20,

      distance: 10000

    }

  },

  // =========================
  // MOONS
  // =========================

  MOON_NORTH: {

    radius: 18,

    color: 0xcccccc,

    orbitColor: 0x999999,

    orbitRadius: 250,

    orbitSpeed: 0.02,

    orbitPlane: "YZ" as const,

    orbitInclination: 0,

    orbitAscendingNode: 0,

    orbitEccentricity: 0,

    orbitPlaneOffset: 0,

    reverseOrbit: false,

    visible: true

  },

  MOON_EQUATOR: {

    radius: 24,

    color: 0x888888,

    orbitColor: 0x666666,

    orbitRadius: 450,

    orbitSpeed: 0.01,

    orbitPlane: "XZ" as const,

    orbitInclination: 0,

    orbitAscendingNode: 0,

    orbitEccentricity: 0,

    orbitPlaneOffset: 0,

    reverseOrbit: false,

    visible: true

  },

  // =========================
  // SUNS
  // =========================

  SUN_LARGE: {

    // Provisional source-role binding for the physical engine.
    // The canonical mapping of "large/medium/small" to
    // first/second/third celestial bodies is still editable here.
    radiationRole: "MAGIC" as const,

    radius: 50,

    orbitRadius: 1800,

    orbitSpeed: 0.0015,

    orbitPlaneOffset: 300,

    orbitPlane: "XZ" as const,

    orbitInclination: 0,

    orbitAscendingNode: 0,

    orbitEccentricity: 0,

    reverseOrbit: false,

    visible: true

  },

  SUN_MEDIUM: {

    radiationRole: "LIFE" as const,

    radius: 40,

    orbitRadius: 1200,

    orbitSpeed: 0.002,

    orbitPlaneOffset: 150,

    orbitPlane: "XZ" as const,

    orbitInclination: 0,

    orbitAscendingNode: 0,

    orbitEccentricity: 0,

    reverseOrbit: false,

    visible: true

  },

  SUN_SMALL: {

    radiationRole: "FIRE" as const,

    radius: 25,

    orbitRadius: 700,

    orbitSpeed: 0.003,

    orbitPlaneOffset: 0,

    orbitPlane: "YZ" as const,

    orbitInclination: 0,

    orbitAscendingNode: 0,

    orbitEccentricity: 0,

    reverseOrbit: false,

    visible: true

  },

  // =========================
  // RADIATION CALIBRATION
  // =========================

  // Relative source strengths used by the new physical engine.
  // These are implementation calibration values, not new canon.
  RADIATION_PROFILES: {

    MAGIC: {
      lightPower: 1,
      heatPower: 0,
      magicPower: 1
    },

    LIFE: {
      lightPower: 1,
      heatPower: 1,
      magicPower: 0
    },

    FIRE: {
      lightPower: 0.25,
      heatPower: 2,
      magicPower: 0
    }

  },

  // =========================
  // SURFACE FIELD
  // =========================

  SURFACE_FIELD: {

    latitudeSegments: 32,

    longitudeSegments: 64,

    updateIntervalHours: 0.25,

    channel: "SHADOW" as
      "LIGHT" |
      "HEAT" |
      "MAGIC" |
      "MAGOSPHERE" |
      "ANOMALY" |
      "SHADOW" |
      "UMBRA" |
      "PENUMBRA",

    opacity: 0.62

  },

  // =========================
  // SHADOW VOLUMES
  // =========================

  SHADOW_VOLUMES: {

    length: 1600,

    opacity: 0.18,

    showUmbra: true,

    showPenumbra: true

  },

  // =========================
  // DEBUG
  // =========================

DEBUG: {

  showAxis: true,

  showEquator: true,

  showOrbits: true,

  showLightHelpers: true,

  showTimePanel: true,

  showTimeline: true,

  showSurfaceField: true,

  showRadiationRays: true

},

  // =========================
  // GUI LIMITS
  // =========================

  LIMITS: {

    MORRA_RADIUS: {

      min: 50,

      max: 1000,

      step: 1

    },

    AXIS_TILT: {

      min: 0,

      max: 90,

      step: 0.1

    },

    ORBIT_INCLINATION: {

      min: -180,

      max: 180,

      step: 0.1

    },

    ORBIT_PLANE_OFFSET: {

      min: -5000,

      max: 5000,

      step: 1

    },

    ORBIT_ASCENDING_NODE: {

      min: 0,

      max: 360,

      step: 0.1

    },

    ORBIT_ECCENTRICITY: {

      min: 0,

      max: 0.99,

      step: 0.001

    },

    ROTATION_SPEED: {

      min: 0,

      max: 1,

      step: 0.001

    },

    TIME_SPEED: {

      min: 0,

      max: 10000,

      step: 1

    },

    ORBIT_RADIUS: {

      min: 50,

      max: 10000,

      step: 10

    },

    ORBIT_SPEED: {

      min: 0,

      max: 0.05,

      step: 0.0001

    },

    BODY_RADIUS: {

      min: 1,

      max: 500,

      step: 1

    },

    BODY_HEIGHT: {

      min: -5000,

      max: 5000,

      step: 1

    },

    LIGHT_INTENSITY: {

      min: 0,

      max: 500,

      step: 1

    },

    LIGHT_DISTANCE: {

      min: 100,

      max: 50000,

      step: 100

    }

  }

};