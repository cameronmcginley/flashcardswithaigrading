"use client";

import { MarkdownContent } from "@/components/markdown-content";

const markdownExample = `# Markdown Style Guide

Welcome to the Markdown testing page. This document showcases various Markdown elements and how they are styled.

## Text Formatting

Basic text formatting includes:
- **Bold text** using \`**text**\`
- *Italic text* using \`*text*\`
- ~~Strikethrough~~ using \`~~text~~\`
- \`inline code\` using backticks
- [Links](https://example.com) using \`[text](url)\`

## Code Blocks

Here's a JavaScript code block:

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return {
    message: "Greeting sent",
    timestamp: new Date()
  };
}
\`\`\`

And some Python:

\`\`\`python
def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)
\`\`\`

## Lists

### Unordered List
- First item
- Second item
  - Nested item 1
  - Nested item 2
- Third item

### Ordered List
1. First step
2. Second step
   1. Substep A
   2. Substep B
3. Third step

## Tables

| Feature | Support | Notes |
|---------|---------|-------|
| Tables | ✅ | Via remark-gfm |
| Footnotes | ✅ | Also via remark-gfm |
| Strikethrough | ✅ | Basic markdown |

## Blockquotes

> This is a blockquote. It can contain multiple paragraphs.
>
> Second paragraph in blockquote.
>> Nested blockquote

## Task Lists

- [x] Implement Markdown support
- [x] Style code blocks
- [ ] Add more examples
- [ ] Test edge cases

## Mathematical Expressions

When \`a ≠ 0\`, there are two solutions to \`ax² + bx + c = 0\`:

\`x = (-b ± √(b² - 4ac)) / (2a)\`

## Horizontal Rule

---

## Special Characters & Escaping

Using backticks in text: \\\`like this\\\`
Using asterisks: \\*not italic\\*

## Footnotes

Here's a sentence with a footnote[^1].

[^1]: This is the footnote content.

## Final Notes

This document demonstrates the various Markdown elements supported in our application. The styling is consistent with our flashcard system.`;

export default function MarkdownTest() {
  return (
    <div className="container mx-auto py-8 px-4">
      <MarkdownContent content={markdownExample} className="max-w-none" />
    </div>
  );
}
