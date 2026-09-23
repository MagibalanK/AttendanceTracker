import { useState, useEffect } from "react";
import {
  Folder,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Check,
  X,
  Settings,
  Plus,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export interface Semester {
  id: string;
  name: string;
  userId?: string;
  created_at?: string;
}

export interface Course {
  id: string;
  name: string;
  color: string;
  classTimes?: Array<{ day: string; sessions: number }>;
  targetPercentage?: number;
  semesterId?: string | null;
}

export interface AttendanceRecord {
  id: string;
  courseId: string;
  date: string;
  status: "present" | "absent" | "nodata";
}

interface SemesterSelectorProps {
  semesters: Semester[];
  activeSemesterId: string | null;
  allCourses?: Course[];
  allRecords?: AttendanceRecord[];
  onSelectSemester: (id: string) => void;
  onCreateSemester: (name: string) => Promise<void> | void;
  onRenameSemester: (id: string, newName: string) => Promise<void> | void;
  onDeleteSemester: (id: string) => Promise<void> | void;
}

export function SemesterSelector({
  semesters,
  activeSemesterId,
  allCourses = [],
  allRecords = [],
  onSelectSemester,
  onCreateSemester,
  onRenameSemester,
  onDeleteSemester,
}: SemesterSelectorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);

  // Manage modal states
  const [expandedSemesterIds, setExpandedSemesterIds] = useState<Set<string>>(
    new Set(),
  );
  const [editingSemesterId, setEditingSemesterId] = useState<string | null>(
    null,
  );
  const [inlineRenameText, setInlineRenameText] = useState("");
  const [isCreatingInline, setIsCreatingInline] = useState(false);
  const [newSemesterName, setNewSemesterName] = useState("");

  // Delete modal state
  const [semesterToDelete, setSemesterToDelete] = useState<Semester | null>(
    null,
  );
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetManageStates = () => {
    setIsCreatingInline(false);
    setNewSemesterName("");
    setEditingSemesterId(null);
    setInlineRenameText("");
    setExpandedSemesterIds(new Set());
    setSemesterToDelete(null);
    setDeleteConfirmInput("");
  };

  useEffect(() => {
    if (!isManageOpen) {
      resetManageStates();
    }
  }, [isManageOpen]);

  const handleManageOpenChange = (open: boolean) => {
    setIsManageOpen(open);
    if (!open) {
      resetManageStates();
    }
  };

  // Sort semesters by created_at descending (latest created on top)
  const sortedSemesters = [...semesters].sort((a, b) => {
    if (a.created_at && b.created_at) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return 0;
  });

  const activeSemester =
    sortedSemesters.find((s) => s.id === activeSemesterId) ||
    sortedSemesters[0] || {
      id: "default",
      name: "default",
    };

  const otherSemesters = sortedSemesters.filter((s) => s.id !== activeSemester.id);
  const defaultSemId = sortedSemesters[0]?.id || "default";

  /* Toggle expansion of a semester item */
  const toggleExpand = (semId: string) => {
    setExpandedSemesterIds((prev) => {
      const next = new Set(prev);
      if (next.has(semId)) {
        next.delete(semId);
      } else {
        next.add(semId);
      }
      return next;
    });
  };

  /* Inline rename handlers */
  const startRename = (sem: Semester) => {
    setEditingSemesterId(sem.id);
    setInlineRenameText(sem.name);
  };

  const saveRename = async (semId: string) => {
    const trimmed = inlineRenameText.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      await onRenameSemester(semId, trimmed);
      setEditingSemesterId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelRename = () => {
    setEditingSemesterId(null);
    setInlineRenameText("");
  };

  /* Create new semester from top of Manage modal */
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSemesterName.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      await onCreateSemester(trimmed);
      setNewSemesterName("");
      setIsCreatingInline(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Delete handler */
  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!semesterToDelete) return;
    const coursesCount = allCourses.filter(
      (c) => (c.semesterId || defaultSemId) === semesterToDelete.id,
    ).length;
    if (
      coursesCount > 0 &&
      deleteConfirmInput.trim() !== semesterToDelete.name.trim()
    )
      return;

    setIsSubmitting(true);
    try {
      await onDeleteSemester(semesterToDelete.id);
      setSemesterToDelete(null);
      setDeleteConfirmInput("");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Helper to get stats for a course */
  const getCourseStats = (courseId: string) => {
    const courseRecords = allRecords.filter((r) => r.courseId === courseId);
    const attended = courseRecords.filter((r) => r.status === "present").length;
    const conducted = courseRecords.filter((r) => r.status !== "nodata").length;
    const percentage = conducted > 0 ? (attended / conducted) * 100 : 0;
    return { attended, conducted, percentage };
  };

  return (
    <>
      {/* TRIGGER BUTTON & DROPDOWN */}
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            id="semester-dropdown-trigger"
            className="flex items-center gap-2 font-medium text-sm md:text-base text-gray-800 dark:text-gray-200 bg-transparent border-0 outline-none select-none"
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              background: "transparent",
              border: "none",
              boxShadow: "none",
              transition: "none",
            }}
          >
            <Folder className="h-4 w-4 text-indigo-500 flex-shrink-0" />
            <span className="max-w-[150px] truncate">
              {activeSemester.name}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-400 ml-0.5 flex-shrink-0" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-72 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Header Line: "Manage" button centered */}
          <div className="flex items-center justify-center px-2 py-0.5 mb-1">
            <button
              type="button"
              onClick={() => {
                resetManageStates();
                setDropdownOpen(false);
                setIsManageOpen(true);
              }}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-transparent border-0 outline-none select-none cursor-pointer semester-manage-btn"
              style={{
                cursor: "pointer",
                background: "transparent",
                border: "none",
                boxShadow: "none",
                transition: "none",
                padding: "2px 6px",
              }}
              title="Manage semesters"
            >
              <Settings className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
              <span>Manage</span>
            </button>
          </div>

          {/* Active Folder Item (NO background color) */}
          <div
            onClick={() => setDropdownOpen(false)}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg mb-0.5 text-gray-900 dark:text-gray-100 semester-dropdown-item cursor-pointer"
            style={{ background: "transparent", backgroundColor: "transparent", cursor: "pointer" }}
          >
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <Folder className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <span className="font-semibold text-sm truncate">
                {activeSemester.name}
              </span>
            </div>
            <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          </div>

          {/* Other Folders List (NO background, even on hover) */}
          {otherSemesters.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {otherSemesters.map((sem) => (
                <DropdownMenuItem
                  key={sem.id}
                  onClick={() => {
                    onSelectSemester(sem.id);
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-sm text-gray-700 dark:text-gray-200 cursor-pointer semester-dropdown-item"
                  style={{ background: "transparent", backgroundColor: "transparent" }}
                >
                  <Folder className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span className="truncate flex-1">{sem.name}</span>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* MANAGE SEMESTERS WINDOW (DIALOG IN CENTER) */}
      <Dialog open={isManageOpen} onOpenChange={handleManageOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[92vh] flex flex-col gap-2 overflow-hidden rounded-lg semester-manage-dialog"
          style={{
            width: "calc(100vw - 1rem)",
            maxWidth: "464px",
            padding: "10px 14px",
          }}
        >
          <DialogHeader className="pb-1">
            <div className="flex items-center justify-between gap-2">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                <Settings className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                Manage Semesters
              </DialogTitle>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {!isCreatingInline && (
                  <Button
                    size="sm"
                    onClick={() => setIsCreatingInline(true)}
                    className="bg-indigo-600 text-white flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md shadow-sm h-7 cursor-pointer hover:bg-indigo-600 transition-none semester-add-btn"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Semester</span>
                  </Button>
                )}
                <DialogClose className="h-7 w-7 rounded-md p-1.5 text-gray-400 dark:text-gray-400 flex items-center justify-center cursor-pointer hover:bg-transparent hover:text-gray-400 transition-none">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogClose>
              </div>
            </div>
          </DialogHeader>

          {/* Inline Create Form at Top */}
          {isCreatingInline && (
            <form
              onSubmit={handleCreateSubmit}
              className="p-2 sm:p-2.5 my-1.5 rounded-lg semester-dropdown-active flex flex-col sm:flex-row gap-2 items-stretch sm:items-center"
            >
              <div className="flex-1">
                <Input
                  placeholder="Semester name (e.g. Sem 2)"
                  value={newSemesterName}
                  onChange={(e) => setNewSemesterName(e.target.value)}
                  autoFocus
                  disabled={isSubmitting}
                  className="bg-white dark:bg-gray-900 border-indigo-200 dark:border-indigo-800 h-8 text-xs sm:text-sm"
                />
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newSemesterName.trim() || isSubmitting}
                  className="bg-indigo-600 text-white h-8 px-2.5 text-xs rounded-md cursor-pointer hover:bg-indigo-600 transition-none"
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCreatingInline(false);
                    setNewSemesterName("");
                  }}
                  className="h-8 px-2 text-xs text-gray-500 dark:text-gray-400 rounded-md cursor-pointer hover:bg-transparent hover:text-gray-500 transition-none"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Semesters List */}
          <div
            className="flex-1 overflow-y-auto py-1 pr-0.5 semester-list"
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {sortedSemesters.map((sem) => {
              const isActive = sem.id === activeSemester.id;
              const isExpanded = expandedSemesterIds.has(sem.id);
              const isEditing = editingSemesterId === sem.id;

              const semCourses = allCourses.filter(
                (c) => (c.semesterId || defaultSemId) === sem.id,
              );

              return (
                <div
                  key={sem.id}
                  className={`rounded-lg transition-all semester-card ${
                    isActive ? "semester-active" : ""
                  }`}
                >
                  {/* Semester Item Header */}
                  <div
                    className="pl-1.5 pr-2.5 sm:pl-2 sm:pr-3 flex items-center justify-between gap-1.5 sm:gap-2"
                    style={{ paddingTop: "2px", paddingBottom: "2px" }}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                      {/* Expand Button */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(sem.id)}
                        className="p-0.5 text-gray-400 flex-shrink-0 flex items-center justify-center bg-transparent border-0 cursor-pointer"
                        title={
                          isExpanded ? "Collapse courses" : "Expand courses"
                        }
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-2.5 w-2.5" />
                        ) : (
                          <ChevronRight className="h-2.5 w-2.5" />
                        )}
                      </button>

                      <Folder
                        className={`h-4 w-4 flex-shrink-0 ${
                          isActive
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />

                      {/* Semester Name: Display or In-Place Rename */}
                      {isEditing ? (
                        <div className="flex items-center gap-1 flex-1 max-w-xs">
                          <Input
                            value={inlineRenameText}
                            onChange={(e) =>
                              setInlineRenameText(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveRename(sem.id);
                              if (e.key === "Escape") cancelRename();
                            }}
                            autoFocus
                            disabled={isSubmitting}
                            className="h-6 text-xs px-2 bg-white dark:bg-gray-900 border-indigo-400"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => saveRename(sem.id)}
                            disabled={!inlineRenameText.trim() || isSubmitting}
                            className="h-6 w-6 text-gray-500 dark:text-gray-400 flex-shrink-0 rounded-md cursor-pointer hover:bg-transparent hover:text-gray-500 dark:hover:text-gray-400 transition-none"
                            title="Save"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={cancelRename}
                            disabled={isSubmitting}
                            className="h-6 w-6 text-gray-500 dark:text-gray-400 flex-shrink-0 rounded-md cursor-pointer hover:bg-transparent hover:text-gray-500 dark:hover:text-gray-400 transition-none"
                            title="Cancel"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-1.5 cursor-pointer min-w-0"
                          onClick={() => {
                            if (!isActive) onSelectSemester(sem.id);
                          }}
                          title={
                            isActive
                              ? "Current semester"
                              : "Click to switch to this semester"
                          }
                        >
                          <span
                            className={`font-semibold text-sm sm:text-base truncate ${
                              isActive
                                ? "text-indigo-950 dark:text-indigo-200"
                                : "text-gray-900 dark:text-gray-100"
                            }`}
                          >
                            {sem.name}
                          </span>
                          <span
                            className="text-gray-400 dark:text-gray-500 font-mono flex-shrink-0"
                            style={{ fontSize: "12px" }}
                          >
                            ({semCourses.length})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions: Rename & Delete */}
                    {!isEditing && (
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startRename(sem)}
                          className="h-6 w-6 text-gray-500 dark:text-gray-400 rounded-md cursor-pointer hover:bg-transparent hover:text-gray-500 dark:hover:text-gray-400 transition-none"
                          title="Rename semester (in place)"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleteConfirmInput("");
                            setSemesterToDelete(sem);
                          }}
                          className="h-6 w-6 text-gray-500 dark:text-gray-400 rounded-md cursor-pointer hover:bg-transparent hover:text-gray-500 dark:hover:text-gray-400 transition-none"
                          title="Delete semester"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Expanded Courses Breakdown */}
                  {isExpanded && (
                    <div
                      className="px-2 sm:px-2.5 border-t border-gray-100 dark:border-gray-800 rounded-b-lg"
                      style={{ paddingTop: "2px", paddingBottom: "2px" }}
                    >
                      {semCourses.length === 0 ? (
                        <p className="text-[11px] text-gray-400 dark:text-gray-400 italic py-0.5 px-1">
                          No courses in this semester yet.
                        </p>
                      ) : (
                        <div className="space-y-0.5 pt-0.5">
                          {semCourses.map((course) => {
                            const stats = getCourseStats(course.id);
                            const target = course.targetPercentage || 75;
                            const isPassing = stats.percentage >= target;

                            return (
                              <div
                                key={course.id}
                                className="flex items-center justify-between px-2 rounded-md semester-course-item text-xs gap-1.5"
                                style={{
                                  paddingTop: "1px",
                                  paddingBottom: "1px",
                                }}
                              >
                                <div className="flex items-center gap-1.5 min-w-0 pr-1 flex-1">
                                  <span
                                    className="h-2 w-2 rounded-full flex-shrink-0"
                                    style={{
                                      backgroundColor:
                                        course.color || "#4f46e5",
                                    }}
                                  />
                                  <span className="font-medium text-gray-900 dark:text-gray-100 truncate text-[11px] sm:text-xs">
                                    {course.name}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                                  <span className="text-gray-500 dark:text-gray-400 font-mono text-[10px] sm:text-[11px] whitespace-nowrap">
                                    {stats.attended}/{stats.conducted}
                                  </span>
                                  <span
                                    className={`font-semibold px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-mono flex-shrink-0 ${
                                      stats.conducted === 0
                                        ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                        : isPassing
                                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                    }`}
                                  >
                                    {stats.percentage.toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter className="pt-1 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleManageOpenChange(false)}
              className="h-8 px-3 text-xs rounded-md cursor-pointer hover:bg-transparent hover:text-inherit transition-none"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog
        open={Boolean(semesterToDelete)}
        onOpenChange={(open) => !open && setSemesterToDelete(null)}
      >
        <DialogContent
          className="max-h-[92vh] flex flex-col gap-2 overflow-hidden rounded-lg semester-manage-dialog"
          style={{
            width: "calc(100vw - 1rem)",
            maxWidth: "464px",
            padding: "14px 16px",
          }}
        >
          {semesterToDelete &&
            (() => {
              const semToDeleteCoursesCount = allCourses.filter(
                (c) => (c.semesterId || defaultSemId) === semesterToDelete.id,
              ).length;
              const hasCourses = semToDeleteCoursesCount > 0;

              return (
                <form onSubmit={handleDeleteSubmit}>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base sm:text-lg text-red-600 dark:text-red-400">
                      <Trash2 className="h-5 w-5" />
                      Delete Semester Folder
                    </DialogTitle>
                    <DialogDescription className="space-y-2 pt-2 text-left">
                      {hasCourses ? (
                        <>
                          <span className="block text-sm text-gray-700 dark:text-gray-300">
                            This action{" "}
                            <strong className="text-red-600 dark:text-red-400">
                              cannot be undone
                            </strong>
                            . Deleting{" "}
                            <strong>"{semesterToDelete.name}"</strong> will
                            permanently delete all {semToDeleteCoursesCount}{" "}
                            courses and attendance records stored inside this
                            semester folder.
                          </span>
                          <span className="block text-sm text-gray-600 dark:text-gray-400 pt-1">
                            Please type{" "}
                            <strong className="text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border">
                              {semesterToDelete.name}
                            </strong>{" "}
                            to confirm:
                          </span>
                        </>
                      ) : (
                        <span className="block text-sm text-gray-700 dark:text-gray-300">
                          Are you sure you want to delete{" "}
                          <strong>"{semesterToDelete.name}"</strong>? This
                          semester folder has 0 courses.
                        </span>
                      )}
                    </DialogDescription>
                  </DialogHeader>

                  {hasCourses && (
                    <div className="py-3">
                      <Input
                        id="delete-folder-confirm-input"
                        placeholder={`Type "${semesterToDelete.name}" exactly`}
                        value={deleteConfirmInput}
                        onChange={(e) => setDeleteConfirmInput(e.target.value)}
                        autoFocus
                        disabled={isSubmitting}
                        className="w-full text-sm"
                      />
                    </div>
                  )}

                  <DialogFooter className="flex justify-end gap-2 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSemesterToDelete(null)}
                      disabled={isSubmitting}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="destructive"
                      size="sm"
                      disabled={
                        (hasCourses &&
                          deleteConfirmInput.trim() !==
                            semesterToDelete.name.trim()) ||
                        isSubmitting
                      }
                      className="bg-red-600 hover:bg-red-700 text-white h-8 text-xs"
                    >
                      {isSubmitting ? "Deleting..." : "Delete Folder"}
                    </Button>
                  </DialogFooter>
                </form>
              );
            })()}
        </DialogContent>
      </Dialog>
    </>
  );
}
