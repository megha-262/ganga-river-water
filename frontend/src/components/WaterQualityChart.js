import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const WaterQualityChart = ({ data = [], parameter = 'waterQualityIndex', title = 'Water Quality Index' }) => {
  const chartRef = useRef();

  // Process data for the chart
  const processChartData = () => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Sort data by timestamp
    const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Extract labels (dates) and values
    const labels = sortedData.map(item => {
      const date = new Date(item.timestamp);
      return date.toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric',
        hour: parameter === 'waterQualityIndex' ? undefined : '2-digit'
      });
    });

    let values, unit, color, backgroundColor;

    if (parameter === 'waterQualityIndex') {
      values = sortedData.map(item => item.waterQualityIndex);
      unit = '';
      color = 'rgb(59, 130, 246)';
      backgroundColor = 'rgba(59, 130, 246, 0.1)';
    } else {
      // Extract parameter values from nested parameters object
      values = sortedData.map(item => {
        const paramData = item.parameters?.[parameter];
        return paramData?.value || 0;
      });
      
      // Get unit from first available data point
      unit = sortedData.find(item => item.parameters?.[parameter])?.parameters?.[parameter]?.unit || '';
      
      // Set colors based on parameter type
      const parameterColors = {
        dissolvedOxygen: { color: 'rgb(16, 185, 129)', bg: 'rgba(16, 185, 129, 0.1)' },
        biochemicalOxygenDemand: { color: 'rgb(239, 68, 68)', bg: 'rgba(239, 68, 68, 0.1)' },
        ph: { color: 'rgb(168, 85, 247)', bg: 'rgba(168, 85, 247, 0.1)' },
        turbidity: { color: 'rgb(245, 158, 11)', bg: 'rgba(245, 158, 11, 0.1)' },
        nitrate: { color: 'rgb(34, 197, 94)', bg: 'rgba(34, 197, 94, 0.1)' },
        fecalColiform: { color: 'rgb(239, 68, 68)', bg: 'rgba(239, 68, 68, 0.1)' },
      };
      
      const colors = parameterColors[parameter] || { color: 'rgb(107, 114, 128)', bg: 'rgba(107, 114, 128, 0.1)' };
      color = colors.color;
      backgroundColor = colors.bg;
    }

    return {
      labels,
      datasets: [
        {
          label: `${title}${unit ? ` (${unit})` : ''}`,
          data: values,
          borderColor: color,
          backgroundColor: backgroundColor,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: color,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  const chartData = processChartData();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            const unit = context.dataset.label.match(/\(([^)]+)\)/)?.[1] || '';
            return `${context.dataset.label.split(' (')[0]}: ${value}${unit ? ' ' + unit : ''}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
          font: {
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: title,
          font: {
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        beginAtZero: parameter !== 'ph', // pH doesn't start at zero
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  if (chartData.labels.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>No data available</p>
            <p className="text-sm mt-1">Chart will appear when data is loaded</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="h-80">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default WaterQualityChart;