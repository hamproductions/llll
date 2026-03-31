import * as THREE from 'three';

export interface BonePose {
  name: string;
  sampleRate: number;
  duration: number;
  bones: Record<string, {
    euler: [number, number, number];
    quaternion: [number, number, number, number];
  }>;
}

export class PoseController {
  private skeleton: THREE.Skeleton | null = null;
  private boneMap = new Map<string, THREE.Bone>();

  constructor(model: THREE.Group) {
    model.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh && child.skeleton) {
        this.skeleton = child.skeleton;
        for (const bone of child.skeleton.bones) {
          this.boneMap.set(bone.name, bone);
        }
      }
    });
  }

  applyPose(pose: BonePose) {
    for (const [boneName, rot] of Object.entries(pose.bones)) {
      const bone = this.boneMap.get(boneName);
      if (!bone) continue;

      const [rx, ry, rz] = rot.euler;
      bone.rotation.x += THREE.MathUtils.degToRad(rx);
      bone.rotation.y += THREE.MathUtils.degToRad(ry);
      bone.rotation.z += THREE.MathUtils.degToRad(rz);
    }
  }

  resetPose() {
    if (!this.skeleton) return;
    for (const bone of this.skeleton.bones) {
      bone.rotation.set(0, 0, 0);
      bone.quaternion.identity();
    }
    this.skeleton.pose();
  }

  getBoneNames(): string[] {
    return Array.from(this.boneMap.keys());
  }
}
