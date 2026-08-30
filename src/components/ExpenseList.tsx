import { Badge } from "@/components/ui/badge";
import { Clock, User, CreditCard, MapPin, Trash2, ChevronRight } from "lucide-react";
import { Expense, Person } from "@/types/expense";

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onSelect: (expense: Expense) => void;
  selectedExpense: Expense | null;
  people: Person[];
}

const CATEGORY_ICONS: Record<string, string> = {
  Accommodation: "🏨",
  Food: "🍔",
  Fuel: "⛽",
  Miscellaneous: "📦",
  Shopping: "🛍️",
  Sightseeing: "🎟️",
  Smoke: "🚬"
};

export function ExpenseList({ expenses, onDelete, onSelect, selectedExpense, people }: ExpenseListProps) {
  const getPersonName = (id: string) => {
    return people.find((p) => p.id === id)?.name || id;
  };

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className={`flex items-center gap-3 bg-white/10 rounded-xl p-3 cursor-pointer hover:bg-white/20 transition-all border border-white/10 ${
            selectedExpense?.id === expense.id ? "ring-2 ring-indigo-400" : ""
          }`}
          onClick={() => onSelect(expense)}
        >
          <div className="text-2xl">{CATEGORY_ICONS[expense.category] || "📦"}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-white text-sm truncate">
                {expense.subcategory || expense.category}
              </p>
              <p className="font-bold text-white text-sm">₹{expense.amount.toLocaleString("en-IN")}</p>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {expense.dateTime.toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {getPersonName(expense.paidBy)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                {expense.paymentMode}
              </span>
            </div>
            {expense.location && (
              <div className="flex items-center gap-1 mt-1 text-xs text-white/50">
                <MapPin className="h-3 w-3" />
                {expense.location}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {expense.splitAmong && expense.splitAmong.length > 1 && (
              <Badge className="bg-indigo-500/80 text-white border border-indigo-400/30 text-xs">
                {expense.splitAmong.length} split
              </Badge>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(expense.id);
              }}
              className="p-1.5 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <ChevronRight className="h-4 w-4 text-white/40" />
          </div>
        </div>
      ))}
    </div>
  );
}