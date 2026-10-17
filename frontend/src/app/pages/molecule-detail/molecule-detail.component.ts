import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { MoleculeService } from '../../services/molecule.service';
import { Molecule, MoleculeData } from '../../models/models';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const ELEMENT_COLORS: Record<string, number> = {
  'H': 0xFFFFFF,
  'C': 0x333333,
  'N': 0x3050F8,
  'O': 0xFF0D0D,
  'S': 0xFFFF30,
  'P': 0xFF8000,
  'Cl': 0x1FF01F,
  'F': 0x90E050,
  'Br': 0xA62929
};

const ELEMENT_RADII: Record<string, number> = {
  'H': 0.25,
  'C': 0.4,
  'N': 0.38,
  'O': 0.35,
  'S': 0.45,
  'P': 0.42,
  'Cl': 0.43,
  'F': 0.3,
  'Br': 0.46
};

@Component({
  selector: 'app-molecule-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, TranslateModule],
  template: `
    <div class="page-wrapper">
      <a routerLink="/molecules" class="back-link">
        <mat-icon>arrow_back</mat-icon> {{ 'MOLECULES.BACK' | translate }}
      </a>

      @if (molecule) {
        <div class="detail-header">
          <div class="header-icon">
            <mat-icon>view_in_ar</mat-icon>
          </div>
          <div>
            <h1>{{ molecule.name }}</h1>
            <span class="formula-badge">{{ molecule.formula }}</span>
          </div>
        </div>
        <p class="detail-desc">{{ molecule.description }}</p>

        <div class="viewer-wrapper">
          <div #viewerContainer class="viewer-container"></div>
          <div class="controls-hint">
            <mat-icon>mouse</mat-icon>
            {{ 'MOLECULES.CONTROLS' | translate }}
          </div>
        </div>

        <div class="info-card">
          <h3>{{ 'MOLECULES.INFO' | translate }}</h3>
          @if (moleculeData) {
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">{{ 'MOLECULES.ATOMS' | translate }}</span>
                <span class="info-value">{{ moleculeData.atoms.length }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ 'MOLECULES.BONDS' | translate }}</span>
                <span class="info-value">{{ moleculeData.bonds.length }}</span>
              </div>
            </div>
            <div class="elements-row">
              <span class="info-label">{{ 'MOLECULES.ELEMENTS' | translate }}</span>
              <div class="element-list">
                @for (elem of getUniqueElements(); track elem) {
                  <span class="element-badge" [style.background-color]="getElementColorHex(elem)">
                    {{ elem }}
                  </span>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="loading-state">
          <mat-spinner></mat-spinner>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-wrapper { width: 100%; max-width: var(--page-max-mid); margin: 0 auto; padding: 32px var(--page-gutter) 60px; }
    .back-link { display: inline-flex; align-items: center; gap: 6px; color: rgba(0,0,0,0.58); font-size: 14px; font-weight: 500; text-decoration: none; margin-bottom: 24px; transition: color 0.2s; }
    .back-link:hover { color: #00754A; }
    .back-link mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .detail-header { display: flex; align-items: center; gap: 16px; margin-bottom: 8px; }
    .header-icon { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: #1E3932; color: white; flex-shrink: 0; }
    .header-icon mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .detail-header h1 { font-size: 1.5rem; font-weight: 700; color: rgba(0,0,0,0.87); margin: 0 0 6px; letter-spacing: -0.01em; }
    .formula-badge { display: inline-block; padding: 3px 12px; font-size: 13px; font-weight: 600; color: #006241; background: #d4e9e2; border-radius: 50px; }
    .detail-desc { font-size: 0.9375rem; color: rgba(0,0,0,0.58); margin: 0 0 28px; }
    .viewer-wrapper { border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.12); margin-bottom: 28px; }
    .viewer-container { width: 100%; height: 500px; background: #0f172a; }
    .controls-hint { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: #f9f9f9; font-size: 13px; color: rgba(0,0,0,0.58); border-top: 1px solid #edebe9; }
    .controls-hint mat-icon { font-size: 18px; width: 18px; height: 18px; color: rgba(0,0,0,0.30); }
    .info-card { background: white; border-radius: 12px; padding: 24px; max-width: 420px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .info-card h3 { font-size: 1rem; font-weight: 700; color: #006241; margin: 0 0 18px; letter-spacing: -0.01em; }
    .info-grid { display: flex; gap: 32px; margin-bottom: 16px; }
    .info-item { display: flex; flex-direction: column; gap: 4px; }
    .info-label { font-size: 13px; color: rgba(0,0,0,0.58); font-weight: 500; }
    .info-value { font-size: 1.25rem; font-weight: 700; color: rgba(0,0,0,0.87); letter-spacing: -0.01em; }
    .elements-row { display: flex; flex-direction: column; gap: 8px; }
    .element-list { display: flex; gap: 6px; flex-wrap: wrap; }
    .element-badge { display: inline-block; padding: 3px 12px; border-radius: 50px; color: white; font-weight: 600; font-size: 12px; }
    .loading-state { display: flex; justify-content: center; padding: 80px 0; }
  `]
})
export class MoleculeDetailComponent implements OnInit, OnDestroy {
  @ViewChild('viewerContainer', { static: false }) viewerContainer!: ElementRef;

