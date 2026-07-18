import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TrackService } from '../../core/services/track.service';
import { ProfileService } from '../../core/services/profile.service';
import { Application } from '../../core/models/application.model';

export type TrackStatus = Application['status'];

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tracker.component.html',
  styleUrl: './tracker.component.scss'
})
export class ApplicationTrackerComponent {
  trackService = inject(TrackService);
  profileService = inject(ProfileService);

  columns: { id: TrackStatus; title: string }[] = [
    { id: 'applied', title: 'Applied' },
    { id: 'reviewing', title: 'Under Review' },
    { id: 'interviewing', title: 'Interviewing' },
    { id: 'offered', title: 'Offered' }
  ];

  // Drag state
  draggedAppId = signal<string | null>(null);
  activeDragOverColumn = signal<TrackStatus | null>(null);

  // Computed applications list for current student
  studentApps = computed<Application[]>(() => {
    const profile = this.profileService.currentProfile();
    return profile ? this.trackService.getStudentApplications(profile.id) : [];
  });

  getAppsForColumn(columnId: TrackStatus): Application[] {
    return this.studentApps().filter(app => app.status === columnId);
  }

  // Native Drag and Drop Handlers
  onDragStart(event: DragEvent, appId: string) {
    this.draggedAppId.set(appId);
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', appId);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent) {
    // Required to allow drop
    event.preventDefault();
  }

  onDrop(event: DragEvent, targetStatus: TrackStatus) {
    event.preventDefault();
    const appId = this.draggedAppId();
    if (appId) {
      this.trackService.updateApplicationStatus(appId, targetStatus);
      this.draggedAppId.set(null);
    }
  }

  // Fallback click handlers for accessibility and mobile
  moveApp(appId: string, currentStatus: TrackStatus, direction: 'prev' | 'next') {
    const statusOrder: TrackStatus[] = ['applied', 'reviewing', 'interviewing', 'offered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    let nextIndex = currentIndex;
    if (direction === 'prev' && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < statusOrder.length - 1) {
      nextIndex = currentIndex + 1;
    }

    if (nextIndex !== currentIndex) {
      this.trackService.updateApplicationStatus(appId, statusOrder[nextIndex]);
    }
  }
}
