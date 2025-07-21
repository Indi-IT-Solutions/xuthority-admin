import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';

const weeklyData = [
  { name: 'Mon', value: 110 },
  { name: 'Tue', value: 80 },
  { name: 'Wed', value: 85 },
  { name: 'Thu', value: 70 },
  { name: 'Fri', value: 170 },
  { name: 'Sat', value: 160 },
  { name: 'Sun', value: 250 },
];

const monthlyData = [
  { name: 'Mon', value: 1500 },
  { name: 'Tue', value: 1800 },
  { name: 'Wed', value: 1200 },
  { name: 'Thu', value: 1400 },
  { name: 'Fri', value: 2200 },
  { name: 'Sat', value: 2000 },
  { name: 'Sun', value: 2800 },
];

const yearlyData = [
  { name: 'Mon', value: 15000 },
  { name: 'Tue', value: 18000 },
  { name: 'Wed', value: 12000 },
  { name: 'Thu', value: 14000 },
  { name: 'Fri', value: 22000 },
  { name: 'Sat', value: 20000 },
  { name: 'Sun', value: 28000 },
];

interface UserGrowthChartProps {
  activeFilter: 'Weekly' | 'Monthly' | 'Yearly';
}

const UserGrowthChart = ({ activeFilter }: UserGrowthChartProps) => {
  const getData = () => {
    switch (activeFilter) {
      case 'Weekly': return weeklyData;
      case 'Monthly': return monthlyData;
      case 'Yearly': return yearlyData;
      default: return weeklyData;
    }
  };

  const getMaxValue = () => {
    switch (activeFilter) {
      case 'Weekly': return 250;
      case 'Monthly': return 3000;
      case 'Yearly': return 30000;
      default: return 250;
    }
  };

  const data = getData();
  const maxValue = getMaxValue();

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900">User Growth</h3>
      </div>

      {/* Chart */}
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="0" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              domain={[0, maxValue]}
              tickCount={6}
              width={40}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorGrowth)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UserGrowthChart; 