  molecule: Molecule | null = null;
  moleculeData: MoleculeData | null = null;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationId = 0;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private highlightedMesh: THREE.Mesh | null = null;
  private originalColor: THREE.Color | null = null;
  private atomMeshes: THREE.Mesh[] = [];

  constructor(
    private route: ActivatedRoute,
    private moleculeService: MoleculeService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.moleculeService.getById(id).subscribe(mol => {
      this.molecule = mol;
      this.moleculeData = JSON.parse(mol.atomData);
      setTimeout(() => this.initViewer(), 0);
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.renderer?.dispose();
    const container = this.viewerContainer?.nativeElement;
    if (container) {
      container.removeEventListener('mousemove', this.onMouseMove);
    }
  }

  private initViewer(): void {
    const container = this.viewerContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    this.camera.position.set(3, 2, 4);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0x6666ff, 0.5);
    backLight.position.set(-5, -3, -5);
    this.scene.add(backLight);

    // Build molecule
    if (this.moleculeData) {
      this.buildMolecule(this.moleculeData);
    }

    // Mouse interaction
    container.addEventListener('mousemove', this.onMouseMove);

    // Handle resize
    const observer = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
    observer.observe(container);

    // Animate
    this.animate();
  }

  private buildMolecule(data: MoleculeData): void {
    const atomPositions: THREE.Vector3[] = [];

    // Create atoms (spheres)
    data.atoms.forEach((atom, index) => {
      const radius = ELEMENT_RADII[atom.element] || 0.35;
      const color = ELEMENT_COLORS[atom.element] || 0xcccccc;

      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 80,
        specular: 0x444444
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(atom.x, atom.y, atom.z);
      mesh.userData = { element: atom.element, index: index };

      this.scene.add(mesh);
      this.atomMeshes.push(mesh);
      atomPositions.push(new THREE.Vector3(atom.x, atom.y, atom.z));
    });

    // Create bonds (cylinders)
    data.bonds.forEach(bond => {
      const start = atomPositions[bond.from];
      const end = atomPositions[bond.to];

      if (bond.order === 1) {
        this.createBond(start, end, 0xaaaaaa, 0.08);
      } else if (bond.order === 2) {
        const offset = 0.08;
        const dir = new THREE.Vector3().subVectors(end, start).normalize();
        const perp = new THREE.Vector3();
        if (Math.abs(dir.x) < 0.9) {
          perp.crossVectors(dir, new THREE.Vector3(1, 0, 0)).normalize();
        } else {
          perp.crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
        }
        const o = perp.multiplyScalar(offset);
        this.createBond(start.clone().add(o), end.clone().add(o), 0xaaaaaa, 0.05);
        this.createBond(start.clone().sub(o), end.clone().sub(o), 0xaaaaaa, 0.05);
      } else if (bond.order === 3) {
        const offset = 0.1;
        const dir = new THREE.Vector3().subVectors(end, start).normalize();
        const perp = new THREE.Vector3();
        if (Math.abs(dir.x) < 0.9) {
          perp.crossVectors(dir, new THREE.Vector3(1, 0, 0)).normalize();
        } else {
          perp.crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
        }
        const o = perp.multiplyScalar(offset);
        this.createBond(start, end, 0xaaaaaa, 0.05);
        this.createBond(start.clone().add(o), end.clone().add(o), 0xaaaaaa, 0.05);
        this.createBond(start.clone().sub(o), end.clone().sub(o), 0xaaaaaa, 0.05);
      }
    });
  }

  private createBond(start: THREE.Vector3, end: THREE.Vector3, color: number, radius: number): void {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 8);
    const material = new THREE.MeshPhongMaterial({ color, shininess: 40 });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(start).add(direction.multiplyScalar(0.5));

    const axis = new THREE.Vector3(0, 1, 0);
    const dir = direction.normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(axis, new THREE.Vector3().subVectors(end, start).normalize());
    mesh.quaternion.copy(quat);

    this.scene.add(mesh);
  }

  private onMouseMove = (event: MouseEvent): void => {
    const container = this.viewerContainer.nativeElement;
    const rect = container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.atomMeshes);

    // Reset previous highlight
    if (this.highlightedMesh && this.originalColor) {
      (this.highlightedMesh.material as THREE.MeshPhongMaterial).emissive.set(0x000000);
      this.highlightedMesh = null;
    }

    if (intersects.length > 0) {
      const mesh = intersects[0].object as THREE.Mesh;
      (mesh.material as THREE.MeshPhongMaterial).emissive.set(0x444444);
      this.highlightedMesh = mesh;
      container.style.cursor = 'pointer';
    } else {
      container.style.cursor = 'grab';
    }
  };

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  getUniqueElements(): string[] {
    if (!this.moleculeData) return [];
    return [...new Set(this.moleculeData.atoms.map(a => a.element))];
  }

  getElementColorHex(element: string): string {
    const color = ELEMENT_COLORS[element] || 0xcccccc;
    return '#' + color.toString(16).padStart(6, '0');
  }
}
