import { Component, signal, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { TimeDataService } from './services/time-data.service';
import { EmployeeHours } from './models/employee-hours.model';
import { PieChart } from './pie-chart/pie-chart';

@Component({
  imports: [PieChart],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('employee-hours-angular');

  private readonly timeDataService = inject(TimeDataService);
  private request?: Subscription;

  employees = signal<EmployeeHours[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  loadEmployees(apiKey: string): void {
    this.request?.unsubscribe();

    this.employees.set([]);
    this.errorMessage.set('');
    this.isLoading.set(false);

    if (!apiKey.trim()) {
      this.errorMessage.set('Please enter your API key.');
      return;
    }

    this.isLoading.set(true);

    this.request = this.timeDataService.getTimeEntries(apiKey.trim()).subscribe({
      next: (entries) => {
        this.employees.set(
          this.timeDataService.calculateEmployeeHours(entries)
        );
        this.isLoading.set(false);
      },
      error: () => {
        this.employees.set([]);
        this.errorMessage.set('Failed to load employee data.');
        this.isLoading.set(false);
      }
    });
  }
}
