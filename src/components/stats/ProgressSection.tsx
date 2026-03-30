import { Card } from '@/components/ui/card';

export interface ProgressSectionProps {
  completionRate: number;
}

export function ProgressSection({ completionRate }: ProgressSectionProps) {
  const isProgressVisible = completionRate > 10;

  return (
    <Card className="border-2 border-black p-8">
      <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
        <div className="w-2 h-2 bg-black"></div>
        PROGRESS
      </h2>

      <div className="space-y-4">
        <div className="h-12 border-2 border-black bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-black transition-all duration-500 ease-out flex items-center justify-center"
            style={{ width: `${completionRate}%` }}
          >
            {isProgressVisible && (
              <span className="text-white font-black text-sm">
                {completionRate}%
              </span>
            )}
          </div>
        </div>
        {!isProgressVisible && (
          <div className="text-center text-gray-600 font-medium">
            {completionRate}% Complete
          </div>
        )}
      </div>
    </Card>
  );
}
