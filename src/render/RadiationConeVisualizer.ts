import * as THREE from "three";

import type {
  CelestialBody
} from "../astronomy/CelestialBody";

export type RadiationConeKind =
  | "LIGHT"
  | "HEAT"
  | "MAGIC";

interface RadiationConeDefinition {
  id: string;
  kind: RadiationConeKind;
  color: number;
}

interface RadiationConeVisual {
  group: THREE.Group;
  material: THREE.Material;
}

export class RadiationConeVisualizer {
  private readonly scene: THREE.Scene;
  private readonly morra: CelestialBody;
  private readonly definitions: RadiationConeDefinition[];
  private readonly visuals: RadiationConeVisual[] = [];
  private readonly root: THREE.Group;
  private enabled = true;
  private length = 2100;
  private radialScale = 1;

  constructor(scene: THREE.Scene, morra: CelestialBody, definitions: RadiationConeDefinition[]) {
    this.scene = scene;
    this.morra = morra;
    this.definitions = definitions;
    this.root = new THREE.Group();
    this.root.name = "Radiation Cones";
    this.scene.add(this.root);
  }

  setConfig(config:{enabled?:boolean;length?:number;radialScale?:number}) {
    if(config.enabled!==undefined) this.enabled=config.enabled;
    if(config.length!==undefined) this.length=Math.max(1,config.length);
    if(config.radialScale!==undefined) this.radialScale=Math.max(0.01,config.radialScale);
  }

  update(sources:CelestialBody[]) {
    this.clear();
    this.root.visible=this.enabled;
    if(!this.enabled) return;
    for(let i=0;i<Math.min(sources.length,this.definitions.length);i++) this.addCone(sources[i],this.definitions[i]);
  }

  private addCone(source:CelestialBody,definition:RadiationConeDefinition) {
    const sourcePosition=source.mesh.getWorldPosition(new THREE.Vector3());
    const morraPosition=this.morra.mesh.getWorldPosition(new THREE.Vector3());
    const sourceToMorra=morraPosition.clone().sub(sourcePosition);
    const distance=sourceToMorra.length();
    if(distance<=1e-6) return;

    const direction=sourceToMorra.clone().normalize();
    const radiusAtMorra=this.projectedRadius(source.radius,distance);
    const radiusAtEnd=Math.max(radiusAtMorra,radiusAtMorra+this.length*Math.tan(THREE.MathUtils.clamp(source.radius/distance,0,0.45))*this.radialScale);
    const coneDepth=Math.max(this.length,radiusAtMorra*2);

    const geometry=new THREE.ConeGeometry(radiusAtEnd,coneDepth,48,1,true);
    const material=new THREE.MeshBasicMaterial({color:definition.color,transparent:true,opacity:0.08,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
    const mesh=new THREE.Mesh(geometry,material);

    const midpoint=sourcePosition.clone().add(direction.clone().multiplyScalar(coneDepth*0.5));
    mesh.position.copy(midpoint);
    mesh.setRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction));

    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geometry),new THREE.LineBasicMaterial({color:definition.color,transparent:true,opacity:0.35}));
    mesh.add(edges);

    const group=new THREE.Group();
    group.add(mesh);
    this.root.add(group);
    this.visuals.push({group,material});
  }

  private projectedRadius(sourceRadius:number,distance:number){const angularRadius=Math.asin(THREE.MathUtils.clamp(sourceRadius/Math.max(distance,1e-6),0,0.999999));return Math.max(sourceRadius,Math.tan(angularRadius)*distance);}

  private clear(){for(const visual of this.visuals){visual.group.traverse(object=>{const mesh=object as THREE.Mesh;if(mesh.geometry) mesh.geometry.dispose();});visual.material.dispose();}this.visuals.length=0;while(this.root.children.length>0){this.root.remove(this.root.children[this.root.children.length-1]);}}
  dispose(){this.clear();this.root.removeFromParent();}
}
