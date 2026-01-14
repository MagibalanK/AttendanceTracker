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
    onAddCompensation: () => void;
}
export declare function CalendarWeeklyView({ courses, records, onToggleAttendance, onWeekChange, onAddCompensation, }: CalendarWeeklyViewProps): import("react/jsx-runtime").JSX.Element;
export {};
