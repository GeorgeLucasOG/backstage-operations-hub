
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

const stats = [
  {
    title: 'Total Users',
    value: '2,543',
    change: '+12%',
    changeType: 'positive' as const,
    icon: Users,
  },
  {
    title: 'Revenue',
    value: '$45,231',
    change: '+8%',
    changeType: 'positive' as const,
    icon: DollarSign,
  },
  {
    title: 'Active Sessions',
    value: '312',
    change: '-3%',
    changeType: 'negative' as const,
    icon: Activity,
  },
  {
    title: 'Growth Rate',
    value: '24.5%',
    change: '+5%',
    changeType: 'positive' as const,
    icon: TrendingUp,
  },
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <stat.icon className="h-6 w-6 text-primary" />
            </div>
            <span className={`text-sm font-medium ${
              stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
          <p className="text-muted-foreground text-sm">{stat.title}</p>
        </div>
      ))}
    </div>
  );
}
