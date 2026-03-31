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
      setSchedules((prev) => {
        // Update if date exists, else add
        const idx = prev.findIndex((item) => item.date.toDateString() === selectedDate.toDateString());
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = { date: selectedDate, note: schedule };
          return updated;
        }
        return [...prev, { date: selectedDate, note: schedule }];
      });
      setSchedule("");
    }
  };

  return (
    <Dialog>
      <div className="flex flex-col justify-between h-full min-h-[160px]">
        <div className="flex flex-col items-center justify-center flex-1 py-2">
          <span className="font-bold text-lg mb-2">Today's Schedule</span>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="mt-1">Open Calendar</Button>
          </DialogTrigger>
        </div>
        <DialogContent className="max-w-md w-full">
          <DialogTitle className="mb-2">Schedule for Today</DialogTitle>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="mb-4 mx-auto"
          />
          <input
            type="text"
            placeholder="Add note or update schedule"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            className="border p-2 rounded w-full mb-2"
          />
          <Button onClick={handleAddSchedule} disabled={!selectedDate || !schedule} className="w-full mb-2">
            Add/Update
          </Button>
          <div className="mt-2">
            <h3 className="font-semibold mb-2 text-base">Scheduled Items</h3>
            <ul className="max-h-32 overflow-y-auto">
              {schedules.length === 0 && <li className="text-xs text-muted-foreground">No schedules yet.</li>}
              {schedules.map((item, idx) => (
                <li key={idx} className="mb-1 text-sm">
                  <span className="font-mono text-xs">{item.date.toDateString()}:</span> {item.note}
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
}
