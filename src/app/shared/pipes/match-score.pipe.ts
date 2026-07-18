import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'matchScore',
  standalone: true
})
export class MatchScorePipe implements PipeTransform {
  transform(score: number | null | undefined, suffix = ' Match'): string {
    if (score === null || score === undefined) {
      return 'N/A';
    }
    
    return `${Math.round(score)}%${suffix}`;
  }
}

