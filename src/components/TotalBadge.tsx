interface TotalBadgeProps {
  label?: string
  value: string
}

const TotalBadge = ({ label = 'Total', value }: TotalBadgeProps) => (
  <div className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm whitespace-nowrap">
    <span className="text-gray-500">{label}: </span>
    <span className="font-semibold text-gray-900">{value}</span>
  </div>
)

export default TotalBadge
