interface StatusCardProps {
    percentage: number;
    status: 'critical' | 'warning' | 'safe';
    statusText: string;
    message: string;
}
export declare function StatusCard({ percentage, status, statusText, message }: StatusCardProps): import("react/jsx-runtime").JSX.Element;
export {};
