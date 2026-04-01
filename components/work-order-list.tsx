import React from "react";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";

export interface WorkOrder {
  id: number;
  issue: string;
  unit: string;
  status: string;
  vendor: string;
  priority?: string;
  submitted?: string;
}

interface WorkOrderListProps {
  orders: WorkOrder[];
  onNew?: () => void;
}

export const WorkOrderList: React.FC<WorkOrderListProps> = ({ orders, onNew }) => {
  if (!orders.length) {
    return (
      <Empty>
        <div className="mb-2 font-mono text-base text-muted-foreground">No work orders yet.</div>
        {onNew && (
          <Button variant="default" onClick={onNew}>
            + New Work Order
          </Button>
        )}
      </Empty>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border">
        <thead>
          <tr className="bg-muted">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Issue</th>
            <th className="p-2 text-left">Unit</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Vendor</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="border-t">
              <td className="p-2">{order.id}</td>
              <td className="p-2">{order.issue}</td>
              <td className="p-2">{order.unit}</td>
              <td className="p-2">{order.status}</td>
              <td className="p-2">{order.vendor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
