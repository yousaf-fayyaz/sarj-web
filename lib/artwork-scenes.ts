import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { fingerprintRidges, moduleContours, type ModuleSubject } from "./module-shapes";

export type ArtworkModel = {
  root: THREE.Group;
  update: (time: number, engagement: number, entrance: number) => void;
};

const loader = new SVGLoader();
const clamp = THREE.MathUtils.clamp;
const settle = (value: number) => {
  const t = clamp(value, 0, 1);
  return 1 - Math.pow(1 - t, 4);
};

/** All instances share geometry and materials, including the repeated story art. */
export class ArtworkResources {
  private geometries = new Map<string, THREE.BufferGeometry>();
  private materials = new Set<THREE.Material>();

  readonly metal = this.material(new THREE.MeshPhysicalMaterial({
    color: "#607d4f", metalness: 0.72, roughness: 0.28,
    clearcoat: 0.35, clearcoatRoughness: 0.28, envMapIntensity: 0.8,
  }));
  readonly edge = this.material(new THREE.MeshStandardMaterial({
    color: "#344d31", metalness: 0.65, roughness: 0.38,
  }));
  readonly dark = this.material(new THREE.MeshStandardMaterial({
    color: "#12271b", metalness: 0.25, roughness: 0.42,
  }));
  readonly accent = this.material(new THREE.MeshPhysicalMaterial({
    color: "#c4dda5", metalness: 0.5, roughness: 0.22,
    emissive: "#739446", emissiveIntensity: 0.15, clearcoat: 0.4,
  }));
  readonly glow = this.material(new THREE.MeshBasicMaterial({ color: "#d5efb6" }));
  readonly ribs = this.material(new THREE.LineBasicMaterial({
    color: "#b8d58f", transparent: true, opacity: 0.3,
  }));

  material<T extends THREE.Material>(material: T): T {
    this.materials.add(material);
    return material;
  }

  geometry<T extends THREE.BufferGeometry>(key: string, create: () => T): T {
    if (!this.geometries.has(key)) this.geometries.set(key, create());
    return this.geometries.get(key) as T;
  }

  dispose() {
    this.geometries.forEach((geometry) => geometry.dispose());
    this.materials.forEach((material) => material.dispose());
    this.geometries.clear();
    this.materials.clear();
  }
}

function parsePath(d: string) {
  return loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}" /></svg>`).paths[0];
}

function roundedRect(width: number, height: number, radius: number) {
  const x = -width / 2, y = -height / 2, right = width / 2, top = height / 2;
  const s = new THREE.Shape();
  s.moveTo(x + radius, y);
  s.lineTo(right - radius, y);
  s.quadraticCurveTo(right, y, right, y + radius);
  s.lineTo(right, top - radius);
  s.quadraticCurveTo(right, top, right - radius, top);
  s.lineTo(x + radius, top);
  s.quadraticCurveTo(x, top, x, top - radius);
  s.lineTo(x, y + radius);
  s.quadraticCurveTo(x, y, x + radius, y);
  return s;
}

function panel(
  resources: ArtworkResources,
  width: number,
  height: number,
  depth: number,
  radius: number,
  material: THREE.Material = resources.metal,
) {
  const geometry = resources.geometry(`panel:${width}:${height}:${depth}:${radius}`, () => {
    const geo = new THREE.ExtrudeGeometry(roundedRect(width, height, radius), {
      depth, bevelEnabled: true, bevelSize: 0.018, bevelThickness: 0.018,
      bevelSegments: 3, curveSegments: 10,
    });
    geo.translate(0, 0, -depth / 2);
    return geo;
  });
  return new THREE.Mesh(geometry, material);
}

