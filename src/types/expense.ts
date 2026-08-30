export interface Person {
  id: string;
  name: string;
  color: string;
  hexColor: string;
}

export type PaymentMode = "UPI" | "Cash" | "FASTag";

export interface Expense {
  id: string;
  dateTime: Date;
  category: string;
  subcategory: string;
  amount: number;
  paidBy: string;
  splitAmong: string[];
  paymentMode: PaymentMode;
  location: string;
  address: string;
  notes: string;
  photo?: string;
}