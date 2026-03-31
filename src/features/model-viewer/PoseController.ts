import * as THREE from 'three';

export interface BonePose {
  name: string;
  sampleRate: number;
  duration: number;
  bones: Record<string, {
    quaternion: [number, number, number, number];
    muscles?: number[];
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
    console.log(`[PoseController] Found ${this.boneMap.size} bones`);
  }

  applyPose(pose: BonePose) {
    const tmpQ = new THREE.Quaternion();
    for (const [boneName, rot] of Object.entries(pose.bones)) {
      const bone = this.boneMap.get(boneName);
      if (!bone) continue;
      const [qx, qy, qz, qw] = rot.quaternion;
      tmpQ.set(-qx, -qy, qz, qw);
      bone.quaternion.multiply(tmpQ);
    }
  }

  resetPose() {
    if (!this.skeleton) return;
    this.skeleton.pose();
  }
}
