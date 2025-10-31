import * as React from "react";

export default function setValue<T extends object>(
    e: React.ChangeEvent<HTMLInputElement>,
    setRequest: React.Dispatch<React.SetStateAction<T>>): void
{
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setRequest((current) => ({
        ...current,
        [e.target.name]: value,
    }));
}