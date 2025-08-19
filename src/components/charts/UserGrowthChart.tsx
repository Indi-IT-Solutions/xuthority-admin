import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Fallback data for when API data is not available
const fallbackData = [
  { name: 'No Data', value: 0 },
];

interface UserGrowthData {
  period: string;
  users: number;
  vendors: number;
}

interface UserGrowthChartProps {
  activeFilter: 'Weekly' | 'Monthly' | 'Yearly';
  data?: UserGrowthData[];
}

const UserGrowthChart = ({ activeFilter, data }: UserGrowthChartProps) => {
  const formatChartData = () => {
    if (!data || data.length === 0) {
      return fallbackData;
    }

    return data.map((item) => ({
      name: formatPeriodLabel(item.period, activeFilter),
      value: item.users + item.vendors, // Total users + vendors
      users: item.users,
      vendors: item.vendors
    }));
  };

  const formatPeriodLabel = (period: string, filter: 'Weekly' | 'Monthly' | 'Yearly') => {
    try {
      let date: Date;
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
    
    const maxValue = Math.max(...chartData.map(item => item.value));
    return Math.ceil(maxValue * 1.2); // Add 20% padding
  };

  const chartData = formatChartData();
  const maxValue = getMaxValue();

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900  ">{label}</p>
          <hr className='my-2'/>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">
              <span className="font-medium">Total Growth: </span>
              {payload[0].value?.toLocaleString()}
            </p>
            {data.users !== undefined && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Users: </span>
                {data.users?.toLocaleString()}
              </p>
            )}
            {data.vendors !== undefined && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Vendors: </span>
                {data.vendors?.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900">User Growth</h3>
      </div>

      {/* Chart */}
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
            <Tooltip content={<CustomTooltip />} />
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