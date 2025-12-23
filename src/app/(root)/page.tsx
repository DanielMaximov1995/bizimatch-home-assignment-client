"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getExpenses } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UploadInvoiceForm from "@/components/expenses/UploadInvoiceForm";
import ExpensesTable from "@/components/expenses/ExpensesTable";
import ExpensesFilters from "@/components/expenses/ExpensesFilters";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

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

type Filters = {
  from?: string;
  to?: string;
  min?: number;
  max?: number;
  category?: string;
  business?: string;
};

const DashboardPage = () => {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("upload");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [filters, setFilters] = useState<Filters>({});

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && activeTab === "expenses") {
      loadExpenses();
    }
  }, [isAuthenticated, activeTab, filters]);

  const loadExpenses = async () => {
    setIsLoadingExpenses(true);
    try {
      const response = await getExpenses(filters);
      if (response.success && response.data) {
        setExpenses(response.data.items);
      }
    } catch (error) {
      // Error handled by API response
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleExpenseUpdate = () => {
    loadExpenses();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">טוען...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">מערכת ניהול הוצאות</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 ml-2" />
              התנתק
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">העלאת חשבוניות</TabsTrigger>
            <TabsTrigger value="expenses">ניהול הוצאות</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <UploadInvoiceForm onSuccess={loadExpenses} />
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <ExpensesFilters filters={filters} onFiltersChange={handleFiltersChange} />
            {isLoadingExpenses ? (
              <div className="text-center py-8 text-muted-foreground">טוען הוצאות...</div>
            ) : (
              <ExpensesTable expenses={expenses} onUpdate={handleExpenseUpdate} />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardPage;