/** Extrude the actual SVG contour and add engraved ribs to its side walls. */
function contour(resources: ArtworkResources, d: string, depth = 0.22) {
  const group = new THREE.Group();
  const geometry = resources.geometry(`contour:${d}:${depth}`, () => {
    const geo = new THREE.ExtrudeGeometry(parsePath(d).toShapes(), {
      depth: depth * 100, bevelEnabled: true, bevelSize: 1.6,
      bevelThickness: 1.6, bevelSegments: 3, curveSegments: 28,
    });
    geo.scale(0.01, -0.01, 0.01);
    geo.translate(0, 0, -depth / 2);
    // A negative SVG Y scale reverses winding; restore outward-facing triangles.
    const positions = geo.getAttribute("position");
    for (let i = 0; i < positions.count; i += 3) {
      const a = new THREE.Vector3().fromBufferAttribute(positions, i + 1);
      const b = new THREE.Vector3().fromBufferAttribute(positions, i + 2);
      positions.setXYZ(i + 1, b.x, b.y, b.z);
      positions.setXYZ(i + 2, a.x, a.y, a.z);
    }
    geo.computeVertexNormals();
    return geo;
  });
  group.add(new THREE.Mesh(geometry, [resources.metal, resources.edge]));

  const ribGeometry = resources.geometry(`ribs:${d}:${depth}`, () => {
    const points = parsePath(d).subPaths[0].getPoints(56);
    const vertices: number[] = [];
    for (let layer = 0; layer < 8; layer++) {
      const z = -depth / 2 + (layer / 7) * depth;
      for (let i = 1; i < points.length; i++) {
        vertices.push(points[i - 1].x / 100, -points[i - 1].y / 100, z);
        vertices.push(points[i].x / 100, -points[i].y / 100, z);
      }
    }
    return new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  });
  group.add(new THREE.LineSegments(ribGeometry, resources.ribs));
  return group;
}

function stroke(
  resources: ArtworkResources,
  d: string,
  radius = 0.018,
  material: THREE.Material = resources.accent,
) {
  const group = new THREE.Group();
  parsePath(d).subPaths.forEach((path, index) => {
    const geometry = resources.geometry(`stroke:${d}:${radius}:${index}`, () => {
      const curve = new class extends THREE.Curve<THREE.Vector3> {
        constructor() { super(); }
        getPoint(t: number, target = new THREE.Vector3()) {
          const point = path.getPoint(t);
          return target.set(point.x / 100, -point.y / 100, 0);
        }
      }();
      return new THREE.TubeGeometry(curve, 96, radius, 8, false);
    });
    group.add(new THREE.Mesh(geometry, material));
  });
  return group;
}

