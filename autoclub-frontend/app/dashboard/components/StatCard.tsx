interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  color?: string; // ✅ Agregamos esta línea para aceptar el color
}

export default function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold text-zinc-900 mt-2">{value}</h3>
        </div>
        
        {/* Usamos el color si existe, si no, usamos el índigo por defecto */}
        <div className={`p-3 rounded-xl ${color ? `${color} text-white` : 'bg-indigo-50 text-indigo-600'}`}>
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