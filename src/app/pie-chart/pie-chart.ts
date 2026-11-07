import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  OnDestroy
} from '@angular/core';

import Chart from 'chart.js/auto';
import { EmployeeHours } from '../models/employee-hours.model';

@Component({
  selector: 'app-pie-chart',
  imports: [],
  templateUrl: './pie-chart.html',
  styleUrl: './pie-chart.css'
})
export class PieChart implements AfterViewInit, OnChanges, OnDestroy {

  @Input() employees: EmployeeHours[] = [];

  @ViewChild('chartCanvas')
  chartCanvas?: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(): void {
    if (this.chartCanvas) {
      this.renderChart();
    }
  }

  private renderChart(): void {
    if (!this.chartCanvas) return;

    this.chart?.destroy();
    this.chart = undefined;

    const validEmployees = this.employees.filter(e => e.totalHours > 0);

    if (validEmployees.length === 0) return;

    const totalHours = validEmployees.reduce(
      (sum, e) => sum + e.totalHours, 0
    );

    const labels = validEmployees.map(e => {
      const percentage = e.totalHours / totalHours * 100;
      return `${e.employeeName} (${percentage.toFixed(1)}%)`;
    });

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: validEmployees.map(e => e.totalHours),
          backgroundColor: validEmployees.map((_, i) =>
            `hsl(${i * 360 / validEmployees.length}, 65%, 60%)`
          )
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
