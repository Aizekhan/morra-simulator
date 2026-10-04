export const MORRA_CONFIG = {

  // =========================
  // MORRA
  // =========================

  MORRA_RADIUS: 120,

  MORRA_COLOR: 0x3366ff,

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

    orbitPlane: "YZ" as const

  },

  MOON_EQUATOR: {

    radius: 24,

    color: 0x888888,

    orbitColor: 0x666666,

    orbitRadius: 450,

    orbitSpeed: 0.01,

    orbitPlane: "XZ" as const

  },

  // =========================
  // SUNS
  // =========================

  SUN_LARGE: {

    radius: 50,

    orbitRadius: 1800,

    orbitSpeed: 0.0015,

    orbitHeight: 300,

    orbitPlane: "XZ" as const

  },

  SUN_MEDIUM: {

    radius: 40,

    orbitRadius: 1200,

    orbitSpeed: 0.002,

    orbitHeight: 150,

    orbitPlane: "XZ" as const

  },

  SUN_SMALL: {

    radius: 25,

    orbitRadius: 700,

    orbitSpeed: 0.003,

    orbitHeight: 0,

    orbitPlane: "YZ" as const

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

  showTimeline: true

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