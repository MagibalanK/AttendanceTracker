import { LucideIcon } from 'lucide-react';
interface MetricCardProps {
    title: string;
    value: number | string;
    subtitle: string;
    icon?: LucideIcon;
    variant?: 'default' | 'critical' | 'safe' | 'warning' | 'info';
}
export declare function MetricCard({ title, value, subtitle, icon: Icon, variant }: MetricCardProps): import("react/jsx-runtime").JSX.Element;
export {};
