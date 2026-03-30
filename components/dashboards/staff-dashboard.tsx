"use client";
import { useState, useEffect } from "react";
import { User } from "@/lib/auth-context";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Task {
  id: string;
  description: string;
  type: string;
  status: "pending" | "completed";
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
}

interface Incident {
  id: string;
  description: string;
  date: string;
  reporter: string;
}

const demoTasks: Task[] = [
  { id: "1", description: "Clean lobby and common areas", type: "Cleaning", status: "pending" },
  { id: "2", description: "Check HVAC filters on floor 3", type: "Maintenance", status: "pending" },
  { id: "3", description: "Restock restroom supplies (all floors)", type: "Cleaning", status: "completed" },
];

const demoSchedule = [
  { day: "Monday", shift: "8:00 AM - 4:00 PM" },
  { day: "Tuesday", shift: "8:00 AM - 4:00 PM" },
  { day: "Wednesday", shift: "8:00 AM - 4:00 PM" },
  { day: "Thursday", shift: "8:00 AM - 4:00 PM" },
  { day: "Friday", shift: "8:00 AM - 4:00 PM" },
];

const demoAnnouncements: Announcement[] = [
  { id: "a1", title: "Fire Drill Scheduled", content: "Building-wide fire drill on March 25th at 10:00 AM.", date: "Today" },
  { id: "a2", title: "Pool Maintenance", content: "The pool will be closed March 20-22 for annual maintenance.", date: "Yesterday" },
];

export default function StaffDashboard({ user }: { user: User }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("buildsync_staff_tasks") || "null");
      return stored || demoTasks;
    }
    return demoTasks;
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => demoAnnouncements);
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    if (typeof window !== "undefined") {
      const storedIncidents = JSON.parse(localStorage.getItem("buildsync_staff_incidents") || "null");
      return storedIncidents || [];
    }
    return [];
  });
  const [incidentDesc, setIncidentDesc] = useState("");
  const [incidentStatus, setIncidentStatus] = useState("");

  // Removed useEffect for tasks/announcements/incidents initialization

  const handleComplete = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, status: "completed" } : t);
    setTasks(updated);
    localStorage.setItem("buildsync_staff_tasks", JSON.stringify(updated));
  };

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentDesc.trim()) return;
    const newIncident: Incident = {
      id: crypto.randomUUID(),
      description: incidentDesc,
      date: new Date().toLocaleString(),
      reporter: user.name,
    };
    const updated = [newIncident, ...incidents];
    setIncidents(updated);
    localStorage.setItem("buildsync_staff_incidents", JSON.stringify(updated));
    setIncidentDesc("");
    setIncidentStatus("Incident submitted!");
    setTimeout(() => setIncidentStatus(""), 2000);
  };

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold mb-2">Welcome, {user.name}!</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 && <div className="text-muted-foreground">No tasks assigned.</div>}
            <ul className="space-y-3">
              {tasks.map(task => (
                <li key={task.id} className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs ${task.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{task.type}</span>
                  <span className={task.status === "completed" ? "line-through text-muted-foreground" : ""}>{task.description}</span>
                  {task.status === "pending" && (
                    <Button size="sm" onClick={() => handleComplete(task.id)}>Mark Complete</Button>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Work Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {demoSchedule.map((s, i) => (
                <li key={i} className="flex justify-between">
                  <span>{s.day}</span>
                  <span className="font-mono text-xs text-muted-foreground">{s.shift}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader>
          <CardTitle>Building Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 && <div className="text-muted-foreground">No announcements.</div>}
          <ul className="space-y-3">
            {announcements.map(a => (
              <li key={a.id}>
                <div className="font-semibold">{a.title}</div>
                <div className="text-sm text-muted-foreground">{a.content}</div>
                <div className="text-xs text-muted-foreground">{a.date}</div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Incident Report */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Incident Report</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleIncidentSubmit} className="space-y-3">
            <Textarea
              placeholder="Describe the incident..."
              value={incidentDesc}
              onChange={e => setIncidentDesc(e.target.value)}
              required
            />
            <Button type="submit">Submit</Button>
            {incidentStatus && <div className="text-green-600 text-xs mt-1">{incidentStatus}</div>}
          </form>
        </CardContent>
        <CardFooter>
          <div className="w-full">
            <div className="font-semibold mb-2">Recent Reports</div>
            {incidents.length === 0 && <div className="text-muted-foreground">No incidents reported.</div>}
            <ul className="space-y-2 max-h-32 overflow-y-auto">
              {incidents.map(inc => (
                <li key={inc.id} className="border-b pb-1">
                  <div className="text-xs">{inc.description}</div>
                  <div className="text-[10px] text-muted-foreground">{inc.date} — {inc.reporter}</div>
                </li>
              ))}
            </ul>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
