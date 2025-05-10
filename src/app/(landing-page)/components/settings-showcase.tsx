"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RefreshCw, Terminal, Settings2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsShowcase() {
  const [easeFactor, setEaseFactor] = useState(2.5);
  const [interval, setInterval] = useState(4);
  const [aiPrompt, setAiPrompt] = useState(
    "Evaluate the answer based on accuracy and completeness. Provide specific feedback on what was correct and what needs improvement. If the answer is partially correct, explain what's missing."
  );

  const resetToDefault = () => {
    setEaseFactor(2.5);
    setInterval(4);
    setAiPrompt(
      "Evaluate the answer based on accuracy and completeness. Provide specific feedback on what was correct and what needs improvement. If the answer is partially correct, explain what's missing."
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="p-6 border-2 bg-white dark:bg-gray-800 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center">
            <Settings2 className="mr-2 h-5 w-5" />
            Study Parameters
          </h3>
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={resetToDefault}
              title="Reset to Default"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label htmlFor="ease-factor">Ease Factor</Label>
              <span className="text-sm text-gray-500">
                {easeFactor.toFixed(1)}
              </span>
            </div>
            <Slider
              id="ease-factor"
              min={1.3}
              max={3.5}
              step={0.1}
              value={[easeFactor]}
              onValueChange={(value) => setEaseFactor(value[0])}
              className="py-2"
            />
            <p className="text-xs text-gray-500">
              Controls how quickly intervals increase. Higher values mean faster
              progression.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label htmlFor="interval">Starting Interval (days)</Label>
              <span className="text-sm text-gray-500">{interval}</span>
            </div>
            <Slider
              id="interval"
              min={1}
              max={10}
              step={1}
              value={[interval]}
              onValueChange={(value) => setInterval(value[0])}
              className="py-2"
            />
            <p className="text-xs text-gray-500">
              The initial interval for new cards after the first successful
              review.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={resetToDefault}
            >
              Reset to Default
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-2 bg-gray-950 text-gray-100 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center">
            <Terminal className="mr-2 h-5 w-5" />
            AI Prompt Editor
          </h3>
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={resetToDefault}
              className="text-gray-300 hover:text-white hover:bg-gray-800"
              title="Reset to Default"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="ai-prompt" className="text-gray-300">
              Custom AI Grading Prompt
            </Label>
            <Textarea
              id="ai-prompt"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="mt-2 h-[180px] bg-gray-900 border-gray-800 text-gray-100"
              placeholder="Enter your custom AI grading prompt..."
            />
            <p className="text-xs text-gray-400 mt-2">
              Customize how the AI evaluates and responds to your answers. Use
              variables like {"{question}"}, {"{your_answer}"}, and{" "}
              {"{correct_answer}"}.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={resetToDefault}
            >
              Reset to Default
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
