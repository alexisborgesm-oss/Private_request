"use client";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function CalendarClient({ events }: { events: any[] }) {
  return (
    <div className="w-full">
      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        height="auto"
        headerToolbar={{ left: "prev,next today", center: "title", right: "timeGridWeek,dayGridMonth" }}
        events={events}
      />
    </div>
  );
}
