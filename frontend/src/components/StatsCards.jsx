import { 
  UsersIcon, 
  ClockIcon, 
  CheckCircleIcon,
  CalendarDaysIcon 
} from '@heroicons/react/24/outline'

function StatsCards({ stats }) {
  const statItems = [
    {
      name: 'Total Students',
      value: stats.totalStudents,
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Pending Appointments',
      value: stats.pendingAppointments,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      name: 'Completed Sessions',
      value: stats.completedAppointments,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: "Today's Appointments",
      value: stats.todayAppointments,
      icon: CalendarDaysIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item) => (
        <div key={item.name} className="card">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${item.bgColor}`}>
              <item.icon className={`h-6 w-6 ${item.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{item.name}</p>
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards
