import {
  Component,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  NgZone,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface Dot {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  scale: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
}

@Component({
  selector: 'app-dot-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dot-grid.component.html',
  styleUrl: './dot-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DotGridComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() dotSize = 2.5;
  @Input() gap = 28;
  @Input() baseColor = 'rgba(99, 102, 241, 0.25)';
  @Input() activeColor = 'rgba(168, 85, 247, 0.95)';
  @Input() proximity = 130;
  @Input() shockRadius = 220;
  @Input() shockStrength = 14;

  private ngZone = inject(NgZone);
  private ctx!: CanvasRenderingContext2D | null;
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private dots: Dot[] = [];
  private shockwaves: Shockwave[] = [];
  
  private mouse = {
    x: -1000,
    y: -1000,
    prevX: -1000,
    prevY: -1000,
    speedX: 0,
    speedY: 0
  };

  private width = 0;
  private height = 0;
  private dpr = 1;
  private prefersReducedMotion = false;
  
  private boundMouseMove = this.onMouseMove.bind(this);
  private boundMouseLeave = this.onMouseLeave.bind(this);
  private boundClick = this.onClick.bind(this);
  private boundTouch = this.onTouch.bind(this);

  ngOnInit() {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    this.ngZone.runOutsideAngular(() => {
      this.initCanvas();
      this.setupListeners();
      this.animate();
    });
  }

  ngOnDestroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    const canvas = this.canvasRef.nativeElement;
    const target = canvas.parentElement || canvas;
    target.removeEventListener('mousemove', this.boundMouseMove);
    target.removeEventListener('mouseleave', this.boundMouseLeave);
    target.removeEventListener('click', this.boundClick);
    target.removeEventListener('touchstart', this.boundTouch);
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    });
    this.resizeObserver.observe(canvas.parentElement || canvas);

    this.resizeCanvas();
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const parent = canvas.parentElement || document.body;
    
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = parent.clientWidth;
    this.height = parent.clientHeight;

    canvas.width = this.width * this.dpr;
    canvas.height = this.height * this.dpr;
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;

    if (this.ctx) {
      this.ctx.scale(this.dpr, this.dpr);
    }

    this.buildGrid();
  }

  private buildGrid() {
    this.dots = [];
    const cols = Math.floor(this.width / this.gap);
    const rows = Math.floor(this.height / this.gap);

    const startX = (this.width - cols * this.gap) / 2 + this.gap / 2;
    const startY = (this.height - rows * this.gap) / 2 + this.gap / 2;

    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const bx = startX + c * this.gap;
        const by = startY + r * this.gap;
        
        this.dots.push({
          x: bx,
          y: by,
          baseX: bx,
          baseY: by,
          vx: 0,
          vy: 0,
          size: this.dotSize,
          alpha: 0.25,
          scale: 1
        });
      }
    }
  }

  private setupListeners() {
    const canvas = this.canvasRef.nativeElement;
    const target = canvas.parentElement || canvas;

    target.addEventListener('mousemove', this.boundMouseMove, { passive: true });
    target.addEventListener('mouseleave', this.boundMouseLeave, { passive: true });
    target.addEventListener('click', this.boundClick, { passive: true });
    target.addEventListener('touchstart', this.boundTouch, { passive: true });
  }

  private onMouseMove(e: MouseEvent) {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const currX = e.clientX - rect.left;
    const currY = e.clientY - rect.top;

    if (this.mouse.prevX !== -1000) {
      this.mouse.speedX = currX - this.mouse.prevX;
      this.mouse.speedY = currY - this.mouse.prevY;
    }

    this.mouse.x = currX;
    this.mouse.y = currY;
    this.mouse.prevX = currX;
    this.mouse.prevY = currY;
  }

  private onMouseLeave() {
    this.mouse.x = -1000;
    this.mouse.y = -1000;
  }

  private onClick(e: MouseEvent) {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    this.createShockwave(cx, cy);
  }

  private onTouch(e: TouchEvent) {
    if (e.touches.length > 0) {
      const canvas = this.canvasRef.nativeElement;
      const rect = canvas.getBoundingClientRect();
      this.createShockwave(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
    }
  }

  private createShockwave(x: number, y: number) {
    if (this.prefersReducedMotion) return;
    this.shockwaves.push({
      x,
      y,
      radius: 5,
      maxRadius: this.shockRadius,
      strength: this.shockStrength
    });
  }

  private animate() {
    this.render();
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  private render() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const wave = this.shockwaves[i];
      wave.radius += 7;
      if (wave.radius >= wave.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }

    const mouseActive = this.mouse.x !== -1000;

    for (let i = 0; i < this.dots.length; i++) {
      const dot = this.dots[i];

      let targetScale = 1;
      let targetAlpha = 0.25;

      if (mouseActive && !this.prefersReducedMotion) {
        const dx = dot.x - this.mouse.x;
        const dy = dot.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.proximity) {
          const ratio = 1 - dist / this.proximity;
          targetScale = 1 + ratio * 0.75;
          targetAlpha = 0.25 + ratio * 0.7;

          // Mouse speed inertia displacement
          if (Math.abs(this.mouse.speedX) > 1 || Math.abs(this.mouse.speedY) > 1) {
            dot.vx += (this.mouse.speedX * 0.08) * ratio;
            dot.vy += (this.mouse.speedY * 0.08) * ratio;
          }
        }
      }

      // Apply Shockwaves
      for (let j = 0; j < this.shockwaves.length; j++) {
        const wave = this.shockwaves[j];
        const dx = dot.x - wave.x;
        const dy = dot.y - wave.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const waveDelta = Math.abs(dist - wave.radius);

        if (waveDelta < 35 && dist > 0) {
          const waveRatio = 1 - waveDelta / 35;
          const force = (waveRatio * wave.strength);
          const angle = Math.atan2(dy, dx);

          dot.vx += Math.cos(angle) * force;
          dot.vy += Math.sin(angle) * force;
          targetScale = Math.max(targetScale, 1.4);
          targetAlpha = Math.max(targetAlpha, 0.95);
        }
      }

      // Spring physics return to base position
      if (!this.prefersReducedMotion) {
        const springX = (dot.baseX - dot.x) * 0.08;
        const springY = (dot.baseY - dot.y) * 0.08;
        
        dot.vx = (dot.vx + springX) * 0.84;
        dot.vy = (dot.vy + springY) * 0.84;
        
        dot.x += dot.vx;
        dot.y += dot.vy;
      } else {
        dot.x = dot.baseX;
        dot.y = dot.baseY;
      }

      // Smooth property scaling
      dot.scale += (targetScale - dot.scale) * 0.15;
      dot.alpha += (targetAlpha - dot.alpha) * 0.15;

      // Draw dot
      this.ctx.beginPath();
      const currentRadius = Math.max(0.5, dot.size * dot.scale);
      this.ctx.arc(dot.x, dot.y, currentRadius, 0, Math.PI * 2);

      if (dot.alpha > 0.45) {
        this.ctx.fillStyle = this.activeColor;
      } else {
        this.ctx.fillStyle = this.baseColor;
      }
      
      this.ctx.globalAlpha = Math.min(Math.max(dot.alpha, 0.15), 1.0);
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1.0;
  }
}
