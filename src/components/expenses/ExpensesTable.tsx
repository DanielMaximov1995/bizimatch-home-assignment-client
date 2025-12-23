"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { updateExpenseCategory, deleteExpense } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import EditExpenseDialog from "./EditExpenseDialog";

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
};

type ExpensesTableProps = {
  expenses: Expense[];
  onUpdate: () => void;
};

const CATEGORIES = [
  { value: "CAR", label: "רכב" },
  { value: "FOOD", label: "מזון" },
  { value: "OPERATIONS", label: "תפעול" },
  { value: "IT", label: "IT" },
  { value: "TRAINING", label: "הדרכה/הכשרה" },
  { value: "OTHER", label: "אחר" },
];

const DOC_TYPE_LABELS = {
  INVOICE: "חשבונית",
  RECEIPT: "קבלה",
  UNKNOWN: "לא ידוע",
};

const ExpensesTable = ({ expenses, onUpdate }: ExpensesTableProps) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCategoryChange = async (expenseId: string, category: string) => {
    setUpdatingId(expenseId);

    try {
      const response = await updateExpenseCategory(expenseId, category);

      if (response.success) {
        toast.success("קטגוריית ההוצאה עודכנה בהצלחה");
        onUpdate();
      } else {
        toast.error(response.error || "לא ניתן לעדכן את הקטגוריה");
      }
    } catch (error) {
      toast.error("אירעה שגיאה בעת עדכון הקטגוריה");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (expenseId: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את ההוצאה הזו?")) {
      return;
    }

    setDeletingId(expenseId);

    try {
      const response = await deleteExpense(expenseId);

      if (response.success) {
        toast.success("נמחק בהצלחה", { description: "ההוצאה נמחקה מהמערכת" });
        onUpdate();
      } else {
        toast.error("שגיאה במחיקה", { description: response.error || "לא ניתן למחוק את ההוצאה" });
      }
    } catch (error) {
      toast.error("שגיאה", { description: "אירעה שגיאה בעת מחיקת ההוצאה" });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
    }).format(amount);
  };

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          אין הוצאות להצגה
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ניהול הוצאות</CardTitle>
        <CardDescription>
          {expenses.length} הוצאות נמצאו
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-right text-sm font-medium">שם עסק</th>
                <th className="px-4 py-3 text-right text-sm font-medium">תאריך</th>
                <th className="px-4 py-3 text-right text-sm font-medium">לפני מע״מ</th>
                <th className="px-4 py-3 text-right text-sm font-medium">אחרי מע״מ</th>
                <th className="px-4 py-3 text-right text-sm font-medium">מספר חשבונית</th>
                <th className="px-4 py-3 text-right text-sm font-medium">סוג מסמך</th>
                <th className="px-4 py-3 text-right text-sm font-medium">קטגוריה</th>
                <th className="px-4 py-3 text-right text-sm font-medium w-12"></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">
                    {expense.businessName || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatDate(expense.transactionDate)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatCurrency(expense.amountBeforeVat)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {formatCurrency(expense.amountAfterVat)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {expense.invoiceNumber || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {DOC_TYPE_LABELS[expense.docType]}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={expense.category}
                      onChange={(e) =>
                        handleCategoryChange(expense.id, e.target.value)
                      }
                      disabled={updatingId === expense.id}
                      className="w-40"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEdit(expense)}
                          disabled={deletingId === expense.id}
                        >
                          <Edit className="h-4 w-4 ml-2" />
                          ערוך
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDelete(expense.id)}
                          disabled={deletingId === expense.id}
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          מחק
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      <EditExpenseDialog
        expense={editingExpense}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={onUpdate}
      />
    </Card>
  );
};

export default ExpensesTable;

