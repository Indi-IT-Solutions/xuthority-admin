import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Fallback data for when API data is not available
const fallbackData = [
  { name: 'No Data', Published: 0, Pending: 0, Disputed: 0 },
];

interface ReviewTrendsData {
  period: string;
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  dispute: number;
}

interface ReviewsChartProps {
  activeFilter: 'Weekly' | 'Monthly' | 'Yearly';
  data?: ReviewTrendsData[];
}

const ReviewsChart = ({ activeFilter, data }: ReviewsChartProps) => {
  const formatChartData = () => {
    if (!data || data.length === 0) {
      return fallbackData;
    }

    return data.map((item) => ({
      name: formatPeriodLabel(item.period, activeFilter),
      Published: item.approved, // Map approved to Published for UI consistency
      Pending: item.pending,
      Disputed: item.dispute, // Map dispute to Disputed for UI consistency
      Rejected: item.rejected
    }));
  };

  const formatPeriodLabel = (period: string, filter: 'Weekly' | 'Monthly' | 'Yearly') => {
    try {
      let date: Date;
      // Handle 'YYYY-MM-DD' and 'YYYY-MM' as local dates to avoid timezone shifts
      if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
        const [y, m, d] = period.split('-').map(Number);
        date = new Date(y, m - 1, d);
      } else if (/^\d{4}-\d{2}$/.test(period)) {
        const [y, m] = period.split('-').map(Number);
        date = new Date(y, m - 1, 1);
      } else if (/^\d{4}$/.test(period)) {
        date = new Date(Number(period), 0, 1);
      } else {
        date = new Date(period);
      }

      switch (filter) {
        case 'Weekly':
          return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        case 'Monthly':
          return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        case 'Yearly':
          return date.getFullYear().toString();
        default:
          return period;
      }
    } catch {
      return period;
    }
  };

  const getMaxValue = () => {
    const chartData = formatChartData();
    if (chartData.length === 0) return 100;
    
    const maxValue = Math.max(...chartData.map(item => 
      Math.max(item.Published, item.Pending, item.Disputed, item.Rejected || 0)
    ));
    return Math.ceil(maxValue * 1.2); // Add 20% padding
  };

  const chartData = formatChartData();
  const maxValue = getMaxValue();

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900  ">{label}</p>
          <hr className='my-2'/>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                <span className="font-medium">{entry.dataKey}: </span>
                {entry.value?.toLocaleString()}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

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
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
              tickFormatter={(value) => value.toLocaleString()}
              allowDecimals={false} 
            />
            <Tooltip content={<CustomTooltip />} />
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