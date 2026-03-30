import { useEffect, useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TrendingUp, CheckCircle2, AlertTriangle, ListTodo } from 'lucide-react';
import { TaskStats, EfficiencyMetrics, TrendAnalysis } from '@/types/statistics';
import {
  calculateTaskStats,
  calculateEfficiencyMetrics,
  calculateTrendAnalysis,
} from '@/lib/statisticsHelpers';
import { StatCard } from '@/components/stats/StatCard';
import { TaskBreakdown } from '@/components/stats/TaskBreakdown';
import { EfficiencySection } from '@/components/stats/EfficiencySection';
import { TrendSection } from '@/components/stats/TrendSection';

export default function StatisticsPage() {
  const tasks = useTaskStore((state) => state.tasks);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    overdue: 0,
    completionRate: 0,
  });
  const [efficiency, setEfficiency] = useState<EfficiencyMetrics>({
    leadTime: 0,
    velocity: 0,
    peakProductivityDay: 'N/A',
    peakProductivityCount: 0,
  });
  const [trend, setTrend] = useState<TrendAnalysis>({
    burndownData: [],
    completionTrendData: [],
  });

  useEffect(() => {
    setStats(calculateTaskStats(tasks));
    setEfficiency(calculateEfficiencyMetrics(tasks));
    setTrend(calculateTrendAnalysis(tasks));
  }, [tasks]);

  return (
    <main className="min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="border-2 border-black bg-white p-8">
          <div className="flex items-center gap-4 mb-4">
            <TrendingUp className="w-8 h-8 stroke-[2.5]" />
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              STATISTICS
            </h1>
          </div>
          <p className="text-lg text-gray-700 font-medium">
            Task overview and performance metrics
          </p>
        </div>

        {/* Desktop View - Full Layout */}
        <div className="hidden md:block space-y-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<ListTodo className="w-6 h-6 stroke-[2.5]" />}
              title="Total Tasks"
              value={stats.total}
              bgColor="bg-blue-100"
              borderColor="border-blue-900"
              textColor="text-blue-900"
            />

            <StatCard
              icon={<CheckCircle2 className="w-6 h-6 stroke-[2.5]" />}
              title="Completed"
              value={stats.completed}
              bgColor="bg-green-100"
              borderColor="border-green-900"
              textColor="text-green-900"
            />

            <StatCard
              icon={<AlertTriangle className="w-6 h-6 stroke-[2.5]" />}
              title="Overdue"
              value={stats.overdue}
              bgColor="bg-red-100"
              borderColor="border-red-900"
              textColor="text-red-900"
            />

            <StatCard
              icon={<TrendingUp className="w-6 h-6 stroke-[2.5]" />}
              title="Completion"
              value={`${stats.completionRate}%`}
              bgColor="bg-purple-100"
              borderColor="border-purple-900"
              textColor="text-purple-900"
            />
          </div>

          {/* Task Breakdown */}
          <Card className="border-2 border-black p-8">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
              <div className="w-2 h-2 bg-black"></div>
              TASK BREAKDOWN
            </h2>

            <TaskBreakdown tasks={tasks} />
          </Card>

          {/* Efficiency Metrics */}
          {stats.total > 0 && <EfficiencySection metrics={efficiency} />}

          {/* Trend Analysis */}
          {stats.total > 0 && <TrendSection data={trend} />}
        </div>

        {/* Mobile View - Tabbed Layout */}
        <div className="md:hidden">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 border-2 border-black bg-white mb-6">
              <TabsTrigger value="overview" className="text-xs font-bold">
                Overview
              </TabsTrigger>
              <TabsTrigger value="breakdown" className="text-xs font-bold">
                Breakdown
              </TabsTrigger>
              <TabsTrigger value="efficiency" className="text-xs font-bold">
                Efficiency
              </TabsTrigger>
              <TabsTrigger value="trend" className="text-xs font-bold">
                Trend
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  icon={<ListTodo className="w-6 h-6 stroke-[2.5]" />}
                  title="Total Tasks"
                  value={stats.total}
                  bgColor="bg-blue-100"
                  borderColor="border-blue-900"
                  textColor="text-blue-900"
                />

                <StatCard
                  icon={<CheckCircle2 className="w-6 h-6 stroke-[2.5]" />}
                  title="Completed"
                  value={stats.completed}
                  bgColor="bg-green-100"
                  borderColor="border-green-900"
                  textColor="text-green-900"
                />

                <StatCard
                  icon={<AlertTriangle className="w-6 h-6 stroke-[2.5]" />}
                  title="Overdue"
                  value={stats.overdue}
                  bgColor="bg-red-100"
                  borderColor="border-red-900"
                  textColor="text-red-900"
                />

                <StatCard
                  icon={<TrendingUp className="w-6 h-6 stroke-[2.5]" />}
                  title="Completion"
                  value={`${stats.completionRate}%`}
                  bgColor="bg-purple-100"
                  borderColor="border-purple-900"
                  textColor="text-purple-900"
                />
              </div>
            </TabsContent>

            {/* Breakdown Tab */}
            <TabsContent value="breakdown" className="space-y-6">
              <Card className="border-2 border-black p-8">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                  <div className="w-2 h-2 bg-black"></div>
                  TASK BREAKDOWN
                </h2>

                <TaskBreakdown tasks={tasks} />
              </Card>
            </TabsContent>

            {/* Efficiency Tab */}
            <TabsContent value="efficiency" className="space-y-6">
              {stats.total > 0 ? (
                <EfficiencySection metrics={efficiency} />
              ) : (
                <Card className="border-2 border-black p-8 text-center">
                  <p className="text-gray-600 font-medium">
                    Complete tasks to see efficiency metrics
                  </p>
                </Card>
              )}
            </TabsContent>

            {/* Trend Tab */}
            <TabsContent value="trend" className="space-y-6">
              {stats.total > 0 ? (
                <TrendSection data={trend} />
              ) : (
                <Card className="border-2 border-black p-8 text-center">
                  <p className="text-gray-600 font-medium">
                    Create tasks to see trend analysis
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
