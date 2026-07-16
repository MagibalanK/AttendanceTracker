import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Calendar, Edit2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface CourseCardProps {
  id: string;
  name: string;
  color: string;
  percentage: number;
  attended: number;
  conducted: number;
  classTimes: Array<{ day: string; sessions: number }>;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const DAY_SHORT: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

export function CourseCard({
  name,
  color,
  percentage,
  attended,
  conducted,
  classTimes,
  onView,
  onEdit,
  onDelete,
}: CourseCardProps) {
  // Sort class times by day order
  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const sortedClassTimes = [...classTimes].sort(
    (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
  );

  const totalSessions = classTimes.reduce((sum, ct) => sum + ct.sessions, 0);

  const targetPercentage = 75;
  const bunksLeft = Math.max(
    0,
    Math.floor(attended - (targetPercentage * conducted) / 100)
  );

  const calculateRecover = () => {
    if (percentage >= targetPercentage) return 0;
    let t = conducted;
    let a = attended;
    let c = 0;
    if (t === 0) return 1;
    while ((a / t) * 100 < targetPercentage) {
      t++;
      a++;
      c++;
      if (c > 500) break;
    }
    return c;
  };

  const classesToRecover = calculateRecover();

  return (
    <Card
      className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={onView}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {name}
          </h3>
        </div>
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            <Edit2 className="h-4 w-4" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600" onClick={(e) => e.stopPropagation()}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Course</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {name}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onDelete(); 
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-3 w-3" />
          <span>{totalSessions} session{totalSessions !== 1 ? 's' : ''} per week</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {sortedClassTimes.map((ct, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs"
            >
              {DAY_SHORT[ct.day]} ({ct.sessions})
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Attendance <span className="text-xs ml-1 opacity-70">({attended}/{conducted})</span>
          </span>
          <span className={percentage >= 75 ? "text-green-600" : "text-red-600"}>
            {percentage.toFixed(1)}%
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
        {conducted > 0 && (
          <div className="flex justify-between text-xs mt-1 pt-1">
            {percentage >= 75 ? (
              <span className={bunksLeft === 0 ? "text-gray-500 dark:text-gray-400 font-medium" : "text-green-600 dark:text-green-400 font-medium"}>
                {bunksLeft} bunk{bunksLeft !== 1 ? 's' : ''} left
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400 font-medium">
                {classesToRecover} class{classesToRecover !== 1 ? 'es' : ''} to recover
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
