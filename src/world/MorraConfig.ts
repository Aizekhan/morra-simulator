export const MORRA_CONFIG = {

  // =========================
  // MORRA
  // =========================

  // Canonical starting scale: Jupiter-class world.
  MORRA_RADIUS: 69911,

  MORRA_COLOR: 0xffffff,

  MORRA_VISIBLE: true,

  MORRA_SURFACE_TEXTURE: "/textures/worlds/morra-world-map.png",

  MORRA_SURFACE_TEXTURE_OPACITY: 1,

  MORRA_SURFACE_TEXTURE_ENABLED: true,

  MORRA_BASE_EMISSIVE: 0.35,

  // Canonical axial tilt.
  AXIS_TILT: 25,

  // Calibrated so one simulator orbit equals 365 days.
  ROTATION_SPEED: 360 / (30 * 24),

  // =========================
  // TIME
  // =========================

  TIME_SPEED: 1,

  HOURS_IN_DAY: 30,

  DAYS_IN_MONTH: 40,

  MONTHS_IN_YEAR: 12,

  // =========================
  // VISUAL LIGHT CALIBRATION
  // =========================

  LIGHTS: {

    ambient: 0.15,

    LARGE: {
      color: 0xffcc88,
      intensity: 50,
      distance: 2000000
    },

    MEDIUM: {
      color: 0xffaa55,
      intensity: 30,
      distance: 2000000
    },

    SMALL: {
      color: 0xffffcc,
      intensity: 20,
      distance: 2000000
    }

  },

  // =========================
  // MOONS
  // =========================

  MOON_NORTH: {

    // ≈ 900 km diameter.
    radius: 450,

    color: 0xcccccc,

    orbitColor: 0x999999,

    // ≈ 100,000 km center-to-center.
    orbitRadius: 100000,

    // 40-day period.
    orbitSpeed: 360 / (40 * 30),

    // Canonical starting polar orbit.
    orbitPlane: "XZ" as const,

    orbitInclination: 90,

    orbitAscendingNode: 0,

    orbitEccentricity: 0,

    orbitPlaneOffset: 0,

    reverseOrbit: false,

    visible: true

  },

  MOON_EQUATOR: {

    // ≈ 400 km diameter.
    radius: 200,

    color: 0x888888,

    orbitColor: 0x666666,

    // ≈ 160,000 km center-to-center.
    orbitRadius: 160000,

    // 67-day period.
    orbitSpeed: 360 / (67 * 30),

    // Perpendicular to the equatorial orbital plane.
    orbitPlane: "YZ" as const,

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

    radiationRole: "MAGIC" as const,

    // ≈ 2500 km diameter.
    radius: 1250,

    // ≈ 300,000 km from Morra's center.
    orbitRadius: 300000,

    // 365-day period.
    orbitSpeed: 360 / (365 * 30),

    // 25° orbit inclination relative to Morra's equator.
    orbitPlaneOffset: 0,

    orbitPlane: "XZ" as const,

    orbitInclination: 25,

    orbitAscendingNode: 0,

    orbitEccentricity: 0,

    reverseOrbit: false,

    visible: true

  },

  SUN_MEDIUM: {

    radiationRole: "LIFE" as const,

    // ≈ 1500 km diameter.
    radius: 750,

    // ≈ 220,000 km from Morra's center.
    orbitRadius: 220000,

    // 180-day period.
    orbitSpeed: 360 / (180 * 30),

    // Almost equatorial.
    orbitPlaneOffset: 0,

    orbitPlane: "XZ" as const,

    orbitInclination: 0,

    orbitAscendingNode: 0,

    orbitEccentricity: 0,

    reverseOrbit: false,

    visible: true

  },

  SUN_SMALL: {

    radiationRole: "FIRE" as const,

    // ≈ 800 km diameter.
    radius: 400,

    // ≈ 500,000 km from Morra's center.
    orbitRadius: 500000,

    // 600-day period.
    orbitSpeed: 360 / (600 * 30),

    // Perpendicular to the equatorial orbital plane.
    orbitPlaneOffset: 0,

    orbitPlane: "XZ" as const,

    orbitInclination: 90,

    orbitAscendingNode: 0,

    orbitEccentricity: 0,

    reverseOrbit: false,

    visible: true

  },

  // =========================
  // RADIATION CALIBRATION
  // =========================

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

    length: 180000,

    opacity: 0.18,

    showUmbra: true,

    showPenumbra: true

  },

  // =========================
  // RADIATION CONES
  // =========================

  RADIATION_CONES: {

    enabled: true,

    length: 180000,

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
      min: 100,
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
      max: 500000,
      step: 1
    },

    ORBIT_RADIUS: {
      min: 50,
      max: 2000000,
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
      max: 2000000,
      step: 100
    }

  }

};
