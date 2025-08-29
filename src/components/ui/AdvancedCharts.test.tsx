import React from 'react';
import { render, screen } from '@testing-library/react';
import { AdvancedHistogram, AdvancedLineChart, MetricCard, StatusDistributionChart } from './AdvancedCharts';

// Données de test
const mockHistogramData = [
  { label: 'Développeur Full Stack', value: 25, color: '#3B82F6' },
  { label: 'Product Manager', value: 18, color: '#10B981' },
  { label: 'Designer UX/UI', value: 12, color: '#F59E0B' }
];

const mockLineChartData = [
  { period: 'Jan', values: { applied: 10, interview: 5, offer: 2, rejected: 3 } },
  { period: 'Fév', values: { applied: 15, interview: 8, offer: 3, rejected: 4 } },
  { period: 'Mar', values: { applied: 20, interview: 12, offer: 5, rejected: 6 } }
];

const mockLineChartSeries = [
  { key: 'applied', label: 'Applied', color: '#3B82F6' },
  { key: 'interview', label: 'Interview', color: '#10B981' },
  { key: 'offer', label: 'Offer', color: '#F59E0B' },
  { key: 'rejected', label: 'Rejected', color: '#EF4444' }
];

const mockStatusData = [
  { status: 'Candidatures', count: 45, percentage: 60, color: '#3B82F6' },
  { status: 'Entretiens', count: 25, percentage: 33, color: '#10B981' },
  { status: 'Offres', count: 5, percentage: 7, color: '#F59E0B' }
];

describe('AdvancedCharts Components', () => {
  describe('AdvancedHistogram', () => {
    it('renders histogram with correct title and data', () => {
      render(
        <AdvancedHistogram
          title="Test Histogram"
          data={mockHistogramData}
        />
      );

      expect(screen.getByText('Test Histogram')).toBeInTheDocument();
      expect(screen.getByText('Développeur Full Stack')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('renders all data points', () => {
      render(
        <AdvancedHistogram
          title="Test Histogram"
          data={mockHistogramData}
        />
      );

      mockHistogramData.forEach(item => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
        expect(screen.getByText(item.value.toString())).toBeInTheDocument();
      });
    });
  });

  describe('AdvancedLineChart', () => {
    it('renders line chart with correct title', () => {
      render(
        <AdvancedLineChart
          title="Test Line Chart"
          data={mockLineChartData}
          series={mockLineChartSeries}
        />
      );

      expect(screen.getByText('Test Line Chart')).toBeInTheDocument();
    });

    it('renders all series in legend', () => {
      render(
        <AdvancedLineChart
          title="Test Line Chart"
          data={mockLineChartData}
          series={mockLineChartSeries}
        />
      );

      mockLineChartSeries.forEach(series => {
        expect(screen.getByText(series.label)).toBeInTheDocument();
      });
    });

    it('renders all periods on x-axis', () => {
      render(
        <AdvancedLineChart
          title="Test Line Chart"
          data={mockLineChartData}
          series={mockLineChartSeries}
        />
      );

      mockLineChartData.forEach(data => {
        expect(screen.getByText(data.period)).toBeInTheDocument();
      });
    });
  });

  describe('MetricCard', () => {
    it('renders metric card with title and value', () => {
      const MockIcon = () => <div data-testid="mock-icon">Icon</div>;
      
      render(
        <MetricCard
          title="Test Metric"
          value={42}
          icon={MockIcon}
          color="blue"
        />
      );

      expect(screen.getByText('Test Metric')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    it('renders change indicator when provided', () => {
      const MockIcon = () => <div data-testid="mock-icon">Icon</div>;
      
      render(
        <MetricCard
          title="Test Metric"
          value={42}
          change={{ value: 15, type: 'increase' }}
          icon={MockIcon}
          color="blue"
        />
      );

      expect(screen.getByText('+15%')).toBeInTheDocument();
    });
  });

  describe('StatusDistributionChart', () => {
    it('renders status distribution chart with correct title', () => {
      render(
        <StatusDistributionChart data={mockStatusData} />
      );

      expect(screen.getByText('Répartition par Statut')).toBeInTheDocument();
    });

    it('renders all status items', () => {
      render(
        <StatusDistributionChart data={mockStatusData} />
      );

      mockStatusData.forEach(item => {
        expect(screen.getByText(item.status)).toBeInTheDocument();
        expect(screen.getByText(`${item.count} (${item.percentage}%)`)).toBeInTheDocument();
      });
    });

    it('renders total count', () => {
      render(
        <StatusDistributionChart data={mockStatusData} />
      );

      const total = mockStatusData.reduce((sum, item) => sum + item.count, 0);
      expect(screen.getByText(`Total: ${total} candidatures`)).toBeInTheDocument();
    });
  });
});
