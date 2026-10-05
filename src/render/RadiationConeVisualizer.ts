
    const visibleDistance =
      Math.max(
        0,
        occlusionHit?.distance ??
        distance
      );

    const sizeFactor =
      source.radius /
      Math.max(
        this.referenceSourceRadius(),
        1e-6
      );

    const influenceRange =
      this.length *
      sizeFactor *
      this.rangeScale;

    const coneDepth =
      Math.max(
        Math.min(
          influenceRange,
          visibleDistance
        ),
        1
      );

    if(
      visibleDistance <=
      1
    ) {
      return;
    }

    const radiusAtMorra =
      this.projectedRadius(
        source.radius,
        distance
      );

    const radiusAtEnd =
      Math.max(
        radiusAtMorra,
        radiusAtMorra +
        coneDepth *
        Math.tan(
          THREE.MathUtils.clamp(
            source.radius /
            distance,
            0,
            0.45
          )
        ) *
        this.radialScale
      );

    const geometry=new THREE.ConeGeometry(radiusAtEnd,coneDepth,48,1,true);

    const material=new THREE.MeshBasicMaterial({
      color:definition.color,
      transparent:true,
      opacity:this.opacity,
      depthWrite:false,
      side:THREE.DoubleSide,
      blending:THREE.AdditiveBlending
    });

    const mesh=new THREE.Mesh(
      geometry,
      material
    );

    const midpoint=sourcePosition.clone().add(direction.clone().multiplyScalar(coneDepth*0.5));
    mesh.position.copy(midpoint);
    mesh.setRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction));

    const edgesGeometry =
      new THREE.EdgesGeometry(
        geometry
      );

    const edgeMaterial =
      new THREE.LineBasicMaterial({
        color:
          definition.color,
        transparent:
          true,
        opacity:
          this.edgeOpacity
      });

    const edges =
      new THREE.LineSegments(
        edgesGeometry,
        edgeMaterial
      );

    mesh.add(
      edges
    );

    const group=new THREE.Group();
    group.add(mesh);
    this.root.add(group);
    this.visuals.push({group,material});
  }

  private findNearestOccluderHit(
    source: CelestialBody,
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    maxDistance: number
  ): {
    body: CelestialBody;
    distance: number;
  } | null {

    const candidates =
      this.getSceneCelestialBodies();

    let nearest:
      {
        body: CelestialBody;
        distance: number;
      } | null = null;

    for(
      const body of candidates
    ) {

      if(
        body === source
      ) {
        continue;
      }

      const center =
        body.mesh.getWorldPosition(
          new THREE.Vector3()
        );

      const toCenter =
        center
          .sub(origin);

      const projection =
        toCenter.dot(
          direction
        );

      if(
        projection <= 0 ||
        projection >= nearest
      ) {
        continue;
      }

      const perpendicular =
        toCenter
          .sub(
            direction