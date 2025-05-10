"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TextInputWithLimitProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onValidChange?: (isValid: boolean) => void;
  maxLength: number;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

export function TextInputWithLimit({
  id,
  label,
  value,
  onChange,
  onValidChange,
  maxLength,
  placeholder,
  className,
  multiline = false,
  rows = 3,
  helperText,
  required = false,
  disabled = false,
}: TextInputWithLimitProps) {
  const [isExceeded, setIsExceeded] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const currentLength = value.length;
    setCharCount(currentLength);
    const exceeded = currentLength > maxLength;
    setIsExceeded(exceeded);

    if (onValidChange) {
      onValidChange(!exceeded);
    }
  }, [value, maxLength, onValidChange]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange(e.target.value);
  };

  const inputClasses = cn(
    isExceeded ? "border-red-500 focus-visible:ring-red-500" : "",
    className
  );

  // Calculate fixed height based on rows
  const textareaHeight = `${Math.max(rows * 24, 72)}px`;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between">
          <Label
            htmlFor={id}
            className={
              required
                ? "after:content-['*'] after:ml-0.5 after:text-red-500"
                : ""
            }
          >
            {label}
          </Label>
          <span
            className={`text-xs ${
              isExceeded ? "text-red-500 font-medium" : "text-gray-500"
            }`}
          >
            {charCount}/{maxLength}
          </span>
        </div>
      )}

      {multiline ? (
        <div className="relative" style={{ height: textareaHeight }}>
          <Textarea
            id={id}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={cn(
              inputClasses,
              "absolute inset-0 resize-none overflow-auto"
            )}
            disabled={disabled}
          />
        </div>
      ) : (
        <Input
          id={id}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={inputClasses}
          disabled={disabled}
        />
      )}

      {isExceeded && (
        <p className="text-xs text-red-500">
          Text exceeds maximum length of {maxLength} characters
        </p>
      )}

      {helperText && !isExceeded && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
