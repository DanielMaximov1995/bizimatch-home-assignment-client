"use client";

import { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

type ExpenseFiltersProps = {
  filters: {
    from?: string;
    to?: string;
    min?: number;
    max?: number;
    category?: string;
    business?: string;
  };
  onFiltersChange: (filters: ExpenseFiltersProps["filters"]) => void;
};

const CATEGORIES = [
  { value: "", label: "כל הקטגוריות" },
  { value: "CAR", label: "רכב" },
  { value: "FOOD", label: "מזון" },
  { value: "OPERATIONS", label: "תפעול" },
  { value: "IT", label: "IT" },
  { value: "TRAINING", label: "הדרכה/הכשרה" },
  { value: "OTHER", label: "אחר" },
];

const ExpensesFilters = ({ filters, onFiltersChange }: ExpenseFiltersProps) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key: keyof typeof localFilters, value: string | number | undefined) => {
    const newFilters = { ...localFilters, [key]: value || undefined };
    setLocalFilters(newFilters);
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    const emptyFilters = {
      from: undefined,
      to: undefined,
      min: undefined,
      max: undefined,
      category: undefined,
      business: undefined,
    };
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ""
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          סינון
          {hasActiveFilters && (
            <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
              פעיל
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">סינון הוצאות</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 px-2">
                <X className="h-3 w-3 ml-1" />
                איפוס
              </Button>
            )}
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="business">שם עסק</Label>
              <Input
                id="business"
                placeholder="חפש לפי שם עסק..."
                value={localFilters.business || ""}
                onChange={(e) => handleChange("business", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">קטגוריה</Label>
              <Select
                id="category"
                value={localFilters.category || ""}
                onChange={(e) => handleChange("category", e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="from">מתאריך</Label>
                <Input
                  id="from"
                  type="date"
                  value={localFilters.from || ""}
                  onChange={(e) => handleChange("from", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="to">עד תאריך</Label>
                <Input
                  id="to"
                  type="date"
                  value={localFilters.to || ""}
                  onChange={(e) => handleChange("to", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="min">סכום מינימלי (₪)</Label>
                <Input
                  id="min"
                  type="number"
                  placeholder="0"
                  value={localFilters.min || ""}
                  onChange={(e) =>
                    handleChange("min", e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max">סכום מקסימלי (₪)</Label>
                <Input
                  id="max"
                  type="number"
                  placeholder="0"
                  value={localFilters.max || ""}
                  onChange={(e) =>
                    handleChange("max", e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleApply} className="flex-1">
                החל סינון
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ExpensesFilters;

