import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Task, TaskPriority, TaskStatus } from '../models/Task';

export type ExportFormat = 'xlsx' | 'csv' | 'json';

interface ExportOptions {
  includeCharts?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Extend ExcelJS types to include chart functionality
declare module 'exceljs' {
  interface Workbook {
    addChart(options: any): any;
  }
  
  interface Worksheet {
    addChart(chart: any): void;
  }
}

export class ExportService {
  private static instance: ExportService;

  private constructor() {}

  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  public async exportTasks(
    tasks: Task[],
    format: ExportFormat,
    options: ExportOptions = {}
  ): Promise<void> {
    switch (format) {
      case 'xlsx':
        await this.exportToExcel(tasks, options);
        break;
      case 'csv':
        await this.exportToCSV(tasks);
        break;
      case 'json':
        await this.exportToJSON(tasks);
        break;
      default:
        throw new Error('Unsupported export format');
    }
  }

  private async exportToExcel(tasks: Task[], options: ExportOptions): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tasks');

    // Set up columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'Priority', key: 'priority', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Tags', key: 'tags', width: 30 },
      { header: 'Estimated Time (min)', key: 'estimatedTime', width: 20 },
      { header: 'Actual Time (min)', key: 'actualTime', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Updated At', key: 'updatedAt', width: 20 },
      { header: 'Completed At', key: 'completedAt', width: 20 },
      { header: 'Efficiency Score', key: 'efficiency', width: 15 }
    ];

    // Add data
    tasks.forEach(task => {
      worksheet.addRow({
        id: task.getId(),
        title: task.getTitle(),
        description: task.getDescription(),
        priority: task.getPriority(),
        status: task.getStatus(),
        tags: task.getTags().join(', '),
        estimatedTime: task.getEstimatedTime(),
        actualTime: task.getActualTime(),
        createdAt: task.getCreatedAt().toISOString(),
        updatedAt: task.getUpdatedAt().toISOString(),
        completedAt: task.getCompletedAt()?.toISOString() || '',
        efficiency: task.calculateEfficiency().toFixed(2) + '%'
      });
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF94A3B8' }
    };

    // Add charts if requested
    if (options.includeCharts) {
      const chartSheet = workbook.addWorksheet('Analytics');
      
      // Priority distribution chart
      const priorityCounts = this.getPriorityCounts(tasks);
      const priorityLabels = Object.keys(priorityCounts);
      const priorityValues = Object.values(priorityCounts);

      const priorityChart = workbook.addChart({
        type: 'pie',
        title: {
          text: 'Task Distribution by Priority',
          font: { size: 14, bold: true }
        },
        legend: {
          position: 'right'
        },
        plotArea: {
          showPercent: true
        }
      });

      priorityChart.addSeries({
        name: 'Priority Distribution',
        labels: priorityLabels,
        values: priorityValues,
        dataLabels: { showPercent: true }
      });

      // Add priority data to sheet for reference
      chartSheet.addRow(['Priority Distribution']);
      chartSheet.addRow(['Priority', 'Count']);
      priorityLabels.forEach((label, index) => {
        chartSheet.addRow([label, priorityValues[index]]);
      });
      chartSheet.addChart(priorityChart);

      // Status distribution chart
      const statusCounts = this.getStatusCounts(tasks);
      const statusLabels = Object.keys(statusCounts);
      const statusValues = Object.values(statusCounts);

      const statusChart = workbook.addChart({
        type: 'column',
        title: {
          text: 'Tasks by Status',
          font: { size: 14, bold: true }
        },
        legend: {
          position: 'top'
        },
        valueAxis: {
          title: {
            text: 'Number of Tasks'
          }
        },
        categoryAxis: {
          title: {
            text: 'Status'
          }
        }
      });

      statusChart.addSeries({
        name: 'Status Distribution',
        labels: statusLabels,
        values: statusValues,
        dataLabels: { showValue: true }
      });

      // Add status data to sheet for reference
      chartSheet.addRow([]);
      chartSheet.addRow(['Status Distribution']);
      chartSheet.addRow(['Status', 'Count']);
      statusLabels.forEach((label, index) => {
        chartSheet.addRow([label, statusValues[index]]);
      });
      chartSheet.addChart(statusChart);

      // Position charts
      priorityChart.setPosition('A1', 'G15');
      statusChart.setPosition('A16', 'G30');
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    saveAs(blob, 'tasks-export.xlsx');
  }

  private async exportToCSV(tasks: Task[]): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tasks');

    // Set up columns (same as Excel export)
    worksheet.columns = [
      { header: 'ID', key: 'id' },
      { header: 'Title', key: 'title' },
      { header: 'Description', key: 'description' },
      { header: 'Priority', key: 'priority' },
      { header: 'Status', key: 'status' },
      { header: 'Tags', key: 'tags' },
      { header: 'Estimated Time (min)', key: 'estimatedTime' },
      { header: 'Actual Time (min)', key: 'actualTime' },
      { header: 'Created At', key: 'createdAt' },
      { header: 'Updated At', key: 'updatedAt' },
      { header: 'Completed At', key: 'completedAt' },
      { header: 'Efficiency Score', key: 'efficiency' }
    ];

    // Add data
    tasks.forEach(task => {
      worksheet.addRow({
        id: task.getId(),
        title: task.getTitle(),
        description: task.getDescription(),
        priority: task.getPriority(),
        status: task.getStatus(),
        tags: task.getTags().join(', '),
        estimatedTime: task.getEstimatedTime(),
        actualTime: task.getActualTime(),
        createdAt: task.getCreatedAt().toISOString(),
        updatedAt: task.getUpdatedAt().toISOString(),
        completedAt: task.getCompletedAt()?.toISOString() || '',
        efficiency: task.calculateEfficiency().toFixed(2) + '%'
      });
    });

    const buffer = await workbook.csv.writeBuffer();
    const blob = new Blob([buffer], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'tasks-export.csv');
  }

  private async exportToJSON(tasks: Task[]): Promise<void> {
    const data = tasks.map(task => task.toJSON());
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    saveAs(blob, 'tasks-export.json');
  }

  private getPriorityCounts(tasks: Task[]): Record<TaskPriority, number> {
    const counts: Partial<Record<TaskPriority, number>> = {};
    tasks.forEach(task => {
      const priority = task.getPriority();
      counts[priority] = (counts[priority] || 0) + 1;
    });
    return counts as Record<TaskPriority, number>;
  }

  private getStatusCounts(tasks: Task[]): Record<TaskStatus, number> {
    const counts: Partial<Record<TaskStatus, number>> = {};
    tasks.forEach(task => {
      const status = task.getStatus();
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts as Record<TaskStatus, number>;
  }
}