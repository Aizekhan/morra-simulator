export const MORRA_CONFIG = {

  // =========================
  // MORRA
  // =========================

  // Default world scale: Jupiter-class radius (render/simulation units remain configurable).
  MORRA_RADIUS: 69911,

  MORRA_COLOR: 0x3366ff,

  MORRA_VISIBLE: true,

  // Render-only world-map texture. Empty means the procedural surface
  // remains in use until an authored equirectangular map is added.
  MORRA_SURFACE_TEXTURE: "/textures/worlds/morra-world-map.png",

  MORRA_SURFACE_TEXTURE_OPACITY: 1,

  MORRA_SURFACE_TEXTURE_ENABLED: true,

  // Render-only base emissive so Morra remains visually readable
  // when the physical light sources are on the far side.
  // Keep the real Morra mesh visibly readable at system scale; this is render-only and does not change physical radiation.
  MORRA_BASE_EMISSIVE: 0.35,

  AXIS_TILT: 0,

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

    // Large magical luminary ≈ 7 Earth radii.
    radius: 44597,

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

    // Life luminary ≈ 4 Earth radii.
    radius: 25484,

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

    // Small luminary ≈ Earth radius.
    radius: 6371,

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
  // MOON REFLECTION
  // =========================

  // Simulator rendering calibration, not canon.
  MOON_REFLECTION: {

    enabled: true,

    albedo: 0.12,

    intensityScale: 50000000,

    maxIntensity: 2.5

  },

  // =========================
  // SURFACE FIELD
  // =========================

  SURFACE_FIELD: {

    latitudeSegments: 64,

    longitudeSegments: 128,

    updateIntervalHours: 0.25,

    channel: "LIGHT_TOTAL" as
      "LIGHT" |
      "HEAT" |
      "MAGIC" |
      "MAGOSPHERE" |
      "ANOMALY" |
      "SHADOW" |
      "UMBRA" |
      "PENUMBRA" |
      "LIGHT_TOTAL" |
      "HEAT_TOTAL" |
      "MAGIC_TOTAL" |
      "LARGE_SUN" |
      "MEDIUM_SUN" |
      "SMALL_SUN" |
      "NORTH_MOON" |
      "EQUATOR_MOON" |
      "SPECTRUM",

    opacity: 0.55

  },

  // =========================
  // SHADOW VOLUMES
  // =========================

  SHADOW_VOLUMES: {

    enabled: false,

    length: 1600,

    opacity: 0.18,

    showUmbra: true,

    showPenumbra: true

  },

  // =========================
  // RADIATION CONES
  // =========================

  RADIATION_CONES: {

    enabled: true,

    length: 2100,

    radialScale: 1,

    rangeScale: 1,

    opacity: 0.08,

    edgeOpacity: 0.35

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

  showSurfaceField: false,

  showRadiationRays: false,

  showDirectIllumination: false,

  showEclipseShadows: true

},

  // =========================
  // GUI LIMITS
  // =========================

  LIMITS: {

    MORRA_RADIUS: {

      min: 50,

      max: 100000,

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

      max: 100000,

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