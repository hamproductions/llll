import * as THREE from 'three';

export interface ExpressionCurve {
  type: 'constant' | 'dense';
  value?: number;
  samples?: number[];
}

export interface ExpressionData {
  name: string;
  sampleRate: number;
  curves: Record<string, ExpressionCurve>;
}

interface BlendShapeTarget {
  mesh: THREE.Mesh;
  index: number;
}

export class ExpressionController {
  private targets = new Map<string, BlendShapeTarget>();
  private currentWeights = new Map<string, number>();
  private targetWeights = new Map<string, number>();
  private lerpSpeed = 8;

  constructor(model: THREE.Group) {
    this.scan(model);
    console.log(`[ExpressionController] Found ${this.targets.size} blend shape targets:`, Array.from(this.targets.keys()).slice(0, 10));
  }

  private scan(model: THREE.Group) {
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      console.log(`[ExpressionController] Scanning mesh: ${child.name}, hasMorphDict: ${!!child.morphTargetDictionary}, hasMorphInfluences: ${!!child.morphTargetInfluences}`);
      if (!child.morphTargetDictionary || !child.morphTargetInfluences) return;

      for (const [name, index] of Object.entries(child.morphTargetDictionary)) {
        this.targets.set(name, { mesh: child, index });
        this.currentWeights.set(name, 0);
        this.targetWeights.set(name, 0);
      }
    });
  }

  getBlendShapeNames(): string[] {
    return Array.from(this.targets.keys());
  }

  applyExpression(data: ExpressionData, frameIndex = 0) {
    this.resetTargets();

    for (const [curveName, curve] of Object.entries(data.curves)) {
      const target = this.targets.get(curveName);
      if (!target) continue;

      let weight: number;
      if (curve.type === 'constant') {
        weight = curve.value ?? 0;
      } else if (curve.samples && curve.samples.length > 0) {
        const idx = Math.min(frameIndex, curve.samples.length - 1);
        weight = curve.samples[idx];
      } else {
        weight = 0;
      }

      this.targetWeights.set(curveName, weight / 100);
    }
  }

  setBlendShape(name: string, weight: number) {
    if (!this.targets.has(name)) return;
    this.targetWeights.set(name, weight / 100);
  }

  resetTargets() {
    for (const name of this.targetWeights.keys()) {
      this.targetWeights.set(name, 0);
    }
  }

  reset() {
    for (const [name, target] of this.targets) {
      this.currentWeights.set(name, 0);
      this.targetWeights.set(name, 0);
      if (target.mesh.morphTargetInfluences) {
        target.mesh.morphTargetInfluences[target.index] = 0;
      }
    }
  }

  update(deltaTime: number) {
    const alpha = 1 - Math.exp(-this.lerpSpeed * deltaTime);

    for (const [name, target] of this.targets) {
      const current = this.currentWeights.get(name) ?? 0;
      const goal = this.targetWeights.get(name) ?? 0;
      const next = current + (goal - current) * alpha;

      this.currentWeights.set(name, next);
      if (target.mesh.morphTargetInfluences) {
        target.mesh.morphTargetInfluences[target.index] = next;
      }
    }
  }

  setLerpSpeed(speed: number) {
    this.lerpSpeed = speed;
  }
}
