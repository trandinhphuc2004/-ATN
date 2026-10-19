import {
    Component, OnDestroy, OnChanges, Input,
    ElementRef, ViewChild, SimpleChanges, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TranslateModule } from '@ngx-translate/core';
import { Reaction } from '../../models/models';

interface BeakerProfile {
    phaseLabels: string[];
    phaseDescriptions: string[];
    startTemp: number;
    maxTemp: number;
    phase0Duration: number;
    phase1Duration: number;
    phase2Duration: number;
    liquidStartColor: number;
    liquidEndColor: number;
    enableVapor: boolean;
    vaporIntensity: number;
    enablePrecipitate: boolean;
    precipitateIntensity: number;
    enableBubbles: boolean;
    bubblesIntensity: number;
    enableHeat: boolean;
    heatIntensity: number;
}

@Component({
    selector: 'app-beaker-simulation',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="beaker-wrapper">
      <div #beakerCanvas class="beaker-canvas"></div>

            <div class="hud-top">
                <span class="hud-dot"></span>
                <span class="hud-title">{{ 'BEAKER.TITLE' | translate }}</span>
            </div>

            <div class="temp-display">
                <div class="temp-label">{{ 'BEAKER.TEMPERATURE' | translate }}</div>
                <div class="temp-value">{{ displayTemp }}<span class="temp-unit">°C</span></div>
            </div>

            <div class="side-panel">
                <div class="panel-section">
                    <div class="panel-label">{{ 'BEAKER.REACTION' | translate }}</div>
                    <div class="reaction-eq">{{ reaction?.equation || ('BEAKER.NO_REACTION' | translate) }}</div>
        </div>

                <div class="panel-section">
                    <div class="panel-label">{{ 'BEAKER.DESCRIPTION' | translate }}</div>
                    <p class="info-text">{{ reaction?.description || ('BEAKER.NO_DESCRIPTION' | translate) }}</p>
        </div>

                <div class="panel-section">
                    <div class="panel-label">{{ 'BEAKER.PHASE' | translate }}</div>
                    <div class="phase-indicator">
                        <span class="phase-dot" [class.active]="phase === 0" [class.done]="phase > 0">1</span>
                        <span class="phase-line"><span class="fill" [style.width.%]="phase > 0 ? 100 : (phase === 0 ? simProgress * 100 : 0)"></span></span>
                        <span class="phase-dot" [class.active]="phase === 1" [class.done]="phase > 1">2</span>
                        <span class="phase-line"><span class="fill" [style.width.%]="phase > 1 ? 100 : (phase === 1 ? simProgress * 100 : 0)"></span></span>
                        <span class="phase-dot" [class.active]="phase === 2">3</span>
                    </div>
                    <div class="phase-name">{{ phaseLabels[phase] }}</div>
                    <div class="phase-desc">{{ profile.phaseDescriptions[phase] }}</div>
                </div>

                <div class="panel-section">
                    <div class="panel-label">{{ 'BEAKER.CONTROLS' | translate }}</div>

                    <div class="slider-row">
                        <div class="slider-header">
                            <span class="slider-title">{{ 'BEAKER.SPEED' | translate }}</span>
                            <span class="slider-value">{{ speed.toFixed(1) }}x</span>
                        </div>
                        <input type="range" min="0.3" max="3" step="0.1" [(ngModel)]="speed" (input)="onSpeedChange()">
                    </div>

                    <div class="slider-row">
                        <div class="slider-header">
                            <span class="slider-title">{{ 'BEAKER.TARGET_TEMP' | translate }}</span>
                            <span class="slider-value">{{ targetTemp }}°C</span>
                        </div>
                        <input type="range" min="15" max="100" step="1" [(ngModel)]="targetTemp" (input)="onTempChange()">
                    </div>

                    <div class="btn-row">
                        <button class="btn btn-primary" (click)="startSim()" [disabled]="running && !paused">▶ {{ 'BEAKER.START' | translate }}</button>
                        <button class="btn btn-secondary" (click)="togglePause()" [disabled]="!running">{{ paused ? ('▶ ' + ('BEAKER.RESUME' | translate)) : ('⏸ ' + ('BEAKER.PAUSE' | translate)) }}</button>
                        <button class="btn btn-danger" (click)="resetSim()">↺ {{ 'BEAKER.RESET' | translate }}</button>
                    </div>
        </div>
      </div>

            <div class="legend">
                <span class="legend-item"><i class="swatch liquid"></i>{{ 'BEAKER.LEGEND_LIQUID' | translate }}</span>
                <span class="legend-item"><i class="swatch precip"></i>{{ 'BEAKER.LEGEND_PRECIP' | translate }}</span>
                <span class="legend-item"><i class="swatch vapor"></i>{{ 'BEAKER.LEGEND_VAPOR' | translate }}</span>
                <span class="legend-item"><i class="swatch heat"></i>{{ 'BEAKER.LEGEND_HEAT' | translate }}</span>
      </div>
    </div>
  `,
    styles: [`
    .beaker-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      background: #07080f;
            border-radius: 16px;
      overflow: hidden;
    }
    .beaker-canvas { width: 100%; height: 100%; }

        .hud-top {
            position: absolute;
            top: 18px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 15;
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(10, 12, 22, 0.72);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
            padding: 10px 20px;
            backdrop-filter: blur(14px);
      pointer-events: none;
    }
        .hud-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #22d3ee;
            box-shadow: 0 0 8px #22d3ee;
    }
        .hud-title {
            font-size: 0.86rem;
            font-weight: 700;
            color: #dbe7f5;
            letter-spacing: 0.02em;
    }

        .temp-display {
            position: absolute;
            top: 18px;
            right: 18px;
            z-index: 15;
            background: rgba(10, 12, 22, 0.72);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
            padding: 10px 14px;
            text-align: center;
            backdrop-filter: blur(14px);
            pointer-events: none;
    }
        .temp-label {
            font-size: 10px;
            color: #64748b;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin-bottom: 2px;
    }
        .temp-value {
            font-size: 1.6rem;
            font-weight: 800;
            color: #f97316;
            line-height: 1;
    }
        .temp-unit { font-size: 0.9rem; color: #94a3b8; }

        .side-panel {
            position: absolute;
            top: 86px;
            left: 18px;
            bottom: 18px;
            width: 320px;
            z-index: 15;
            overflow-y: auto;
            background: rgba(10, 12, 22, 0.66);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 18px;
            padding: 16px;
            backdrop-filter: blur(18px);
    }
        .panel-section { margin-bottom: 14px; }
        .panel-label {
            font-size: 10px;
            letter-spacing: 0.11em;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 700;
            margin-bottom: 6px;
    }
        .reaction-eq {
            font-family: 'Courier New', monospace;
            background: rgba(56, 189, 248, 0.1);
            border: 1px solid rgba(56, 189, 248, 0.2);
            color: #67d2ff;
            border-radius: 10px;
            padding: 10px;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
            line-height: 1.4;
    }
        .info-text { font-size: 12px; color: #9bb1c8; line-height: 1.6; margin: 0; }

        .phase-indicator {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 8px;
    }
        .phase-dot {
            width: 26px;
            height: 26px;
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.09);
            color: #5e7489;
            font-size: 11px;
            font-weight: 700;
            flex-shrink: 0;
        }
        .phase-dot.active {
            background: linear-gradient(135deg, #8b5cf6, #6d28d9);
            color: #fff;
            border-color: transparent;
            box-shadow: 0 0 12px rgba(139, 92, 246, 0.45);
        }
        .phase-dot.done {
            background: rgba(34, 197, 94, 0.15);
            border-color: rgba(34, 197, 94, 0.3);
            color: #4ade80;
        }
        .phase-line {
            flex: 1;
            height: 2px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 2px;
            overflow: hidden;
        }
        .phase-line .fill {
            display: block;
            height: 100%;
            background: linear-gradient(90deg, #8b5cf6, #22d3ee);
            transition: width 0.35s;
        }
        .phase-name { font-size: 12px; color: #e2edf8; font-weight: 600; }
        .phase-desc { font-size: 11px; color: #7489a0; margin-top: 3px; }

        .slider-row { margin-bottom: 10px; }
        .slider-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 4px;
        }
        .slider-title { font-size: 11px; color: #c7d6e7; }
        .slider-value {
            font-size: 11px;
            color: #9f86ff;
            font-weight: 700;
            background: rgba(139, 92, 246, 0.14);
            padding: 1px 8px;
            border-radius: 10px;
        }
        input[type=range] {
            -webkit-appearance: none;
            width: 100%;
            height: 4px;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.1);
            outline: none;
        }
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 13px;
            height: 13px;
            border-radius: 50%;
            background: #8b5cf6;
            cursor: pointer;
            box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.25);
        }

        .btn-row { display: flex; gap: 8px; }
        .btn {
            flex: 1;
            height: 35px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.14);
            background: rgba(255, 255, 255, 0.06);
            color: #d3dfeb;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
        }
        .btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .btn-primary {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            border-color: transparent;
            color: #fff;
        }
        .btn-secondary:hover:not(:disabled) { background: rgba(255, 255, 255, 0.11); }
        .btn-danger {
            background: rgba(239, 68, 68, 0.15);
            border-color: rgba(239, 68, 68, 0.35);
            color: #f48b8b;
        }

        .legend {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: 18px;
            z-index: 15;
            display: flex;
            align-items: center;
            gap: 16px;
            background: rgba(10, 12, 22, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 8px 12px;
            backdrop-filter: blur(12px);
            pointer-events: none;
        }
        .legend-item { display: flex; align-items: center; gap: 7px; color: #9bb1c8; font-size: 11px; }
        .swatch { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
        .swatch.liquid { background: #64b4ff; }
        .swatch.precip { background: #cdd0e8; box-shadow: 0 0 6px #cdd0e8; }
        .swatch.vapor { background: #aac0ff; box-shadow: 0 0 6px #aac0ff; }
        .swatch.heat { background: #ff8c32; box-shadow: 0 0 6px #ff8c32; }

        @media (max-width: 860px) {
            .side-panel { display: none; }
            .legend {
                width: calc(100% - 18px);
                left: 9px;
                transform: none;
                justify-content: space-between;
                gap: 8px;
            }
            .legend-item { font-size: 10px; }
        }
  `]
})
export class BeakerSimulationComponent implements OnDestroy, OnChanges {
    @ViewChild('beakerCanvas', { static: true }) canvasRef!: ElementRef<HTMLDivElement>;
    @Input() reaction: Reaction | null = null;

    phase = 0;
    phaseLabels = ['Mixing', 'Reacting', 'Complete'];
    displayTemp = 25;
    running = false;
    paused = false;
    speed = 1.0;
    targetTemp = 70;

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private orbitControls!: OrbitControls;
    private animId = 0;
    private clock = new THREE.Clock();
    private simTime = 0;
    simProgress = 0;

    // Particle arrays
    private vaporPositions!: Float32Array;
    private vaporSizes!: Float32Array;
    private vaporOpacities!: Float32Array;
    private vaporVels: any[] = [];
    private vaporGeo!: THREE.BufferGeometry;
    private VAPOR_COUNT = 500;

    private precipPositions!: Float32Array;
    private precipSizes!: Float32Array;
    private precipOpacities!: Float32Array;
    private precipTargets: { x: number, y: number, z: number }[] = [];
    private precipStates: { settled: boolean, delay: number }[] = [];
    private precipGeo!: THREE.BufferGeometry;
    private PRECIP_COUNT = 600;

    private liquidMat!: THREE.MeshPhysicalMaterial;
    private surfaceMesh!: THREE.Mesh;
    private heatGlowMat!: THREE.ShaderMaterial;
    private bubbles: THREE.Mesh[] = [];
    private BUBBLE_COUNT = 60;
    profile: BeakerProfile = this.defaultProfile();

    constructor(private zone: NgZone) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['reaction'] && this.reaction) {
            this.profile = this.resolveProfile(this.reaction);
            this.phaseLabels = this.profile.phaseLabels;
            this.displayTemp = this.profile.startTemp;
            this.targetTemp = this.profile.maxTemp;
            this.initScene();
        }
    }

    ngOnDestroy() {
        this.destroyScene();
    }

    startSim() { this.running = true; this.paused = false; }
    togglePause() { this.paused = !this.paused; }
    onSpeedChange() { }
    onTempChange() {
        this.targetTemp = Math.max(this.profile.startTemp, this.targetTemp);
    }

    resetSim() {
        this.running = false; this.paused = false;
        this.phase = 0; this.simTime = 0; this.simProgress = 0;
        this.displayTemp = this.profile.startTemp;
        // Reset precipitate
        for (let i = 0; i < this.PRECIP_COUNT; i++) {
            const a = Math.random() * Math.PI * 2, r = Math.random() * 1.3;
            this.precipPositions[i * 3] = Math.cos(a) * r;
            this.precipPositions[i * 3 + 1] = 0.5 + Math.random() * 2.5;
            this.precipPositions[i * 3 + 2] = Math.sin(a) * r;
            this.precipOpacities[i] = 0;
            this.precipStates[i].settled = false;
        }
        this.precipGeo.attributes['position'].needsUpdate = true;
        this.precipGeo.attributes['opacity'].needsUpdate = true;
        this.liquidMat?.color.set(this.profile.liquidStartColor);
        this.bubbles.forEach(b => { b.visible = false; this.resetBubble(b); });
        if (this.heatGlowMat) this.heatGlowMat.uniforms['uIntensity'].value = 0;
    }

    private initScene() {
        const el = this.canvasRef.nativeElement;
        if (this.renderer) this.destroyScene();

        const w = el.clientWidth || 600;
        const h = el.clientHeight || 460;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x07080f);
        this.scene.fog = new THREE.FogExp2(0x07080f, 0.028);

        this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 200);
        this.camera.position.set(5, 4.5, 9);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.renderer.shadowMap.enabled = true;
        el.appendChild(this.renderer.domElement);

        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.target.set(0, 2, 0);
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.06;
        this.orbitControls.minDistance = 4;
        this.orbitControls.maxDistance = 22;
        this.orbitControls.maxPolarAngle = Math.PI * 0.82;

        this.addLights();
        this.addGround();
        this.addBeaker();
        this.addLiquid();
        this.addVaporSystem();
        this.addPrecipSystem();
        this.addBubbles();
        this.addHeatGlow();

        new ResizeObserver(() => {
            const nw = el.clientWidth, nh = el.clientHeight;
            this.camera.aspect = nw / nh;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(nw, nh);
        }).observe(el);

        this.zone.runOutsideAngular(() => this.loop());
    }

    private destroyScene() {
        cancelAnimationFrame(this.animId);
        this.renderer?.dispose();
        const el = this.canvasRef?.nativeElement;
        if (el && this.renderer?.domElement?.parentNode === el) {
            el.removeChild(this.renderer.domElement);
        }
    }

    private addLights() {
        this.scene.add(new THREE.AmbientLight(0x334466, 0.7));
        const key = new THREE.DirectionalLight(0xdce8ff, 1.8);
        key.position.set(8, 14, 6); key.castShadow = true;
        key.shadow.mapSize.set(1024, 1024);
        this.scene.add(key);
        const fill = new THREE.DirectionalLight(0x6488aa, 0.45);
        fill.position.set(-6, 8, -4); this.scene.add(fill);
        const rim = new THREE.PointLight(0x8b5cf6, 25, 28);
        rim.position.set(-4, 6, -6); this.scene.add(rim);
        const warm = new THREE.PointLight(0xff8844, 12, 18);
        warm.position.set(4, 1, 5); this.scene.add(warm);
    }

    private addGround() {
        const g = new THREE.Mesh(
            new THREE.PlaneGeometry(50, 50),
            new THREE.MeshStandardMaterial({ color: 0x0c0e18, roughness: 0.9 })
        );
        g.rotation.x = -Math.PI / 2; g.receiveShadow = true; this.scene.add(g);
        this.scene.add(new THREE.GridHelper(38, 38, 0x1a1f35, 0x111528));
    }

    private addBeaker() {
        const profile = [
            new THREE.Vector2(1.6, 0), new THREE.Vector2(1.6, 0.08),
            new THREE.Vector2(1.55, 0.12), new THREE.Vector2(1.55, 4.4),
            new THREE.Vector2(1.65, 4.7), new THREE.Vector2(1.72, 4.85),
            new THREE.Vector2(1.72, 5.0), new THREE.Vector2(1.65, 5.0),
            new THREE.Vector2(1.58, 4.85), new THREE.Vector2(1.48, 4.7),
            new THREE.Vector2(1.48, 0.18), new THREE.Vector2(1.48, 0.08),
            new THREE.Vector2(1.52, 0)
        ];
        const mat = new THREE.MeshPhysicalMaterial({
            color: 0xc8ddef, transparent: true, opacity: 0.16,
            roughness: 0.04, transmission: 0.93, thickness: 0.3,
            ior: 1.52, clearcoat: 1, clearcoatRoughness: 0.04, side: THREE.DoubleSide
        });
        const beaker = new THREE.Mesh(new THREE.LatheGeometry(profile, 64), mat);
        beaker.castShadow = true; this.scene.add(beaker);

        const bot = new THREE.Mesh(
            new THREE.CircleGeometry(1.55, 64),
            new THREE.MeshPhysicalMaterial({
                color: 0xc8ddef, transparent: true, opacity: 0.1,
                roughness: 0.04, transmission: 0.95, ior: 1.52, side: THREE.DoubleSide
            })
        );
        bot.rotation.x = -Math.PI / 2; bot.position.y = 0.08; this.scene.add(bot);

        const mMat = new THREE.MeshBasicMaterial({ color: 0x88aacc, transparent: true, opacity: 0.3 });
        for (let i = 1; i <= 4; i++) {
            const m = new THREE.Mesh(new THREE.RingGeometry(1.556, 1.562, 64), mMat);
            m.rotation.x = Math.PI / 2; m.position.y = i * 1.0 + 0.2; this.scene.add(m);
        }
    }

    private addLiquid() {
        this.liquidMat = new THREE.MeshPhysicalMaterial({
            color: 0x3a8fd4, transparent: true, opacity: 0.44,
            roughness: 0.1, transmission: 0.5, thickness: 1.5,
            ior: 1.33, side: THREE.DoubleSide
        });
        const liq = new THREE.Mesh(new THREE.CylinderGeometry(1.46, 1.46, 3.2, 64, 1, false), this.liquidMat);
        liq.position.y = 1.8; this.scene.add(liq);

        this.surfaceMesh = new THREE.Mesh(
            new THREE.CircleGeometry(1.46, 64),
            new THREE.MeshPhysicalMaterial({
                color: 0x5aafee, transparent: true, opacity: 0.28,
                roughness: 0.02, metalness: 0.2, side: THREE.DoubleSide
            })
        );
        this.surfaceMesh.rotation.x = -Math.PI / 2;
        this.surfaceMesh.position.y = 3.4; this.scene.add(this.surfaceMesh);
    }

    private addVaporSystem() {
        const N = this.VAPOR_COUNT;
        this.vaporPositions = new Float32Array(N * 3);
        this.vaporSizes = new Float32Array(N);
        this.vaporOpacities = new Float32Array(N);
        for (let i = 0; i < N; i++) this.initVaporParticle(i);

        this.vaporGeo = new THREE.BufferGeometry();
        this.vaporGeo.setAttribute('position', new THREE.BufferAttribute(this.vaporPositions, 3));
        this.vaporGeo.setAttribute('size', new THREE.BufferAttribute(this.vaporSizes, 1));
        this.vaporGeo.setAttribute('opacity', new THREE.BufferAttribute(this.vaporOpacities, 1));

        const mat = new THREE.ShaderMaterial({
            vertexShader: `attribute float size; attribute float opacity; varying float vOp;
        void main(){vOp=opacity; vec4 mv=modelViewMatrix*vec4(position,1.);
        gl_PointSize=size*(180./-mv.z); gl_Position=projectionMatrix*mv;}`,
            fragmentShader: `varying float vOp; void main(){
        float d=length(gl_PointCoord-vec2(.5)); if(d>.5)discard;
        float a=smoothstep(.5,.0,d)*vOp;
        vec3 c=mix(vec3(.55,.72,1.),vec3(.85,.9,1.),d*2.);
        gl_FragColor=vec4(c,a*.5);}`,
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
        });
        this.scene.add(new THREE.Points(this.vaporGeo, mat));
    }

    private initVaporParticle(i: number) {
        const a = Math.random() * Math.PI * 2, r = Math.random() * 1.1;
        this.vaporPositions[i * 3] = Math.cos(a) * r;
        this.vaporPositions[i * 3 + 1] = 3.4 + Math.random() * .4;
        this.vaporPositions[i * 3 + 2] = Math.sin(a) * r;
        this.vaporSizes[i] = 3 + Math.random() * 5;
        this.vaporOpacities[i] = 0;
        this.vaporVels[i] = {
            vy: 0.009 + Math.random() * .017,
            vx: (Math.random() - .5) * .004, vz: (Math.random() - .5) * .004,
            life: 0, maxLife: 70 + Math.random() * 100
        };
    }

    private addPrecipSystem() {
        const N = this.PRECIP_COUNT;
        this.precipTargets = [];
        this.precipStates = [];
        this.precipPositions = new Float32Array(N * 3);
        this.precipSizes = new Float32Array(N);
        this.precipOpacities = new Float32Array(N);
        for (let i = 0; i < N; i++) {
            const a = Math.random() * Math.PI * 2, r = Math.random() * 1.3;
            this.precipPositions[i * 3] = Math.cos(a) * r;
            this.precipPositions[i * 3 + 1] = 0.5 + Math.random() * 2.5;
            this.precipPositions[i * 3 + 2] = Math.sin(a) * r;
            this.precipSizes[i] = 1.5 + Math.random() * 3.5;
            this.precipOpacities[i] = 0;
            const ta = Math.random() * Math.PI * 2, tr = Math.pow(Math.random(), .5) * 1.3;
            const ty = 0.15 + Math.random() * .65 * Math.pow(1 - tr / 1.3, .5);
            this.precipTargets.push({ x: Math.cos(ta) * tr, y: ty, z: Math.sin(ta) * tr });
            this.precipStates.push({ settled: false, delay: Math.random() * 200 });
        }
        this.precipGeo = new THREE.BufferGeometry();
        this.precipGeo.setAttribute('position', new THREE.BufferAttribute(this.precipPositions, 3));
        this.precipGeo.setAttribute('size', new THREE.BufferAttribute(this.precipSizes, 1));
        this.precipGeo.setAttribute('opacity', new THREE.BufferAttribute(this.precipOpacities, 1));
        const mat = new THREE.ShaderMaterial({
            vertexShader: `attribute float size; attribute float opacity; varying float vOp;
        void main(){vOp=opacity; vec4 mv=modelViewMatrix*vec4(position,1.);
        gl_PointSize=size*(180./-mv.z); gl_Position=projectionMatrix*mv;}`,
            fragmentShader: `varying float vOp; void main(){
        float d=length(gl_PointCoord-vec2(.5)); if(d>.5)discard;
        float a=smoothstep(.5,.05,d)*vOp;
        vec3 c=mix(vec3(.92,.92,.96),vec3(.72,.76,.87),d*2.);
        gl_FragColor=vec4(c,a*.85);}`,
            transparent: true, depthWrite: false, blending: THREE.NormalBlending
        });
        this.scene.add(new THREE.Points(this.precipGeo, mat));
    }

    private addBubbles() {
        const geo = new THREE.SphereGeometry(0.04, 10, 10);
        for (let i = 0; i < this.BUBBLE_COUNT; i++) {
            const mat = new THREE.MeshPhysicalMaterial({
                color: 0xaaddff, transparent: true, opacity: 0.3,
                roughness: 0, transmission: 0.9, ior: 1.05
            });
            const b = new THREE.Mesh(geo, mat);
            this.resetBubble(b); b.visible = false;
            this.scene.add(b); this.bubbles.push(b);
        }
    }

    private resetBubble(b: THREE.Mesh) {
        const a = Math.random() * Math.PI * 2, r = Math.random() * 1.1;
        b.position.set(Math.cos(a) * r, .3 + Math.random() * .5, Math.sin(a) * r);
        const s = .5 + Math.random() * 1.4; b.scale.set(s, s, s);
        b.userData = {
            vy: .005 + Math.random() * .014,
            vx: (Math.random() - .5) * .003,
            ws: 1 + Math.random() * 2.5,
            wa: .002 + Math.random() * .005
        };
    }

    private addHeatGlow() {
        this.heatGlowMat = new THREE.ShaderMaterial({
            vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
            fragmentShader: `varying vec2 vUv; uniform float uTime; uniform float uIntensity;
        void main(){vec2 c=vUv-.5; float d=length(c);
        float g=smoothstep(.5,.0,d)*uIntensity;
        float f=.9+.1*sin(uTime*3.+d*18.);
        vec3 col=mix(vec3(1.,.3,.04),vec3(1.,.62,.1),d*2.);
        gl_FragColor=vec4(col*f,g*.65);}`,
            uniforms: { uTime: { value: 0 }, uIntensity: { value: 0 } },
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
        });
        const glow = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), this.heatGlowMat);
        glow.rotation.x = -Math.PI / 2; glow.position.y = 0.02; this.scene.add(glow);
    }

    private loop() {
        this.animId = requestAnimationFrame(() => this.loop());
        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();

        this.orbitControls?.update();

        if (this.running && !this.paused) {
            const sf = this.speed * (0.7 + this.displayTemp / 100 * 0.55);
            this.simTime += delta * sf;

            if (this.phase === 0) {
                this.simProgress = Math.min(1, this.simTime / this.profile.phase0Duration);
                if (this.simProgress >= 1) { this.phase = 1; this.simTime = 0; this.simProgress = 0; }
            } else if (this.phase === 1) {
                this.simProgress = Math.min(1, this.simTime / this.profile.phase1Duration);
                if (this.simProgress >= 1) { this.phase = 2; this.simTime = 0; this.simProgress = 0; }
                // Temperature rise
                this.displayTemp = Math.round(
                    this.profile.startTemp + this.simProgress * (this.targetTemp - this.profile.startTemp)
                );
                // Liquid color
                const lc = new THREE.Color();
                lc.lerpColors(
                    new THREE.Color(this.profile.liquidStartColor),
                    new THREE.Color(this.profile.liquidEndColor),
                    this.simProgress
                );
                this.liquidMat.color.copy(lc);
            } else {
                this.simProgress = Math.min(1, this.simTime / this.profile.phase2Duration);
            }
        }

        // Vapor intensity per phase
        const baseVaporIntensity = this.phase === 1 ? this.simProgress * 1.2
            : this.phase === 2 ? Math.max(0, 1 - this.simProgress * 2.5)
                : this.phase === 0 ? this.simProgress * 0.25 : 0;
        const vI = this.profile.enableVapor ? baseVaporIntensity * this.profile.vaporIntensity : 0;
        this.tickVapor(elapsed, vI);

        // Precipitate
        if (this.profile.enablePrecipitate && this.phase >= 1) {
            this.tickPrecip(elapsed, this.profile.precipitateIntensity);
        } else {
            this.fadePrecipitate();
        }

        // Bubbles
        const maxBubbles = this.profile.enableBubbles
            ? Math.floor(this.BUBBLE_COUNT * this.profile.bubblesIntensity)
            : 0;
        const bCnt = this.phase === 1
            ? maxBubbles
            : this.phase === 0
                ? Math.floor(maxBubbles * this.simProgress * .4)
                : 0;
        this.tickBubbles(elapsed, bCnt);

        // Heat glow
        const baseHeatIntensity = this.running
            ? (this.phase === 0 ? this.simProgress * .5 : this.phase === 1 ? 0.5 + this.simProgress * .5 : 1 - this.simProgress * .7)
            : 0;
        const hI = this.profile.enableHeat ? baseHeatIntensity * this.profile.heatIntensity : 0;
        this.heatGlowMat.uniforms['uIntensity'].value += (hI - this.heatGlowMat.uniforms['uIntensity'].value) * .05;
        this.heatGlowMat.uniforms['uTime'].value = elapsed;

        // Surface wobble
        if (this.surfaceMesh) this.surfaceMesh.position.y = 3.4 + Math.sin(elapsed * 1.5) * .012 + Math.cos(elapsed * 2.2) * .007;

        this.renderer.render(this.scene, this.camera);
    }

    private tickVapor(t: number, intensity: number) {
        for (let i = 0; i < this.VAPOR_COUNT; i++) {
            const v = this.vaporVels[i]; v.life++;
            if (v.life > v.maxLife || this.vaporPositions[i * 3 + 1] > 9) { this.initVaporParticle(i); continue; }
            const tf = this.displayTemp / 40;
            this.vaporPositions[i * 3] += v.vx + Math.sin(t * 2 + i) * .001;
            this.vaporPositions[i * 3 + 1] += v.vy * tf;
            this.vaporPositions[i * 3 + 2] += v.vz + Math.cos(t * 2 + i * 1.3) * .001;
            const lr = v.life / v.maxLife;
            this.vaporOpacities[i] = lr < .15 ? (lr / .15) * intensity : lr > .6 ? ((1 - lr) / .4) * intensity : intensity;
            this.vaporSizes[i] = (3 + Math.random() * 1.5) * (1 + lr * 2.2);
        }
        this.vaporGeo.attributes['position'].needsUpdate = true;
        this.vaporGeo.attributes['size'].needsUpdate = true;
        this.vaporGeo.attributes['opacity'].needsUpdate = true;
    }

    private tickPrecip(t: number, intensity: number) {
        const gp = this.phase === 1 ? this.simProgress : 1;
        const sf = this.speed;
        for (let i = 0; i < this.PRECIP_COUNT; i++) {
            const pSt = this.precipStates[i];
            const dn = pSt.delay / 200;
            if (gp > dn * 0.8) {
                const lt = Math.min(1, (gp - dn * .8) / Math.max(.001, 1 - dn * .8));
                const et = 1 - Math.pow(1 - lt, 3);
                this.precipOpacities[i] = Math.min(1, et * 1.5) * intensity;
                if (!pSt.settled) {
                    const tg = this.precipTargets[i];
                    this.precipPositions[i * 3] += (tg.x - this.precipPositions[i * 3]) * .018 * sf;
                    this.precipPositions[i * 3 + 1] += (tg.y - this.precipPositions[i * 3 + 1]) * .014 * sf;
                    this.precipPositions[i * 3 + 2] += (tg.z - this.precipPositions[i * 3 + 2]) * .018 * sf;
                    this.precipPositions[i * 3] += Math.sin(t * 1.5 + i * .5) * .002;
                    this.precipPositions[i * 3 + 2] += Math.cos(t * 1.5 + i * .7) * .002;
                    if (Math.abs(this.precipPositions[i * 3 + 1] - tg.y) < .07) pSt.settled = true;
                } else {
                    this.precipPositions[i * 3] = this.precipTargets[i].x + Math.sin(t * .3 + i) * .003;
                    this.precipPositions[i * 3 + 2] = this.precipTargets[i].z + Math.cos(t * .3 + i * 1.1) * .003;
                }
            }
        }
        this.precipGeo.attributes['position'].needsUpdate = true;
        this.precipGeo.attributes['opacity'].needsUpdate = true;
    }

    private fadePrecipitate() {
        for (let i = 0; i < this.PRECIP_COUNT; i++) {
            this.precipOpacities[i] *= 0.9;
        }
        this.precipGeo.attributes['opacity'].needsUpdate = true;
    }

    private tickBubbles(t: number, active: number) {
        for (let i = 0; i < this.BUBBLE_COUNT; i++) {
            const b = this.bubbles[i];
            if (i < active) {
                b.visible = true;
                b.position.y += b.userData['vy'] * (this.displayTemp / 25);
                b.position.x += b.userData['vx'] + Math.sin(t * b.userData['ws'] + i) * b.userData['wa'];
                b.position.z += Math.cos(t * b.userData['ws'] * .7 + i) * b.userData['wa'];
                if (b.position.y > 3.3) this.resetBubble(b);
                (b.material as THREE.MeshPhysicalMaterial).opacity = .18 + Math.sin(t * 3 + i) * .1;
            } else { b.visible = false; }
        }
    }

    private defaultProfile(): BeakerProfile {
        return {
            phaseLabels: ['Mixing', 'Reacting', 'Complete'],
            phaseDescriptions: [
                'Reactants are being mixed in the beaker.',
                'Bond changes are occurring and products are forming.',
                'Reaction products are stabilized.'
            ],
            startTemp: 25,
            maxTemp: 70,
            phase0Duration: 3,
            phase1Duration: 8,
            phase2Duration: 4,
            liquidStartColor: 0x3a8fd4,
            liquidEndColor: 0x88aabb,
            enableVapor: true,
            vaporIntensity: 0.9,
            enablePrecipitate: false,
            precipitateIntensity: 1,
            enableBubbles: true,
            bubblesIntensity: 0.8,
            enableHeat: true,
            heatIntensity: 0.9
        };
    }

    private resolveProfile(reaction: Reaction): BeakerProfile {
        const base = this.defaultProfile();
        const fx = this.parseEffects(reaction.animationSteps);
        // Ghep ca description vao signature (chua tu "ket tua"/"gas"...) va bo dau tieng Viet
        // (normalize) de tu khoa khong dau nhu "ket tua" khop duoc voi du lieu co dau "ket tua".
        const signature = this.normalize(
            `${reaction.name} ${reaction.equation} ${reaction.reactionType} ${reaction.description ?? ''}`
        );

        if (this.containsAny(signature, [
            // Cac ket tua pho bien (khong dau, chu thuong):
            'agno3', 'agcl', 'agbr', 'agi', 'caco3', 'caso4', 'baso4', 'baco3',
            'mg(oh)2', 'fe(oh)3', 'fe(oh)2', 'cu(oh)2', 'al(oh)3', 'pbcl2', 'pbi2', 'bacl2',
            // Tu khoa mo ta (da bo dau):
            'ket tua', 'precip', 'trao doi'
        ])) {
            return {
                ...base,
                phaseLabels: ['Mixing', 'Precipitating', 'Settled'],
                phaseDescriptions: [
                    'Solutions combine and ions distribute in liquid.',
                    'Insoluble particles nucleate and grow in suspension.',
                    'Precipitate settles at the bottom of the beaker.'
                ],
                startTemp: 24,
                maxTemp: 30,
                liquidStartColor: 0x56acef,
                liquidEndColor: 0xc4ccd9,
                enableVapor: false,
                vaporIntensity: 0,
                enablePrecipitate: true,
                precipitateIntensity: 1,
                enableBubbles: false,
                bubblesIntensity: 0,
                enableHeat: false,
                heatIntensity: 0,
                phase1Duration: 9,
                ...fx
            };
        }

        if (this.containsAny(signature, ['h2o2', 'o2', 'decomposition', 'co2', 'gas'])) {
            return {
                ...base,
                phaseLabels: ['Mixing', 'Gas Release', 'Complete'],
                phaseDescriptions: [
                    'Reactants are uniformly dissolved in the solution.',
                    'Gas is generated and bubbles rise upward.',
                    'Gas evolution slows and the solution stabilizes.'
                ],
                startTemp: 24,
                maxTemp: 50,
                liquidStartColor: 0x4da4eb,
                liquidEndColor: 0x89b6d0,
                enableVapor: true,
                vaporIntensity: 1.15,
                enablePrecipitate: false,
                enableBubbles: true,
                bubblesIntensity: 1,
                enableHeat: true,
                heatIntensity: 0.65,
                ...fx
            };
        }

        if (this.containsAny(signature, ['combust', 'ch4', 'burn', 'dot chay'])) {
            return {
                ...base,
                phaseLabels: ['Ignition', 'Reacting', 'Complete'],
                phaseDescriptions: [
                    'System receives activation energy and heats up.',
                    'Reaction proceeds rapidly with strong heat.',
                    'Heat decreases while products remain.'
                ],
                startTemp: 30,
                maxTemp: 90,
                liquidStartColor: 0x3f9be6,
                liquidEndColor: 0x8da8b6,
                vaporIntensity: 1.3,
                bubblesIntensity: 1,
                heatIntensity: 1.2,
                ...fx
            };
        }

        return { ...base, ...fx };
    }

    private parseEffects(animationSteps: string): Partial<BeakerProfile> {
        try {
            const parsed = JSON.parse(animationSteps);
            const effects = parsed?.effects;
            if (!effects) return {};

            return {
                startTemp: this.toNumber(effects.startTemp),
                maxTemp: this.toNumber(effects.maxTemp),
                liquidStartColor: this.toColor(effects.liquidColorStart),
                liquidEndColor: this.toColor(effects.liquidColorEnd),
                enableVapor: this.toBoolean(effects.vapor),
                vaporIntensity: this.toNumber(effects.vaporIntensity),
                enablePrecipitate: this.toBoolean(effects.precipitate),
                precipitateIntensity: this.toNumber(effects.precipitateIntensity),
                enableBubbles: this.toBoolean(effects.bubbles),
                bubblesIntensity: this.toNumber(effects.bubblesIntensity),
                enableHeat: this.toBoolean(effects.heat),
                heatIntensity: this.toNumber(effects.heatIntensity)
            };
        } catch {
            return {};
        }
    }

    private toColor(value: unknown): number | undefined {
        if (typeof value !== 'string' || !value.trim()) return undefined;
        try {
            return new THREE.Color(value).getHex();
        } catch {
            return undefined;
        }
    }

    private toNumber(value: unknown): number | undefined {
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        if (typeof value === 'string') {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) return parsed;
        }
        return undefined;
    }

    private toBoolean(value: unknown): boolean | undefined {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            if (value.toLowerCase() === 'true') return true;
            if (value.toLowerCase() === 'false') return false;
        }
        return undefined;
    }

    private containsAny(content: string, keys: string[]): boolean {
        return keys.some(k => content.includes(k));
    }

    /**
     * Bo dau tieng Viet, chuyen subscript Unicode ve chu so thuong, va lowercase
     * de so khop keyword khong dau. VD: "Phan ung Kết Tủa" -> "phan ung ket tua",
     * "CaSO₄" -> "caso4". Dam bao tu khoa nhu "ket tua"/"caso4" khop duoc du lieu
     * tu AI du co dau hay dung subscript. Xu ly rieng 'đ/Đ' (khong tach bang NFD).
     */
    private normalize(text: string): string {
        // Chuyen subscript ₀..₉ (U+2080..U+2089) ve 0..9: AI hay tra "CaSO₄" thay vi "CaSO4".
        const desubscript = text.replace(/[₀-₉]/g, d => String(d.charCodeAt(0) - 0x2080));
        return desubscript
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '') // bo dau ket hop (combining diacritical marks U+0300..U+036F)
            .replace(/đ/g, 'd');         // chu 'd' khong tach bang NFD -> thay thu cong
    }
}
