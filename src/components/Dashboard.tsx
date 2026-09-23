import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { CourseCard } from "./CourseCard";
import { StatsWidget } from "./StatsWidget";
import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { SemesterSelector, Semester } from "./SemesterSelector";

interface Course {
  id: string;
  name: string;
  color: string;
  classTimes: Array<{ day: string; sessions: number }>;
  targetPercentage: number;
}

interface AttendanceRecord {
  id: string;
  courseId: string;
  date: string;
  status: "present" | "absent" | "nodata";
}

interface DashboardProps {
  courses: Course[];
  records: AttendanceRecord[];
  allCourses?: Course[];
  allRecords?: AttendanceRecord[];
  semesters: Semester[];
  activeSemesterId: string | null;
  onSelectSemester: (id: string) => void;
  onCreateSemester: (name: string) => Promise<void> | void;
  onRenameSemester: (id: string, newName: string) => Promise<void> | void;
  onDeleteSemester: (id: string) => Promise<void> | void;
  onAddCourse: () => void;
  onViewAnalytics: () => void;
  onViewCalendar: () => void;
  onViewCourse: (courseId: string) => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
}

export function Dashboard({
  courses,
  records,
  allCourses,
  allRecords,
  semesters,
  activeSemesterId,
  onSelectSemester,
  onCreateSemester,
  onRenameSemester,
  onDeleteSemester,
  onAddCourse,
  onViewCalendar,
  onViewCourse,
  onEditCourse,
  onDeleteCourse,
}: DashboardProps) {
  const getCourseStats = (courseId: string) => {
    const courseRecords = records.filter((r) => r.courseId === courseId);
    const presentCount = courseRecords.filter(
      (r) => r.status === "present",
    ).length;
    const totalCount = courseRecords.filter(
      (r) => r.status !== "nodata",
    ).length;
    const percentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
    return { attended: presentCount, conducted: totalCount, percentage };
  };

  const getWeeklyStats = () => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    const weekRecords = records.filter((r) => {
      const recordDate = new Date(r.date);
      return isWithinInterval(recordDate, { start: weekStart, end: weekEnd });
    });

    const attended = weekRecords.filter((r) => r.status === "present").length;
    const missed = weekRecords.filter((r) => r.status === "absent").length;
    const total = weekRecords.filter((r) => r.status !== "nodata").length;

    return { attended, missed, total };
  };

  const weeklyStats = getWeeklyStats();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-1">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white truncate">
            TrackYourClawses
          </h1>

          <div className="flex-shrink-0">
            <SemesterSelector
              semesters={semesters}
              activeSemesterId={activeSemesterId}
              allCourses={allCourses}
              allRecords={allRecords}
              onSelectSemester={onSelectSemester}
              onCreateSemester={onCreateSemester}
              onRenameSemester={onRenameSemester}
              onDeleteSemester={onDeleteSemester}
            />
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg mb-3">
          Track your classes and monitor your attendance
        </p>

        <Button
          size="lg"
          onClick={onViewCalendar}
          className="w-full sm:w-auto text-base py-6 px-8 transition-all hover:shadow-lg btn-calendar-custom"
        >
          <CalendarIcon className="h-5 w-5 mr-3" />
          Open Calendar View
        </Button>
      </div>

      <div>
        <h2 className="mb-4">This Week's Stats</h2>
        <StatsWidget
          attended={weeklyStats.attended}
          missed={weeklyStats.missed}
          total={weeklyStats.total}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="!mb-0">Your Courses</h2>
          <Button onClick={onAddCourse}>
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>
        {courses.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="text-gray-400">
                <CalendarIcon className="h-16 w-16 mx-auto mb-4" />
              </div>
              <div>
                <h3 className="mb-2">No courses yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get started by adding your first course
                </p>
                <Button onClick={onAddCourse}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Course
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => {
              const stats = getCourseStats(course.id);
              return (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  name={course.name}
                  color={course.color}
                  percentage={stats.percentage}
                  attended={stats.attended}
                  conducted={stats.conducted}
                  classTimes={course.classTimes}
                  onView={() => onViewCourse(course.id)}
                  onEdit={() => onEditCourse(course)}
                  onDelete={() => onDeleteCourse(course.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
