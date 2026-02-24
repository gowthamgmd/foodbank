export default function StatCard({ title, value, subtitle, icon, color = 'green', trend }) {
    const colorMap = {
        green: 'from-green-50  to-green-100  border-green-200  text-green-700',
        blue: 'from-blue-50   to-blue-100   border-blue-200   text-blue-700',
        amber: 'from-amber-50  to-amber-100  border-amber-200  text-amber-700',
        red: 'from-red-50    to-red-100    border-red-200    text-red-700',
        purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700',
    };

    return (
        <div className={`card p-5 bg-gradient-to-br border ${colorMap[color]}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium opacity-70 mb-1">{title}</p>
                    <p className="text-3xl font-extrabold">{value}</p>
                    {subtitle && <p className="text-xs mt-1 opacity-60">{subtitle}</p>}
                    {trend !== undefined && (
                        <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
                        </p>
                    )}
                </div>
                {icon && (
                    <span className="text-3xl opacity-80">{icon}</span>
                )}
            </div>
        </div>
    );
}
