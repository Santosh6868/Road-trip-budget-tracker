import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Users, TrendingUp, IndianRupee } from "lucide-react";
import { Person } from "@/types/expense";

interface StatsCardsProps {
  totalSpent: number;
  personTotals: Record<string, number>;
  people: Person[];
  categoryTotals: Record<string, number>;
}

export function StatsCards({ totalSpent, personTotals, people, categoryTotals }: StatsCardsProps) {
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-2 text-white/70 mb-2">
            <Wallet className="h-4 w-4 md:h-5 md:w-5" />
            <span className="text-xs md:text-sm font-medium">Total Spent</span>
          </div>
          <p className="text-xl md:text-3xl font-bold text-white">₹{totalSpent.toLocaleString("en-IN")}</p>
          <p className="text-xs text-white/50 mt-1">{Object.keys(categoryTotals).length} categories</p>
        </CardContent>
      </Card>
      <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-2 text-white/70 mb-2">
            <Users className="h-4 w-4 md:h-5 md:w-5" />
            <span className="text-xs md:text-sm font-medium">Per Person</span>
          </div>
          <p className="text-xl md:text-3xl font-bold text-white">₹{(totalSpent / 4).toLocaleString("en-IN")}</p>
          <p className="text-xs text-white/50 mt-1">4 people equal split</p>
        </CardContent>
      </Card>
      <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-2 text-white/70 mb-2">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
            <span className="text-xs md:text-sm font-medium">Top Category</span>
          </div>
          <p className="text-xl md:text-3xl font-bold text-white">
            {topCategory ? topCategory[0] : "N/A"}
          </p>
          <p className="text-xs text-white/50 mt-1">
            {topCategory ? `₹${topCategory[1].toLocaleString("en-IN")}` : "Add expenses"}
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-2 text-white/70 mb-2">
            <IndianRupee className="h-4 w-4 md:h-5 md:w-5" />
            <span className="text-xs md:text-sm font-medium">Top Spender</span>
          </div>
          <p className="text-xl md:text-3xl font-bold text-white">
            {people.reduce((max, p) => (personTotals[p.id] || 0) > (personTotals[max.id] || 0) ? p : max, people[0]).name}
          </p>
          <p className="text-xs text-white/50 mt-1">
            ₹{Math.max(...people.map((p) => personTotals[p.id] || 0)).toLocaleString("en-IN")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}