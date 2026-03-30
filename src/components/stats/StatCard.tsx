import { Card } from '@/components/ui/card';

export interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

export function StatCard({
  icon,
  title,
  value,
  bgColor,
  borderColor,
  textColor,
}: StatCardProps) {
  return (
    <Card className={`border-2 ${borderColor} ${bgColor} p-6 flex flex-col`}>
      <div className={`${textColor} mb-4`}>{icon}</div>
      <p className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">
        {title}
      </p>
      <p className={`text-4xl md:text-5xl font-black ${textColor}`}>
        {value}
      </p>
    </Card>
  );
}
