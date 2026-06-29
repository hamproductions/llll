import {
  AssetManager,
  AnimationState,
  AnimationStateData,
  AtlasAttachmentLoader,
  ManagedWebGLRenderingContext,
  Physics,
  ResizeMode,
  SceneRenderer,
  Skeleton,
  SkeletonBinary,
  type SkeletonData,
  type TrackEntry
} from '@esotericsoftware/spine-webgl';

export interface ActorInfo {
  animations: string[];
  skins: string[];
  width: number;
  height: number;
}

export interface RoutineClip {
  t: number;
  dur: number;
  clipIn: number;
  timeScale: number;
  loop: number;
  mix: number;
  alpha: number;
  anim: string | null;
}

export interface CubicKey {
  t: number;
  c: number[];
}
export interface OrderKey {
  t: number;
  o: number;
}
export interface Motion {
  x: CubicKey[];
  y: CubicKey[];
  z: CubicKey[];
  order: OrderKey[];
}

export interface Projection {
  w: number;
  h: number;
  groundY: number;
  spread: number;
  baseScale: number;
  zFront: number;
}

interface Placement {
  baseWx: number;
  baseWy: number;
  baseWz: number;
  motion: Motion | null;
  scaleMul: number;
  offsetX: number;
}

// Largest-index key with t <= time (floor). Returns -1 if time precedes the first key.
function floorIndex<T extends { t: number }>(track: T[], time: number): number {
  if (track.length === 0 || time < track[0].t) return -1;
  let lo = 0;
  let hi = track.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (track[mid].t <= time) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

// Evaluate a Unity cubic curve (segment polynomial c0*dt^3 + c1*dt^2 + c2*dt + c3).
function evalCubic(curve: CubicKey[], time: number, fallback: number): number {
  if (curve.length === 0) return fallback;
  const i = floorIndex(curve, time);
  if (i < 0) return curve[0].c[3];
  const k = curve[i];
  const next = curve[i + 1];
  let dt = time - k.t;
  if (next) dt = Math.min(dt, next.t - k.t);
  else dt = 0;
  const c = k.c;
  return ((c[0] * dt + c[1]) * dt + c[2]) * dt + c[3];
}

interface Actor {
  id: string;
  skeleton: Skeleton;
  state: AnimationState;
  data: SkeletonData;
  premultipliedAlpha: boolean;
  order: number;
  routine: RoutineClip[] | null;
  routineIndex: number;
  animSet: Set<string>;
  animDur: Map<string, number>;
  curAnim: string | null;
  curEntry: TrackEntry | null;
  placement: Placement | null;
}

export interface LoadActorOptions {
  scale?: number;
  premultipliedAlpha?: boolean;
}

const MAX_SEEK_DELTA = 0.5;

export class StageRenderer {
  readonly canvas: HTMLCanvasElement;
  private context: ManagedWebGLRenderingContext;
  private renderer: SceneRenderer;
  private assetManager: AssetManager;
  private actors = new Map<string, Actor>();
  private raf = 0;
  private disposed = false;

  private lastFrameMs = 0;
  private clockSource: (() => number | null) | null = null;
  private lastClock = 0;
  private masterTime = 0;
  private prevMaster = 0;
  private lastAudioMs = 0;
  private projection: Projection | null = null;

  playing = false;
  speed = 1;
  cameraY = 0;
  cameraZoom = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = new ManagedWebGLRenderingContext(canvas, {
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false
    });
    this.renderer = new SceneRenderer(canvas, this.context);
    this.assetManager = new AssetManager(this.context);
    this.raf = requestAnimationFrame(this.loop);
  }

  async loadActor(
    id: string,
    skelUrl: string,
    atlasUrl: string,
    opts: LoadActorOptions = {}
  ): Promise<ActorInfo> {
    await Promise.all([
      this.assetManager.loadBinaryAsync(skelUrl),
      this.assetManager.loadTextureAtlasAsync(atlasUrl)
    ]);
    if (this.disposed) throw new Error('renderer disposed');

    const atlas = this.assetManager.get(atlasUrl);
    const atlasLoader = new AtlasAttachmentLoader(atlas);
    const binary = new SkeletonBinary(atlasLoader);
    binary.scale = opts.scale ?? 1;
    const data: SkeletonData = binary.readSkeletonData(this.assetManager.get(skelUrl));

    const skeleton = new Skeleton(data);
    const stateData = new AnimationStateData(data);
    stateData.defaultMix = 0.12;
    const state = new AnimationState(stateData);

    const existing = this.actors.get(id);
    if (existing) this.removeActor(id);

    const actor: Actor = {
      id,
      skeleton,
      state,
      data,
      premultipliedAlpha: opts.premultipliedAlpha ?? true,
      order: this.actors.size,
      routine: null,
      routineIndex: -1,
      animSet: new Set(data.animations.map((a) => a.name)),
      animDur: new Map(data.animations.map((a) => [a.name, a.duration])),
      curAnim: null,
      curEntry: null,
      placement: null
    };
    this.actors.set(id, actor);

    skeleton.setToSetupPose();
    skeleton.updateWorldTransform(Physics.update);
    const bounds = skeleton.getBoundsRect();

    return {
      animations: data.animations.map((a) => a.name),
      skins: data.skins.map((s) => s.name),
      width: bounds.width,
      height: bounds.height
    };
  }

  removeActor(id: string) {
    this.actors.delete(id);
  }

  hasActor(id: string) {
    return this.actors.has(id);
  }

  setAnimation(id: string, name: string, loop = true): TrackEntry | null {
    const actor = this.actors.get(id);
    if (!actor) return null;
    actor.routine = null;
    return actor.state.setAnimation(0, name, loop);
  }

  setRoutine(id: string, clips: RoutineClip[]) {
    const actor = this.actors.get(id);
    if (!actor) return;
    actor.routine = clips.filter((c) => c.anim && actor.animSet.has(c.anim));
    actor.routineIndex = -1;
  }

  setProjection(p: Projection) {
    this.projection = p;
  }

  setPlacement(id: string, placement: Placement) {
    const actor = this.actors.get(id);
    if (actor) actor.placement = placement;
  }

  private project(
    p: Placement,
    time: number
  ): { x: number; y: number; scale: number; order: number } {
    const proj = this.projection!;
    let wx = p.baseWx;
    let wy = p.baseWy;
    let wz = p.baseWz;
    if (p.motion) {
      wx = evalCubic(p.motion.x, time, p.baseWx);
      wy = evalCubic(p.motion.y, time, p.baseWy);
      wz = evalCubic(p.motion.z, time, p.baseWz);
    }
    // Authoritative draw order from the animated SortingGroup curve; otherwise front (more
    // negative z) on top.
    let order = -wz * 100;
    if (p.motion && p.motion.order.length > 0) {
      const oi = floorIndex(p.motion.order, time);
      order = p.motion.order[oi >= 0 ? oi : 0].o;
    }
    // 2.5D affine mapping onto the pre-painted portrait stage (no perspective, constant size).
    // Floor band ~0.32..1.0; x=±4.5 -> screen edges; deeper(+wy) -> higher on screen; feet-anchored.
    const { w, h, groundY, spread, baseScale } = proj;
    const xFrac = 0.5 + ((wx + p.offsetX) * spread) / 9.0;
    const yFrac = 0.64 - 0.187 * wy * spread - (groundY - 0.45);
    const x = (xFrac - 0.5) * w;
    const y = (0.5 - yFrac) * h;
    const scale = baseScale * p.scaleMul * (h / 1024);
    return { x, y, scale, order };
  }

  private driveRoutine(actor: Actor, time: number) {
    const clips = actor.routine!;
    if (clips.length === 0) return;
    let idx = -1;
    for (let i = 0; i < clips.length; i++) {
      if (clips[i].t <= time) idx = i;
      else break;
    }
    if (idx < 0) idx = 0;
    const clip = clips[idx];
    if (!clip.anim) return;

    if (idx === actor.routineIndex) return; // same clip — let Spine advance naturally

    if (actor.curAnim !== clip.anim || !actor.curEntry) {
      // Animation changed: (re)start it at the clip's source offset.
      const entry = actor.state.setAnimation(0, clip.anim, clip.loop > 0);
      entry.alpha = clip.alpha;
      entry.mixDuration = clip.mix;
      entry.timeScale = clip.timeScale;
      entry.trackTime = clip.clipIn + Math.max(0, time - clip.t) * clip.timeScale;
      actor.curAnim = clip.anim;
      actor.curEntry = entry;
    } else {
      // Same animation continues across clips: keep playing it (no rewind), just adjust speed/loop.
      actor.curEntry.timeScale = clip.timeScale;
      actor.curEntry.loop = clip.loop > 0;
    }
    actor.routineIndex = idx;
  }

  setSkin(id: string, skin: string) {
    const actor = this.actors.get(id);
    if (!actor) return;
    actor.skeleton.setSkinByName(skin);
    actor.skeleton.setSlotsToSetupPose();
  }

  setTransform(id: string, x: number, y: number, scaleX: number, scaleY = scaleX) {
    const actor = this.actors.get(id);
    if (!actor) return;
    actor.skeleton.x = x;
    actor.skeleton.y = y;
    actor.skeleton.scaleX = scaleX;
    actor.skeleton.scaleY = scaleY;
  }

  setActorTimeScale(id: string, timeScale: number) {
    const actor = this.actors.get(id);
    if (actor) actor.state.timeScale = timeScale;
  }

  setClockSource(fn: (() => number | null) | null) {
    this.clockSource = fn;
    this.lastClock = fn?.() ?? 0;
  }

  resyncClock() {
    this.lastClock = this.clockSource?.() ?? 0;
    this.masterTime = this.lastClock;
    this.prevMaster = this.lastClock;
    this.lastFrameMs = 0;
    this.lastAudioMs = 0;
    for (const a of this.actors.values()) {
      a.curAnim = null;
      a.curEntry = null;
    }
  }

  private loop = (nowMs: number) => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);

    let seeked = false;
    const c = this.clockSource ? this.clockSource() : null;
    if (c != null) {
      // Lock strictly to the audio clock — never race ahead (that caused dances to loop early
      // in slow sections). audio.currentTime is monotonic and frame-smooth during playback.
      const d = c - this.lastClock;
      if (d < 0 || d > MAX_SEEK_DELTA) seeked = true;
      this.lastClock = c;
      this.masterTime = c;
    }
    this.lastFrameMs = nowMs;
    const frameDelta = Math.max(0, Math.min(this.masterTime - this.prevMaster, 0.1));
    this.prevMaster = this.masterTime;
    if (seeked) {
      for (const a of this.actors.values()) {
        a.curAnim = null;
        a.curEntry = null;
      }
    }

    const gl = this.context.gl;
    this.renderer.resize(ResizeMode.Expand);
    this.renderer.camera.position.x = 0;
    this.renderer.camera.position.y = this.cameraY;
    this.renderer.camera.zoom = this.cameraZoom;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const drawList: { actor: Actor; order: number }[] = [];
    for (const actor of this.actors.values()) {
      if (actor.routine) this.driveRoutine(actor, this.masterTime);
      let order = 100;
      if (actor.placement && this.projection) {
        const pr = this.project(actor.placement, this.masterTime);
        actor.skeleton.x = pr.x;
        actor.skeleton.y = pr.y;
        actor.skeleton.scaleX = pr.scale;
        actor.skeleton.scaleY = pr.scale;
        order = pr.order;
      }
      actor.state.update(frameDelta);
      actor.state.apply(actor.skeleton);
      actor.skeleton.updateWorldTransform(Physics.update);
      drawList.push({ actor, order });
    }
    drawList.sort((a, b) => a.order - b.order);

    this.renderer.begin();
    for (const { actor } of drawList) {
      this.renderer.drawSkeleton(actor.skeleton, actor.premultipliedAlpha);
    }
    this.renderer.end();
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.actors.clear();
    this.assetManager.dispose();
    this.renderer.dispose();
  }
}
