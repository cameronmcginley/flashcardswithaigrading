"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Button } from "@/components/ui/button";
import { Eye, Edit2, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  markdown?: boolean;
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
  markdown = false,
}: TextInputWithLimitProps) {
  const [isExceeded, setIsExceeded] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;

      // Insert tab at cursor position
      const newValue = value.substring(0, start) + "\t" + value.substring(end);
      onChange(newValue);

      // Set cursor position after the inserted tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart =
            textareaRef.current.selectionEnd = start + 1;
        }
      }, 0);
    }
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
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
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
          </div>
          <div className="flex items-center gap-2">
            {markdown && multiline && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setIsPreview(!isPreview)}
              >
                {isPreview ? (
                  <>
                    <Edit2 className="h-3 w-3 mr-1" /> Edit
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" /> Preview
                  </>
                )}
              </Button>
            )}
            <span
              className={`text-xs ${
                isExceeded ? "text-red-500 font-medium" : "text-gray-500"
              }`}
            >
              {charCount}/{maxLength}
            </span>
          </div>
        </div>
      )}

      {multiline ? (
        markdown ? (
          <div>
            {isPreview ? (
              <div
                className="border rounded-md p-3 overflow-auto prose bg-muted/20"
                style={{ height: textareaHeight }}
              >
                {value ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {value}
                  </ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground italic">
                    No content to preview
                  </p>
                )}
              </div>
            ) : (
              <div className="relative" style={{ height: textareaHeight }}>
                <Textarea
                  ref={textareaRef}
                  id={id}
                  value={value}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className={cn(
                    inputClasses,
                    "absolute inset-0 resize-none overflow-auto font-mono"
                  )}
                  disabled={disabled}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="relative" style={{ height: textareaHeight }}>
            <Textarea
              ref={textareaRef}
              id={id}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn(
                inputClasses,
                "absolute inset-0 resize-none overflow-auto"
              )}
              disabled={disabled}
            />
          </div>
        )
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

      {markdown && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-xs text-blue-500 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                <span>Markdown formatting is supported</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="text-xs">
                Markdown formatting is supported. Use # for headings, * for
                lists, **bold**, *italic*, `code`, and more.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {helperText && !isExceeded && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
