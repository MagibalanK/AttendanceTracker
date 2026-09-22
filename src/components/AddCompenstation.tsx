import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";

interface Course {
  id: string;
  name: string;
}

interface AddCompensationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: Course[];
  onSubmit: (
    courseId: string,
    date: string,
    sessions: number,
    status: "present" | "absent"
  ) => void;
}

export function AddCompensationDialog({
  open,
  onOpenChange,
  courses,
  onSubmit,
}: AddCompensationDialogProps) {
  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState("");
  const [sessions, setSessions] = useState(1);
  const [status, setStatus] = useState<"present" | "absent">("present");

  const handleSubmit = () => {
    if (!courseId || !date || sessions < 1) return;
    onSubmit(courseId, date, sessions, status);
    onOpenChange(false);
  };

return (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    {/* Smaller dialog + tighter padding */}
    <AlertDialogContent className="sm:max-w-md p-5">
      <AlertDialogHeader>
        <AlertDialogTitle>Add Compensation Class</AlertDialogTitle>
      </AlertDialogHeader>

      {/* Consistent vertical spacing */}
      <div className="space-y-5">
        {/* SUBJECT */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm text-muted-foreground mt-2">
            Subject
          </Label>
          <Select onValueChange={setCourseId}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* DATE */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm text-muted-foreground mt-2">
            Date
          </Label>
          <Input
            type="date"
            className="h-9"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* SESSIONS */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm text-muted-foreground mt-2">
            Number of Sessions
          </Label>
          <Input
            type="number"
            min={1}
            max={6}
            className="h-9"
            value={sessions}
            onChange={(e) => setSessions(Number(e.target.value))}
          />
        </div>

        {/* STATUS */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm text-muted-foreground mt-2">
            Status
          </Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as "present" | "absent")}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Footer spacing */}
      <AlertDialogFooter className="mt-6 gap-2">
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <Button onClick={handleSubmit}>Add</Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
}
