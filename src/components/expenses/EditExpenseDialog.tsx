"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { updateExpense } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Expense = {
  id: string;
  businessName: string | null;
  businessId: string | null;
  invoiceNumber: string | null;
  docType: "INVOICE" | "RECEIPT" | "UNKNOWN";
  amountBeforeVat: number;
  amountAfterVat: number;
  transactionDate: string;
  category: "CAR" | "FOOD" | "OPERATIONS" | "IT" | "TRAINING" | "OTHER";
  serviceDesc?: string | null;
};

type EditExpenseDialogProps = {
  expense: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const CATEGORIES = [
  { value: "CAR", label: "רכב" },
  { value: "FOOD", label: "מזון" },
  { value: "OPERATIONS", label: "תפעול" },
  { value: "IT", label: "IT" },
  { value: "TRAINING", label: "הדרכה/הכשרה" },
  { value: "OTHER", label: "אחר" },
];

const EditExpenseDialog = ({ expense, open, onOpenChange, onSuccess }: EditExpenseDialogProps) => {
  const [formData, setFormData] = useState({
    businessName: "",
    businessId: "",
    invoiceNumber: "",
    transactionDate: "",
    amountBeforeVat: 0,
    amountAfterVat: 0,
    docType: "UNKNOWN" as "INVOICE" | "RECEIPT" | "UNKNOWN",
    category: "OTHER" as "CAR" | "FOOD" | "OPERATIONS" | "IT" | "TRAINING" | "OTHER",
    serviceDesc: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (expense) {
      setFormData({
        businessName: expense.businessName || "",
        businessId: expense.businessId || "",
        invoiceNumber: expense.invoiceNumber || "",
        transactionDate: expense.transactionDate
          ? new Date(expense.transactionDate).toISOString().split("T")[0]
          : "",
        amountBeforeVat: expense.amountBeforeVat || 0,
        amountAfterVat: expense.amountAfterVat || 0,
        docType: expense.docType || "UNKNOWN",
        category: expense.category || "OTHER",
        serviceDesc: expense.serviceDesc || "",
      });
    }
  }, [expense]);

  const handleSave = async () => {
    if (!expense) return;

    if (!formData.amountAfterVat || !formData.transactionDate) {
      toast.error("שדות חובה חסרים", { description: "אנא מלא סכום ותאריך" });
      return;
    }

    setIsSaving(true);

    try {
      const response = await updateExpense(expense.id, {
        businessName: formData.businessName || null,
        businessId: formData.businessId || null,
        invoiceNumber: formData.invoiceNumber || null,
        transactionDate: new Date(formData.transactionDate).toISOString(),
        amountBeforeVat: formData.amountBeforeVat,
        amountAfterVat: formData.amountAfterVat,
        docType: formData.docType,
        category: formData.category,
        serviceDesc: formData.serviceDesc || null,
      });

      if (response.success) {
        toast.success("עודכן בהצלחה", { description: "ההוצאה עודכנה במערכת" });
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error("שגיאה בעדכון", { description: response.error || "לא ניתן לעדכן את ההוצאה" });
      }
    } catch (error) {
      toast.error("שגיאה", { description: "אירעה שגיאה בעת עדכון ההוצאה" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>עריכת הוצאה</DialogTitle>
          <DialogDescription>
            עדכן את פרטי ההוצאה לפי הצורך
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-businessName">שם העסק</Label>
              <Input
                id="edit-businessName"
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
                placeholder="שם העסק"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-businessId">ח"פ / עוסק מורשה</Label>
              <Input
                id="edit-businessId"
                value={formData.businessId}
                onChange={(e) =>
                  setFormData({ ...formData, businessId: e.target.value })
                }
                placeholder="מספר עסק"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-invoiceNumber">מספר חשבונית</Label>
              <Input
                id="edit-invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) =>
                  setFormData({ ...formData, invoiceNumber: e.target.value })
                }
                placeholder="מספר חשבונית"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-transactionDate">תאריך העסקה *</Label>
              <Input
                id="edit-transactionDate"
                type="date"
                value={formData.transactionDate}
                onChange={(e) =>
                  setFormData({ ...formData, transactionDate: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-amountBeforeVat">סכום לפני מע״מ (₪) *</Label>
              <Input
                id="edit-amountBeforeVat"
                type="number"
                step="0.01"
                value={formData.amountBeforeVat}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amountBeforeVat: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-amountAfterVat">סכום אחרי מע״מ (₪) *</Label>
              <Input
                id="edit-amountAfterVat"
                type="number"
                step="0.01"
                value={formData.amountAfterVat}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amountAfterVat: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-docType">סוג מסמך</Label>
              <select
                id="edit-docType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.docType}
                onChange={(e) =>
                  setFormData({ ...formData, docType: e.target.value as any })
                }
              >
                <option value="INVOICE">חשבונית</option>
                <option value="RECEIPT">קבלה</option>
                <option value="UNKNOWN">לא ידוע</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">קטגוריה</Label>
              <select
                id="edit-category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as any })
                }
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-serviceDesc">תיאור השירות</Label>
            <Input
              id="edit-serviceDesc"
              value={formData.serviceDesc}
              onChange={(e) =>
                setFormData({ ...formData, serviceDesc: e.target.value })
              }
              placeholder="תיאור השירות"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              ביטול
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "שומר..." : "שמור שינויים"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditExpenseDialog;

