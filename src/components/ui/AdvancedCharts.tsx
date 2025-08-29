import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { BarChart3, LineChart, TrendingUp, TrendingDown } from 'lucide-react';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface HistogramProps {
  title: string;
  data: ChartDataPoint[];
  maxValue?: number;
  height?: number;
  showValues?: boolean;
}

interface LineChartProps {
  title: string;
  data: Array<{
    period: string;
    values: { [key: string]: number };
  }>;
  series: Array<{
    key: string;
    label: string;
    color: string;
  }>;
  height?: number;
}

export function AdvancedHistogram({ 
  title, 
  data, 
  maxValue, 
  height = 200, 
  showValues = true 
}: HistogramProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));
  
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium truncate flex-1 pr-2">{item.label}</span>
                {showValues && (
                  <Badge variant="secondary" className="text-xs">
                    {item.value}
                  </Badge>
                )}
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${Math.min((item.value / max) * 100, 100)}%`,
                    backgroundColor: item.color || '#3B82F6'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AdvancedLineChart({ 
  title, 
  data, 
  series, 
  height = 200 
}: LineChartProps) {
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    data: any;
    period: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    data: {},
    period: ''
  });

  const maxValue = Math.max(
    ...data.flatMap(d => Object.values(d.values))
  );
  
  const minValue = Math.min(
    ...data.flatMap(d => Object.values(d.values))
  );
  
  const range = maxValue - minValue;
  
  const handleMouseEnter = (e: React.MouseEvent<SVGCircleElement>, d: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cardElement = e.currentTarget.closest('.shadow-soft');
    
    if (cardElement) {
      const cardRect = cardElement.getBoundingClientRect();
      setTooltip({
        visible: true,
        x: rect.left - cardRect.left + rect.width / 2,
        y: rect.top - cardRect.top - 10,
        data: d.values,
        period: d.period
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };
  
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <LineChart className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Légende */}
          <div className="flex flex-wrap gap-3 text-xs">
            {series.map((serie) => (
              <div key={serie.key} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: serie.color }}
                />
                <span>{serie.label}</span>
              </div>
            ))}
          </div>
          
          {/* Graphique */}
          <div className="relative" style={{ height }}>
            {/* Grille de fond */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border-t border-gray-200" />
              ))}
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border-l border-gray-200" />
              ))}
            </div>
            
            {/* Lignes de données */}
            {series.map((serie) => (
              <svg
                key={serie.key}
                className="absolute inset-0 w-full h-full"
                style={{ height }}
              >
                <polyline
                  fill="none"
                  stroke={serie.color}
                  strokeWidth="2"
                  points={data.map((d, i) => {
                    const x = (i / (data.length - 1)) * 100;
                    const y = range > 0 
                      ? 100 - ((d.values[serie.key] - minValue) / range) * 100
                      : 50;
                    return `${x},${y}`;
                  }).join(' ')}
                />
                {/* Points sur la ligne */}
                {data.map((d, i) => {
                  const x = (i / (data.length - 1)) * 100;
                  const y = range > 0 
                    ? 100 - ((d.values[serie.key] - minValue) / range) * 100
                    : 50;
                  return (
                    <circle
                      key={`${serie.key}-${i}`}
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="3"
                      fill={serie.color}
                      className="transition-all duration-200 hover:r-4 cursor-pointer"
                      onMouseEnter={(e) => handleMouseEnter(e, d)}
                      onMouseLeave={handleMouseLeave}
                      style={{ pointerEvents: 'all' }}
                    />
                  );
                })}
              </svg>
            ))}
            
            {/* Tooltip */}
            {tooltip.visible && (
              <div 
                className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 text-xs pointer-events-none"
                style={{
                  left: tooltip.x - 75,
                  top: tooltip.y - 80,
                  minWidth: '150px',
                  transform: 'translateY(-100%)'
                }}
              >
                <div className="font-semibold text-center mb-2 text-gray-900 dark:text-gray-100">
                  {tooltip.period}
                </div>
                <div className="space-y-1">
                  {series.map((serie) => (
                    <div key={serie.key} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: serie.color }}
                        />
                        <span className="text-gray-600 dark:text-gray-400">{serie.label}</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {tooltip.data[serie.key] || 0}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Flèche du tooltip */}
                <div 
                  className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200 dark:border-t-gray-700"
                />
              </div>
            )}
            
            {/* Labels des axes */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-muted-foreground">
              {data.map((d, i) => (
                <span key={i} className="text-center">
                  {d.period}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = "blue" 
}: {
  title: string;
  value: string | number;
  change?: { value: number; type: 'increase' | 'decrease' };
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600'
  };
  
  return (
    <Card className="shadow-soft hover:shadow-medium transition-all">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${colorClasses[color]} flex-shrink-0`} />
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl font-bold text-foreground">
          {value}
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            change.type === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {change.type === 'increase' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {change.value > 0 ? '+' : ''}{change.value}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StatusDistributionChart({ 
  data 
}: { 
  data: Array<{ status: string; count: number; percentage: number; color: string }> 
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Répartition par Statut</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{item.status}</span>
                  <span className="text-muted-foreground">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="pt-2 text-xs text-muted-foreground text-center">
            Total: {total} candidatures
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ApplicationsPerJobChart({ 
  data 
}: { 
  data: Array<{ title: string; applications_count: number; new_applications_24h: number }> 
}) {
  // Couleurs différentes pour ce graphique
  const colors = ['#8B5CF6', '#EC4899', '#F97316', '#06B6D4', '#84CC16', '#F59E0B', '#EF4444', '#10B981'];
  
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Dynamique des candidatures par offre</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.slice(0, 8).map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium truncate flex-1 pr-2" title={item.title}>
                  {item.title}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.applications_count} total
                  </Badge>
                  {item.new_applications_24h > 0 && (
                    <Badge variant="outline" className="text-xs text-green-600">
                      +{item.new_applications_24h} 24h
                    </Badge>
                  )}
                </div>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${Math.min((item.applications_count / Math.max(...data.map(d => d.applications_count))) * 100, 100)}%`,
                    backgroundColor: colors[index % colors.length]
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
