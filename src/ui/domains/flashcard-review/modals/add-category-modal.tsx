"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TextInputWithLimit } from "@/components/text-input";
import { toast } from "sonner";

interface AddCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (name: string) => void;
}

export const AddCategoryModal = ({
  open,
  onOpenChange,
  onAddCategory,
}: AddCategoryModalProps) => {
  const [categoryName, setCategoryName] = useState("");
  const [isNameValid, setIsNameValid] = useState(true);

  const handleSubmit = () => {
    if (!isNameValid) {
      toast.error("Validation Error", {
        description: "Please fix the validation errors before saving.",
      });
      return;
    }

    if (categoryName.trim()) {
      onAddCategory(categoryName);
      setCategoryName("");
    } else {
      toast.error("Validation Error", {
        description: "Category name cannot be empty.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <TextInputWithLimit
            id="categoryName"
            label="Category Name"
            value={categoryName}
            onChange={setCategoryName}
            onValidChange={setIsNameValid}
            maxLength={100}
            placeholder="Enter category name..."
            required
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Category</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
