"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@/lib/auth-context";

type DeskSection =
  | "dashboard"
  | "event-log"
  | "instructions"
  | "maintenance"
  | "units"
  | "shift-log"
  | "reservations"
  | "parking";

type InboxItem = {
  id: string;
  resident: string;
  subject: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "verified";
};

type EventLogEntry = {
  id: string;
  timestamp: string;
  title: string;
  details: string;
  category: "front_desk" | "maintenance" | "security" | "resident";
  notifyStaff: boolean;
  notifiedAt?: string;
};

type EventLogDraft = {
  title: string;
  details: string;
  category: EventLogEntry["category"];
  notifyStaff: boolean;
};

type InstructionScope = "general" | "resident" | "unit";

type InstructionEntry = {
  id: string;
  createdAt: string;
  title: string;
  message: string;
  scope: InstructionScope;
  target: string;
  active: boolean;
};

type ParkingPolicy = {
  residentCanManage: boolean;
  conciergeCanManage: boolean;
  visitorPolicy: "open" | "restricted" | "invite_only";
  paidParking: boolean;
  paymentLink: string;
  paymentWindow: string;
};

type ParkingSession = {
  id: string;
  vehiclePlate: string;
  occupantName: string;
  unit: string;
  slot: string;
  startTime: string;
  endTime: string;
  status: "active" | "scheduled" | "closed";
  requiresPayment: boolean;
  paid: boolean;
  createdBy: "resident" | "visitor" | "concierge_assist";
};

type ParkingDraft = {
  vehiclePlate: string;
  occupantName: string;
  unit: string;
  slot: string;
  startTime: string;
  endTime: string;
  status: ParkingSession["status"];
  requiresPayment: boolean;
  paid: boolean;
};

type MaintenanceTicket = {
  id: string;
  createdAt: string;
  issue: string;
  unit: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in_progress" | "completed";
  assignee: string;
  notes: string;
};

type MaintenanceDraft = {
  issue: string;
  unit: string;
  priority: MaintenanceTicket["priority"];
  status: MaintenanceTicket["status"];
  assignee: string;
  notes: string;
};

type UnitRecord = {
  id: string;
  unitNumber: string;
  occupantName: string;
  occupancy: "occupied" | "vacant" | "notice";
  note: string;
  updatedAt: string;
};

type UnitDraft = {
  unitNumber: string;
  occupantName: string;
  occupancy: UnitRecord["occupancy"];
  note: string;
};

type ShiftLogEntry = {
  id: string;
  createdAt: string;
  shiftLabel: string;
  startTime: string;
  endTime: string;
  summary: string;
  pendingEscalations: number;
  handoffTo: string;
};

type ShiftLogDraft = {
  shiftLabel: string;
  startTime: string;
  endTime: string;
  summary: string;
  pendingEscalations: number;
  handoffTo: string;
};

type ReservationEntry = {
  id: string;
  createdAt: string;
  amenity: string;
  unit: string;
  requestedBy: string;
  startTime: string;
  endTime: string;
  status: "pending" | "approved" | "rejected" | "completed";
  notes: string;
};

type ReservationDraft = {
  amenity: string;
  unit: string;
  requestedBy: string;
  startTime: string;
  endTime: string;
  status: ReservationEntry["status"];
  notes: string;
};

const DESK_NAV: Array<{ key: DeskSection; label: string }> = [
  { key: "dashboard", label: "Dashboard" },
  { key: "event-log", label: "Event Log" },
  { key: "instructions", label: "Instructions" },
  { key: "maintenance", label: "Maintenance" },
  { key: "units", label: "Units" },
  { key: "shift-log", label: "Shift Log" },
  { key: "reservations", label: "Reservations" },
  { key: "parking", label: "Parking Management" },
];

const INBOX_SEED: InboxItem[] = [
  { id: "i-1", resident: "Unit 8A", subject: "Lease renewal reminder", priority: "high", status: "pending" },
  { id: "i-2", resident: "Unit 3F", subject: "Package pickup confirmation", priority: "medium", status: "pending" },
  { id: "i-3", resident: "Unit 5D", subject: "Water shutdown notice", priority: "high", status: "verified" },
  { id: "i-4", resident: "Unit 12B", subject: "Move-in checklist", priority: "low", status: "pending" },
];

const EVENT_LOG_SEED: EventLogEntry[] = [
  {
    id: "e-1",
    timestamp: "2026-04-03 14:05",
    title: "Package handoff completed",
    details: "Package released to resident at Unit 3F after ID validation.",
    category: "resident",
    notifyStaff: false,
  },
  {
    id: "e-2",
    timestamp: "2026-04-03 13:42",
    title: "Visitor pre-authorization completed",
    details: "Temporary guest pass approved for Unit 6C.",
    category: "security",
    notifyStaff: true,
    notifiedAt: "2026-04-03 13:44",
  },
  {
    id: "e-3",
    timestamp: "2026-04-03 12:18",
    title: "Vendor access code issued",
    details: "RapidFlow Plumbing received temporary door code for Unit 202.",
    category: "maintenance",
    notifyStaff: true,
  },
];

const INSTRUCTION_SEED: InstructionEntry[] = [
  {
    id: "ins-1",
    createdAt: "2026-04-03 09:00",
    title: "Front Desk Hours",
    message: "Front desk support is available from 8 AM to 8 PM.",
    scope: "general",
    target: "All",
    active: true,
  },
  {
    id: "ins-2",
    createdAt: "2026-04-03 10:10",
    title: "Package Pickup Reminder",
    message: "Your package will be held for 48 hours. Please bring photo ID.",
    scope: "resident",
    target: "Resident: Unit 3F",
    active: true,
  },
  {
    id: "ins-3",
    createdAt: "2026-04-03 11:25",
    title: "Water Line Inspection",
    message: "Planned shutdown between 2 PM and 4 PM.",
    scope: "unit",
    target: "Unit 5D",
    active: true,
  },
];

const PARKING_POLICY_SEED: ParkingPolicy = {
  residentCanManage: true,
  conciergeCanManage: true,
  visitorPolicy: "restricted",
  paidParking: true,
  paymentLink: "https://pay.buildsync.example/parking",
  paymentWindow: "08:00-20:00",
};

const PARKING_SESSIONS_SEED: ParkingSession[] = [
  {
    id: "pk-1",
    vehiclePlate: "AB-2371",
    occupantName: "Eric Yuen",
    unit: "Unit 1A",
    slot: "V-12",
    startTime: "2026-04-03 15:00",
    endTime: "2026-04-03 17:00",
    status: "scheduled",
    requiresPayment: true,
    paid: false,
    createdBy: "resident",
  },
  {
    id: "pk-2",
    vehiclePlate: "KL-9032",
    occupantName: "Searcy Dryden",
    unit: "Unit 6C",
    slot: "V-08",
    startTime: "2026-04-03 17:00",
    endTime: "2026-04-03 20:00",
    status: "active",
    requiresPayment: true,
    paid: true,
    createdBy: "visitor",
  },
];

const MAINTENANCE_SEED: MaintenanceTicket[] = [
  {
    id: "mt-1",
    createdAt: "2026-04-03 10:12",
    issue: "Possible pipe leak",
    unit: "Unit 202",
    priority: "high",
    status: "open",
    assignee: "RapidFlow Plumbing",
    notes: "Awaiting vendor confirmation.",
  },
  {
    id: "mt-2",
    createdAt: "2026-04-03 12:40",
    issue: "Lobby lighting repair",
    unit: "Common Area",
    priority: "medium",
    status: "in_progress",
    assignee: "Evening Shift",
    notes: "Replacement bulbs requested.",
  },
];

