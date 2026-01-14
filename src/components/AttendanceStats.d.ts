interface AttendanceStatsProps {
    total: number;
    attended: number;
    missed: number;
    bunksLeft: number;
    toRecover: number;
}
export declare function AttendanceStats({ total, attended, missed, bunksLeft, toRecover, }: AttendanceStatsProps): import("react/jsx-runtime").JSX.Element;
export {};
