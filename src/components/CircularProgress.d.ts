interface CircularProgressProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    status: 'critical' | 'warning' | 'safe';
}
export declare function CircularProgress({ percentage, size, strokeWidth, status }: CircularProgressProps): import("react/jsx-runtime").JSX.Element;
export {};
