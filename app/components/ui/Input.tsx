import React, { useState } from 'react';

interface InputProps {
    label: string;
    value: number;
    onChange: (val: number) => void;
    unit: string;
}

export const NumberInput = ({ label, value, onChange, unit }: InputProps) => {
    // State to track if the user is currently typing in this specific box
    const [isFocused, setIsFocused] = useState(false);

    // Helper: Formats 1234.5 -> "1,234.50"
    const formatNumber = (num: number) => {
        if (num === 0 && !isFocused) return ''; // Show placeholder if 0
        return new Intl.NumberFormat('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        }).format(num);
    };

    return (
        <div className="flex flex-col gap-2 mb-4 group">
            <label className="text-sm font-bold text-gray-700 group-focus-within:text-black transition-colors">
                {label}
            </label>
            <div className="relative">
                <input
                    // SWITCH LOGIC: If clicking, use 'number' input. If looking, use 'text' input.
                    type={isFocused ? "number" : "text"}
                    min="0"
                    step="0.01"
                    
                    // VALUE LOGIC: If clicking, show raw data (1234.5). If looking, show pretty data (1,234.50)
                    value={isFocused ? (value === 0 ? '' : value) : formatNumber(value || 0)}
                    
                    onChange={(e) => {
                        // This ensures the calculation engine always gets a valid NUMBER
                        const val = parseFloat(e.target.value);
                        onChange(isNaN(val) ? 0 : val);
                    }}
                    
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    
                    className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-gray-900 placeholder-gray-300 font-mono text-base shadow-sm"
                    placeholder="0.00"
                />
                <span className="absolute right-4 top-4 text-xs font-bold text-gray-400 bg-white pl-2">
                    {unit}
                </span>
            </div>
        </div>
    );
};