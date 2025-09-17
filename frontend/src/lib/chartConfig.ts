import { ChartConfiguration, ChartOptions, ChartData } from 'chart.js/auto';

// Chart color palette for learning platform
export const chartColors = {
  primary: '#3b82f6',
  secondary: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  light: '#f8fafc',
  dark: '#1e293b',
  // Learning-specific colors
  beginner: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
  expert: '#8b5cf6',
  // Progress colors
  completed: '#10b981',
  inProgress: '#3b82f6',
  notStarted: '#94a3b8',
} as const;

// Chart theme configurations
export const chartThemes = {
  light: {
    backgroundColor: '#ffffff',
    textColor: '#1e293b',
    gridColor: '#e2e8f0',
    borderColor: '#cbd5e1',
  },
  dark: {
    backgroundColor: '#1e293b',
    textColor: '#f1f5f9',
    gridColor: '#334155',
    borderColor: '#475569',
  },
} as const;

// Base chart options for consistency across all charts
export const baseChartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          family: 'Inter, sans-serif',
        },
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#cbd5e1',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      padding: 12,
    },
  },
  scales: {
    x: {
      grid: {
        display: true,
        color: chartThemes.light.gridColor,
      },
      ticks: {
        font: {
          size: 11,
          family: 'Inter, sans-serif',
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: chartThemes.light.gridColor,
      },
      ticks: {
        font: {
          size: 11,
          family: 'Inter, sans-serif',
        },
      },
    },
  },
};

