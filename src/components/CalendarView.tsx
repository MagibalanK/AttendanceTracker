import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  format,
  startOfWeek,
  addDays,
  subWeeks,
  addWeeks,
} from "date-fns";

/* ================= TYPES ================= */

interface Course {
  id: string;
  name: string;
  color: string;
}

interface AttendanceRecord {
  id: string;
  courseId: string;
  date: string;
  status: "present" | "absent" | "nodata";
}

interface CalendarWeeklyViewProps {
  courses: Course[];
  records: AttendanceRecord[];
  onToggleAttendance: (recordId: string) => void;
  onWeekChange: (weekStart: Date) => void;
  onAddCompensation: () => void; // ✅ NEW (callback only)
}

/* ================= COMPONENT ================= */

export function CalendarWeeklyView({
  courses,
  records,
  onToggleAttendance,
  onWeekChange,
  onAddCompensation,
}: CalendarWeeklyViewProps) {
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  useEffect(() => {
    onWeekChange(selectedWeekStart);
  }, [selectedWeekStart, onWeekChange]);

  const getWeekDates = () =>
    Array.from({ length: 7 }).map((_, i) =>
      addDays(selectedWeekStart, i)
    );

  const getRecord = (courseId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return records.find(
      (r) => r.courseId === courseId && r.date === dateStr
    );
  };

  const getStatusIcon = (status: AttendanceRecord["status"]) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "nodata":
        return <HelpCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: AttendanceRecord["status"]) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "absent":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      case "nodata":
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const goToPreviousWeek = () =>
    setSelectedWeekStart((prev) => subWeeks(prev, 1));

  const goToNextWeek = () =>
    setSelectedWeekStart((prev) => addWeeks(prev, 1));

  return (
    <div className="space-y-6 text-sm sm:text-base">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-lg sm:text-xl font-semibold">
          Weekly Timetable
        </h1>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddCompensation}
          >
            Add Compensation Class
          </Button>

          <Button size="icon" variant="ghost" onClick={goToPreviousWeek}>
            <ChevronLeft />
          </Button>

          <span className="text-gray-600 dark:text-gray-400 font-medium">
            {format(selectedWeekStart, "MMM d")} –{" "}
            {format(addDays(selectedWeekStart, 6), "MMM d, yyyy")}
          </span>

          <Button size="icon" variant="ghost" onClick={goToNextWeek}>
            <ChevronRight />
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-x-auto rounded-2xl shadow-sm">
        <table className="w-full border-collapse text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="w-1/6 border p-2 sticky left-0 bg-white dark:bg-gray-900">
                Course
              </th>
              {getWeekDates().map((date, i) => {
                const isWeekend = i >= 5;
                return (
                  <th
                    key={date.toISOString()}
                    className={`border p-2 text-center ${
                      isWeekend ? "hidden sm:table-cell" : ""
                    }`}
                  >
                    {format(date, "EEE dd/MM")}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td className="border p-2 flex items-center gap-2 sticky left-0 bg-white dark:bg-gray-900">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: course.color }}
                  />
                  <span className="truncate">{course.name}</span>
                </td>

                {getWeekDates().map((date, i) => {
                  const isWeekend = i >= 5;
                  const record = getRecord(course.id, date);

                  return (
                    <td
                      key={date.toISOString()}
                      className={`border p-1 text-center ${
                        isWeekend ? "hidden sm:table-cell" : ""
                      }`}
                    >
                      {record ? (
                        <button
                          onClick={() =>
                            onToggleAttendance(record.id)
                          }
                          className={`flex items-center justify-center w-full px-2 py-1 rounded ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {getStatusIcon(record.status)}
                        </button>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
