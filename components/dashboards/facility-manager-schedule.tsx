import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function FacilityManagerSchedule() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [schedule, setSchedule] = useState<string>("");
  const [schedules, setSchedules] = useState<{ date: Date; note: string }[]>([]);

  const handleAddSchedule = () => {
    if (selectedDate && schedule) {
      setSchedules([...schedules, { date: selectedDate, note: schedule }]);
      setSchedule("");
    }
  };

  return (
    <div className="p-6">
      <h2 className="font-bold text-xl mb-4">Today's Schedule</h2>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="accent">Open Calendar</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Schedule for Today</DialogTitle>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="mb-4"
          />
          <input
            type="text"
            placeholder="Add note or update schedule"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            className="border p-2 rounded w-full mb-2"
          />
          <Button onClick={handleAddSchedule} disabled={!selectedDate || !schedule}>
            Add/Update
          </Button>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Scheduled Items</h3>
            <ul>
              {schedules.map((item, idx) => (
                <li key={idx} className="mb-1">
                  <span className="font-mono text-xs">{item.date.toDateString()}:</span> {item.note}
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
