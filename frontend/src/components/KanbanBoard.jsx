import { useState } from 'react'
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format, parseISO, isPast } from 'date-fns'
import { Pencil, Trash2, GripVertical } from 'lucide-react'
import { PriorityBadge } from './ui/Badge'

const COLUMNS = [
  { id: 'PENDING', label: 'Pending', color: 'bg-amber-500' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-sky-500' },
  { id: 'COMPLETED', label: 'Completed', color: 'bg-emerald-500' },
]

function TaskCard({ task, isAdmin, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  }

  const overdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'COMPLETED'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-[1.35rem] border border-white/18 bg-white/28 dark:bg-white/6 backdrop-blur-md p-3.5 shadow-sm hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] cursor-grab active:cursor-grabbing flex-shrink-0"
        >
          <GripVertical size={14} />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[color:var(--text-main)] leading-snug">{task.title}</p>
          {task.description && (
            <p className="text-xs text-[color:var(--text-muted)] mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="flex flex-wrap gap-1.5 mt-2.5">
            <PriorityBadge priority={task.priority} />
            {task.assignedTo && (
              <span className="badge bg-white/25 text-[color:var(--text-main)]">{task.assignedTo.name}</span>
            )}
          </div>

          {task.dueDate && (
            <p className={`text-xs mt-2 ${overdue ? 'text-rose-500 font-medium' : 'text-[color:var(--text-muted)]'}`}>
              {overdue ? '⚠ Overdue · ' : '📅 '}{format(parseISO(task.dueDate), 'MMM d')}
            </p>
          )}
        </div>

        {isAdmin && (
          <div className="flex flex-col gap-1 flex-shrink-0">
            <button onClick={() => onEdit(task)} className="text-[color:var(--text-muted)] hover:text-brand-500 transition-colors">
              <Pencil size={12} />
            </button>
            <button onClick={() => onDelete(task)} className="text-[color:var(--text-muted)] hover:text-rose-500 transition-colors">
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Column({ column, tasks, isAdmin, onEdit, onDelete }) {
  return (
    <div className="flex flex-col flex-1 min-w-[240px] max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
        <h4 className="font-semibold text-sm text-[color:var(--text-main)]">{column.label}</h4>
        <span className="ml-auto text-xs font-medium bg-white/25 text-[color:var(--text-muted)] px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 min-h-[200px] space-y-2.5 p-2 rounded-[1.35rem] bg-white/18 dark:bg-white/4 border border-dashed border-white/18">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} isAdmin={isAdmin} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <p className="text-center text-xs text-[color:var(--text-muted)] py-8">Drop tasks here</p>
        )}
      </div>
    </div>
  )
}

export default function KanbanBoard({ tasks, isAdmin, onStatusChange, onEdit, onDelete }) {
  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status)

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find((t) => t.id === active.id))
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null)
    if (!over) return

    const overTask = tasks.find((t) => t.id === over.id)
    const overColumn = COLUMNS.find((c) => c.id === over.id)
    const newStatus = overTask?.status || overColumn?.id

    if (newStatus && newStatus !== activeTask?.status) {
      onStatusChange(active.id, newStatus)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <Column
            key={col.id}
            column={col}
            tasks={getTasksByStatus(col.id)}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="w-64 rounded-[1.35rem] border border-white/18 bg-white/40 dark:bg-white/8 backdrop-blur-md p-3.5 shadow-xl rotate-2">
            <p className="text-sm font-semibold text-[color:var(--text-main)]">{activeTask.title}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
