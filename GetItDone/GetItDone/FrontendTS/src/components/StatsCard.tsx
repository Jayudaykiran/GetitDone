import { ReactNode } from 'react'

type StatsCardProps = {
  title: string
  value: number | string
  subtitle?: string
  icon?: ReactNode
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
}

export default function StatsCard({ title, value, subtitle, icon, color = 'blue' }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="card group hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]} group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}


