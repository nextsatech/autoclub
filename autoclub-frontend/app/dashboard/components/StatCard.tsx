interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
}

export default function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold text-zinc-900 mt-2">{value}</h3>
        </div>
        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
          <i className={`bi ${icon} text-xl`}></i>
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-medium">
            {trend}
          </span>
          <span className="text-zinc-400">vs mes anterior</span>
        </div>
      )}
    </div>
  );
}