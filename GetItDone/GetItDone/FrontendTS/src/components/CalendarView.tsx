import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useEffect, useState } from 'react'

export default function CalendarView({ events, onEventClick }: { events?: any[]; onEventClick?: (e: any) => void }) {
  const [ev, setEv] = useState<any[]>(events ?? [])

  useEffect(() => {
    if (events) setEv(events)
  }, [events])

  return (
    <div className="card">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        events={ev}
        eventClassNames={(arg) => {
          const status = (arg.event.extendedProps as any)?.status as string
          if (status === 'CANCELLED' || status === 'REJECTED') return ['!bg-gray-800', '!border-gray-800', '!text-white']
          if (status === 'COMPLETED') return ['!bg-green-600', '!border-green-600', '!text-white']
          if (status === 'PENDING') return ['!bg-red-500', '!border-red-500', '!text-white']
          if (status === 'CONFIRMED' || status === 'ACCEPTED') return ['!bg-red-600', '!border-red-600', '!text-white']
          return []
        }}
        eventClick={(info) => onEventClick && onEventClick(info)}
      />
    </div>
  )
}
