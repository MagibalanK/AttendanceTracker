import { useState, useEffect, useRef, useCallback } from "react";
import { Dashboard } from "./components/Dashboard";
import { CalendarWeeklyView } from "./components/CalendarView";
import Analytics from "./components/Analytics";
import { AddCourseDialog } from "./components/AddCourseDialog";
import { ImportCoursesDialog } from "./components/ImportCoursesDialog";
import { Semester } from "./components/SemesterSelector";
import supabase from "./supabaseClient";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { addDays, format } from "date-fns";
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
import { toast } from "sonner";

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
  targetPercentage: number;
  semesterId?: string | null;
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

  const navigate = useNavigate();
  const { signOutUser } = useAuth();

  /* ================= STATE ================= */

  const [userName, setUserName] = useState("Guest");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Semesters
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [activeSemesterId, setActiveSemesterId] = useState<string | null>(null);

  // Courses & Records
  const [courses, setCourses] = useState<Course[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ================= FILTERED DATA (BY SEMESTER) ================= */

  const displayedCourses = courses.filter((c) => {
    if (!activeSemesterId) return true;
    return (c.semesterId || semesters[0]?.id) === activeSemesterId;
  });

  const displayedCourseIds = new Set(displayedCourses.map((c) => c.id));

  const displayedRecords = records.filter((r) =>
    displayedCourseIds.has(r.courseId),
  );

  function deriveAttendanceStats(recs: AttendanceRecord[]): {
    totalClasses: number;
    attendedClasses: number;
  } {
    const conducted = recs.filter(
      (r) => r.status === "present" || r.status === "absent",
    );

    const attended = conducted.filter((r) => r.status === "present");

    return {
      totalClasses: conducted.length,
      attendedClasses: attended.length,
    };
  }
  const { totalClasses, attendedClasses } = deriveAttendanceStats(displayedRecords);

  /* ================= AUTH ================= */

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        navigate("/");
        return;
      }
      setUserName(data.user?.user_metadata?.name ?? "Guest");
    });
  }, [navigate]);

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

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch semesters
      const { data: semesterData, error: semesterError } = await supabase
        .from("semesters")
        .select("*")
        .eq("userId", user.id)
        .order("created_at", { ascending: false });

      let currentSemesters: Semester[] = semesterData ?? [];

      if (semesterError) {
        console.error("Error fetching semesters:", semesterError);
      }

      // If no semesters exist yet, create a default semester
      if (currentSemesters.length === 0) {
        const defaultSem: Semester = {
          id: crypto.randomUUID(),
          name: "default",
          userId: user.id,
        };
        const { data: insertedSem } = await supabase
          .from("semesters")
          .insert(defaultSem)
          .select()
          .single();

        currentSemesters = [insertedSem ?? defaultSem];
      }

      // Determine active semester
      const savedActiveId = localStorage.getItem(`activeSemester_${user.id}`);
      const defaultActiveId =
        savedActiveId && currentSemesters.some((s) => s.id === savedActiveId)
          ? savedActiveId
          : currentSemesters[0].id;

      setSemesters(currentSemesters);
      setActiveSemesterId(defaultActiveId);

      // 2. Fetch courses & records
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("userId", user.id);

      let loadedCourses: Course[] = courseData ?? [];

      // If any existing course is missing semesterId, assign it to the default semester
      const defaultSemId = currentSemesters[0].id;
      const coursesWithoutSem = loadedCourses.filter((c) => !c.semesterId);
      if (coursesWithoutSem.length > 0) {
        await supabase
          .from("courses")
          .update({ semesterId: defaultSemId })
          .eq("userId", user.id)
          .is("semesterId", null);

        loadedCourses = loadedCourses.map((c) =>
          c.semesterId ? c : { ...c, semesterId: defaultSemId },
        );
      }

      const { data: recordData } = await supabase
        .from("attendanceRecords")
        .select("*")
        .eq("userId", user.id);

      setCourses(loadedCourses);
      setRecords(recordData ?? []);
      setIsLoading(false);
    };

    loadData();
  }, []);

  /* ================= SEMESTER HANDLERS ================= */

  const handleSelectSemester = (id: string) => {
    setActiveSemesterId(id);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        localStorage.setItem(`activeSemester_${user.id}`, id);
      }
    });

    // If currently viewing a course that doesn't belong to the new semester, go back to dashboard
    if (currentView === "course" && selectedCourseId) {
      const courseInNewSem = courses.some(
        (c) => c.id === selectedCourseId && (c.semesterId || semesters[0]?.id) === id,
      );
      if (!courseInNewSem) {
        setSelectedCourseId(null);
        setCurrentView("dashboard");
      }
    }
  };

  const handleCreateSemester = async (name: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const newSem: Semester = {
      id: crypto.randomUUID(),
      name,
      userId: user.id,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("semesters").insert(newSem);
    if (error) {
      console.error("Error creating semester:", error);
      toast.error("Failed to create semester folder: " + error.message);
      return;
    }

    setSemesters((prev) => [newSem, ...prev]);
    handleSelectSemester(newSem.id);
    toast.success(`Created folder "${name}"`);
  };

  const handleRenameSemester = async (id: string, newName: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("semesters")
      .update({ name: newName })
      .eq("id", id)
      .eq("userId", user.id);

    if (error) {
      console.error("Error renaming semester:", error);
      toast.error("Failed to rename semester folder: " + error.message);
      return;
    }

    setSemesters((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s)),
    );
    toast.success(`Renamed folder to "${newName}"`);
  };

  const handleDeleteSemester = async (id: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const semesterToDelete = semesters.find((s) => s.id === id);
    if (!semesterToDelete) return;

    // Delete semester from Supabase (cascades to courses in Postgres)
    const { error } = await supabase
      .from("semesters")
      .delete()
      .eq("id", id)
      .eq("userId", user.id);

    if (error) {
      console.error("Error deleting semester:", error);
      toast.error("Failed to delete semester folder: " + error.message);
      return;
    }

    // Courses belonging to the deleted semester
    const deletedCourseIds = courses
      .filter((c) => (c.semesterId || semesters[0]?.id) === id)
      .map((c) => c.id);

    setCourses((prev) =>
      prev.filter((c) => (c.semesterId || semesters[0]?.id) !== id),
    );
    setRecords((prev) =>
      prev.filter((r) => !deletedCourseIds.includes(r.courseId)),
    );

    const remaining = semesters.filter((s) => s.id !== id);

    if (remaining.length > 0) {
      setSemesters(remaining);
      if (activeSemesterId === id) {
        handleSelectSemester(remaining[0].id);
      }
    } else {
      // If no semesters remain, automatically recreate 'default'
      const defaultSem: Semester = {
        id: crypto.randomUUID(),
        name: "default",
        userId: user.id,
      };
      await supabase.from("semesters").insert(defaultSem);
      setSemesters([defaultSem]);
      handleSelectSemester(defaultSem.id);
    }

    if (selectedCourseId && deletedCourseIds.includes(selectedCourseId)) {
      setSelectedCourseId(null);
      setCurrentView("dashboard");
    }

    toast.success(`Deleted folder "${semesterToDelete.name}" and its data`);
  };

  /* ================= COMPENSATION ================= */

  const handleAddCompensation = async (
    courseId: string,
    date: string,
    sessions: number,
    status: "present" | "absent",
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

  /* ================= ATTENDANCE GENERATION ================= */

  const isGeneratingRef = useRef(false);

  const ensureAttendanceForWeek = useCallback(
    async (weekStart: Date) => {
      if (isGeneratingRef.current) return;
      isGeneratingRef.current = true;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const newRecords: AttendanceRecord[] = [];

        displayedCourses.forEach((course) => {
          for (let i = 0; i < 7; i++) {
            const date = addDays(weekStart, i);
            const dayName = WEEKDAYS[date.getDay()];
            const dateStr = format(date, "yyyy-MM-dd");

            const scheduledCT = course.classTimes.find(
              (ct) => ct.day === dayName,
            );

            if (scheduledCT) {
              const existingCount = displayedRecords.filter(
                (r) => r.courseId === course.id && r.date === dateStr,
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
          const { error } = await supabase
            .from("attendanceRecords")
            .insert(newRecords.map((r) => ({ ...r, userId: user.id })));
          if (error) {
            console.error("Error generating attendance records:", error);
            toast.error(
              "Failed to generate attendance records: " + error.message,
            );
            return;
          }
          setRecords((prev) => [...prev, ...newRecords]);
        }
      } finally {
        isGeneratingRef.current = false;
      }
    },
    [displayedCourses, displayedRecords],
  );

  const handleWeekChange = useCallback(
    (weekStart: Date) => {
      ensureAttendanceForWeek(weekStart);
    },
    [ensureAttendanceForWeek],
  );

  /* ================= HANDLERS ================= */

  const handleToggleAttendance = async (
    recordId: string,
    isCompensation?: boolean,
  ) => {
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
      const { error } = await supabase
        .from("attendanceRecords")
        .delete()
        .eq("id", recordId);
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
      prev.map((r) => (r.id === recordId ? { ...r, status: next } : r)),
    );
  };

  const handleViewCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView("course");
  };

  const handleSaveCourse = async (course: Course | Omit<Course, "id">) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if ("id" in course) {
      await supabase
        .from("courses")
        .update({
          name: course.name,
          color: course.color,
          classTimes: course.classTimes,
          targetPercentage: course.targetPercentage,
        })
        .eq("id", course.id)
        .eq("userId", user.id);

      setCourses((prev) => prev.map((c) => (c.id === course.id ? { ...c, ...course } : c)));
    } else {
      const newCourse: Course & { userId: string } = {
        id: crypto.randomUUID(),
        userId: user.id,
        semesterId: activeSemesterId,
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const rows = imported.map((c) => ({
      ...c,
      id: crypto.randomUUID(),
      userId: user.id,
      semesterId: activeSemesterId,
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

  const handleSaveTargetPercentage = async (
    courseId: string,
    target: number,
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("courses")
      .update({ targetPercentage: target })
      .eq("id", courseId)
      .eq("userId", user.id);

    if (error) {
      console.error("Error updating target percentage:", error);
      toast.error("Failed to save target percentage: " + error.message);
      return;
    }

    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId ? { ...c, targetPercentage: target } : c,
      ),
    );
    toast.success(`Target updated to ${target}%`);
  };

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Toaster />

      <nav className="sticky top-0 z-50 border-b bg-white dark:bg-gray-800 shadow-sm h-[100px]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() =>
              currentView !== "dashboard" && setCurrentView("dashboard")
            }
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
                  <User size={20} />
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
        {isLoading ? (
          <div className="space-y-6 w-full animate-pulse">
            <div className="mb-8">
              <div
                style={{ height: "40px", width: "256px" }}
                className="bg-gray-200 dark:bg-gray-800 rounded mb-2"
              ></div>
            </div>

            <div>
              <div
                style={{ height: "32px", width: "192px" }}
                className="bg-gray-200 dark:bg-gray-800 rounded mb-4"
              ></div>
              <div
                style={{ height: "96px", width: "100%" }}
                className="bg-gray-200 dark:bg-gray-800 rounded-xl"
              ></div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div
                  style={{ height: "32px", width: "128px" }}
                  className="bg-gray-200 dark:bg-gray-800 rounded"
                ></div>
                <div
                  style={{ height: "40px", width: "128px" }}
                  className="bg-gray-200 dark:bg-gray-800 rounded-lg"
                ></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    style={{ height: "192px", width: "100%" }}
                    className="bg-gray-200 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          currentView === "dashboard" && (
            <Dashboard
              courses={displayedCourses}
              records={displayedRecords}
              allCourses={courses}
              allRecords={records}
              semesters={semesters}
              activeSemesterId={activeSemesterId}
              onSelectSemester={handleSelectSemester}
              onCreateSemester={handleCreateSemester}
              onRenameSemester={handleRenameSemester}
              onDeleteSemester={handleDeleteSemester}
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
          )
        )}

        {!isLoading && currentView === "calendar" && (
          <CalendarWeeklyView
            courses={displayedCourses}
            records={displayedRecords}
            onToggleAttendance={handleToggleAttendance}
            onWeekChange={handleWeekChange}
            onAddCompensation={() => setShowCompDialog(true)}
            isCompensationDialogOpen={showCompDialog}
            onAddQuickCompensation={async (courseId, date, status) => {
              const dateStr = format(date, "yyyy-MM-dd");
              await handleAddCompensation(courseId, dateStr, 1, status);
            }}
          />
        )}

        {!isLoading && currentView === "course" && selectedCourse && (
          <Analytics
            courseId={selectedCourse.id}
            initialTarget={selectedCourse.targetPercentage || 75}
            onSaveTarget={handleSaveTargetPercentage}
            totalClasse={records
              .filter((r) => r.courseId === selectedCourse.id)
              .reduce((count, r) => {
                if (r.status === "present" || r.status === "absent") {
                  return count + 1;
                }
                return count;
              }, 0)}
            attendedClasse={records
              .filter((r) => r.courseId === selectedCourse.id)
              .reduce((count, r) => {
                if (r.status === "present") {
                  return count + 1;
                }
                return count;
              }, 0)}
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
        courses={displayedCourses}
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
              href="https://github.com/MagibalanK"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              GitHub
            </a>
            <span>•</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
