const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type User = {
  id: string;
  email: string;
};

type LoginResponse = {
  token: string;
  user: User;
};

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

const request = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "שגיאה בהתחברות לשרת",
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "שגיאת רשת",
    };
  }
};

export const register = async (
  email: string,
  password: string
): Promise<ApiResponse<User>> => {
  return request<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const login = async (
  email: string,
  password: string
): Promise<ApiResponse<LoginResponse>> => {
  const response = await request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (response.success && response.data) {
    localStorage.setItem("auth_token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }

  return response;
};

export const logout = (): void => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user");
};

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};


type ExpenseDTO = {
  id: string;
  userId: string;
  businessName: string | null;
  businessId: string | null;
  serviceDesc: string | null;
  invoiceNumber: string | null;
  docType: "INVOICE" | "RECEIPT" | "UNKNOWN";
  amountBeforeVat: number;
  amountAfterVat: number;
  transactionDate: string;
  category: "CAR" | "FOOD" | "OPERATIONS" | "IT" | "TRAINING" | "OTHER";
  rawText: string | null;
  createdAt: string;
};

type ExpenseFilters = {
  from?: string;
  to?: string;
  min?: number;
  max?: number;
  category?: string;
  business?: string;
  page?: number;
  pageSize?: number;
};

type PaginatedExpenses = {
  items: ExpenseDTO[];
  totalCount: number;
  page: number;
  pageSize: number;
};

const requestWithFile = async <T>(
  endpoint: string,
  file: File
): Promise<ApiResponse<T>> => {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "שגיאה בהעלאת הקובץ",
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "שגיאת רשת",
    };
  }
};

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

type ParseInvoiceResponse = {
  extracted: ExtractedData;
};

type SaveInvoiceData = {
  businessName?: string;
  businessId?: string;
  serviceDesc?: string;
  invoiceNumber?: string;
  docType?: string;
  amountBeforeVat: number;
  amountAfterVat: number;
  transactionDate: string;
};

export const parseInvoice = async (
  file: File
): Promise<ApiResponse<ParseInvoiceResponse>> => {
  return requestWithFile<ParseInvoiceResponse>("/invoices/parse", file);
};

export const saveInvoice = async (
  data: SaveInvoiceData
): Promise<ApiResponse<{ expense: ExpenseDTO }>> => {
  return request<{ expense: ExpenseDTO }>("/invoices/save", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getExpenses = async (
  filters?: ExpenseFilters
): Promise<ApiResponse<PaginatedExpenses>> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });
  }

  const queryString = params.toString();
  const endpoint = queryString ? `/expenses?${queryString}` : "/expenses";

  return request<PaginatedExpenses>(endpoint);
};

export const updateExpenseCategory = async (
  expenseId: string,
  category: string
): Promise<ApiResponse<{ expense: ExpenseDTO }>> => {
  return request<{ expense: ExpenseDTO }>(`/expenses/${expenseId}/category`, {
    method: "PATCH",
    body: JSON.stringify({ category }),
  });
};

type UpdateExpenseData = {
  businessName?: string | null;
  businessId?: string | null;
  serviceDesc?: string | null;
  invoiceNumber?: string | null;
  docType?: "INVOICE" | "RECEIPT" | "UNKNOWN";
  amountBeforeVat?: number;
  amountAfterVat?: number;
  transactionDate?: string;
  category?: "CAR" | "FOOD" | "OPERATIONS" | "IT" | "TRAINING" | "OTHER";
};

export const updateExpense = async (
  expenseId: string,
  data: UpdateExpenseData
): Promise<ApiResponse<{ expense: ExpenseDTO }>> => {
  return request<{ expense: ExpenseDTO }>(`/expenses/${expenseId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const deleteExpense = async (
  expenseId: string
): Promise<ApiResponse<void>> => {
  return request<void>(`/expenses/${expenseId}`, {
    method: "DELETE",
  });
};

