import {
  Calendar,
  CheckCircle2,
  XCircle,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { Card } from "./ui/card";

interface AttendanceStatsProps {
  total: number;
  attended: number;
  missed: number;
  bunksLeft: number;
  toRecover: number;
}

export function AttendanceStats({
  total,
  attended,
  missed,
  bunksLeft,
  toRecover,
}: AttendanceStatsProps) {
  return (
    <>
      {/* TOP STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Calendar />}
          label="Total Classes"
          value={total}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle2 />}
          label="Attended"
          value={attended}
          color="green"
        />
        <StatCard
          icon={<XCircle />}
          label="Missed"
          value={missed}
          color="red"
        />
      </div>

      {/* BOTTOM CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {/* Bunks Left */}
        <Card className="p-5 rounded-2xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Bunks Left</p>
              <p className="text-3xl font-semibold">{bunksLeft}</p>
              <p className="text-xs text-gray-400 mt-1">Safe skips</p>
            </div>
            <Shield className="h-5 w-5 text-gray-400" />
          </div>
        </Card>

        {/* To Recover */}
        <Card className="p-5 rounded-2xl bg-red-50 border-red-200 dark:bg-red-900/20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-red-600">To Recover</p>
              <p className="text-3xl font-semibold text-red-700">
                {toRecover}
              </p>
              <p className="text-xs text-red-500 mt-1">Attend next</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
        </Card>
      </div>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "green" | "red";
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/40",
    green: "bg-green-100 text-green-600 dark:bg-green-900/40",
    red: "bg-red-100 text-red-600 dark:bg-red-900/40",
  };

  return (
    <Card className="p-5 rounded-2xl">
      <div className="flex items-center gap-4">
        <div
          className={`h-11 w-11 rounded-xl flex items-center justify-center ${colors[color]}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </Card>
  );
}
