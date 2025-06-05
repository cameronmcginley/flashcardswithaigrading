"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import { Button } from "@/components/ui/button";
import { Eye, Edit2, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import "katex/dist/katex.min.css";
import "katex/dist/contrib/mhchem";

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
  markdown?: boolean;
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
  markdown = false,
}: JsonTextInputProps) {
  const [isInvalid, setIsInvalid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Extract markdown content from JSON for preview
  const extractMarkdownContent = (jsonString: string): string => {
    if (!jsonString.trim()) return "";

    try {
      const parsed = JSON.parse(jsonString);

      // If it's an array of cards
      if (Array.isArray(parsed)) {
        return parsed
          .map((card, index) => {
            return `## Card ${index + 1}\n\n### Front\n${
              card.front || ""
            }\n\n### Back\n${card.back || ""}\n\n---\n`;
          })
          .join("\n");
      }

      // If it's a single card object
      if (parsed.front || parsed.back) {
        return `## Card\n\n### Front\n${
          parsed.front || ""
        }\n\n### Back\n${parsed.back || ""}\n`;
      }

      // Otherwise, just stringify it nicely
      return "```json\n" + JSON.stringify(parsed, null, 2) + "\n```";
    } catch {
      return "Invalid JSON";
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
      } catch {
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
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
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
        </div>

        {markdown && (
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
      </div>

      {markdown ? (
        <div>
          {isPreview ? (
            <div
              className="border rounded-md p-3 overflow-auto prose bg-muted/20"
              style={{ minHeight: textareaHeight, maxHeight: "400px" }}
            >
              {value ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeHighlight, rehypeKatex]}
                >
                  {extractMarkdownContent(value)}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground italic">
                  No content to preview
                </p>
              )}
            </div>
          ) : (
            <Textarea
              ref={textareaRef}
              id={id}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder={placeholder}
              className={cn(inputClasses, "font-mono")}
              disabled={disabled}
              style={{ minHeight: textareaHeight }}
            />
          )}
        </div>
      ) : (
        <Textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(inputClasses)}
          disabled={disabled}
          style={{ minHeight: textareaHeight }}
        />
      )}

      {isInvalid && (
        <p className="text-xs text-red-500">
          {errorMessage || "Invalid JSON format"}
        </p>
      )}

      {markdown && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-xs text-blue-500 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                <span>
                  Markdown formatting is supported in front and back fields
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="text-xs">
                Markdown formatting is supported in front and back fields.
                Use # for headings, * for lists, **bold**, *italic*, `code`, and
                more.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {helperText && !isInvalid && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
