"use client";

import { useState } from "react";
import { Upload, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { parseInvoice } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import InvoicePreview from "./InvoicePreview";

type UploadInvoiceFormProps = {
  onSuccess?: () => void;
};

const UploadInvoiceForm = ({ onSuccess }: UploadInvoiceFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!validTypes.includes(selectedFile.type)) {
      toast.error("סוג קובץ לא נתמך. אנא העלה קובץ PDF או תמונה (JPG/PNG)");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("קובץ גדול מדי. גודל הקובץ חייב להיות קטן מ-10MB");
      return;
    }

    setFile(selectedFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);

    try {
      const response = await parseInvoice(file);

      if (response.success && response.data) {
        setExtractedData(response.data.extracted);
        toast.success("הקובץ נבדק בהצלחה - אנא בדוק את הפרטים המחולצים");
      } else {
        toast.error(response.error || "לא ניתן לעבד את הקובץ");
      }
    } catch (error) {
      toast.error("אירעה שגיאה בעת עיבוד הקובץ");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePreviewCancel = () => {
    setExtractedData(null);
    setFile(null);
  };

  const handlePreviewSuccess = () => {
    setExtractedData(null);
    setFile(null);
    if (onSuccess) {
      onSuccess();
    }
  };

  const getFileIcon = () => {
    if (!file) return null;
    if (file.type === "application/pdf") {
      return <FileText className="h-12 w-12 text-muted-foreground" />;
    }
    return <ImageIcon className="h-12 w-12 text-muted-foreground" />;
  };

  if (extractedData) {
    return (
      <InvoicePreview
        extracted={extractedData}
        onCancel={handlePreviewCancel}
        onSuccess={handlePreviewSuccess}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>העלאת חשבונית</CardTitle>
        <CardDescription>
          העלה קובץ PDF או תמונה של חשבונית/קבלה לניתוח אוטומטי
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors
            ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25"
            }
            ${file ? "border-solid border-primary" : ""}
          `}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileInput}
            disabled={isUploading}
          />

          {file ? (
            <div className="flex flex-col items-center gap-4">
              {getFileIcon()}
              <div className="text-center">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFile(null)}
                disabled={isUploading}
              >
                בחר קובץ אחר
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-primary hover:underline"
                >
                  לחץ לבחירת קובץ
                </label>
                <p className="text-sm text-muted-foreground">או גרור לכאן</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  PDF, JPG, PNG (עד 10MB)
                </p>
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? "מעלה ומעבד..." : "העלה ונתח חשבונית"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UploadInvoiceForm;

