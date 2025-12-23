"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { saveInvoice } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ExtractedData = {
  docType: string;
  amountBeforeVat: number;
  amountAfterVat: number;
  transactionDate: string;
  businessName?: string;
  businessId?: string;
  invoiceNumber?: string;
  serviceDesc?: string;
};

type InvoicePreviewProps = {
  extracted: ExtractedData;
  onCancel: () => void;
  onSuccess: () => void;
};

const DOC_TYPE_LABELS: Record<string, string> = {
  INVOICE: "חשבונית",
  RECEIPT: "קבלה",
  UNKNOWN: "לא ידוע",
};

const InvoicePreview = ({ extracted, onCancel, onSuccess }: InvoicePreviewProps) => {
  const [formData, setFormData] = useState({
    businessName: extracted.businessName || "",
    businessId: extracted.businessId || "",
    invoiceNumber: extracted.invoiceNumber || "",
    transactionDate: extracted.transactionDate
      ? new Date(extracted.transactionDate).toISOString().split("T")[0]
      : "",
    amountBeforeVat: extracted.amountBeforeVat || 0,
    amountAfterVat: extracted.amountAfterVat || 0,
    docType: extracted.docType || "UNKNOWN",
    serviceDesc: extracted.serviceDesc || "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.amountAfterVat || !formData.transactionDate) {
      toast.error("שדות חובה חסרים - אנא מלא סכום ותאריך");
      return;
    }

    setIsSaving(true);

    try {
      const response = await saveInvoice({
        businessName: formData.businessName || undefined,
        businessId: formData.businessId || undefined,
        invoiceNumber: formData.invoiceNumber || undefined,
        transactionDate: new Date(formData.transactionDate).toISOString(),
        amountBeforeVat: formData.amountBeforeVat,
        amountAfterVat: formData.amountAfterVat,
        docType: formData.docType,
        serviceDesc: formData.serviceDesc || undefined,
      });

      if (response.success) {
        toast.success("החשבונית נשמרה במערכת בהצלחה");
        onSuccess();
      } else {
        toast.error(response.error || "לא ניתן לשמור את החשבונית");
      }
    } catch (error) {
      toast.error("אירעה שגיאה בעת שמירת החשבונית");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>בדוק ואשר פרטי חשבונית</CardTitle>
        <CardDescription>
          אנא בדוק את הפרטים המחולצים ותקן במידת הצורך לפני השמירה
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="businessName">שם העסק *</Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) =>
                setFormData({ ...formData, businessName: e.target.value })
              }
              placeholder="שם העסק"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessId">ח"פ / עוסק מורשה</Label>
            <Input
              id="businessId"
              value={formData.businessId}
              onChange={(e) =>
                setFormData({ ...formData, businessId: e.target.value })
              }
              placeholder="מספר עסק"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">מספר חשבונית</Label>
            <Input
              id="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) =>
                setFormData({ ...formData, invoiceNumber: e.target.value })
              }
              placeholder="מספר חשבונית"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionDate">תאריך העסקה *</Label>
            <Input
              id="transactionDate"
              type="date"
              value={formData.transactionDate}
              onChange={(e) =>
                setFormData({ ...formData, transactionDate: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amountBeforeVat">סכום לפני מע״מ (₪) *</Label>
            <Input
              id="amountBeforeVat"
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
            <Label htmlFor="amountAfterVat">סכום אחרי מע״מ (₪) *</Label>
            <Input
              id="amountAfterVat"
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
            <Label htmlFor="docType">סוג מסמך</Label>
            <select
              id="docType"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.docType}
              onChange={(e) =>
                setFormData({ ...formData, docType: e.target.value })
              }
            >
              <option value="INVOICE">חשבונית</option>
              <option value="RECEIPT">קבלה</option>
              <option value="UNKNOWN">לא ידוע</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
          >
            <Check className="h-4 w-4 ml-2" />
            {isSaving ? "שומר..." : "אשר ושמור"}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4 ml-2" />
            ביטול
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoicePreview;

