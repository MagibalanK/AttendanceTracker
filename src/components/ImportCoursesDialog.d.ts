interface Course {
    id: string;
    name: string;
    color: string;
    classTimes: {
        day: string;
        sessions: number;
    }[];
}
interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport: (courses: Course[]) => void;
}
export declare function ImportCoursesDialog({ open, onOpenChange, onImport, }: Props): import("react/jsx-runtime").JSX.Element;
export {};
