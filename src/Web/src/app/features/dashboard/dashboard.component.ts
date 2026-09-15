// src/Web/src/app/features/dashboard/dashboard.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardService } from '../../shared/services/dashboard.service';
import { DashboardSummary } from '../../shared/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  summary = signal<DashboardSummary | null>(null);
  loading = signal(true);

  chartData: ChartData<'doughnut'> = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#fbbf24', '#3b82f6', '#22c55e'] }]
  };

  chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  };

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe({
      next: data => {
        this.summary.set(data);
        this.chartData = {
          ...this.chartData,
          datasets: [{
            ...this.chartData.datasets[0],
            data: [data.pendingTaskCount, data.inProgressTaskCount, data.completedTaskCount]
          }]
        };
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  taskStatusPercent(count: number): number {
    const total = this.summary()?.taskCount || 1;
    return Math.round((count / total) * 100);
  }

  goToNewProject(): void {
    this.router.navigate(['/projects/new']);
  }

  initials(title: string): string {
    return title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
}