import { Card } from '@/components/ui/card';
import { EfficiencyMetrics } from '@/types/statistics';
import { Zap, TrendingUp, Calendar } from 'lucide-react';

export interface EfficiencySectionProps {
  metrics: EfficiencyMetrics;
}

/**
 * EfficiencySection displays key performance metrics including lead time,
 * velocity, and peak productivity day with Neubrutalism design
 */
export function EfficiencySection({ metrics }: EfficiencySectionProps) {
  return (
    <Card className="border-2 border-black p-8">
      <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
        <Zap className="w-6 h-6 stroke-[2.5]" />
        EFFICIENCY METRICS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lead Time */}
        <EfficiencyMetricCard
          icon={<Calendar className="w-6 h-6 stroke-[2.5]" />}
          label="Lead Time"
          value={`${metrics.leadTime}`}
          unit="days"
          borderColor="border-orange-300"
          bgColor="bg-orange-50"
          textColor="text-orange-900"
          description="Average time to complete"
        />

        {/* Velocity */}
        <EfficiencyMetricCard
          icon={<TrendingUp className="w-6 h-6 stroke-[2.5]" />}
          label="Velocity"
          value={`${metrics.velocity}`}
          unit="tasks/week"
          borderColor="border-cyan-300"
          bgColor="bg-cyan-50"
          textColor="text-cyan-900"
          description="Tasks completed per week"
        />

        {/* Peak Productivity Day */}
        <EfficiencyMetricCard
          icon={<Zap className="w-6 h-6 stroke-[2.5]" />}
          label="Peak Day"
          value={metrics.peakProductivityDay}
          unit={`${metrics.peakProductivityCount} tasks`}
          borderColor="border-amber-300"
          bgColor="bg-amber-50"
          textColor="text-amber-900"
          description="Most productive day"
        />
      </div>
    </Card>
  );
}

interface EfficiencyMetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  description: string;
}

/**
 * Individual efficiency metric card with Neubrutalism styling
 */
function EfficiencyMetricCard({
  icon,
  label,
  value,
  unit,
  borderColor,
  bgColor,
  textColor,
  description,
}: EfficiencyMetricCardProps) {
  return (
    <div className={`border-2 ${borderColor} ${bgColor} p-6 flex flex-col`}>
      <div className={`${textColor} mb-3`}>{icon}</div>
      <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
        {label}
      </p>
      <p className={`text-3xl md:text-4xl font-black ${textColor} mb-1`}>
        {value}
      </p>
      <p className="text-xs font-medium text-gray-600 mb-3">{unit}</p>
      <p className="text-xs text-gray-600 border-t-2 border-gray-300 pt-3">
        {description}
      </p>
    </div>
  );
}
