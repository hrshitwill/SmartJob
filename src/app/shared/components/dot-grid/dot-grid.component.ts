import {
  Component,
  ElementRef,
  Input,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  NgZone,
  inject,
  ViewEncapsulation
} from '@angular/core';
import { gsap } from 'gsap';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(InertiaPlugin);

/* ─── Helpers ──────────────────────────────────────────────────── */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16)
  };
}

function throttle(fn: (...args: any[]) => void, limit: number) {
  let lastCall = 0;
  return function (...args: any[]) {
    const now = performance.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
}

interface Dot {
  cx: number;
  cy: number;
  xOffset: number;
  yOffset: number;
  _inertiaApplied: boolean;
}

/* ─── Component ─────────────────────────────────────────────────── */
@Component({
  selector: 'app-dot-grid',
  standalone: true,
  imports: [],
  templateUrl: './dot-grid.component.html',
  styleUrl: './dot-grid.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class DotGridComponent implements AfterViewInit, OnDestroy {

  /* wrapper + canvas refs */
  @ViewChild('wrap',   { static: true }) wrapRef!:   ElementRef<HTMLDivElement>;
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  /* props mirroring React Bits exactly */
  @Input() dotSize        = 10;
  @Input() gap            = 15;
  @Input() baseColor      = '#5227FF';
  @Input() activeColor    = '#5227FF';
  @Input() proximity      = 120;
  @Input() speedTrigger   = 100;
  @Input() shockRadius    = 250;
  @Input() shockStrength  = 5;
  @Input() maxSpeed       = 5000;
  @Input() resistance     = 750;
  @Input() returnDuration = 1.5;

  private ngZone = inject(NgZone);

  private dots: Dot[] = [];
  private rafId: number | null = null;
  private circlePath: Path2D | null = null;
  private ro: ResizeObserver | null = null;

  private pointer = {
    x: 0, y: 0,
    vx: 0, vy: 0,
    speed: 0,
    lastTime: 0,
    lastX: 0, lastY: 0
  };

  private throttledMove!: (e: MouseEvent) => void;
  private boundClick!:    (e: MouseEvent) => void;

  /* ── Lifecycle ── */
  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.circlePath = this.buildCirclePath();
      this.buildGrid();
      this.startDrawLoop();
      this.attachListeners();

      this.ro = new ResizeObserver(() => this.buildGrid());
      this.ro.observe(this.wrapRef.nativeElement);
    });
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    if (this.ro) this.ro.disconnect();
    window.removeEventListener('mousemove', this.throttledMove);
    window.removeEventListener('click', this.boundClick);
  }

  /* ── Build circle Path2D once ── */
  private buildCirclePath(): Path2D {
    const p = new Path2D();
    p.arc(0, 0, this.dotSize / 2, 0, Math.PI * 2);
    return p;
  }

  /* ── Build / rebuild dot grid ── */
  private buildGrid(): void {
    const wrap   = this.wrapRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;

    const { width, height } = wrap.getBoundingClientRect();
    if (!width || !height) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = width  * dpr;
    canvas.height = height * dpr;
    canvas.style.width  = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cell = this.dotSize + this.gap;
    const cols = Math.floor((width  + this.gap) / cell);
    const rows = Math.floor((height + this.gap) / cell);

    const gridW = cell * cols - this.gap;
    const gridH = cell * rows - this.gap;

    const startX = (width  - gridW) / 2 + this.dotSize / 2;
    const startY = (height - gridH) / 2 + this.dotSize / 2;

    this.dots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.dots.push({
          cx: startX + c * cell,
          cy: startY + r * cell,
          xOffset: 0,
          yOffset: 0,
          _inertiaApplied: false
        });
      }
    }
  }

  /* ── 60fps draw loop ── */
  private startDrawLoop(): void {
    const proxSq    = this.proximity * this.proximity;
    const baseRgb   = hexToRgb(this.baseColor);
    const activeRgb = hexToRgb(this.activeColor);

    const draw = () => {
      const canvas = this.canvasRef.nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx || !this.circlePath) { this.rafId = requestAnimationFrame(draw); return; }

      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      const px = this.pointer.x;
      const py = this.pointer.y;

      for (const dot of this.dots) {
        const ox = dot.cx + dot.xOffset;
        const oy = dot.cy + dot.yOffset;
        const dx = dot.cx - px;
        const dy = dot.cy - py;
        const dsq = dx * dx + dy * dy;

        let fillStyle = this.baseColor;
        if (dsq <= proxSq) {
          const t = 1 - Math.sqrt(dsq) / this.proximity;
          const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
          const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
          const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
          fillStyle = `rgb(${r},${g},${b})`;
        }

        ctx.save();
        ctx.translate(ox, oy);
        ctx.fillStyle = fillStyle;
        ctx.fill(this.circlePath);
        ctx.restore();
      }

      this.rafId = requestAnimationFrame(draw);
    };

    this.rafId = requestAnimationFrame(draw);
  }

  /* ── Mouse / click listeners ── */
  private attachListeners(): void {
    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      const pr  = this.pointer;
      const dt  = pr.lastTime ? now - pr.lastTime : 16;
      const dx  = e.clientX - pr.lastX;
      const dy  = e.clientY - pr.lastY;

      let vx    = (dx / dt) * 1000;
      let vy    = (dy / dt) * 1000;
      let speed = Math.hypot(vx, vy);

      if (speed > this.maxSpeed) {
        const scale = this.maxSpeed / speed;
        vx *= scale; vy *= scale;
        speed = this.maxSpeed;
      }

      pr.lastTime = now;
      pr.lastX    = e.clientX;
      pr.lastY    = e.clientY;
      pr.vx = vx; pr.vy = vy;
      pr.speed = speed;

      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      pr.x = e.clientX - rect.left;
      pr.y = e.clientY - rect.top;

      /* inertia on fast swipes */
      for (const dot of this.dots) {
        const dist = Math.hypot(dot.cx - pr.x, dot.cy - pr.y);
        if (speed > this.speedTrigger && dist < this.proximity && !dot._inertiaApplied) {
          dot._inertiaApplied = true;
          gsap.killTweensOf(dot);
          const pushX = (dot.cx - pr.x) + vx * 0.005;
          const pushY = (dot.cy - pr.y) + vy * 0.005;
          gsap.to(dot, {
            inertia: { xOffset: pushX, yOffset: pushY, resistance: this.resistance },
            onComplete: () => {
              gsap.to(dot, {
                xOffset: 0,
                yOffset: 0,
                duration: this.returnDuration,
                ease: 'elastic.out(1, 0.75)'
              });
              dot._inertiaApplied = false;
            }
          });
        }
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      const cx   = e.clientX - rect.left;
      const cy   = e.clientY - rect.top;

      for (const dot of this.dots) {
        const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
        if (dist < this.shockRadius && !dot._inertiaApplied) {
          dot._inertiaApplied = true;
          gsap.killTweensOf(dot);
          const falloff = Math.max(0, 1 - dist / this.shockRadius);
          const pushX = (dot.cx - cx) * this.shockStrength * falloff;
          const pushY = (dot.cy - cy) * this.shockStrength * falloff;
          gsap.to(dot, {
            inertia: { xOffset: pushX, yOffset: pushY, resistance: this.resistance },
            onComplete: () => {
              gsap.to(dot, {
                xOffset: 0,
                yOffset: 0,
                duration: this.returnDuration,
                ease: 'elastic.out(1, 0.75)'
              });
              dot._inertiaApplied = false;
            }
          });
        }
      }
    };

    this.throttledMove = throttle(onMove, 50) as (e: MouseEvent) => void;
    this.boundClick    = onClick;

    window.addEventListener('mousemove', this.throttledMove, { passive: true });
    window.addEventListener('click',     this.boundClick);
  }
}
