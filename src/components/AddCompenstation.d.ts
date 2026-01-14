interface Course {
    id: string;
    name: string;
}
interface AddCompensationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courses: Course[];
    onSubmit: (courseId: string, date: string, sessions: number, status: "present" | "absent") => void;
}
export declare function AddCompensationDialog({ open, onOpenChange, courses, onSubmit, }: AddCompensationDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
