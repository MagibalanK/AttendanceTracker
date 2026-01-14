import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, } from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
export function AddCompensationDialog({ open, onOpenChange, courses, onSubmit, }) {
    const [courseId, setCourseId] = useState("");
    const [date, setDate] = useState("");
    const [sessions, setSessions] = useState(1);
    const [status, setStatus] = useState("present");
    const handleSubmit = () => {
        if (!courseId || !date || sessions < 1)
            return;
        onSubmit(courseId, date, sessions, status);
        onOpenChange(false);
    };
    return (_jsx(AlertDialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(AlertDialogContent, { className: "sm:max-w-md p-5", children: [_jsx(AlertDialogHeader, { children: _jsx(AlertDialogTitle, { children: "Add Compensation Class" }) }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { className: "text-sm text-muted-foreground mt-2", children: "Subject" }), _jsxs(Select, { onValueChange: setCourseId, children: [_jsx(SelectTrigger, { className: "h-9", children: _jsx(SelectValue, { placeholder: "Select subject" }) }), _jsx(SelectContent, { children: courses.map((c) => (_jsx(SelectItem, { value: c.id, children: c.name }, c.id))) })] })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { className: "text-sm text-muted-foreground mt-2", children: "Date" }), _jsx(Input, { type: "date", className: "h-9", value: date, onChange: (e) => setDate(e.target.value) })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { className: "text-sm text-muted-foreground mt-2", children: "Number of Sessions" }), _jsx(Input, { type: "number", min: 1, max: 6, className: "h-9", value: sessions, onChange: (e) => setSessions(Number(e.target.value)) })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { className: "text-sm text-muted-foreground mt-2", children: "Status" }), _jsxs(Select, { value: status, onValueChange: (v) => setStatus(v), children: [_jsx(SelectTrigger, { className: "h-9", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "present", children: "Present" }), _jsx(SelectItem, { value: "absent", children: "Absent" })] })] })] })] }), _jsxs(AlertDialogFooter, { className: "mt-6 gap-2", children: [_jsx(AlertDialogCancel, { children: "Cancel" }), _jsx(Button, { onClick: handleSubmit, children: "Add" })] })] }) }));
}
