import * as React from "react";

interface TextInputProps<T extends object> {
    request: T;
    setRequest: React.Dispatch<React.SetStateAction<T>>;
    id: keyof T;
    placeholder: string;
    autoFocus?: boolean;
    short?: boolean;
    setValue: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// @ts-expect-error cancelRequest is here for later use
export default function TextInput<T extends object>({request, setRequest, id, placeholder, setValue, autoFocus = false, short = false}: TextInputProps<T>){

    const togglePlaceholder = (value: string, labelId: string ) => {
        const labelElement = document.getElementById(labelId);
        if (!labelElement) return;
        if (value && labelElement) {labelElement.classList.toggle('filled', !!value);}
        // if (!value && labelElement) {labelElement.classList.remove('filled');}
    };

    const showPlaceholder = (labelId: string) => {
        document.getElementById(labelId)?.classList.add('filled');
    };

    const hideplaceholder = (value: string, labelId: string) => {
        if (!value) document.getElementById(labelId)?.classList.remove('filled');
    };

    const value = request[id] as string | number | boolean | undefined;

    return (
        <label
            id={String(id)}
            className={`${!short ? "long" : "short"} placeholder`}
            data-placeholder={placeholder}
            onMouseEnter={() => showPlaceholder(String(id))}
            onMouseLeave={() => hideplaceholder(String(value ?? ""), String(id))}
        >
            <input
                autoFocus={autoFocus}
                type='text'
                name={String(id)}
                maxLength={100}
                placeholder={placeholder}
                value={String(value ?? "")}
                onChange={(e) => {
                    togglePlaceholder(e.target.value, String(id));
                    setValue(e);
                }}
                onFocus={() => showPlaceholder(String(id))}
                onBlur={(e) => hideplaceholder(e.target.value, String(id))}
            />
        </label>
    )
}