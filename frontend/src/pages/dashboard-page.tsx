import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../components/ui/card';

const trendData = [
  { month: 'Jan', claims: 22 },
  { month: 'Feb', claims: 28 },
  { month: 'Mar', claims: 31 },
  { month: 'Apr', claims: 25 },
  { month: 'May', claims: 34 },
  { month: 'Jun', claims: 29 }
];

const partData = [
  { name: 'Turbocharger', value: 35 },
  { name: 'Bearing', value: 22 },
  { name: 'Brake Disc', value: 19 },
  { name: 'Other', value: 24 }
];

export const DashboardPage = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total Claims', 450],
          ['Open Claims', 96],
          ['Closed Claims', 318],
          ['Rejected Claims', 36]
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="h-80">
          <h3 className="mb-3 font-semibold">Monthly Trends</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="claims" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="h-80">
          <h3 className="mb-3 font-semibold">Failure Frequency by Part</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={partData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#2563eb" />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h3 className="mb-2 font-semibold">Warranty Cost Analysis</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">Estimated total cost: $157,500 | Average cost per claim: $350</p>
      </Card>
    </div>
  );
};
