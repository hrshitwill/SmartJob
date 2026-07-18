import { trigger, transition, style, query, animate, group } from '@angular/animations';

export const routeAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    
    // Set enter/leave elements to absolute positioning
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        opacity: 0,
        transform: 'translateY(12px)'
      })
    ], { optional: true }),
    
    group([
      // Animate the leaving route out
      query(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-12px)' }))
      ], { optional: true }),
      
      // Animate the entering route in
      query(':enter', [
        animate('250ms 100ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { optional: true })
    ])
  ])
]);
