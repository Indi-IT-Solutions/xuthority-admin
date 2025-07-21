import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}

const StatsCard = ({ title, value, icon: Icon, iconColor, iconBgColor }: StatsCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-500 text-xs md:text-sm font-normal mb-2">
            {title}
          </h3>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 truncate">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${iconBgColor} flex-shrink-0 ml-3 md:ml-4`}>
          <Icon className={`w-5 h-5 md:w-6 md:h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard; 