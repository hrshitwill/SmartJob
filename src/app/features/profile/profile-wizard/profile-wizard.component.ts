import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProfileService } from '../../../core/services/profile.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-profile-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './profile-wizard.component.html',
  styleUrl: './profile-wizard.component.scss'
})
export class ProfileWizardComponent {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  currentStep = signal<number>(1);
  totalSteps = 5;

  // Form groups for steps
  preferencesForm: FormGroup;
  academicForm: FormGroup;
  workAuthForm: FormGroup;
  
  // Local state for Skills Tagging
  availableSkills: string[] = [
    'Angular', 'TypeScript', 'SCSS', 'RxJS', 'Java', 'Spring Boot', 
    'SQL', 'REST API', 'Figma', 'Next.js', 'Docker', 'Git', 'HTML', 'CSS'
  ];
  selectedSkills = signal<string[]>([]);
  newSkillText = '';

  // Resume state
  isDragging = signal<boolean>(false);
  isParsing = signal<boolean>(false);
  uploadedFileName = signal<string>('');

  constructor() {
    const currentProfile = this.profileService.currentProfile();

    this.preferencesForm = this.fb.group({
      preferredRole: [currentProfile?.preferredRole || '', Validators.required],
      preferredLocation: [currentProfile?.preferredLocation || '', Validators.required],
      preferredWorkMode: [currentProfile?.preferredWorkMode || 'remote', Validators.required]
    });

    this.academicForm = this.fb.group({
      gpa: [
        currentProfile?.gpa || '', 
        [Validators.required, Validators.min(0.1), Validators.max(4.0)]
      ]
    });

    this.workAuthForm = this.fb.group({
      workAuthorization: [currentProfile?.workAuthorization || 'authorized', Validators.required]
    });

    if (currentProfile) {
      this.selectedSkills.set([...currentProfile.skills]);
      if (currentProfile.resumeName) {
        this.uploadedFileName.set(currentProfile.resumeName);
      }
    }
  }

  nextStep() {
    if (this.currentStep() === 1 && this.preferencesForm.invalid) {
      this.toastService.warning('Please complete your preferred role and location details.');
      return;
    }
    if (this.currentStep() === 2 && this.academicForm.invalid) {
      this.toastService.warning('Please enter a valid GPA between 0.0 and 4.0.');
      return;
    }
    if (this.currentStep() === 3 && this.workAuthForm.invalid) {
      return;
    }
    if (this.currentStep() === 4 && this.selectedSkills().length === 0) {
      this.toastService.warning('Please add or select at least one skill.');
      return;
    }

    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  // Skills Tagger Helpers
  toggleSkill(skill: string) {
    this.selectedSkills.update(skills => {
      if (skills.includes(skill)) {
        return skills.filter(s => s !== skill);
      } else {
        return [...skills, skill];
      }
    });
  }

  addCustomSkill() {
    const trimmed = this.newSkillText.trim();
    if (!trimmed) return;

    this.selectedSkills.update(skills => {
      if (skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
        this.toastService.warning('Skill already added!');
        return skills;
      }
      return [...skills, trimmed];
    });

    this.newSkillText = '';
  }

  removeSkill(skillToRemove: string) {
    this.selectedSkills.update(skills => skills.filter(s => s !== skillToRemove));
  }

  // File Upload Handlers (Simulation)
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave() {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File) {
    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      this.toastService.danger('Please upload a PDF or Word document (.docx, .doc).');
      return;
    }

    this.uploadedFileName.set(file.name);
    this.isParsing.set(true);

    // Simulate AI parsing of the resume details
    setTimeout(() => {
      this.isParsing.set(false);
      this.toastService.success('Resume parsed successfully! Extracted skills added to your list.');
      
      // Auto-extract mock skills based on resume
      const parsedSkills = ['TypeScript', 'Angular', 'RxJS', 'SCSS'];
      this.selectedSkills.update(current => {
        const merged = [...current];
        parsedSkills.forEach(s => {
          if (!merged.includes(s)) {
            merged.push(s);
          }
        });
        return merged;
      });
      
      // Auto advance to skills step (Step 4) so the user can verify
      this.currentStep.set(4);
    }, 1800);
  }

  finishSetup() {
    // Save all fields to ProfileService
    const profileData = {
      preferredRole: this.preferencesForm.value.preferredRole,
      preferredLocation: this.preferencesForm.value.preferredLocation,
      preferredWorkMode: this.preferencesForm.value.preferredWorkMode,
      gpa: Number(this.academicForm.value.gpa),
      workAuthorization: this.workAuthForm.value.workAuthorization,
      skills: this.selectedSkills(),
      resumeName: this.uploadedFileName() || undefined
    };

    this.profileService.updateProfile(profileData);
    this.toastService.success('Profile setup complete! Welcome to your Matching Dashboard.');
    this.router.navigate(['/dashboard']);
  }
}
