'use client';

import { useState } from 'react';
import Input from './Input';
import Button from './Button';
import { cn } from '@/lib/utils';

interface ScoreInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export default function ScoreInput({
  label,
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  disabled = false,
}: ScoreInputProps) {
  const [localValue, setLocalValue] = useState(value.toString());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    const numValue = parseInt(newValue) || 0;
    if (numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  const handleBlur = () => {
    const numValue = parseInt(localValue) || min;
    const clampedValue = Math.max(min, Math.min(max, numValue));
    setLocalValue(clampedValue.toString());
    onChange(clampedValue);
  };

  const increment = () => {
    const newValue = Math.min(max, value + step);
    setLocalValue(newValue.toString());
    onChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(min, value - step);
    setLocalValue(newValue.toString());
    onChange(newValue);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={decrement}
          disabled={disabled || value <= min}
          className="min-w-[52px]"
          aria-label="Decrease"
        >
          −
        </Button>
        <Input
          type="number"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="text-center text-2xl font-bold"
          aria-label={label}
        />
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={increment}
          disabled={disabled || value >= max}
          className="min-w-[52px]"
          aria-label="Increase"
        >
          +
        </Button>
      </div>
    </div>
  );
}





