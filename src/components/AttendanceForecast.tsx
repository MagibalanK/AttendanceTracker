import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card } from "./ui/card";

interface ForecastProps {
  data: { class: number; percentage: number }[];
  target: number;
}

export function AttendanceForecast({ data, target }: ForecastProps) {
  return (
    <Card className="p-6 rounded-2xl">
      <div className="mb-4">
        <h3 className="font-semibold text-lg">Forecast</h3>
        <p className="text-sm text-gray-500">
          Projection for the next 10 classes
        </p>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis dataKey="class" />
            <YAxis domain={[60, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => `${v}%`} />
            <ReferenceLine
              y={target}
              stroke="#888"
              strokeDasharray="6 6"
              label={{ value: `GOAL ${target}%`, position: "right" }}
            />
            <Line
              type="monotone"
              dataKey="percentage"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