const UNITS_SEED: UnitRecord[] = [
  {
    id: "u-1",
    unitNumber: "Unit 1A",
    occupantName: "Eric Yuen",
    occupancy: "occupied",
    note: "Concierge note updated.",
    updatedAt: "2026-04-03 09:50",
  },
  {
    id: "u-2",
    unitNumber: "Unit 6C",
    occupantName: "Searcy Dryden",
    occupancy: "occupied",
    note: "Reservation approved.",
    updatedAt: "2026-04-03 11:06",
  },
  {
    id: "u-3",
    unitNumber: "Unit 8A",
    occupantName: "Mina Ortiz",
    occupancy: "notice",
    note: "Renewal reminder pending.",
    updatedAt: "2026-04-03 13:15",
  },
];

const SHIFT_LOG_SEED: ShiftLogEntry[] = [
  {
    id: "sl-1",
    createdAt: "2026-04-03 14:00",
    shiftLabel: "Morning Shift",
    startTime: "08:00",
    endTime: "16:00",
    summary: "Closed with 6 completed requests.",
    pendingEscalations: 1,
    handoffTo: "Evening Shift",
  },
  {
    id: "sl-2",
    createdAt: "2026-04-03 16:45",
    shiftLabel: "Evening Shift",
    startTime: "17:00",
    endTime: "23:00",
    summary: "Starting with 2 pending escalations.",
    pendingEscalations: 2,
    handoffTo: "Night Desk",
  },
];

const RESERVATION_SEED: ReservationEntry[] = [
  {
    id: "rs-1",
    createdAt: "2026-04-03 12:10",
    amenity: "Guest Suite",
    unit: "Unit 1A",
    requestedBy: "Eric Yuen",
    startTime: "2026-04-03 15:00",
    endTime: "2026-04-03 17:00",
    status: "approved",
    notes: "Visitor check-in at front desk.",
  },
  {
    id: "rs-2",
    createdAt: "2026-04-03 13:20",
    amenity: "Movie Theater",
    unit: "Unit 6C",
    requestedBy: "Searcy Dryden",
    startTime: "2026-04-03 17:00",
    endTime: "2026-04-03 20:00",
    status: "approved",
    notes: "A/V setup requested.",
  },
];

