
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const data = [
  { name: 'Jan', users: 400, revenue: 2400 },
  { name: 'Feb', users: 300, revenue: 1398 },
  { name: 'Mar', users: 600, revenue: 9800 },
  { name: 'Apr', users: 800, revenue: 3908 },
  { name: 'May', users: 700, revenue: 4800 },
  { name: 'Jun', users: 900, revenue: 3800 },
];

export function AnalyticsChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">User Growth</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