function disc(resources: ArtworkResources, radius: number, depth: number, material = resources.metal) {
  const geometry = resources.geometry(`disc:${radius}:${depth}`, () =>
    new THREE.CylinderGeometry(radius, radius, depth, 64));
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

function ring(resources: ArtworkResources, radius: number, tube = 0.016) {
  return new THREE.Mesh(resources.geometry(`ring:${radius}:${tube}`, () =>
    new THREE.TorusGeometry(radius, tube, 8, 80)), resources.accent);
}

function payroll(resources: ArtworkResources): ArtworkModel {
  const root = new THREE.Group();
  const coins: { group: THREE.Group; height: number; index: number }[] = [];
  for (const [x, y, count, z] of [[-0.72, -0.8, 9, 0.1], [0.66, -0.62, 16, -0.44]]) {
    for (let i = 0; i < count; i++) {
      const coin = new THREE.Group();
      const body = disc(resources, 0.54, 0.068);
      body.rotation.x = 0;
      coin.add(body);
      const edge = ring(resources, 0.495, 0.009);
      edge.rotation.x = -Math.PI / 2;
      edge.position.y = 0.039;
      coin.add(edge);
      coin.position.set(x, y + i * 0.079, z);
      root.add(coin);
      coins.push({ group: coin, height: coin.position.y, index: i });
    }
  }
  const hero = contour(resources, moduleContours.payroll, 0.2);
  hero.position.set(-0.12, 0.35, 0.55);
  for (const radius of [0.75, 0.7]) {
    const rim = ring(resources, radius, radius === 0.75 ? 0.015 : 0.007);
    rim.position.z = 0.12;
    hero.add(rim);
  }
  const banknote = panel(resources, 0.77, 0.48, 0.03, 0.07, resources.dark);
  banknote.position.z = 0.13;
  hero.add(banknote);
  const emblem = ring(resources, 0.115, 0.025);
  emblem.position.z = 0.16;
  hero.add(emblem);
  [-0.27, 0.27].forEach((x) => {
    const dot = disc(resources, 0.03, 0.01, resources.accent);
    dot.position.set(x, 0, 0.16);
    hero.add(dot);
  });
  root.add(hero);
  return {
    root,
    update(time, engagement, entrance) {
      coins.forEach(({ group, height, index }) => {
        const assembly = settle(entrance * 1.6 - index * 0.035);
        group.scale.setScalar(Math.max(0.001, assembly));
        group.position.y = height + (1 - assembly) * (0.45 + index * 0.04);
      });
      hero.rotation.y = Math.sin(time * 0.65) * 0.18 + engagement * 0.3 + (1 - settle(entrance)) * -0.8;
      hero.rotation.z = Math.sin(time * 0.43) * 0.045;
      hero.position.y = 0.35 + Math.sin(time * 0.8) * 0.07 + engagement * 0.08;
    },
  };
}

function attendance(resources: ArtworkResources): ArtworkModel {
  const root = new THREE.Group();
  const ridges = new THREE.Group();
  const ridgesMaterial = resources.material(resources.metal.clone());
  ridgesMaterial.color.set("#9ab67d");
  ridgesMaterial.roughness = 0.26;
  fingerprintRidges.forEach((d) => {
    const recessed = stroke(resources, d, 0.053, resources.edge);
    recessed.position.z = -0.07;
    ridges.add(recessed);
    ridges.add(stroke(resources, d, 0.029, ridgesMaterial));
  });
  root.add(ridges);
  const scanMaterial = resources.material(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { strength: { value: 0.6 } },
    vertexShader: `varying vec2 vUv;
      void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `varying vec2 vUv;uniform float strength;
      void main(){float beam=exp(-pow((vUv.y-.5)*8.,2.));
      float edge=smoothstep(0.,.15,vUv.x)*smoothstep(0.,.15,1.-vUv.x);
      gl_FragColor=vec4(.76,1.,.54,beam*edge*strength);}`,
  }));
  const scan = new THREE.Mesh(resources.geometry("scan-plane", () => new THREE.PlaneGeometry(2.5, 0.3)), scanMaterial);
  scan.position.z = 0.1;
  root.add(scan);
  const rails = stroke(resources, "M-126-83v-23h23M103-106h23v23M126 83v23h-23M-103 106h-23V83", 0.012);
  rails.position.z = -0.06;
  root.add(rails);
  return {
    root,
    update(time, engagement, entrance) {
      const reveal = settle(entrance);
      ridges.scale.setScalar(0.85 + reveal * 0.15);
      scan.position.y = Math.sin(time * 0.85) * 1.03;
      scanMaterial.uniforms.strength.value = (0.42 + engagement * 0.35) * reveal;
      rails.scale.setScalar(1 + Math.sin(time * 0.85) * 0.018 + engagement * 0.025);
      ridgesMaterial.emissive.set("#6a963e");
      ridgesMaterial.emissiveIntensity = 0.05 + Math.pow(Math.max(0, Math.cos(time * 0.85)), 8) * 0.16;
    },
  };
}

function leave(resources: ArtworkResources): ArtworkModel {
  const root = contour(resources, moduleContours.leave, 0.28);
  const inset = panel(resources, 1.86, 1.18, 0.025, 0.035, resources.dark);
  inset.position.set(-0.14, -0.32, 0.16);
  root.add(inset);
  const divider = stroke(resources, "M-115-39H88", 0.012);
  divider.position.z = 0.165;
  root.add(divider);
  [-0.75, 0.4].forEach((x) => {
    const binding = stroke(resources, "M-5 0v-27c0-10 15-10 15 0v27", 0.044);
    binding.position.set(x, 0.92, 0.19);
    root.add(binding);
  });
  const cells: THREE.Mesh[] = [];
  for (let i = 0; i < 12; i++) {
    const cell = panel(resources, 0.21, 0.19, 0.028, 0.025, i === 6 ? resources.accent : resources.metal);
    cell.position.set(-0.79 + (i % 4) * 0.41, 0.025 - Math.floor(i / 4) * 0.34, 0.19);
    root.add(cell);
    cells.push(cell);
  }
  const check = stroke(resources, "m-7 0 5 5 9-10", 0.014, resources.dark);
  check.position.copy(cells[6].position);
  check.position.z = 0.23;
  root.add(check);
  return {
    root,
    update(time, engagement, entrance) {
      cells.forEach((cell, i) => {
        const reveal = settle(entrance * 1.5 - i * 0.035);
        const wave = Math.max(0, Math.sin(time * 1.05 - i * 0.42));
        cell.scale.setScalar(Math.max(0.001, reveal));
        cell.position.z = 0.19 + wave * 0.045 + (i === 6 ? engagement * 0.16 : engagement * 0.03);
      });
      check.position.z = cells[6].position.z + 0.04;
      check.scale.setScalar(settle(entrance * 1.5 - 0.3));
    },
  };
}

function selfService(resources: ArtworkResources): ArtworkModel {
  const root = contour(resources, moduleContours["self-service"], 0.25);
  const screen = panel(resources, 1.37, 2.1, 0.025, 0.12, resources.dark);
  screen.position.set(-0.04, 0, 0.15);
  root.add(screen);
  const speaker = panel(resources, 0.42, 0.055, 0.01, 0.025, resources.edge);
  speaker.position.set(-0.04, 1, 0.18);
  root.add(speaker);
  const avatar = disc(resources, 0.23, 0.025);
  avatar.position.set(-0.04, 0.56, 0.19);
  root.add(avatar);
  const head = disc(resources, 0.069, 0.01, resources.accent);
  head.position.set(-0.04, 0.62, 0.21);
  root.add(head);
  const shoulders = stroke(resources, "M-14 0c1-16 27-16 28 0", 0.035);
  shoulders.position.set(-0.04, 0.44, 0.21);
  root.add(shoulders);
  const notifications: THREE.Group[] = [];
  for (let i = 0; i < 3; i++) {
    const row = new THREE.Group();
    row.add(panel(resources, 1.1, 0.28, 0.035, 0.045, resources.edge));
    const text = stroke(resources, `M-22-4h${i === 1 ? 53 : 42}M-22 4h30`, 0.008);
    text.position.z = 0.03;
    row.add(text);
    const check = stroke(resources, "m-45 0 4 4 8-9", 0.014);
    check.position.z = 0.035;
    row.add(check);
    row.position.set(-0.04, 0.04 - i * 0.37, 0.22);
    notifications.push(row);
    root.add(row);
  }
  const home = panel(resources, 0.35, 0.025, 0.01, 0.01, resources.accent);
  home.position.set(-0.04, -0.98, 0.18);
  root.add(home);
  return {
    root,
    update(time, engagement, entrance) {
      notifications.forEach((row, i) => {
        const reveal = settle(entrance * 1.5 - i * 0.12);
        const pulse = Math.pow(Math.max(0, Math.sin(time * 0.9 - i * 0.85)), 4);
        row.position.x = -0.04 + (1 - reveal) * 0.5;
        row.position.z = 0.22 + pulse * 0.065 + engagement * (0.13 + i * 0.05);
        row.scale.setScalar(Math.max(0.001, reveal));
      });
    },
  };
}

function performance(resources: ArtworkResources): ArtworkModel {
  const root = new THREE.Group();
  const bars: THREE.Group[] = [];
  [0.82, 1.32, 1.9].forEach((height, i) => {
    const bar = new THREE.Group();
    const body = panel(resources, 0.53, height, 0.34, 0.04);
    body.position.y = height / 2;
    bar.add(body);
    const engraving = resources.geometry(`bar-ribs:${height}`, () => {
      const vertices: number[] = [];
      for (let x = -0.22; x < 0.24; x += 0.045) vertices.push(x, 0.05, 0.185, x, height - 0.04, 0.185);
      return new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    });
    bar.add(new THREE.LineSegments(engraving, resources.ribs));
    bar.position.set(-0.88 + i * 0.78, -0.98, -i * 0.09);
    root.add(bar);
    bars.push(bar);
  });
  const arrow = stroke(resources, "m-111-23 73-50 49 8 74-65m-36 1 36-1-2 35", 0.028);
  arrow.position.set(0.04, -0.08, 0.32);
  root.add(arrow);
  const baseline = stroke(resources, "M-130 103H118", 0.009, resources.edge);
  root.add(baseline);
  return {
    root,
    update(time, engagement, entrance) {
      bars.forEach((bar, i) => {
        bar.scale.y = Math.max(0.001, settle(entrance * 1.4 - i * 0.13)) * (1 + Math.sin(time * 0.7 - i * 0.4) * 0.028);
        bar.position.z = -i * 0.09 + engagement * i * 0.055;
      });
      arrow.scale.setScalar(Math.max(0.001, settle(entrance * 1.3 - 0.22)));
      arrow.position.y = -0.08 + Math.sin(time * 0.7) * 0.045 + engagement * 0.08;
    },
  };
}

function employeeFiles(resources: ArtworkResources): ArtworkModel {
  const root = new THREE.Group();
  const sheets: THREE.Group[] = [];
  for (let i = 0; i < 3; i++) {
    const sheet = contour(resources, moduleContours["employee-files"], 0.08);
    const fold = stroke(resources, "M34-105v44h44", 0.012);
    fold.position.z = 0.062;
    sheet.add(fold);
    sheet.position.set((2 - i) * 0.17, (2 - i) * 0.08, i * 0.14);
    root.add(sheet);
    sheets.push(sheet);
  }
  const front = sheets[2];
  const photo = panel(resources, 0.63, 0.67, 0.015, 0.06, resources.dark);
  photo.position.set(-0.34, 0.465, 0.065);
  front.add(photo);
  const head = disc(resources, 0.11, 0.012, resources.accent);
  head.position.set(-0.34, 0.57, 0.085);
  front.add(head);
  const shoulders = stroke(resources, "M-54-25c0-26 40-26 40 0", 0.045);
  shoulders.position.z = 0.085;
  front.add(shoulders);
  const lines: THREE.Group[] = [];
  [10, 27, 44, 61, 78].forEach((y, i) => {
    const line = stroke(resources, `M-65 ${y}h${i === 4 ? 65 : 122}`, i < 2 ? 0.013 : 0.007);
    line.position.z = 0.075;
    front.add(line);
    lines.push(line);
  });
  return {
    root,
    update(time, engagement, entrance) {
      sheets.forEach((sheet, i) => {
        const fan = 1 + engagement * 0.9 + Math.sin(time * 0.6) * 0.08;
        const reveal = settle(entrance * 1.5 - i * 0.1);
        sheet.position.x = (2 - i) * 0.17 * fan + (1 - reveal) * 0.35;
        sheet.position.y = (2 - i) * 0.08 * fan;
        sheet.rotation.z = (2 - i) * (-0.025 - engagement * 0.07);
        sheet.scale.setScalar(0.9 + reveal * 0.1);
      });
      lines.forEach((line, i) => {
        line.scale.x = Math.max(0.001, settle(entrance * 1.5 - i * 0.06));
      });
    },
  };
}

function abstract(resources: ArtworkResources, variant: number): ArtworkModel {
  const root = new THREE.Group();
  const ribs: THREE.Mesh[] = [];
  const square = variant % 3 === 1;
  const geometry = resources.geometry(square ? "abstract-square" : "abstract-ring", () => {
    if (!square) return new THREE.TorusGeometry(1.24, 0.019, 8, 120);
    const shape = roundedRect(2.36, 2.36, 0.4);
    shape.holes.push(new THREE.Path(roundedRect(2.18, 2.18, 0.34).getPoints(32)));
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.026, bevelEnabled: true, bevelSize: 0.009,
      bevelThickness: 0.009, bevelSegments: 2, curveSegments: 16,
    });
    geo.center();
    return geo;
  });
  for (let i = 0; i < 29; i++) {
    const rib = new THREE.Mesh(geometry, resources.metal);
    root.add(rib);
    ribs.push(rib);
  }
  return {
    root,
    update(time, engagement, entrance) {
      const reveal = settle(entrance);
      ribs.forEach((rib, i) => {
        const t = i / 28 - 0.5;
        rib.position.z = t * (1.55 + engagement * 0.28 + (1 - reveal) * 0.5);
        rib.rotation.z = square ? t * (-0.9 + Math.sin(time * 0.4) * 0.28) : Math.sin(t * 3 + time * 0.4) * 0.018;
        rib.scale.setScalar(1 - Math.cos(t * Math.PI) * (square ? 0.06 : 0.12));
      });
      root.rotation.z = (square ? -0.24 : 0.34) + Math.sin(time * 0.3) * 0.08;
    },
  };
}

const builders = {
  payroll, attendance, leave, "self-service": selfService,
  performance, "employee-files": employeeFiles,
} satisfies Record<ModuleSubject, (resources: ArtworkResources) => ArtworkModel>;

export function createArtworkModel(key: string, resources: ArtworkResources): ArtworkModel {
  if (key in builders) return builders[key as ModuleSubject](resources);
  return abstract(resources, Number(key.split("-")[1]) || 0);
}
