"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

// Dummy API fetch simulation
type Equipment = {
  id: number;
  name: string;
  health: number;
  status: string;
};

async function fetchEquipment() {
  // Replace with real API call
  return [
    { id: 1, name: "Boiler", health: 98, status: "Operational" },
    { id: 2, name: "Elevator", health: 70, status: "Maintenance Due" },
    { id: 3, name: "Generator", health: 100, status: "Operational" },
  ];
}

export default function EquipmentHealthPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquipment().then(data => {
      setEquipment(data);
      setLoading(false);
    });
  }, []);

  return (
    <section className="mt-6 bg-background rounded-lg shadow-sm p-6">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-semibold">Equipment Health</span>
      </nav>
      <h1 className="text-2xl font-bold mb-4">Equipment Health</h1>
      {loading ? (
        <div className="text-muted-foreground">Loading equipment data...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Health (%)</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((eq) => (
                <tr key={eq.id} className="border-t">
                  <td className="p-2">{eq.name}</td>
                  <td className="p-2">{eq.health}%</td>
                  <td className="p-2">{eq.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
