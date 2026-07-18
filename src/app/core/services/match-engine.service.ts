import { Injectable } from '@angular/core';
import { StudentProfile } from '../models/profile.model';
import { Job } from '../models/job.model';

export interface LearningResource {
  skill: string;
  resource: string;
  link: string;
}

export interface MatchBreakdown {
  score: number;
  skillsScore: number;
  skillsMatched: string[];
  skillsMissing: string[];
  skillsPercent: number;
  gpaScore: number;
  gpaPassed: boolean;
  gpaMargin: number;
  workAuthScore: number;
  workAuthCompatible: boolean;
  explanation: string[];
  roadmap: LearningResource[];
}

@Injectable({
  providedIn: 'root'
})
export class MatchEngineService {

  private readonly RESOURCE_MAP: Record<string, { resource: string; link: string }> = {
    'angular': { resource: 'Angular official tutorials & guides', link: 'https://angular.dev' },
    'typescript': { resource: 'TypeScript official handbook & playground', link: 'https://www.typescriptlang.org' },
    'rxjs': { resource: 'RxJS Operators interactive reference guide', link: 'https://rxjs.dev' },
    'scss': { resource: 'Sass Guide & normalizer structures', link: 'https://sass-lang.com' },
    'java': { resource: 'Oracle Java tutorials and documentation', link: 'https://dev.java' },
    'spring boot': { resource: 'Spring Academy - Build Spring Boot REST APIs', link: 'https://spring.academy' },
    'sql': { resource: 'PostgreSQL official tutorial manual', link: 'https://www.postgresql.org' },
    'rest api': { resource: 'RESTful API Design guidelines on MDN', link: 'https://developer.mozilla.org' },
    'docker': { resource: 'Docker Curriculum - Complete container course', link: 'https://docker-curriculum.com' },
    'figma': { resource: 'Figma Design Academy for developers', link: 'https://www.figma.com/resources/learn-design' },
    'git': { resource: 'Pro Git Book (free interactive edition)', link: 'https://git-scm.com/book' },
    'web performance': { resource: 'web.dev performance metrics & indicators', link: 'https://web.dev/performance-scoring' },
    'animations': { resource: 'CSS Tricks Complete Guide to CSS Transitions', link: 'https://css-tricks.com/almanac/properties/t/transition' }
  };

  calculateMatch(profile: StudentProfile | null, job: Job): MatchBreakdown {
    // If no profile, return 0 score and default breakdown
    if (!profile) {
      return {
        score: 0,
        skillsScore: 0,
        skillsMatched: [],
        skillsMissing: job.skillsRequired,
        skillsPercent: 0,
        gpaScore: 0,
        gpaPassed: false,
        gpaMargin: 0,
        workAuthScore: 0,
        workAuthCompatible: false,
        explanation: ['Create a profile to calculate your matching compatibility.'],
        roadmap: this.generateRoadmap(job.skillsRequired)
      };
    }

    const explanation: string[] = [];
    
    // 1. Skill Overlap (Weight: 50 points)
    const requiredSkills = job.skillsRequired || [];
    const studentSkills = profile.skills || [];
    
    let matchedSkills: string[] = [];
    let missingSkills: string[] = [];
    let skillsScore = 0;
    let skillsPercent = 0;

    if (requiredSkills.length > 0) {
      matchedSkills = requiredSkills.filter(skill => 
        studentSkills.some(studentSkill => studentSkill.toLowerCase() === skill.toLowerCase())
      );
      missingSkills = requiredSkills.filter(skill => 
        !studentSkills.some(studentSkill => studentSkill.toLowerCase() === skill.toLowerCase())
      );
      
      skillsPercent = Math.round((matchedSkills.length / requiredSkills.length) * 100);
      skillsScore = Math.round((matchedSkills.length / requiredSkills.length) * 50);
      
      if (skillsPercent === 100) {
        explanation.push(`You match all required skills for this role.`);
      } else if (skillsPercent >= 50) {
        explanation.push(`Strong skills overlap: You match ${matchedSkills.length} of ${requiredSkills.length} skills.`);
      } else if (matchedSkills.length > 0) {
        explanation.push(`Partial skills overlap: You are missing ${missingSkills.join(', ')}.`);
      } else {
        explanation.push(`Skill gap: This role requires skills you haven't listed yet.`);
      }
    } else {
      skillsPercent = 100;
      skillsScore = 50;
      explanation.push(`No specific technical skills are required.`);
    }

    // 2. GPA Threshold (Weight: 30 points)
    let gpaScore = 0;
    let gpaPassed = false;
    const gpaMargin = profile.gpa - job.gpaThreshold;

    if (profile.gpa >= job.gpaThreshold) {
      gpaScore = 30;
      gpaPassed = true;
      explanation.push(`Your GPA of ${profile.gpa.toFixed(2)} meets the minimum threshold of ${job.gpaThreshold.toFixed(2)}.`);
    } else if (gpaMargin >= -0.3) {
      gpaScore = 15;
      gpaPassed = false;
      explanation.push(`Your GPA of ${profile.gpa.toFixed(2)} is close to the threshold of ${job.gpaThreshold.toFixed(2)}.`);
    } else {
      gpaScore = 0;
      gpaPassed = false;
      explanation.push(`Your GPA of ${profile.gpa.toFixed(2)} is below the target requirement of ${job.gpaThreshold.toFixed(2)}.`);
    }

    // 3. Work Auth Compatibility (Weight: 20 points)
    let workAuthScore = 0;
    let workAuthCompatible = false;

    if (profile.workAuthorization === 'authorized') {
      workAuthScore = 20;
      workAuthCompatible = true;
      explanation.push(`Authorized to work: You don't require visa sponsorship.`);
    } else {
      if (job.sponsorshipRequired) {
        workAuthScore = 20;
        workAuthCompatible = true;
        explanation.push(`Sponsorship available: The employer supports candidates requiring visa sponsorship.`);
      } else {
        workAuthScore = 0;
        workAuthCompatible = false;
        explanation.push(`Sponsorship gap: The employer requires existing US work authorization.`);
      }
    }

    const totalScore = skillsScore + gpaScore + workAuthScore;
    const roadmap = this.generateRoadmap(missingSkills);

    return {
      score: totalScore,
      skillsScore,
      skillsMatched: matchedSkills,
      skillsMissing: missingSkills,
      skillsPercent,
      gpaScore,
      gpaPassed,
      gpaMargin,
      workAuthScore,
      workAuthCompatible,
      explanation,
      roadmap
    };
  }

  private generateRoadmap(missingSkills: string[]): LearningResource[] {
    return missingSkills.map(skill => {
      const match = this.RESOURCE_MAP[skill.toLowerCase()];
      if (match) {
        return { skill, ...match };
      }
      return { 
        skill, 
        resource: `Coursera / Udemy courses on ${skill}`, 
        link: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}` 
      };
    });
  }
}