export default function ConciergeDashboard({ user }: { user: User }) {
  const [activeSection, setActiveSection] = useState<DeskSection>("dashboard");
  const [inbox, setInbox] = useState<InboxItem[]>(INBOX_SEED);
  const [eventLogs, setEventLogs] = useState<EventLogEntry[]>(EVENT_LOG_SEED);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventDraft, setEventDraft] = useState<EventLogDraft>({
    title: "",
    details: "",
    category: "front_desk",
    notifyStaff: false,
  });
  const [instructions, setInstructions] = useState<InstructionEntry[]>(INSTRUCTION_SEED);
  const [editingInstructionId, setEditingInstructionId] = useState<string | null>(null);
  const [instructionDraft, setInstructionDraft] = useState({
    title: "",
    message: "",
    scope: "general" as InstructionScope,
    target: "All",
    active: true,
  });
  const [parkingPolicy, setParkingPolicy] = useState<ParkingPolicy>(PARKING_POLICY_SEED);
  const [parkingSessions, setParkingSessions] = useState<ParkingSession[]>(PARKING_SESSIONS_SEED);
  const [editingParkingId, setEditingParkingId] = useState<string | null>(null);
  const [parkingDraft, setParkingDraft] = useState<ParkingDraft>({
    vehiclePlate: "",
    occupantName: "",
    unit: "",
    slot: "",
    startTime: "",
    endTime: "",
    status: "scheduled",
    requiresPayment: false,
    paid: false,
  });
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(MAINTENANCE_SEED);
  const [editingMaintenanceId, setEditingMaintenanceId] = useState<string | null>(null);
  const [maintenanceDraft, setMaintenanceDraft] = useState<MaintenanceDraft>({
    issue: "",
    unit: "",
    priority: "medium",
    status: "open",
    assignee: "",
    notes: "",
  });
  const [units, setUnits] = useState<UnitRecord[]>(UNITS_SEED);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [unitDraft, setUnitDraft] = useState<UnitDraft>({
    unitNumber: "",
    occupantName: "",
    occupancy: "occupied",
    note: "",
  });
  const [shiftLogs, setShiftLogs] = useState<ShiftLogEntry[]>(SHIFT_LOG_SEED);
  const [editingShiftLogId, setEditingShiftLogId] = useState<string | null>(null);
  const [shiftLogDraft, setShiftLogDraft] = useState<ShiftLogDraft>({
    shiftLabel: "",
    startTime: "",
    endTime: "",
    summary: "",
    pendingEscalations: 0,
    handoffTo: "",
  });
  const [reservations, setReservations] = useState<ReservationEntry[]>(RESERVATION_SEED);
  const [editingReservationId, setEditingReservationId] = useState<string | null>(null);
  const [reservationDraft, setReservationDraft] = useState<ReservationDraft>({
    amenity: "",
    unit: "",
    requestedBy: "",
    startTime: "",
    endTime: "",
    status: "pending",
    notes: "",
  });

  const sectionStorageKey = useMemo(() => {
    const identity = (user.email || user.id || "default").toLowerCase();
    return `buildsync_concierge_active_section_${identity}`;
  }, [user.email, user.id]);

  const eventLogStorageKey = useMemo(() => {
    const identity = (user.email || user.id || "default").toLowerCase();
    return `buildsync_concierge_event_log_${identity}`;
  }, [user.email, user.id]);

  const instructionsStorageKey = useMemo(() => {
    const identity = (user.email || user.id || "default").toLowerCase();
    return `buildsync_concierge_instructions_${identity}`;
  }, [user.email, user.id]);

  const parkingPolicyStorageKey = useMemo(() => {
    const identity = (user.email || user.id || "default").toLowerCase();
    return `buildsync_concierge_parking_policy_${identity}`;
  }, [user.email, user.id]);

  const parkingSessionsStorageKey = useMemo(() => {
    const identity = (user.email || user.id || "default").toLowerCase();
    return `buildsync_concierge_parking_sessions_${identity}`;
  }, [user.email, user.id]);

  const maintenanceStorageKey = useMemo(() => {
    const identity = (user.email || user.id || "default").toLowerCase();
    return `buildsync_concierge_maintenance_${identity}`;
  }, [user.email, user.id]);

  const unitsStorageKey = useMemo(() => {
    const identity = (user.email || user.id || "default").toLowerCase();
    return `buildsync_concierge_units_${identity}`;
  }, [user.email, user.id]);

  const shiftLogStorageKey = useMemo(() => {
    const identity = (user.email || user.id || "default").toLowerCase();
    return `buildsync_concierge_shift_log_${identity}`;
  }, [user.email, user.id]);

  const reservationStorageKey = useMemo(() => {
    const identity = (user.email || user.id || "default").toLowerCase();
    return `buildsync_concierge_reservations_${identity}`;
  }, [user.email, user.id]);

  const canNotifyStaff = useMemo(() => {
    const elevatedRoles = new Set(["admin", "building_manager", "building_owner"]);
    if (elevatedRoles.has(user.role)) return true;
    if (Array.isArray(user.accessRoles) && user.accessRoles.some((role) => elevatedRoles.has(role))) return true;
    return (user.email || "").toLowerCase().includes("lead");
  }, [user]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(sectionStorageKey);
      if (!saved) return;

      const isValid = DESK_NAV.some((item) => item.key === saved);
      if (isValid) {
        setActiveSection(saved as DeskSection);
      }
    } catch {
      // Ignore persisted section errors and keep default dashboard view.
    }
  }, [sectionStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(sectionStorageKey, activeSection);
    } catch {
      // Ignore write failures for local-only preference.
    }
  }, [activeSection, sectionStorageKey]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(eventLogStorageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as EventLogEntry[];
      if (Array.isArray(parsed)) {
        setEventLogs(parsed);
      }
    } catch {
      // Ignore malformed local event log and keep seeded values.
    }
  }, [eventLogStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(eventLogStorageKey, JSON.stringify(eventLogs));
    } catch {
      // Ignore persistence failures in local-only mode.
    }
  }, [eventLogs, eventLogStorageKey]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(instructionsStorageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as InstructionEntry[];
      if (Array.isArray(parsed)) {
        setInstructions(parsed);
      }
    } catch {
      // Ignore malformed instructions state and continue with defaults.
    }
  }, [instructionsStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(instructionsStorageKey, JSON.stringify(instructions));
    } catch {
      // Ignore persistence failures in local-only mode.
    }
  }, [instructions, instructionsStorageKey]);

  useEffect(() => {
    try {
      const savedPolicy = localStorage.getItem(parkingPolicyStorageKey);
      if (savedPolicy) {
        const parsed = JSON.parse(savedPolicy) as Partial<ParkingPolicy>;
        setParkingPolicy((prev) => ({ ...prev, ...parsed }));
      }

      const savedSessions = localStorage.getItem(parkingSessionsStorageKey);
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions) as ParkingSession[];
        if (Array.isArray(parsed)) {
          setParkingSessions(
            parsed.map((session) => ({
              ...session,
              createdBy: session.createdBy || "concierge_assist",
            })),
          );
        }
      }
    } catch {
      // Ignore malformed parking state and continue with defaults.
    }
  }, [parkingPolicyStorageKey, parkingSessionsStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(parkingPolicyStorageKey, JSON.stringify(parkingPolicy));
    } catch {
      // Ignore local persistence failures.
    }
  }, [parkingPolicy, parkingPolicyStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(parkingSessionsStorageKey, JSON.stringify(parkingSessions));
    } catch {
      // Ignore local persistence failures.
    }
  }, [parkingSessions, parkingSessionsStorageKey]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(maintenanceStorageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as MaintenanceTicket[];
      if (Array.isArray(parsed)) {
        setMaintenanceTickets(parsed);
      }
    } catch {
      // Ignore malformed local maintenance state.
    }
  }, [maintenanceStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(maintenanceStorageKey, JSON.stringify(maintenanceTickets));
    } catch {
      // Ignore local persistence failures.
    }
  }, [maintenanceTickets, maintenanceStorageKey]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(unitsStorageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as UnitRecord[];
      if (Array.isArray(parsed)) {
        setUnits(parsed);
      }
    } catch {
      // Ignore malformed local units state.
    }
  }, [unitsStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(unitsStorageKey, JSON.stringify(units));
    } catch {
      // Ignore local persistence failures.
    }
  }, [units, unitsStorageKey]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(shiftLogStorageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as ShiftLogEntry[];
      if (Array.isArray(parsed)) {
        setShiftLogs(parsed);
      }
    } catch {
      // Ignore malformed local shift log state.
    }
  }, [shiftLogStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(shiftLogStorageKey, JSON.stringify(shiftLogs));
    } catch {
      // Ignore local persistence failures.
    }
  }, [shiftLogs, shiftLogStorageKey]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(reservationStorageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as ReservationEntry[];
      if (Array.isArray(parsed)) {
        setReservations(parsed);
      }
    } catch {
      // Ignore malformed local reservations state.
    }
  }, [reservationStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(reservationStorageKey, JSON.stringify(reservations));
    } catch {
      // Ignore local persistence failures.
    }
  }, [reservations, reservationStorageKey]);

  useEffect(() => {
    if (parkingPolicy.paidParking) return;

    setParkingDraft((prev) => ({
      ...prev,
      requiresPayment: false,
      paid: false,
    }));

    setParkingSessions((prev) =>
      prev.map((session) => ({
        ...session,
        requiresPayment: false,
        paid: false,
      })),
    );
  }, [parkingPolicy.paidParking]);

  const pendingCount = useMemo(() => inbox.filter((item) => item.status === "pending").length, [inbox]);
  const verifiedCount = useMemo(() => inbox.filter((item) => item.status === "verified").length, [inbox]);
  const activeParkingCount = useMemo(() => parkingSessions.filter((session) => session.status === "active").length, [parkingSessions]);
  const openMaintenanceCount = useMemo(
    () => maintenanceTickets.filter((ticket) => ticket.status !== "completed").length,
    [maintenanceTickets],
  );
  const activeReservationCount = useMemo(
    () => reservations.filter((reservation) => reservation.status === "approved" || reservation.status === "pending").length,
    [reservations],
  );

  const userCanManageParking = useMemo(() => {
    if (["concierge", "admin", "building_manager", "building_owner"].includes(user.role)) {
      return parkingPolicy.conciergeCanManage;
    }
    if (["resident", "tenant"].includes(user.role)) {
      return parkingPolicy.residentCanManage;
    }
    return false;
  }, [user.role, parkingPolicy.conciergeCanManage, parkingPolicy.residentCanManage]);

  const canEditParkingSession = (session: ParkingSession) => {
    if (!userCanManageParking) return false;
    if (user.role === "concierge") {
      return session.createdBy === "concierge_assist";
    }
    return true;
  };

  const verifyInboxItem = (id: string) => {
    setInbox((prev) => prev.map((item) => (item.id === id ? { ...item, status: "verified" } : item)));
  };

  const resetEventDraft = () => {
    setEventDraft({
      title: "",
      details: "",
      category: "front_desk",
      notifyStaff: false,
    });
    setEditingEventId(null);
  };

  const handleSaveEvent = () => {
    const title = eventDraft.title.trim();
    const details = eventDraft.details.trim();
    if (!title || !details) return;

    if (editingEventId) {
      setEventLogs((prev) =>
        prev.map((entry) =>
          entry.id === editingEventId
            ? {
                ...entry,
                title,
                details,
                category: eventDraft.category,
                notifyStaff: canNotifyStaff ? eventDraft.notifyStaff : false,
              }
            : entry,
        ),
      );
      resetEventDraft();
      return;
    }

    const now = new Date();
    const next: EventLogEntry = {
      id: `e-${now.getTime()}`,
      timestamp: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      title,
      details,
      category: eventDraft.category,
      notifyStaff: canNotifyStaff ? eventDraft.notifyStaff : false,
    };

    setEventLogs((prev) => [next, ...prev]);
    resetEventDraft();
  };

  const startEditEvent = (entry: EventLogEntry) => {
    setEditingEventId(entry.id);
    setEventDraft({
      title: entry.title,
      details: entry.details,
      category: entry.category,
      notifyStaff: entry.notifyStaff,
    });
  };

  const notifyStaff = (id: string) => {
    if (!canNotifyStaff) return;
    const now = new Date();
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setEventLogs((prev) => prev.map((entry) => (entry.id === id ? { ...entry, notifyStaff: true, notifiedAt: stamp } : entry)));
  };

  const resetInstructionDraft = () => {
    setInstructionDraft({
      title: "",
      message: "",
      scope: "general",
      target: "All",
      active: true,
    });
    setEditingInstructionId(null);
  };

  const startEditInstruction = (entry: InstructionEntry) => {
    setEditingInstructionId(entry.id);
    setInstructionDraft({
      title: entry.title,
      message: entry.message,
      scope: entry.scope,
      target: entry.target,
      active: entry.active,
    });
  };

  const saveInstruction = () => {
    const title = instructionDraft.title.trim();
    const message = instructionDraft.message.trim();
    const target = instructionDraft.target.trim() || (instructionDraft.scope === "general" ? "All" : "");

    if (!title || !message || !target) return;

    if (editingInstructionId) {
      setInstructions((prev) =>
        prev.map((entry) =>
          entry.id === editingInstructionId
            ? {
                ...entry,
                title,
                message,
                scope: instructionDraft.scope,
                target,
                active: instructionDraft.active,
              }
            : entry,
        ),
      );
      resetInstructionDraft();
      return;
    }

    const now = new Date();
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setInstructions((prev) => [
      {
        id: `ins-${now.getTime()}`,
        createdAt: stamp,
        title,
        message,
        scope: instructionDraft.scope,
        target,
        active: instructionDraft.active,
      },
      ...prev,
    ]);
    resetInstructionDraft();
  };

  const toggleInstructionActive = (id: string) => {
    setInstructions((prev) => prev.map((entry) => (entry.id === id ? { ...entry, active: !entry.active } : entry)));
  };

  const resetParkingDraft = () => {
    setParkingDraft({
      vehiclePlate: "",
      occupantName: "",
      unit: "",
      slot: "",
      startTime: "",
      endTime: "",
      status: "scheduled",
      requiresPayment: parkingPolicy.paidParking,
      paid: false,
    });
    setEditingParkingId(null);
  };

  const startEditParking = (session: ParkingSession) => {
    setEditingParkingId(session.id);
    setParkingDraft({
      vehiclePlate: session.vehiclePlate,
      occupantName: session.occupantName,
      unit: session.unit,
      slot: session.slot,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status,
      requiresPayment: session.requiresPayment,
      paid: session.paid,
    });
  };

  const saveParkingSession = () => {
    if (!userCanManageParking) return;

    const vehiclePlate = parkingDraft.vehiclePlate.trim();
    const occupantName = parkingDraft.occupantName.trim();
    const unit = parkingDraft.unit.trim();
    const slot = parkingDraft.slot.trim();
    const startTime = parkingDraft.startTime.trim();
    const endTime = parkingDraft.endTime.trim();

    if (!vehiclePlate || !occupantName || !unit || !slot || !startTime || !endTime) return;

    if (editingParkingId) {
      setParkingSessions((prev) =>
        prev.map((session) =>
          session.id === editingParkingId
            ? {
                ...session,
                vehiclePlate,
                occupantName,
                unit,
                slot,
                startTime,
                endTime,
                status: parkingDraft.status,
                requiresPayment: parkingPolicy.paidParking ? parkingDraft.requiresPayment : false,
                paid: parkingPolicy.paidParking ? parkingDraft.paid : false,
              }
            : session,
        ),
      );
      resetParkingDraft();
      return;
    }

    const now = new Date();
    setParkingSessions((prev) => [
      {
        id: `pk-${now.getTime()}`,
        vehiclePlate,
        occupantName,
        unit,
        slot,
        startTime,
        endTime,
        status: parkingDraft.status,
        requiresPayment: parkingPolicy.paidParking ? parkingDraft.requiresPayment : false,
        paid: parkingPolicy.paidParking ? parkingDraft.paid : false,
        createdBy: "concierge_assist",
      },
      ...prev,
    ]);
    resetParkingDraft();
  };

  const markParkingPaid = (id: string) => {
    if (!userCanManageParking) return;
    setParkingSessions((prev) => prev.map((session) => (session.id === id ? { ...session, paid: true } : session)));
  };

  const nowStamp = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };

  const resetMaintenanceDraft = () => {
    setMaintenanceDraft({
      issue: "",
      unit: "",
      priority: "medium",
      status: "open",
      assignee: "",
      notes: "",
    });
    setEditingMaintenanceId(null);
  };

  const startEditMaintenance = (ticket: MaintenanceTicket) => {
    setEditingMaintenanceId(ticket.id);
    setMaintenanceDraft({
      issue: ticket.issue,
      unit: ticket.unit,
      priority: ticket.priority,
      status: ticket.status,
      assignee: ticket.assignee,
      notes: ticket.notes,
    });
  };

  const saveMaintenanceTicket = () => {
    const issue = maintenanceDraft.issue.trim();
    const unit = maintenanceDraft.unit.trim();
    const assignee = maintenanceDraft.assignee.trim();
    const notes = maintenanceDraft.notes.trim();
    if (!issue || !unit || !assignee || !notes) return;

    if (editingMaintenanceId) {
      setMaintenanceTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === editingMaintenanceId
            ? {
                ...ticket,
                issue,
                unit,
                priority: maintenanceDraft.priority,
                status: maintenanceDraft.status,
                assignee,
                notes,
              }
            : ticket,
        ),
      );
      resetMaintenanceDraft();
      return;
    }

    setMaintenanceTickets((prev) => [
      {
        id: `mt-${Date.now()}`,
        createdAt: nowStamp(),
        issue,
        unit,
        priority: maintenanceDraft.priority,
        status: maintenanceDraft.status,
        assignee,
        notes,
      },
      ...prev,
    ]);
    resetMaintenanceDraft();
  };

  const resetUnitDraft = () => {
    setUnitDraft({
      unitNumber: "",
      occupantName: "",
      occupancy: "occupied",
      note: "",
    });
    setEditingUnitId(null);
  };

  const startEditUnit = (entry: UnitRecord) => {
    setEditingUnitId(entry.id);
    setUnitDraft({
      unitNumber: entry.unitNumber,
      occupantName: entry.occupantName,
      occupancy: entry.occupancy,
      note: entry.note,
    });
  };

  const saveUnit = () => {
    const unitNumber = unitDraft.unitNumber.trim();
    const occupantName = unitDraft.occupantName.trim();
    const note = unitDraft.note.trim();
    if (!unitNumber || !occupantName || !note) return;

    if (editingUnitId) {
      setUnits((prev) =>
        prev.map((entry) =>
          entry.id === editingUnitId
            ? {
                ...entry,
                unitNumber,
                occupantName,
                occupancy: unitDraft.occupancy,
                note,
                updatedAt: nowStamp(),
              }
            : entry,
        ),
      );
      resetUnitDraft();
      return;
    }

    setUnits((prev) => [
      {
        id: `u-${Date.now()}`,
        unitNumber,
        occupantName,
        occupancy: unitDraft.occupancy,
        note,
        updatedAt: nowStamp(),
      },
      ...prev,
    ]);
    resetUnitDraft();
  };

  const resetShiftLogDraft = () => {
    setShiftLogDraft({
      shiftLabel: "",
      startTime: "",
      endTime: "",
      summary: "",
      pendingEscalations: 0,
      handoffTo: "",
    });
    setEditingShiftLogId(null);
  };

  const startEditShiftLog = (entry: ShiftLogEntry) => {
    setEditingShiftLogId(entry.id);
    setShiftLogDraft({
      shiftLabel: entry.shiftLabel,
      startTime: entry.startTime,
      endTime: entry.endTime,
      summary: entry.summary,
      pendingEscalations: entry.pendingEscalations,
      handoffTo: entry.handoffTo,
    });
  };

  const saveShiftLog = () => {
    const shiftLabel = shiftLogDraft.shiftLabel.trim();
    const startTime = shiftLogDraft.startTime.trim();
    const endTime = shiftLogDraft.endTime.trim();
    const summary = shiftLogDraft.summary.trim();
    const handoffTo = shiftLogDraft.handoffTo.trim();
    if (!shiftLabel || !startTime || !endTime || !summary || !handoffTo) return;

    if (editingShiftLogId) {
      setShiftLogs((prev) =>
        prev.map((entry) =>
          entry.id === editingShiftLogId
            ? {
                ...entry,
                shiftLabel,
                startTime,
                endTime,
                summary,
                pendingEscalations: shiftLogDraft.pendingEscalations,
                handoffTo,
              }
            : entry,
        ),
      );
      resetShiftLogDraft();
      return;
    }

    setShiftLogs((prev) => [
      {
        id: `sl-${Date.now()}`,
        createdAt: nowStamp(),
        shiftLabel,
        startTime,
        endTime,
        summary,
        pendingEscalations: shiftLogDraft.pendingEscalations,
        handoffTo,
      },
      ...prev,
    ]);
    resetShiftLogDraft();
  };

  const resetReservationDraft = () => {
    setReservationDraft({
      amenity: "",
      unit: "",
      requestedBy: "",
      startTime: "",
      endTime: "",
      status: "pending",
      notes: "",
    });
    setEditingReservationId(null);
  };

  const startEditReservation = (entry: ReservationEntry) => {
    setEditingReservationId(entry.id);
    setReservationDraft({
      amenity: entry.amenity,
      unit: entry.unit,
      requestedBy: entry.requestedBy,
      startTime: entry.startTime,
      endTime: entry.endTime,
      status: entry.status,
      notes: entry.notes,
    });
  };

  const saveReservation = () => {
    const amenity = reservationDraft.amenity.trim();
    const unit = reservationDraft.unit.trim();
    const requestedBy = reservationDraft.requestedBy.trim();
    const startTime = reservationDraft.startTime.trim();
    const endTime = reservationDraft.endTime.trim();
    const notes = reservationDraft.notes.trim();
    if (!amenity || !unit || !requestedBy || !startTime || !endTime || !notes) return;

    if (editingReservationId) {
      setReservations((prev) =>
        prev.map((entry) =>
          entry.id === editingReservationId
            ? {
                ...entry,
                amenity,
                unit,
                requestedBy,
                startTime,
                endTime,
                status: reservationDraft.status,
                notes,
              }
            : entry,
        ),
      );
      resetReservationDraft();
      return;
    }

    setReservations((prev) => [
      {
        id: `rs-${Date.now()}`,
        createdAt: nowStamp(),
        amenity,
        unit,
        requestedBy,
        startTime,
        endTime,
        status: reservationDraft.status,
        notes,
      },
      ...prev,
    ]);
    resetReservationDraft();
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-8">
      <section className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-xl border border-border/40 bg-card/60 p-4 md:p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Core Concierge Workspace</p>
          <h1 className="mt-1 text-2xl font-semibold md:text-4xl">{user.name || "Concierge"} - Shift Desk</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome, {user.name || "Concierge"}. This workspace focuses only on front-desk core operations.
          </p>
        </header>

        <section className="grid gap-4 xl:grid-cols-[220px_1fr]">
          <aside className="rounded-xl border border-border/35 bg-card/45 p-2">
            <nav className="space-y-1" aria-label="Concierge desk navigation">
              {DESK_NAV.map((item) => {
                const isActive = activeSection === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveSection(item.key)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      isActive
                        ? "border border-red-500/40 bg-red-500/15 text-red-200"
                        : "border border-transparent text-foreground/85 hover:border-accent/30 hover:bg-accent/8"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <button
              type="button"
              className="mt-4 w-full rounded-lg border border-emerald-500/45 bg-emerald-500/15 px-3 py-2 font-mono text-xs uppercase tracking-[0.14em] text-emerald-200"
            >
              + Add
            </button>
          </aside>

          <div className="space-y-4">
            {activeSection === "dashboard" && (
              <>
                <section className="rounded-xl border border-border/35 bg-card/45 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Action Items</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-md border border-border/35 bg-background/55 px-3 py-2">
                      <p className="text-xl font-semibold">{pendingCount}</p>
                      <p className="text-sm text-accent">Open Requests</p>
                    </div>
                    <div className="rounded-md border border-border/35 bg-background/55 px-3 py-2">
                      <p className="text-xl font-semibold">{verifiedCount}</p>
                      <p className="text-sm text-accent">Verified Tasks</p>
                    </div>
                  </div>
                </section>

                <section className="grid gap-3 lg:grid-cols-2">
                  <article className="rounded-xl border border-border/35 bg-card/45 p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Live Operations</p>
                    <p className="mt-2 text-sm">Open maintenance tickets: {openMaintenanceCount}</p>
                    <p className="mt-2 text-sm">Reservations in progress: {activeReservationCount}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Updated from tab data.</p>
                  </article>
                  <article className="rounded-xl border border-border/35 bg-card/45 p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Latest Shift Handoff</p>
                    <p className="mt-2 text-sm">{shiftLogs[0]?.summary || "No shift logs yet."}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {shiftLogs[0] ? `${shiftLogs[0].shiftLabel} | ${shiftLogs[0].startTime}-${shiftLogs[0].endTime}` : "Add a shift log entry."}
                    </p>
                  </article>
                </section>

                <section className="rounded-xl border border-border/35 bg-card/45 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Agentic Inbox</p>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Review / Approve</span>
                  </div>
                  <div className="space-y-2">
                    {inbox.map((item) => (
                      <div key={item.id} className="rounded-md border border-border/35 bg-background/55 px-3 py-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-sm font-medium">{item.subject}</p>
                          <span className="text-xs text-muted-foreground">{item.resident}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="rounded-full border border-border/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                            {item.priority}
                          </span>
                          <span className="rounded-full border border-border/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                            {item.status}
                          </span>
                          {item.status === "pending" && (
                            <button
                              type="button"
                              onClick={() => verifyInboxItem(item.id)}
                              className="ml-auto rounded-md border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-200"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="grid gap-3 md:grid-cols-3">
                  <article className="rounded-xl border border-border/35 bg-card/45 p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Units Tracked</p>
                    <p className="mt-3 text-3xl font-semibold">{units.length}</p>
                    <p className="text-xs text-muted-foreground">Occupancy records synced.</p>
                  </article>
                  <article className="rounded-xl border border-border/35 bg-card/45 p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Events Entered</p>
                    <p className="mt-3 text-3xl font-semibold">{eventLogs.length}</p>
                    <p className="text-xs text-muted-foreground">From Event Log / Change Log.</p>
                  </article>
                  <article className="rounded-xl border border-border/35 bg-card/45 p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Parking Sessions</p>
                    <p className="mt-3 text-3xl font-semibold">{parkingSessions.length}</p>
                    <p className="text-xs text-muted-foreground">{activeParkingCount} active right now.</p>
                  </article>
                </section>
              </>
            )}

            {activeSection === "event-log" && (
              <section className="rounded-xl border border-border/35 bg-card/45 p-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Event Log / Change Log</p>
                  <span className="text-xs text-muted-foreground">{eventLogs.length} entries</span>
                </div>

                <div className="mt-3 rounded-md border border-border/35 bg-background/55 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {editingEventId ? "Edit Event" : "Add Event"}
                  </p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <input
                      value={eventDraft.title}
                      onChange={(event) => setEventDraft((prev) => ({ ...prev, title: event.target.value }))}
                      placeholder="Event title"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                    <select
                      value={eventDraft.category}
                      onChange={(event) => setEventDraft((prev) => ({ ...prev, category: event.target.value as EventLogEntry["category"] }))}
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    >
                      <option value="front_desk">Front Desk</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="security">Security</option>
                      <option value="resident">Resident</option>
                    </select>
                    <textarea
                      value={eventDraft.details}
                      onChange={(event) => setEventDraft((prev) => ({ ...prev, details: event.target.value }))}
                      placeholder="Details"
                      className="md:col-span-2 h-20 rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={eventDraft.notifyStaff}
                        onChange={(event) => setEventDraft((prev) => ({ ...prev, notifyStaff: event.target.checked }))}
                        disabled={!canNotifyStaff}
                      />
                      Notify staff on save
                    </label>
                    {!canNotifyStaff && (
                      <span className="text-[11px] text-amber-300">No permission to trigger staff notifications.</span>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveEvent}
                      className="ml-auto rounded-md border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-200"
                    >
                      {editingEventId ? "Save Changes" : "Add Event"}
                    </button>
                    {editingEventId && (
                      <button
                        type="button"
                        onClick={resetEventDraft}
                        className="rounded-md border border-border/40 bg-background px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-sm">
                  {eventLogs.map((entry) => (
                    <div key={entry.id} className="rounded-md border border-border/35 bg-background/55 p-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-medium">{entry.timestamp} - {entry.title}</p>
                        <span className="rounded-full border border-border/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          {entry.category.replace("_", " ")}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{entry.details}</p>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => startEditEvent(entry)}
                          className="rounded-md border border-border/40 bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => notifyStaff(entry.id)}
                          disabled={!canNotifyStaff}
                          className="rounded-md border border-sky-500/40 bg-sky-500/15 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-sky-200 disabled:opacity-50"
                        >
                          Notify Staff
                        </button>
                        {entry.notifiedAt && (
                          <span className="text-[11px] text-emerald-300">Notified at {entry.notifiedAt}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeSection === "instructions" && (
              <section className="rounded-xl border border-border/35 bg-card/45 p-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Instructions</p>
                  <span className="text-xs text-muted-foreground">General, resident, or unit scoped</span>
                </div>

                <div className="mt-3 rounded-md border border-border/35 bg-background/55 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {editingInstructionId ? "Edit Instruction" : "Add Instruction"}
                  </p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <input
                      value={instructionDraft.title}
                      onChange={(event) => setInstructionDraft((prev) => ({ ...prev, title: event.target.value }))}
                      placeholder="Instruction title"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                    <select
                      value={instructionDraft.scope}
                      onChange={(event) => {
                        const nextScope = event.target.value as InstructionScope;
                        setInstructionDraft((prev) => ({
                          ...prev,
                          scope: nextScope,
                          target: nextScope === "general" ? "All" : prev.target === "All" ? "" : prev.target,
                        }));
                      }}
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    >
                      <option value="general">General (all users)</option>
                      <option value="resident">Resident-specific</option>
                      <option value="unit">Unit-specific</option>
                    </select>

                    <input
                      value={instructionDraft.target}
                      onChange={(event) => setInstructionDraft((prev) => ({ ...prev, target: event.target.value }))}
                      placeholder={
                        instructionDraft.scope === "general"
                          ? "All"
                          : instructionDraft.scope === "resident"
                            ? "Resident name or identifier"
                            : "Unit number (e.g., Unit 5D)"
                      }
                      disabled={instructionDraft.scope === "general"}
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm disabled:opacity-70"
                    />

                    <label className="inline-flex items-center gap-2 rounded-md border border-border/35 bg-background px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={instructionDraft.active}
                        onChange={(event) => setInstructionDraft((prev) => ({ ...prev, active: event.target.checked }))}
                      />
                      Active instruction
                    </label>

                    <textarea
                      value={instructionDraft.message}
                      onChange={(event) => setInstructionDraft((prev) => ({ ...prev, message: event.target.value }))}
                      placeholder="Instruction message"
                      className="md:col-span-2 h-20 rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={saveInstruction}
                      className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-200"
                    >
                      {editingInstructionId ? "Save Changes" : "Add Instruction"}
                    </button>
                    {editingInstructionId && (
                      <button
                        type="button"
                        onClick={resetInstructionDraft}
                        className="rounded-md border border-border/40 bg-background px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-sm">
                  {instructions.map((entry) => (
                    <div key={entry.id} className="rounded-md border border-border/35 bg-background/55 p-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-medium">{entry.title}</p>
                        <span className="rounded-full border border-border/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          {entry.scope}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{entry.message}</p>
                      <div className="mt-2 flex items-center gap-2 flex-wrap text-xs">
                        <span className="text-muted-foreground">Target: {entry.target}</span>
                        <span className="text-muted-foreground">Created: {entry.createdAt}</span>
                        <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${entry.active ? "border-emerald-500/30 text-emerald-300" : "border-border/30 text-muted-foreground"}`}>
                          {entry.active ? "active" : "inactive"}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEditInstruction(entry)}
                          className="ml-auto rounded-md border border-border/40 bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleInstructionActive(entry.id)}
                          className="rounded-md border border-border/40 bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
                        >
                          {entry.active ? "Disable" : "Enable"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeSection === "maintenance" && (
              <section className="rounded-xl border border-border/35 bg-card/45 p-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Maintenance Dispatch</p>
                  <span className="text-xs text-muted-foreground">{maintenanceTickets.length} tickets</span>
                </div>

                <div className="mt-3 rounded-md border border-border/35 bg-background/55 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {editingMaintenanceId ? "Edit Ticket" : "Add Ticket"}
                  </p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <input
                      value={maintenanceDraft.issue}
                      onChange={(event) => setMaintenanceDraft((prev) => ({ ...prev, issue: event.target.value }))}
                      placeholder="Issue"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                    <input
                      value={maintenanceDraft.unit}
                      onChange={(event) => setMaintenanceDraft((prev) => ({ ...prev, unit: event.target.value }))}
                      placeholder="Unit or area"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                    <select
                      value={maintenanceDraft.priority}
                      onChange={(event) =>
                        setMaintenanceDraft((prev) => ({ ...prev, priority: event.target.value as MaintenanceTicket["priority"] }))
                      }
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <select
                      value={maintenanceDraft.status}
                      onChange={(event) =>
                        setMaintenanceDraft((prev) => ({ ...prev, status: event.target.value as MaintenanceTicket["status"] }))
                      }
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <input
                      value={maintenanceDraft.assignee}
                      onChange={(event) => setMaintenanceDraft((prev) => ({ ...prev, assignee: event.target.value }))}
                      placeholder="Assigned to"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                    <textarea
                      value={maintenanceDraft.notes}
                      onChange={(event) => setMaintenanceDraft((prev) => ({ ...prev, notes: event.target.value }))}
                      placeholder="Notes"
                      className="h-20 rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={saveMaintenanceTicket}
                      className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-200"
                    >
                      {editingMaintenanceId ? "Save Ticket" : "Add Ticket"}
                    </button>
                    {editingMaintenanceId && (
                      <button
                        type="button"
                        onClick={resetMaintenanceDraft}
                        className="rounded-md border border-border/40 bg-background px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-sm">
                  {maintenanceTickets.map((ticket) => (
                    <div key={ticket.id} className="rounded-md border border-border/35 bg-background/55 p-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-medium">{ticket.issue} - {ticket.unit}</p>
                        <span className="rounded-full border border-border/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          {ticket.priority}
                        </span>
                        <span className="rounded-full border border-border/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          {ticket.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{ticket.notes}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Assignee: {ticket.assignee}</span>
                        <span className="text-[11px] text-muted-foreground">Created: {ticket.createdAt}</span>
                        <button
                          type="button"
                          onClick={() => startEditMaintenance(ticket)}
                          className="ml-auto rounded-md border border-border/40 bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeSection === "units" && (
              <section className="rounded-xl border border-border/35 bg-card/45 p-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Units</p>
                  <span className="text-xs text-muted-foreground">{units.length} records</span>
                </div>

                <div className="mt-3 rounded-md border border-border/35 bg-background/55 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {editingUnitId ? "Edit Unit" : "Add Unit"}
                  </p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <input
                      value={unitDraft.unitNumber}
                      onChange={(event) => setUnitDraft((prev) => ({ ...prev, unitNumber: event.target.value }))}
                      placeholder="Unit number"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                    <input
                      value={unitDraft.occupantName}
                      onChange={(event) => setUnitDraft((prev) => ({ ...prev, occupantName: event.target.value }))}
                      placeholder="Occupant name"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                    <select
                      value={unitDraft.occupancy}
                      onChange={(event) =>
                        setUnitDraft((prev) => ({ ...prev, occupancy: event.target.value as UnitRecord["occupancy"] }))
                      }
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    >
                      <option value="occupied">Occupied</option>
                      <option value="vacant">Vacant</option>
                      <option value="notice">Notice</option>
                    </select>
                    <textarea
                      value={unitDraft.note}
                      onChange={(event) => setUnitDraft((prev) => ({ ...prev, note: event.target.value }))}
                      placeholder="Unit note"
                      className="h-20 rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={saveUnit}
                      className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-200"
                    >
                      {editingUnitId ? "Save Unit" : "Add Unit"}
                    </button>
                    {editingUnitId && (
                      <button
                        type="button"
                        onClick={resetUnitDraft}
                        className="rounded-md border border-border/40 bg-background px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid gap-2 md:grid-cols-2 text-sm">
                  {units.map((entry) => (
                    <div key={entry.id} className="rounded-md border border-border/35 bg-background/55 p-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{entry.unitNumber} - {entry.occupantName}</p>
                        <span className="rounded-full border border-border/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          {entry.occupancy}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{entry.note}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Updated: {entry.updatedAt}</span>
                        <button
                          type="button"
                          onClick={() => startEditUnit(entry)}
                          className="ml-auto rounded-md border border-border/40 bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeSection === "shift-log" && (
              <section className="rounded-xl border border-border/35 bg-card/45 p-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Shift Log</p>
                  <span className="text-xs text-muted-foreground">{shiftLogs.length} entries</span>
                </div>

                <div className="mt-3 rounded-md border border-border/35 bg-background/55 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {editingShiftLogId ? "Edit Shift Entry" : "Add Shift Entry"}
                  </p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <input
                      value={shiftLogDraft.shiftLabel}
                      onChange={(event) => setShiftLogDraft((prev) => ({ ...prev, shiftLabel: event.target.value }))}
                      placeholder="Shift label"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                    <input
                      value={shiftLogDraft.handoffTo}
                      onChange={(event) => setShiftLogDraft((prev) => ({ ...prev, handoffTo: event.target.value }))}
                      placeholder="Handoff to"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                    <input
                      value={shiftLogDraft.startTime}
                      onChange={(event) => setShiftLogDraft((prev) => ({ ...prev, startTime: event.target.value }))}
                      placeholder="Start time"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                    <input
                      value={shiftLogDraft.endTime}
                      onChange={(event) => setShiftLogDraft((prev) => ({ ...prev, endTime: event.target.value }))}
                      placeholder="End time"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      min={0}
                      value={shiftLogDraft.pendingEscalations}
                      onChange={(event) =>
                        setShiftLogDraft((prev) => ({ ...prev, pendingEscalations: Number(event.target.value) || 0 }))
                      }
                      placeholder="Pending escalations"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                    <textarea
                      value={shiftLogDraft.summary}
                      onChange={(event) => setShiftLogDraft((prev) => ({ ...prev, summary: event.target.value }))}
                      placeholder="Shift summary"
                      className="h-20 rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={saveShiftLog}
                      className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-200"
                    >
                      {editingShiftLogId ? "Save Entry" : "Add Entry"}
                    </button>
                    {editingShiftLogId && (
                      <button
                        type="button"
                        onClick={resetShiftLogDraft}
                        className="rounded-md border border-border/40 bg-background px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-sm">
                  {shiftLogs.map((entry) => (
                    <div key={entry.id} className="rounded-md border border-border/35 bg-background/55 p-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-medium">{entry.shiftLabel} | {entry.startTime}-{entry.endTime}</p>
                        <span className="rounded-full border border-border/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          {entry.pendingEscalations} escalations
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{entry.summary}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Handoff: {entry.handoffTo}</span>
                        <span className="text-[11px] text-muted-foreground">Logged: {entry.createdAt}</span>
                        <button
                          type="button"
                          onClick={() => startEditShiftLog(entry)}
                          className="ml-auto rounded-md border border-border/40 bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeSection === "reservations" && (
              <section className="rounded-xl border border-border/35 bg-card/45 p-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Reservations</p>
                  <span className="text-xs text-muted-foreground">{reservations.length} reservations</span>
                </div>

                <div className="mt-3 rounded-md border border-border/35 bg-background/55 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {editingReservationId ? "Edit Reservation" : "Add Reservation"}
                  </p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <input
                      value={reservationDraft.amenity}
                      onChange={(event) => setReservationDraft((prev) => ({ ...prev, amenity: event.target.value }))}
                      placeholder="Amenity"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                    <input
                      value={reservationDraft.unit}
                      onChange={(event) => setReservationDraft((prev) => ({ ...prev, unit: event.target.value }))}
                      placeholder="Unit"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                    <input
                      value={reservationDraft.requestedBy}
                      onChange={(event) => setReservationDraft((prev) => ({ ...prev, requestedBy: event.target.value }))}
                      placeholder="Requested by"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                    <select
                      value={reservationDraft.status}
                      onChange={(event) =>
                        setReservationDraft((prev) => ({ ...prev, status: event.target.value as ReservationEntry["status"] }))
                      }
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </select>
                    <input
                      value={reservationDraft.startTime}
                      onChange={(event) => setReservationDraft((prev) => ({ ...prev, startTime: event.target.value }))}
                      placeholder="Start time"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                    <input
                      value={reservationDraft.endTime}
                      onChange={(event) => setReservationDraft((prev) => ({ ...prev, endTime: event.target.value }))}
                      placeholder="End time"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                    <textarea
                      value={reservationDraft.notes}
                      onChange={(event) => setReservationDraft((prev) => ({ ...prev, notes: event.target.value }))}
                      placeholder="Reservation notes"
                      className="md:col-span-2 h-20 rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={saveReservation}
                      className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-200"
                    >
                      {editingReservationId ? "Save Reservation" : "Add Reservation"}
                    </button>
                    {editingReservationId && (
                      <button
                        type="button"
                        onClick={resetReservationDraft}
                        className="rounded-md border border-border/40 bg-background px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-sm">
                  {reservations.map((entry) => (
                    <div key={entry.id} className="rounded-md border border-border/35 bg-background/55 p-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-medium">
                          {entry.startTime} - {entry.endTime} | {entry.unit} | {entry.amenity}
                        </p>
                        <span className="rounded-full border border-border/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          {entry.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Requested by: {entry.requestedBy}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{entry.notes}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Created: {entry.createdAt}</span>
                        <button
                          type="button"
                          onClick={() => startEditReservation(entry)}
                          className="ml-auto rounded-md border border-border/40 bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeSection === "parking" && (
              <section className="rounded-xl border border-border/35 bg-card/45 p-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Parking Management</p>
                  <span className="text-xs text-muted-foreground">Active sessions: {activeParkingCount}</span>
                </div>

                <div className="mt-3 rounded-md border border-border/35 bg-background/55 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Building + Visitor Policy</p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2 text-sm">
                    <div className="rounded-md border border-border/35 bg-background p-2">
                      Residents can manage parking: <strong>{parkingPolicy.residentCanManage ? "Yes" : "No"}</strong>
                    </div>

                    <div className="rounded-md border border-border/35 bg-background p-2">
                      Concierge can manage parking: <strong>{parkingPolicy.conciergeCanManage ? "Yes" : "No"}</strong>
                    </div>

                    <div className="rounded-md border border-border/35 bg-background p-2">
                      Visitor policy: <strong>{parkingPolicy.visitorPolicy.replace("_", " ")}</strong>
                    </div>

                    <div className="rounded-md border border-border/35 bg-background p-2">
                      Paid parking enabled: <strong>{parkingPolicy.paidParking ? "Yes" : "No"}</strong>
                    </div>
                  </div>

                  {parkingPolicy.paidParking && (
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      <input
                        value={parkingPolicy.paymentLink}
                        onChange={(event) => setParkingPolicy((prev) => ({ ...prev, paymentLink: event.target.value }))}
                        placeholder="Payment link"
                        className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                      />
                      <input
                        value={parkingPolicy.paymentWindow}
                        onChange={(event) => setParkingPolicy((prev) => ({ ...prev, paymentWindow: event.target.value }))}
                        placeholder="Payment timing window (e.g. 08:00-20:00)"
                        className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  )}

                  <div className="mt-2 text-xs text-muted-foreground">
                    Building + visitor policy is managed by Building Manager. Concierge handles assisted bookings when resident/visitor booking is not completed.
                  </div>
                </div>

                <div className="mt-3 rounded-md border border-border/35 bg-background/55 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {editingParkingId ? "Edit Parking Session" : "Add Parking Session"}
                  </p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <input
                      value={parkingDraft.vehiclePlate}
                      onChange={(event) => setParkingDraft((prev) => ({ ...prev, vehiclePlate: event.target.value }))}
                      placeholder="Vehicle plate"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                      disabled={!userCanManageParking}
                    />
                    <input
                      value={parkingDraft.occupantName}
                      onChange={(event) => setParkingDraft((prev) => ({ ...prev, occupantName: event.target.value }))}
                      placeholder="Resident/visitor name"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                      disabled={!userCanManageParking}
                    />
                    <input
                      value={parkingDraft.unit}
                      onChange={(event) => setParkingDraft((prev) => ({ ...prev, unit: event.target.value }))}
                      placeholder="Unit"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                      disabled={!userCanManageParking}
                    />
                    <input
                      value={parkingDraft.slot}
                      onChange={(event) => setParkingDraft((prev) => ({ ...prev, slot: event.target.value }))}
                      placeholder="Slot"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                      disabled={!userCanManageParking}
                    />
                    <input
                      value={parkingDraft.startTime}
                      onChange={(event) => setParkingDraft((prev) => ({ ...prev, startTime: event.target.value }))}
                      placeholder="Start time"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                      disabled={!userCanManageParking}
                    />
                    <input
                      value={parkingDraft.endTime}
                      onChange={(event) => setParkingDraft((prev) => ({ ...prev, endTime: event.target.value }))}
                      placeholder="End time"
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                      disabled={!userCanManageParking}
                    />
                    <select
                      value={parkingDraft.status}
                      onChange={(event) => setParkingDraft((prev) => ({ ...prev, status: event.target.value as ParkingSession["status"] }))}
                      className="rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
                      disabled={!userCanManageParking}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                    </select>
                    <label className="inline-flex items-center gap-2 rounded-md border border-border/35 bg-background px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={parkingDraft.requiresPayment}
                        onChange={(event) => setParkingDraft((prev) => ({ ...prev, requiresPayment: event.target.checked }))}
                        disabled={!userCanManageParking || !parkingPolicy.paidParking}
                      />
                      Requires payment
                    </label>
                  </div>

                  {!parkingPolicy.paidParking && (
                    <p className="mt-2 text-xs text-muted-foreground">Paid parking is disabled by building policy.</p>
                  )}

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={saveParkingSession}
                      disabled={!userCanManageParking}
                      className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-200 disabled:opacity-50"
                    >
                      {editingParkingId ? "Save Session" : "Add Session"}
                    </button>
                    {editingParkingId && (
                      <button
                        type="button"
                        onClick={resetParkingDraft}
                        className="rounded-md border border-border/40 bg-background px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-sm">
                  {parkingSessions.map((session) => (
                    <div key={session.id} className="rounded-md border border-border/35 bg-background/55 p-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-medium">{session.vehiclePlate} - {session.occupantName} ({session.unit})</p>
                        <span className="rounded-full border border-border/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          {session.status}
                        </span>
                        <span className="rounded-full border border-border/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          {session.createdBy === "concierge_assist" ? "concierge assisted" : session.createdBy}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Slot {session.slot} | {session.startTime} {"->"} {session.endTime}
                      </p>

                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {session.requiresPayment ? (
                          <>
                            <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${session.paid ? "border-emerald-500/30 text-emerald-300" : "border-amber-500/30 text-amber-300"}`}>
                              {session.paid ? "paid" : "payment pending"}
                            </span>
                            <a
                              href={parkingPolicy.paymentLink || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-md border border-sky-500/35 bg-sky-500/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-sky-200"
                            >
                              Payment Link
                            </a>
                            <span className="text-[11px] text-muted-foreground">Window: {parkingPolicy.paymentWindow || "N/A"}</span>
                            {!session.paid && (
                              <button
                                type="button"
                                onClick={() => markParkingPaid(session.id)}
                                disabled={!canEditParkingSession(session)}
                                className="rounded-md border border-emerald-500/35 bg-emerald-500/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-200 disabled:opacity-50"
                              >
                                Mark Paid
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">No payment required</span>
                        )}

                        <button
                          type="button"
                          onClick={() => startEditParking(session)}
                          disabled={!canEditParkingSession(session)}
                          className="ml-auto rounded-md border border-border/40 bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground disabled:opacity-50"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
