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
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";

/* ================= CHATGPT PROMPT ================= */

const CHATGPT_PROMPT = `You are given an image of a weekly class timetable.

Convert it into CSV using the EXACT format below.
Use CONCISE, COMMON SUBJECT NAMES.

CSV FORMAT (no extra text, no markdown, no explanations):
name,color,day,sessions

NAMING RULES:
- Use short, common names only
  Examples:
  - Mathematics → Maths
  - Physics → Physics
  - Introduction to Computer Programming → Computer Science
  - Computer Programming Lab → Computer Science Lab
  - Engineering Mechanics → Mechanics
  - Energy and Environmental Engineering → EEE
  - English Theory / Lab → English / English Lab
- Do NOT use course codes
- Do NOT use long official titles
- Keep names short (1–3 words max)

GENERAL RULES:
- Each row represents ONE course on ONE day
- Use the SAME name + color for the same course everywhere
- Days must be exactly:
  Monday, Tuesday, Wednesday, Thursday, Friday
- sessions = number of consecutive periods on that day
- If a course appears twice on the same day, sessions = 2
- Do NOT invent courses
- Do NOT include weekends
- Do NOT repeat the header

Use these colors (pick one per course):
#3B82F6 #10B981 #F59E0B #EF4444 #8B5CF6 #EC4899 #06B6D4

OUTPUT ONLY RAW CSV.
`;

/* ================= TYPES ================= */

interface Course {
  id: string;
  name: string;
  color: string;
  classTimes: { day: string; sessions: number }[];
  targetPercentage: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (courses: Course[]) => void;
}

/* ================= COMPONENT ================= */

export function ImportCoursesDialog({
  open,
  onOpenChange,
  onImport,
}: Props) {
  const [csvText, setCsvText] = useState("");
  const [copied, setCopied] = useState(false);

  const parseCSV = () => {
    try {
      const lines = csvText.trim().split("\n");
      const [, ...rows] = lines;

      const map = new Map<string, Course>();

      rows.forEach((line) => {
        const [name, color, day, sessions] = line.split(",");

        if (!map.has(name)) {
          map.set(name, {
            id: crypto.randomUUID(),
            name,
            color,
            classTimes: [],
            targetPercentage: 75,
          });
        }

        map.get(name)!.classTimes.push({
          day,
          sessions: Number(sessions),
        });
      });

      onImport(Array.from(map.values()));
      toast.success("Courses imported successfully");
      setCsvText("");
      onOpenChange(false);
    } catch {
      toast.error("Invalid CSV format");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg space-y-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Import Courses (CSV)</AlertDialogTitle>
        </AlertDialogHeader>

        {/* COPYABLE PROMPT */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              ChatGPT Prompt (use with timetable image)
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(CHATGPT_PROMPT);
                toast.success("Prompt copied to clipboard");
                setCopied(true);
                setTimeout(() => setCopied(false), 15000);
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          <Textarea
            readOnly
            rows={8}
            value={CHATGPT_PROMPT}
            className="text-xs font-mono"
          />
        </div>

        {/* CSV INPUT */}
        <Textarea
          rows={6}
          placeholder="name,color,day,sessions"
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          className="font-mono"
        />

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={parseCSV}>Run</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
