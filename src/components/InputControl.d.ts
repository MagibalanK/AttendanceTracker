interface InputControlProps {
    label: string;
    sublabel?: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
}
export declare function InputControl({ label, sublabel, value, onChange, min, max }: InputControlProps): import("react/jsx-runtime").JSX.Element;
export {};
