import { useState, useEffect, useRef, useCallback } from "react";
import { Dashboard } from "./components/Dashboard";
import { CalendarWeeklyView } from "./components/CalendarView";
import Analytics from "./components/Analytics"
import { AddCourseDialog } from "./components/AddCourseDialog";
import { ImportCoursesDialog } from "./components/ImportCoursesDialog";
import supabase from "./supabaseClient";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { startOfWeek, addDays, format } from "date-fns";
import { Button } from "./components/ui/button";
import { Moon, Sun, User, Plus } from "lucide-react";
import { AddCompensationDialog } from "./components/AddCompenstation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { Toaster } from "./components/ui/sonner";

/* ================= TYPES ================= */

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

type View = "dashboard" | "course" | "calendar" | "analytics";

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

  const [courses, setCourses] = useState<Course[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  
  
  function deriveAttendanceStats(
  records: AttendanceRecord[]
): { totalClasses: number; attendedClasses: number } {
  const conducted = records.filter(
    r => r.status === "present" || r.status === "absent"
  );

  const attended = conducted.filter(r => r.status === "present");

  return {
    totalClasses: conducted.length,
    attendedClasses: attended.length,
  };
}
const { totalClasses, attendedClasses } =
  deriveAttendanceStats(records);


  /* ================= AUTH ================= */

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserName(data.user?.user_metadata?.name ?? "Guest");
    });
  }, []);

  /* ================= THEME ================= */

  useEffect(() => {
    const saved = localStorage.getItem("attendanceTheme");
    if (saved) setIsDarkMode(saved === "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("attendanceTheme", isDarkMode ? "dark" : "light");
  
  }, [isDarkMode]);



  /* ================= LOAD DATA ================= */


const handleAddCompensation = async (
  courseId: string,
  date: string,
  sessions: number,
  status: "present" | "absent"
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

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
      if (!user) return;

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

  const isGeneratingRef = useRef(false);

  const ensureAttendanceForWeek = useCallback(async (weekStart: Date) => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newRecords: AttendanceRecord[] = [];

      // We need to use the LATEST state, not the closure state if possible,
      // but since we rely on `courses` and `records` from closure, we'll
      // at least prevent concurrent strict-mode execution.
      courses.forEach((course) => {
      for (let i = 0; i < 7; i++) {
        const date = addDays(weekStart, i);
        const dayName = WEEKDAYS[date.getDay()];
        const dateStr = format(date, "yyyy-MM-dd");

        const scheduledCT = course.classTimes.find(
          (ct) => ct.day === dayName
        );

        if (scheduledCT) {
          const existingCount = records.filter(
            (r) => r.courseId === course.id && r.date === dateStr
          ).length;

          const toAdd = scheduledCT.sessions - existingCount;

          for (let j = 0; j < toAdd; j++) {
            newRecords.push({
              id: crypto.randomUUID(),
              courseId: course.id,
              date: dateStr,
              status: "nodata",
            });
          }
        }
      }
    });

      if (newRecords.length > 0) {
        const { error } = await supabase.from("attendanceRecords").insert(
          newRecords.map((r) => ({ ...r, userId: user.id }))
        );
        if (error) {
          console.error("Error generating attendance records:", error);
          toast.error("Failed to generate attendance records: " + error.message);
          return;
        }
        setRecords((prev) => [...prev, ...newRecords]);
      }
    } finally {
      isGeneratingRef.current = false;
    }
  }, [courses, records]);

  const handleWeekChange = useCallback((weekStart: Date) => {
    ensureAttendanceForWeek(weekStart);
  }, [ensureAttendanceForWeek]);

  /* ================= HANDLERS ================= */

  const handleToggleAttendance = async (recordId: string, isCompensation?: boolean) => {
    const record = records.find((r) => r.id === recordId);
    if (!record) return;

    const next =
      record.status === "nodata"
        ? "present"
        : record.status === "present"
        ? "absent"
        : isCompensation
        ? "delete"
        : "nodata";

    if (next === "delete") {
      const { error } = await supabase.from("attendanceRecords").delete().eq("id", recordId);
      if (error) {
        console.error("Error deleting attendance record:", error);
        toast.error("Failed to delete record: " + error.message);
        return;
      }
      setRecords((prev) => prev.filter((r) => r.id !== recordId));
      return;
    }

    const { error } = await supabase
      .from("attendanceRecords")
      .update({ status: next })
      .eq("id", recordId);

    if (error) {
      console.error("Error updating attendance record:", error);
      toast.error("Failed to update record: " + error.message);
      return;
    }

    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId ? { ...r, status: next } : r
      )
    );
  };

  const handleViewCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView("course");
  };

  const handleSaveCourse = async (
    course: Course | Omit<Course, "id">
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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

      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? course : c))
      );
    } else {
      const newCourse: Course & { userId: string } = {
        id: crypto.randomUUID(),
        userId: user.id,
        ...course,
      };

      const { error } = await supabase.from("courses").insert(newCourse);
      if (error) {
        console.error("Error saving course:", error);
        toast.error("Failed to save course: " + error.message);
        return;
      }
      setCourses((prev) => [...prev, newCourse]);
    }

    setEditingCourse(null);
    setShowAddCourseDialog(false);
  };

  const handleDeleteCourse = async (courseId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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

  const handleImportCourses = async (imported: Course[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Toaster />

      <nav className="sticky top-0 z-50 border-b bg-white dark:bg-gray-800 shadow-sm h-[100px]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
<button
  onClick={() => currentView !== "dashboard" && setCurrentView("dashboard")}
  className="flex items-center gap-2"
>
  {currentView !== "dashboard" && (
    <span className="text-sm opacity-70">← Back</span>
  )}
  <img
    src={isDarkMode ? "/darkcar.png" : "/lightcar.png"}
    className="h-10 w-10"
    alt="navigation"
  />
</button>


          <h1 className="text-lg text-gray-800 dark:text-gray-100">
            Attendance Tracker
          </h1>

          <div className="flex items-center gap-3">
            <Button
              size="icon"
              onClick={() => setShowImportDialog(true)}
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus
  size={20}
  className={isDarkMode ? "text-white" : "text-gray-900"}
/>

            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User size={20}/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{userName}</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsDarkMode((d) => !d)}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {currentView === "dashboard" && (
          <Dashboard
            courses={courses}
            records={records}
            onAddCourse={() => setShowAddCourseDialog(true)}
            onViewCalendar={() => setCurrentView("calendar")}
            onViewAnalytics={() => setCurrentView("analytics")}
            onViewCourse={handleViewCourse}
            onEditCourse={(course) => {
              setEditingCourse(course);
              setShowAddCourseDialog(true);
            }}
            onDeleteCourse={handleDeleteCourse}
          />
        )}

        {currentView === "calendar" && (
<CalendarWeeklyView
  courses={courses}
  records={records}
  onToggleAttendance={handleToggleAttendance}
  onWeekChange={handleWeekChange}
  onAddCompensation={() => setShowCompDialog(true)}
/>

        )}

        {currentView === "course" && selectedCourse && (
    
<Analytics
  totalClasse={records.filter(r => r.courseId === selectedCourse.id).reduce((count, r) => {
      if (r.status === "present" || r.status === "absent") {
        return count + 1;
      }
      return count;
    }, 0)}
attendedClasse={
  records
    .filter(r => r.courseId === selectedCourse.id)
    .reduce((count, r) => {
      if (r.status === "present") {
        return count + 1;
      }
      return count;
    }, 0)
}

/>
        )}
      </main>

      <AddCourseDialog
        open={showAddCourseDialog}
        onOpenChange={setShowAddCourseDialog}
        onSave={handleSaveCourse}
        editCourse={editingCourse}
      />
    
<AddCompensationDialog
  open={showCompDialog}
  onOpenChange={setShowCompDialog}
  courses={courses}
  onSubmit={handleAddCompensation}
/>

      <ImportCoursesDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={handleImportCourses}
      />
<footer
  style={{
    marginTop: "3rem",
    padding: "1.5rem 0",
    borderTop: "1px solid var(--border)",
    color: "var(--muted-foreground)",
  }}
>
  <div
    style={{
      maxWidth: "1280px",
      margin: "0 auto",
      padding: "0 1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      alignItems: "center",
      textAlign: "center",
    }}
  >
<p style={{ fontSize: "0.875rem", margin: 0 }}>
Found a bug or have feedback? Lemme know.
</p>

    <div
      style={{
        display: "flex",
        gap: "1rem",
        fontSize: "0.75rem",
      }}
    >
      <a
        href="https://github.com/WhyDeezz"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "inherit", textDecoration: "none" }}
      >
        GitHub
      </a>
      <span>•</span>
      <a
        href="https://www.linkedin.com/in/vaithiesh-jayasankar-2b2586376/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "inherit", textDecoration: "none" }}
      >
        LinkedIn
      </a>
      <span>•</span>
      <a
        href="https://www.instagram.com/why_deezz/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "inherit", textDecoration: "none" }}
      >
        Instagram
      </a>
      <span>•</span>
      <span>© {new Date().getFullYear()}</span>
    </div>

  </div>

</footer>

    </div>

  );
}
