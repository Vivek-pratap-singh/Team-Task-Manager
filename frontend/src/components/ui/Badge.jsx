const STATUS_CLASSES = {
  PENDING:     'badge-pending',
  IN_PROGRESS: 'badge-in-progress',
  COMPLETED:   'badge-completed',
}

const PRIORITY_CLASSES = {
  LOW:    'badge-low',
  MEDIUM: 'badge-medium',
  HIGH:   'badge-high',
}

const STATUS_LABELS = {
  PENDING:     'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED:   'Completed',
}

export function StatusBadge({ status }) {
  return (
    <span className={STATUS_CLASSES[status] || 'badge bg-white/25 text-[color:var(--text-main)]'}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  return (
    <span className={PRIORITY_CLASSES[priority] || 'badge bg-white/25 text-[color:var(--text-main)]'}>
      {priority?.charAt(0) + priority?.slice(1).toLowerCase()}
    </span>
  )
}
