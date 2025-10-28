import * as React from "react";

interface CheckBoxInputProps {
    value: boolean;
    setValue: (e: React.ChangeEvent<HTMLInputElement>) => void;
    id: string;
    text: string;
}

export default function CheckBoxInput({value, setValue, id, text}:CheckBoxInputProps) {
    return (
            <label
                id={id}
            >
                {text}
                <input
                    type='checkbox'
                    name={id}
                    checked={value}
                    onChange={(e) => {
                        setValue(e);
                    }}
                />
            </label>
    )
}