// Progress tracking chart configuration
export const progressChartConfig = (data: number[], labels: string[]): ChartConfiguration => ({
  type: 'line',
  data: {
    labels,
    datasets: [
      {
        label: 'Learning Progress',
        data,
        borderColor: chartColors.primary,
        backgroundColor: `${chartColors.primary}20`,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: chartColors.primary,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  },
  options: {
    ...baseChartOptions,
    plugins: {
      ...baseChartOptions.plugins,
      title: {
        display: true,
        text: 'Learning Progress Over Time',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: 20,
      },
    },
    scales: {
      ...baseChartOptions.scales,
      y: {
        ...baseChartOptions.scales?.y,
        max: 100,
        ticks: {
          ...baseChartOptions.scales?.y?.ticks,
          callback: function(value) {
            return value + '%';
          },
        },
      },
    },
  },
});

// Subject performance chart configuration
export const subjectPerformanceConfig = (data: number[], subjects: string[]): ChartConfiguration => ({
  type: 'bar',
  data: {
    labels: subjects,
    datasets: [
      {
        label: 'Performance Score',
        data,
        backgroundColor: [
          chartColors.primary,
          chartColors.success,
          chartColors.warning,
          chartColors.info,
          chartColors.secondary,
        ],
        borderColor: [
          chartColors.primary,
          chartColors.success,
          chartColors.warning,
          chartColors.info,
          chartColors.secondary,
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  },
  options: {
    ...baseChartOptions,
    plugins: {
      ...baseChartOptions.plugins,
      title: {
        display: true,
        text: 'Subject Performance Analysis',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: 20,
      },
    },
    scales: {
      ...baseChartOptions.scales,
      y: {
        ...baseChartOptions.scales?.y,
        max: 100,
        ticks: {
          ...baseChartOptions.scales?.y?.ticks,
          callback: function(value) {
            return value + '%';
          },
        },
      },
    },
  },
});

// Learning streak chart configuration
export const streakChartConfig = (streakData: number[], days: string[]): ChartConfiguration => ({
  type: 'bar',
  data: {
    labels: days,
    datasets: [
      {
        label: 'Daily Activity (minutes)',
        data: streakData,
        backgroundColor: streakData.map(value => 
          value > 0 ? chartColors.success : chartColors.notStarted
        ),
        borderColor: chartColors.success,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  },
  options: {
    ...baseChartOptions,
    plugins: {
      ...baseChartOptions.plugins,
      title: {
        display: true,
        text: 'Learning Streak - Last 7 Days',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: 20,
      },
      legend: {
        display: false,
      },
    },
    scales: {
      ...baseChartOptions.scales,
      y: {
        ...baseChartOptions.scales?.y,
        ticks: {
          ...baseChartOptions.scales?.y?.ticks,
          callback: function(value) {
            return value + ' min';
          },
        },
      },
    },
  },
});

// Skills distribution pie chart configuration
export const skillsDistributionConfig = (data: number[], skills: string[]): ChartConfiguration => ({
  type: 'doughnut',
  data: {
    labels: skills,
    datasets: [
      {
        data,
        backgroundColor: [
          chartColors.primary,
          chartColors.success,
          chartColors.warning,
          chartColors.info,
          chartColors.secondary,
          chartColors.expert,
        ],
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 10,
      },
    ],
  },
  options: {
    ...baseChartOptions,
    plugins: {
      ...baseChartOptions.plugins,
      title: {
        display: true,
        text: 'Skills Distribution',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: 20,
      },
      legend: {
        ...baseChartOptions.plugins?.legend,
        position: 'right',
      },
    },
    scales: {}, // Remove scales for pie chart
    cutout: '60%',
  } as ChartOptions<'doughnut'>,
});

// XP points over time configuration
export const xpProgressConfig = (xpData: number[], timeLabels: string[]): ChartConfiguration => ({
  type: 'line',
  data: {
    labels: timeLabels,
    datasets: [
      {
        label: 'XP Points',
        data: xpData,
        borderColor: chartColors.warning,
        backgroundColor: `${chartColors.warning}15`,
        borderWidth: 3,
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: chartColors.warning,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  },
  options: {
    ...baseChartOptions,
    plugins: {
      ...baseChartOptions.plugins,
      title: {
        display: true,
        text: 'XP Points Progress',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: 20,
      },
    },
    scales: {
      ...baseChartOptions.scales,
      y: {
        ...baseChartOptions.scales?.y,
        ticks: {
          ...baseChartOptions.scales?.y?.ticks,
          callback: function(value) {
            return value + ' XP';
          },
        },
      },
    },
  },
});

// Quiz performance radar chart
export const quizPerformanceConfig = (
  data: number[], 
  categories: string[]
): ChartConfiguration => ({
  type: 'radar',
  data: {
    labels: categories,
    datasets: [
      {
        label: 'Performance',
        data,
        borderColor: chartColors.primary,
        backgroundColor: `${chartColors.primary}20`,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: chartColors.primary,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  },
  options: {
    ...baseChartOptions,
    plugins: {
      ...baseChartOptions.plugins,
      title: {
        display: true,
        text: 'Quiz Performance by Category',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: 20,
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          callback: function(value) {
            return value + '%';
          },
        },
        grid: {
          color: chartColors.light,
        },
        angleLines: {
          color: chartColors.light,
        },
      },
    },
  } as ChartOptions<'radar'>,
});

// Utility function to apply dark theme
export const applyDarkTheme = (config: ChartConfiguration): ChartConfiguration => {
  const darkConfig = JSON.parse(JSON.stringify(config));
  
  if (darkConfig.options?.scales?.x?.grid) {
    darkConfig.options.scales.x.grid.color = chartThemes.dark.gridColor;
  }
  if (darkConfig.options?.scales?.y?.grid) {
    darkConfig.options.scales.y.grid.color = chartThemes.dark.gridColor;
  }
  if (darkConfig.options?.plugins?.legend?.labels) {
    darkConfig.options.plugins.legend.labels.color = chartThemes.dark.textColor;
  }
  
  return darkConfig;
};

// Default export with all configurations
export const chartConfigs = {
  progress: progressChartConfig,
  subjectPerformance: subjectPerformanceConfig,
  streak: streakChartConfig,
  skillsDistribution: skillsDistributionConfig,
  xpProgress: xpProgressConfig,
  quizPerformance: quizPerformanceConfig,
  colors: chartColors,
  themes: chartThemes,
  baseOptions: baseChartOptions,
  applyDarkTheme,
};

export default chartConfigs;
