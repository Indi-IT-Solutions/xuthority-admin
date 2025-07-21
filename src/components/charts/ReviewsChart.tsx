import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';

const weeklyData = [
  { name: 'Mon', Published: 500, Pending: 1300, Disputed: 200 },
  { name: 'Tue', Published: 1100, Pending: 2000, Disputed: 300 },
  { name: 'Wed', Published: 900, Pending: 1800, Disputed: 400 },
  { name: 'Thu', Published: 600, Pending: 2100, Disputed: 350 },
  { name: 'Fri', Published: 1200, Pending: 1200, Disputed: 200 },
  { name: 'Sat', Published: 750, Pending: 1500, Disputed: 250 },
  { name: 'Sun', Published: 1800, Pending: 2200, Disputed: 600 },
];

const monthlyData = [
  { name: 'Mon', Published: 3500, Pending: 8300, Disputed: 1200 },
  { name: 'Tue', Published: 4100, Pending: 12000, Disputed: 1800 },
  { name: 'Wed', Published: 3900, Pending: 11800, Disputed: 2400 },
  { name: 'Thu', Published: 3600, Pending: 13100, Disputed: 2350 },
  { name: 'Fri', Published: 5200, Pending: 9200, Disputed: 1200 },
  { name: 'Sat', Published: 4750, Pending: 10500, Disputed: 1750 },
  { name: 'Sun', Published: 7800, Pending: 15200, Disputed: 4600 },
];

const yearlyData = [
  { name: 'Mon', Published: 35000, Pending: 83000, Disputed: 12000 },
  { name: 'Tue', Published: 41000, Pending: 120000, Disputed: 18000 },
  { name: 'Wed', Published: 39000, Pending: 118000, Disputed: 24000 },
  { name: 'Thu', Published: 36000, Pending: 131000, Disputed: 23500 },
  { name: 'Fri', Published: 52000, Pending: 92000, Disputed: 12000 },
  { name: 'Sat', Published: 47500, Pending: 105000, Disputed: 17500 },
  { name: 'Sun', Published: 78000, Pending: 152000, Disputed: 46000 },
];

interface ReviewsChartProps {
  activeFilter: 'Weekly' | 'Monthly' | 'Yearly';
}

const ReviewsChart = ({ activeFilter }: ReviewsChartProps) => {
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
      case 'Weekly': return 2500;
      case 'Monthly': return 20000;
      case 'Yearly': return 200000;
      default: return 2500;
    }
  };

  const data = getData();
  const maxValue = getMaxValue();

  const CustomLegend = () => (
    <div className="flex items-center justify-center space-x-4 md:space-x-6 mt-3 md:mt-4">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="text-xs md:text-sm text-gray-600">Published</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <span className="text-xs md:text-sm text-gray-600">Pending</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <span className="text-xs md:text-sm text-gray-600">Disputed</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900">Reviews</h3>
      </div>

      {/* Chart */}
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
            <Bar 
              dataKey="Published" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]}
              maxBarSize={16}
            />
            <Bar 
              dataKey="Pending" 
              fill="#f59e0b" 
              radius={[4, 4, 0, 0]}
              maxBarSize={16}
            />
            <Bar 
              dataKey="Disputed" 
              fill="#ef4444" 
              radius={[4, 4, 0, 0]}
              maxBarSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <CustomLegend />
    </div>
  );
};

export default ReviewsChart; 