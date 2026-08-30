import { Card, CardContent } from "@/components/ui/card";

interface CategoryBreakdownProps {
  categoryTotals: Record<string, number>;
  totalSpent: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Accommodation: "#8b5cf6",
  Food: "#f59e0b",
  Fuel: "#10b981",
  Miscellaneous: "#6b7280",
  Shopping: "#ec4899",
  Sightseeing: "#3b82f6",
  Smoke: "#ef4444"
};

const CATEGORY_ICONS: Record<string, string> = {
  Accommodation: "🏨",
  Food: "🍔",
  Fuel: "⛽",
  Miscellaneous: "📦",
  Shopping: "🛍️",
  Sightseeing: "🎟️",
  Smoke: "🚬"
};

export function CategoryBreakdown({ categoryTotals, totalSpent }: CategoryBreakdownProps) {
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const total = totalSpent || 1;

  return (
    <div className="space-y-4">
      {/* Donut Chart */}
      <div className="relative w-40 h-40 mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
          {sortedCategories.map(([category, amount], index) => {
            const percentage = (amount / total) * 100;
            const offset = sortedCategories
              .slice(0, index)
              .reduce((sum, [, amt]) => sum + (amt / total) * 100, 0);
            const color = CATEGORY_COLORS[category] || "#6b7280";
            return (
              <circle
                key={category}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={color}
                strokeWidth="12"
                strokeDasharray={`${percentage} ${100 - percentage}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">₹{totalSpent.toLocaleString("en-IN")}</p>
            <p className="text-xs text-white/60">Total</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {sortedCategories.map(([category, amount]) => {
          const percentage = ((amount / total) * 100).toFixed(1);
          const icon = CATEGORY_ICONS[category] || "📦";
          return (
            <div key={category} className="flex items-center justify-between bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <span className="text-white text-sm">{category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-xs">{percentage}%</span>
                <span className="text-white font-semibold text-sm">₹{amount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}