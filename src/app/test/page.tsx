"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Brain, TrendingUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "katex/dist/contrib/mhchem";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="w-[400px] h-[400px]">
        
        {/* AI Feedback Card */}
        <Card className="w-full h-full border-2 border-border bg-muted/20 relative">
          {/* Speech bubble arrow */}
          <div className="absolute -top-3 left-10 w-6 h-6 bg-muted/20 border-t-2 border-l-2 border-border transform rotate-45"></div>
          
          <CardContent className="p-5 h-full flex flex-col">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-muted p-2 rounded-full">
                  <Brain className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <h4 className="font-bold text-xl">AI Feedback</h4>
                  <p className="text-sm text-muted-foreground">GPT-4 Analysis</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600 mb-1">82%</div>
                <Badge variant="outline" className="text-sm flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Ease +12%
                </Badge>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-muted rounded-full mb-4 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: "82%" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>

            {/* AI Feedback Content */}
            <div className="flex-1 overflow-y-hidden">
              <div className="prose prose-base dark:prose-invert max-w-none text-foreground">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeHighlight, rehypeKatex]}
                >
                  {`**Great work!** Correct time complexity: $O(\\log_2 n)$

\`\`\`javascript
mid = (left + right) / 2;
\`\`\`

**Improvement:** Mention that input must be sorted first.`}
                </ReactMarkdown>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
} 