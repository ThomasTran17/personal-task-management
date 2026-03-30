export interface TaskBreakdownItemProps {
  label: string;
  count: number;
  borderColor: string;
  bgColor: string;
}

export function TaskBreakdownItem({
  label,
  count,
  borderColor,
  bgColor,
}: TaskBreakdownItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-6 border-2 ${borderColor} ${bgColor}`}
    >
      <span className="font-bold text-lg">{label}</span>
      <span className="text-3xl font-black">{count}</span>
    </div>
  );
}
