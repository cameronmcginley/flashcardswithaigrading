"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface JsonTextInputProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onValidChange?: (isValid: boolean) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  validateOnChange?: boolean;
  formatOnBlur?: boolean;
}

export function JsonTextInput({
  id,
  label,
  value,
  onChange,
  onValidChange,
  placeholder,
  className,
  rows = 6,
  helperText,
  required = false,
  disabled = false,
  validateOnChange = false,
  formatOnBlur = true,
}: JsonTextInputProps) {
  const [isInvalid, setIsInvalid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validateJson = (
    jsonString: string
  ): { valid: boolean; error?: string } => {
    if (!jsonString.trim()) {
      return { valid: true };
    }

    try {
      JSON.parse(jsonString);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Invalid JSON format",
      };
    }
  };

  useEffect(() => {
    if (validateOnChange) {
      const result = validateJson(value);
      setIsInvalid(!result.valid);
      setErrorMessage(result.error || "");

      if (onValidChange) {
        onValidChange(result.valid);
      }
    }
  }, [value, validateOnChange, onValidChange]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    const result = validateJson(value);
    setIsInvalid(!result.valid);
    setErrorMessage(result.error || "");

    if (onValidChange) {
      onValidChange(result.valid);
    }

    // Format JSON on blur if it's valid and formatOnBlur is true
    if (result.valid && formatOnBlur && value.trim()) {
      try {
        const formatted = JSON.stringify(JSON.parse(value), null, 2);
        onChange(formatted);
      } catch (error) {
        // This shouldn't happen since we already validated the JSON
      }
    }
  };

  const inputClasses = cn(
    "font-mono text-sm",
    isInvalid ? "border-red-500 focus-visible:ring-red-500" : "",
    className
  );

  // Calculate fixed height based on rows
  const textareaHeight = `${Math.max(rows * 24, 144)}px`;

  return (
    <div className="space-y-2">
      {label && (
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
      )}

      <div className="relative" style={{ height: textareaHeight }}>
        <Textarea
          id={id}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            inputClasses,
            "absolute inset-0 resize-none overflow-auto"
          )}
          disabled={disabled}
        />
      </div>

      {isInvalid && (
        <p className="text-xs text-red-500">
          {errorMessage || "Invalid JSON format"}
        </p>
      )}

      {helperText && !isInvalid && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
