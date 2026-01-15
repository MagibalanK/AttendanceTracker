import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Dashboard } from "./components/Dashboard";
import { CalendarWeeklyView } from "./components/CalendarView";
import Analytics from "./components/Analytics";
import { AddCourseDialog } from "./components/AddCourseDialog";
import { ImportCoursesDialog } from "./components/ImportCoursesDialog";
import supabase from "./supabaseClient";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { addDays, format } from "date-fns";
import { Button } from "./components/ui/button";
import { Moon, Sun, User, Plus } from "lucide-react";
import { AddCompensationDialog } from "./components/AddCompenstation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, } from "./components/ui/dropdown-menu";
import { Toaster } from "./components/ui/sonner";
const WEEKDAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];
export default function App() {
    const [showCompDialog, setShowCompDialog] = useState(false);
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();
    const { signOutUser } = useAuth();
    /* ================= STATE ================= */
    const [userName, setUserName] = useState("Guest");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [courses, setCourses] = useState([]);
    const [records, setRecords] = useState([]);
    const [currentView, setCurrentView] = useState("dashboard");
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [showAddCourseDialog, setShowAddCourseDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    function deriveAttendanceStats(records) {
        const conducted = records.filter(r => r.status === "present" || r.status === "absent");
        const attended = conducted.filter(r => r.status === "present");
        return {
            totalClasses: conducted.length,
            attendedClasses: attended.length,
        };
    }
    const { totalClasses, attendedClasses } = deriveAttendanceStats(records);
    /* ================= AUTH ================= */
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUserName(data.user?.user_metadata?.name ?? "Guest");
        });
    }, []);
    /* ================= THEME ================= */
    useEffect(() => {
        const saved = localStorage.getItem("attendanceTheme");
        if (saved)
            setIsDarkMode(saved === "dark");
    }, []);
    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDarkMode);
        localStorage.setItem("attendanceTheme", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);
    const handleWeekChange = (weekStart) => {
        ensureAttendanceForWeek(weekStart);
    };
    /* ================= LOAD DATA ================= */
    const handleAddCompensation = async (courseId, date, sessions, status) => {
        const { data: { user }, } = await supabase.auth.getUser();
        if (!user)
            return;
        const newRecords = Array.from({ length: sessions }).map(() => ({
            id: crypto.randomUUID(),
            courseId,
            date,
            status,
            userId: user.id,
        }));
        await supabase.from("attendanceRecords").insert(newRecords);
        setRecords((prev) => [...prev, ...newRecords]);
    };
    useEffect(() => {
        const loadData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user)
                return;
            const { data: courseData } = await supabase
                .from("courses")
                .select("*")
                .eq("userId", user.id);
            const { data: recordData } = await supabase
                .from("attendanceRecords")
                .select("*")
                .eq("userId", user.id);
            setCourses(courseData ?? []);
            setRecords(recordData ?? []);
        };
        loadData();
    }, []);
    /* ================= ATTENDANCE GENERATION ================= */
    const ensureAttendanceForWeek = async (weekStart) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user)
            return;
        const newRecords = [];
        courses.forEach((course) => {
            for (let i = 0; i < 7; i++) {
                const date = addDays(weekStart, i);
                const dayName = WEEKDAYS[date.getDay()];
                const dateStr = format(date, "yyyy-MM-dd");
                const scheduled = course.classTimes.some((ct) => ct.day === dayName);
                const exists = records.some((r) => r.courseId === course.id && r.date === dateStr);
                if (scheduled && !exists) {
                    newRecords.push({
                        id: crypto.randomUUID(),
                        courseId: course.id,
                        date: dateStr,
                        status: "nodata",
                    });
                }
            }
        });
        if (newRecords.length > 0) {
            await supabase.from("attendanceRecords").insert(newRecords.map((r) => ({ ...r, userId: user.id })));
            setRecords((prev) => [...prev, ...newRecords]);
        }
    };
    /* ================= HANDLERS ================= */
    const handleToggleAttendance = async (recordId) => {
        const record = records.find((r) => r.id === recordId);
        if (!record)
            return;
        const next = record.status === "nodata"
            ? "present"
            : record.status === "present"
                ? "absent"
                : "nodata";
        await supabase
            .from("attendanceRecords")
            .update({ status: next })
            .eq("id", recordId);
        setRecords((prev) => prev.map((r) => r.id === recordId ? { ...r, status: next } : r));
    };
    const handleViewCourse = (courseId) => {
        setSelectedCourseId(courseId);
        setCurrentView("course");
    };
    const handleSaveCourse = async (course) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user)
            return;
        if ("id" in course) {
            await supabase
                .from("courses")
                .update({
                name: course.name,
                color: course.color,
                classTimes: course.classTimes,
            })
                .eq("id", course.id)
                .eq("userId", user.id);
            setCourses((prev) => prev.map((c) => (c.id === course.id ? course : c)));
        }
        else {
            const newCourse = {
                id: crypto.randomUUID(),
                userId: user.id,
                ...course,
            };
            await supabase.from("courses").insert(newCourse);
            setCourses((prev) => [...prev, newCourse]);
        }
        setEditingCourse(null);
        setShowAddCourseDialog(false);
    };
    const handleDeleteCourse = async (courseId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user)
            return;
        await supabase
            .from("attendanceRecords")
            .delete()
            .eq("courseId", courseId)
            .eq("userId", user.id);
        await supabase
            .from("courses")
            .delete()
            .eq("id", courseId)
            .eq("userId", user.id);
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
        setRecords((prev) => prev.filter((r) => r.courseId !== courseId));
        if (selectedCourseId === courseId) {
            setSelectedCourseId(null);
            setCurrentView("dashboard");
        }
    };
    const handleImportCourses = async (imported) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user)
            return;
        const rows = imported.map((c) => ({
            ...c,
            id: crypto.randomUUID(),
            userId: user.id,
        }));
        await supabase.from("courses").insert(rows);
        setCourses((prev) => [...prev, ...rows]);
        setShowImportDialog(false);
    };
    const handleLogout = async () => {
        await signOutUser();
        navigate("/");
    };
    const selectedCourse = courses.find((c) => c.id === selectedCourseId);
    /* ================= RENDER ================= */
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors", children: [_jsx(Toaster, {}), _jsx("nav", { className: "sticky top-0 z-50 border-b bg-white dark:bg-gray-800 shadow-sm h-[100px]", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-3 flex items-center justify-between", children: [_jsxs("button", { onClick: () => currentView !== "dashboard" && setCurrentView("dashboard"), className: "flex items-center gap-2", children: [currentView !== "dashboard" && (_jsx("span", { className: "text-sm opacity-70", children: "\u2190 Back" })), _jsx("img", { src: isDarkMode ? "/darkcar.png" : "/lightcar.png", className: "h-10 w-10", alt: "navigation" })] }), _jsx("h1", { className: "text-lg text-gray-800 dark:text-gray-100", children: "Attendance Tracker" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Button, { size: "icon", onClick: () => setShowImportDialog(true), className: "rounded-full bg-indigo-600 hover:bg-indigo-700 text-white", children: _jsx(Plus, { size: 20, className: isDarkMode ? "text-white" : "text-gray-900" }) }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "icon", children: _jsx(User, { size: 20 }) }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsx(DropdownMenuLabel, { children: userName }), _jsx(DropdownMenuItem, { onClick: handleLogout, children: "Log out" })] })] }), _jsx(Button, { size: "icon", variant: "ghost", onClick: () => setIsDarkMode((d) => !d), children: isDarkMode ? _jsx(Sun, { size: 20 }) : _jsx(Moon, { size: 20 }) })] })] }) }), _jsxs("main", { className: "max-w-7xl mx-auto p-6", children: [currentView === "dashboard" && (_jsx(Dashboard, { courses: courses, records: records, onAddCourse: () => setShowAddCourseDialog(true), onViewCalendar: () => setCurrentView("calendar"), onViewAnalytics: () => setCurrentView("analytics"), onViewCourse: handleViewCourse, onEditCourse: (course) => {
                            setEditingCourse(course);
                            setShowAddCourseDialog(true);
                        }, onDeleteCourse: handleDeleteCourse })), currentView === "calendar" && (_jsx(CalendarWeeklyView, { courses: courses, records: records, onToggleAttendance: handleToggleAttendance, onWeekChange: handleWeekChange, onAddCompensation: () => setShowCompDialog(true) })), currentView === "course" && selectedCourse && (_jsx(Analytics, { totalClasse: records.filter(r => r.courseId === selectedCourse.id).reduce((count, r) => {
                            if (r.status === "present" || r.status === "absent") {
                                return count + 1;
                            }
                            return count;
                        }, 0), attendedClasse: records
                            .filter(r => r.courseId === selectedCourse.id)
                            .reduce((count, r) => {
                            if (r.status === "present") {
                                return count + 1;
                            }
                            return count;
                        }, 0) }))] }), _jsx(AddCourseDialog, { open: showAddCourseDialog, onOpenChange: setShowAddCourseDialog, onSave: handleSaveCourse, editCourse: editingCourse }), _jsx(AddCompensationDialog, { open: showCompDialog, onOpenChange: setShowCompDialog, courses: courses, onSubmit: handleAddCompensation }), _jsx(ImportCoursesDialog, { open: showImportDialog, onOpenChange: setShowImportDialog, onImport: handleImportCourses }), _jsx("footer", { style: {
                    marginTop: "3rem",
                    padding: "1.5rem 0",
                    borderTop: "1px solid var(--border)",
                    color: "var(--muted-foreground)",
                }, children: _jsxs("div", { style: {
                        maxWidth: "1280px",
                        margin: "0 auto",
                        padding: "0 1.5rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                        alignItems: "center",
                        textAlign: "center",
                    }, children: [_jsx("p", { style: { fontSize: "0.875rem", margin: 0 }, children: "Found a bug or have feedback? Lemme know." }), _jsxs("div", { style: {
                                display: "flex",
                                gap: "1rem",
                                fontSize: "0.75rem",
                            }, children: [_jsx("a", { href: "https://github.com/WhyDeezz", target: "_blank", rel: "noopener noreferrer", style: { color: "inherit", textDecoration: "none" }, children: "GitHub" }), _jsx("span", { children: "\u2022" }), _jsx("a", { href: "https://www.linkedin.com/in/vaithiesh-jayasankar-2b2586376/", target: "_blank", rel: "noopener noreferrer", style: { color: "inherit", textDecoration: "none" }, children: "LinkedIn" }), _jsx("span", { children: "\u2022" }), _jsx("a", { href: "https://www.instagram.com/why_deezz/", target: "_blank", rel: "noopener noreferrer", style: { color: "inherit", textDecoration: "none" }, children: "Instagram" }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["\u00A9 ", new Date().getFullYear()] })] })] }) })] }));
}
