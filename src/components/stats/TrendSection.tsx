import { Card } from '@/components/ui/card';
import type { TrendAnalysis } from '@/types/statistics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingDown, BarChart3 } from 'lucide-react';

export interface TrendSectionProps {
  data: TrendAnalysis;
}

/**
 * TrendSection displays trend analysis with burn down chart and completion chart
 * Uses Recharts for visualization with Neubrutalism styling
 */
export function TrendSection({ data }: TrendSectionProps) {
  const _hasBurndownData = data.burndownData.length > 0;
  const hasCompletionData = data.completionTrendData.length > 0;

  return (
    <Card className="border-2 border-black p-8 space-y-8">
      <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
        <TrendingDown className="w-6 h-6 stroke-[2.5]" />
        TREND ANALYSIS
      </h2>

      {/* Burndown Chart */}
      {/* <div className="border-2 border-black p-6 bg-white">
        <h3 className="text-lg font-black mb-6 flex items-center gap-2">
          <div className="w-2 h-2 bg-black"></div>
          BURNDOWN CHART
        </h3>
        <p className="text-sm text-gray-600 mb-4 font-medium">
          Remaining tasks over time - downward trend means faster completion
        </p>

        {hasBurndownData ? (
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.burndownData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="remainingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#666" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                <YAxis stroke="#666" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #000',
                    borderRadius: '0',
                    padding: '8px',
                    fontWeight: 'bold',
                  }}
                  formatter={(value: any) => [`${value} tasks`, '']}
                  labelStyle={{ color: '#000', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="remaining"
                  stroke="#dc2626"
                  strokeWidth={2}
                  fill="url(#remainingGradient)"
                  name="Remaining"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="w-full h-80 flex items-center justify-center border-2 border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">Insufficient data for burndown chart</p>
          </div>
        )}
      </div> */}

      {/* 7-Day Completion Chart */}
      <div className="border-2 border-black p-6 bg-white">
        <h3 className="text-lg font-black mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 stroke-[2.5]" />
          7-DAY COMPLETION TREND
        </h3>
        <p className="text-sm text-gray-600 mb-4 font-medium">
          Tasks completed daily - see your productivity pattern
        </p>

        {hasCompletionData && data.completionTrendData.some((d) => d.completed > 0) ? (
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.completionTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#666" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                <YAxis stroke="#666" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #000',
                    borderRadius: '0',
                    padding: '8px',
                    fontWeight: 'bold',
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`${value} tasks`, 'Completed']}
                  labelStyle={{ color: '#000', fontWeight: 'bold' }}
                />
                <Bar
                  dataKey="completed"
                  fill="#16a34a"
                  stroke="#15803d"
                  strokeWidth={2}
                  radius={0}
                  name="Completed"
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="w-full h-80 flex items-center justify-center border-2 border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">Complete tasks to see completion trends</p>
          </div>
        )}
      </div>
    </Card>
  );
}
