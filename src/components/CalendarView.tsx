import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
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

interface ClassTime {
  day: string;
  sessions: number;
}

interface Course {
  id: string;
  name: string;
  color: string;
  classTimes: ClassTime[];
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
  onToggleAttendance: (recordId: string, isCompensation?: boolean) => void;
  onWeekChange: (weekStart: Date) => void;
  onAddCompensation: () => void;
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

  const getRecords = (courseId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return records.filter(
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
    setSelectedWeekStart((prev: Date) => subWeeks(prev, 1));

  const goToNextWeek = () =>
    setSelectedWeekStart((prev: Date) => addWeeks(prev, 1));

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
                  const dayName = format(date, "EEEE");
                  const scheduledSessions = course.classTimes.find(ct => ct.day === dayName)?.sessions || 0;
                  const dayRecords = getRecords(course.id, date);
                  const totalSessions = Math.max(scheduledSessions, dayRecords.length);
                  const presentSessions = dayRecords.filter(r => r.status === "present").length;

                  return (
                    <td
                      key={date.toISOString()}
                      className={`border p-1 text-center ${
                        isWeekend ? "hidden sm:table-cell" : ""
                      }`}
                    >
                      {totalSessions === 0 || dayRecords.length === 0 ? (
                        <span className="text-gray-300">—</span>
                      ) : totalSessions === 1 && dayRecords.length === 1 ? (
                        <button
                          onClick={() => onToggleAttendance(dayRecords[0].id, false)}
                          className={`flex items-center justify-center w-full px-2 py-1 rounded ${getStatusColor(
                            dayRecords[0].status
                          )}`}
                        >
                          {getStatusIcon(dayRecords[0].status)}
                        </button>
                      ) : (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className={`relative overflow-hidden flex items-center justify-center w-full px-2 py-1 rounded text-xs sm:text-sm font-medium transition-colors hover:opacity-90 ${
                              presentSessions === dayRecords.length && dayRecords.length > 0
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800"
                                : "text-gray-700 dark:text-gray-300"
                            }`}>
                              {presentSessions !== dayRecords.length && (
                                <div className="absolute inset-0 flex z-0">
                                  {dayRecords.map((r) => (
                                    <div key={r.id} className={`flex-1 opacity-80 ${
                                      r.status === 'present' ? 'bg-green-100 dark:bg-green-900' :
                                      r.status === 'absent' ? 'bg-red-100 dark:bg-red-900' :
                                      'bg-gray-100 dark:bg-gray-800'
                                    }`} />
                                  ))}
                                </div>
                              )}
                              <span className="relative z-10">
                                {presentSessions}/{dayRecords.length}
                              </span>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-2 flex flex-col gap-2">
                            <div className="text-sm font-semibold mb-1 text-center">
                              {format(date, "EEE dd/MM")} - {course.name}
                            </div>
                            {dayRecords.map((record, idx) => {
                              const isCompensation = idx >= scheduledSessions;
                              return (
                                <button
                                  key={record.id}
                                  onClick={() => onToggleAttendance(record.id, isCompensation)}
                                  className={`flex items-center justify-between w-full px-3 py-2 rounded text-sm transition-opacity hover:opacity-80 ${getStatusColor(
                                    record.status
                                  )}`}
                                >
                                  <span>{isCompensation ? "Compensation" : `Session ${idx + 1}`}</span>
                                  {getStatusIcon(record.status)}
                                </button>
                              );
                            })}
                          </PopoverContent>
                        </Popover>
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
