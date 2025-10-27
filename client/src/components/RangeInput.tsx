import * as React from "react";

interface RangeInputProps {
    vertical?: boolean;
    value: number;
    setValue: (e: React.ChangeEvent<HTMLInputElement>) => void;
    id: string;
    placeholder: string;
    min?: number;
    max?: number;
}

export function RangeInput({vertical = false, value, setValue, id, placeholder, min = 300, max = 2000 }: RangeInputProps) {

    return (
            <label
                id={id}
                className={`long placeholder`}
                data-placeholder={placeholder}
            >
                {value}
                <input
                    className={`${vertical ? 'vertical' : ''}`}
                    type='range'
                    name={id}
                    min={min}
                    max={max}
                    step={10}
                    value={value}
                    onChange={(e) => {
                        setValue(e);
                    }}
                />
            </label>
    )
}