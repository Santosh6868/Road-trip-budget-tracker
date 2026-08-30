import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Users,
  TrendingUp,
  Plus,
  X,
  Clock,
  User,
  CreditCard,
  MapPin,
  StickyNote,
  Split,
  Navigation,
  Home,
  History,
  BarChart3,
  Trash2,
  Share2,
  Download,
  Smartphone,
  CheckCircle2,
  PieChart as PieChartIcon,
  IndianRupee,
  Receipt,
  CalendarDays,
  FileSpreadsheet,
  ArrowUpDown,
  Scale
} from "lucide-react";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { StatsCards } from "@/components/StatsCards";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { Expense, Person, PaymentMode } from "@/types/expense";

const PEOPLE: Person[] = [
  { id: "sai", name: "Sai", color: "bg-emerald-500", hexColor: "#10b981" },
  { id: "santosh", name: "Santosh", color: "bg-sky-500", hexColor: "#0ea5e9" },
  { id: "siva", name: "Siva", color: "bg-rose-500", hexColor: "#f43f5e" },
  { id: "srinu", name: "Srinu", color: "bg-amber-500", hexColor: "#f59e0b" }
];

const CATEGORIES = [
  { name: "Accommodation", icon: "🏨", subcategories: ["Late Checkout", "Misc", "Room Amount", "Room Service"] },
  { name: "Food", icon: "🍔", subcategories: ["Alcohol", "Breakfast", "Cool Drinks", "Dinner", "Lunch", "Snacks", "Tea/Coffee", "Water"] },
  { name: "Fuel", icon: "⛽", subcategories: ["Car Repairs", "Fuel", "Tolls (Cash)", "Tolls (Fastag)"] },
  { name: "Miscellaneous", icon: "📦", subcategories: ["Miscellaneous"] },
  { name: "Shopping", icon: "🛍️", subcategories: ["Artifacts", "Clothes", "Households", "Spices", "Toys"] },
  { name: "Sightseeing", icon: "🎟️", subcategories: ["Boat Rides", "Entry Tickets", "Mobile/Camera Stand", "Rides", "Temple Tickets"] },
  { name: "Smoke", icon: "🚬", subcategories: ["Cigarette", "Medicine", "Wet Wipes"] }
];

const CATEGORY_COLORS: Record<string, string> = {
  Accommodation: "#8b5cf6",
  Food: "#f59e0b",
  Fuel: "#10b981",
  Miscellaneous: "#6b7280",
  Shopping: "#ec4899",
  Sightseeing: "#3b82f6",
  Smoke: "#ef4444"
};

type Tab = "home" | "add" | "history" | "stats";

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [splitAll, setSplitAll] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [isMobile, setIsMobile] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("trip-expenses");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setExpenses(parsed.map((e: any) => ({ ...e, dateTime: new Date(e.dateTime) })));
      } catch (e) {
        console.error("Failed to load expenses", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("trip-expenses", JSON.stringify(expenses));
  }, [expenses]);

  // Check if installed as PWA
  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }
    const timer = setTimeout(() => {
      if (!window.matchMedia("(display-mode: standalone)").matches) {
        setShowInstallPrompt(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const addExpense = (expense: Expense) => {
    setExpenses((prev) => [expense, ...prev]);
    if (isMobile) setActiveTab("home");
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  const personTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    PEOPLE.forEach((p) => (totals[p.id] = 0));
    expenses.forEach((e) => {
      if (e.splitAmong && e.splitAmong.length > 0) {
        e.splitAmong.forEach((personId) => {
          const share = e.amount / e.splitAmong.length;
          totals[personId] = (totals[personId] || 0) + share;
        });
      } else {
        totals[e.paidBy] = (totals[e.paidBy] || 0) + e.amount;
      }
    });
    return totals;
  }, [expenses]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return totals;
  }, [expenses]);

  const paymentModeTotals = useMemo(() => {
    const totals: Record<string, number> = { UPI: 0, Cash: 0, FASTag: 0 };
    expenses.forEach((e) => {
      totals[e.paymentMode] = (totals[e.paymentMode] || 0) + e.amount;
    });
    return totals;
  }, [expenses]);

  const splitAmount = totalSpent / 4;

  const personDifferences = useMemo(() => {
    const diffs: Record<string, number> = {};
    PEOPLE.forEach((person) => {
      const spent = personTotals[person.id] || 0;
      diffs[person.id] = spent - splitAmount;
    });
    return diffs;
  }, [personTotals, splitAmount]);

  const getPersonName = (id: string) => {
    return PEOPLE.find((p) => p.id === id)?.name || id;
  };

  const getCategoryIcon = (category: string) => {
    return CATEGORIES.find((c) => c.name === category)?.icon || "📦";
  };

  const handleShare = async () => {
    const shareData = {
      title: "Road Trip Expense Tracker",
      text: `Total Spent: ₹${totalSpent.toLocaleString("en-IN")}\nExpenses: ${expenses.length} entries\n\nTrack your trip expenses with this app!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      setShowShareModal(true);
    }
  };

  const handleInstall = async () => {
    if ((window as any).deferredPrompt) {
      (window as any).deferredPrompt.prompt();
      const choice = await (window as any).deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setShowInstallPrompt(false);
      }
      (window as any).deferredPrompt = null;
    }
  };

  const exportToExcel = () => {
    const headers = [
      "Date & Time",
      "Category",
      "Subcategory",
      "Amount (₹)",
      "Paid By",
      "Split Among",
      "Payment Mode",
      "Location",
      "Address",
      "Notes",
      "Photo"
    ];
    const rows = expenses.map((e) => [
      e.dateTime.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      e.category,
      e.subcategory || "",
      e.amount,
      getPersonName(e.paidBy),
      e.splitAmong && e.splitAmong.length > 0
        ? e.splitAmong.map((id) => getPersonName(id)).join(", ")
        : getPersonName(e.paidBy),
      e.paymentMode,
      e.location || "",
      e.address || "",
      e.notes || "",
      e.photo || "",
    ]);

    const summaryRows = [
      [],
      ["=== TRIP SUMMARY ==="],
      ["Total Spent", totalSpent],
      ["Per Person Share", splitAmount],
      [],
      ["=== INDIVIDUAL SPENDING ==="],
      ["Name", "Amount Spent", "Equal Share", "Difference"],
      ...PEOPLE.map((person) => [
        person.name,
        personTotals[person.id] || 0,
        splitAmount,
        personDifferences[person.id],
      ]),
      [],
      ["=== CATEGORY BREAKDOWN ==="],
      ["Category", "Amount"],
      ...Object.entries(categoryTotals).map(([cat, amt]) => [cat, amt]),
      [],
      ["=== PAYMENT MODE BREAKDOWN ==="],
      ["Mode", "Amount"],
      ...Object.entries(paymentModeTotals).map(([mode, amt]) => [mode, amt]),
    ];

    const allRows = [headers, ...rows, ...summaryRows];

    const csv = allRows
      .map((row) =>
        row
          .map((cell) => {
            if (typeof cell === "string" && (cell.includes(",") || cell.includes('"') || cell.includes("\n"))) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `road-trip-expenses-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const topSpender = PEOPLE.reduce((max, p) => (personTotals[p.id] || 0) > (personTotals[max.id] || 0) ? p : max, PEOPLE[0]);

  return (
    <div className="min-h-screen relative">
      {/* Background Car Image */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1920&auto=format&fit=crop"
          alt="Hyundai Verna 2026 Black"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-slate-900/60 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen pb-20 md:pb-0">
        <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-3 md:px-6 py-3 md:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 md:p-3 bg-white/10 rounded-xl md:rounded-2xl backdrop-blur border border-white/20">
                  <Navigation className="h-5 w-5 md:h-8 md:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-base md:text-3xl font-bold tracking-tight text-white drop-shadow-lg">Road Trip</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 rounded-full px-3 md:px-4 py-1.5 md:py-2 backdrop-blur transition-all"
                >
                  <FileSpreadsheet className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-sm md:text-base font-medium hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 bg-white/10 rounded-full backdrop-blur border border-white/20 hover:bg-white/20 transition-all"
                >
                  <Share2 className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </button>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 md:px-4 py-1.5 md:py-2 backdrop-blur border border-white/20">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  <span className="font-medium text-white text-sm md:text-base">4</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-3 md:px-6 py-3 md:py-8">
          {/* Mobile: Show only active tab content */}
          {isMobile ? (
            <>
              {activeTab === "home" && (
                <div className="space-y-3">
                  {/* 1. Add Expense on top */}
                  <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader className="border-b border-white/10 py-3">
                      <CardTitle className="flex items-center gap-2 text-base text-white">
                        <Plus className="h-4 w-4 text-indigo-300" />
                        Add Expense
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <ExpenseForm people={PEOPLE} categories={CATEGORIES} onAdd={addExpense} splitAll={splitAll} />
                    </CardContent>
                  </Card>

                  {/* 2. Total Spent in pie chart format */}
                  <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader className="border-b border-white/10 py-3">
                      <CardTitle className="flex items-center gap-2 text-base text-white">
                        <PieChartIcon className="h-4 w-4 text-indigo-300" />
                        Total Spent
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="text-center mb-3">
                        <p className="text-3xl font-bold text-white">₹{totalSpent.toLocaleString("en-IN")}</p>
                        <p className="text-xs text-white/60 mt-1">{expenses.length} expenses recorded</p>
                      </div>
                      {Object.keys(categoryTotals).length > 0 ? (
                        <CategoryBreakdown categoryTotals={categoryTotals} totalSpent={totalSpent} />
                      ) : (
                        <div className="text-center py-6">
                          <div className="text-4xl mb-2">💸</div>
                          <p className="text-white/70 text-sm">No expenses yet</p>
                          <p className="text-white/50 text-xs mt-1">Add your first expense above</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 3. Expense History */}
                  <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader className="border-b border-white/10 py-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base text-white">
                          <History className="h-4 w-4 text-indigo-300" />
                          Expense History
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs bg-white/10 text-white border border-white/20">
                          {expenses.length} entries
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3">
                      {expenses.length === 0 ? (
                        <div className="text-center py-6">
                          <div className="text-4xl mb-2">📄</div>
                          <p className="text-white/70 text-sm">No expenses recorded yet</p>
                          <p className="text-white/50 text-xs mt-1">Your trip expenses will appear here</p>
                        </div>
                      ) : (
                        <ExpenseList
                          expenses={expenses.slice(0, 5)}
                          onDelete={deleteExpense}
                          onSelect={setSelectedExpense}
                          selectedExpense={selectedExpense}
                          people={PEOPLE}
                        />
                      )}
                      {expenses.length > 5 && (
                        <button
                          onClick={() => setActiveTab("history")}
                          className="w-full mt-2 text-center text-sm text-indigo-300 hover:text-indigo-200 font-medium py-2"
                        >
                          View all {expenses.length} expenses
                        </button>
                      )}
                    </CardContent>
                  </Card>

                  {/* 4. Equal Split Status */}
                  <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader className="border-b border-white/10 py-3">
                      <CardTitle className="flex items-center gap-2 text-base text-white">
                        <Scale className="h-4 w-4 text-emerald-300" />
                        Equal Split Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="bg-emerald-500/20 rounded-xl p-3 mb-3">
                        <p className="text-xs text-emerald-200">Each person should pay</p>
                        <p className="text-2xl font-bold text-white">₹{splitAmount.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="space-y-2">
                        {PEOPLE.map((person) => {
                          const diff = personDifferences[person.id];
                          const isPositive = diff > 0;
                          return (
                            <div key={person.id} className="flex items-center justify-between bg-white/10 rounded-lg p-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full ${person.color} flex items-center justify-center text-white text-xs font-bold`}>
                                  {person.name.charAt(0)}
                                </div>
                                <span className="text-white text-sm">{person.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-semibold text-sm">₹{(personTotals[person.id] || 0).toLocaleString("en-IN")}</span>
                                {diff !== 0 && (
                                  <Badge className={`${isPositive ? "bg-rose-500/80" : "bg-emerald-500/80"} text-white border border-white/20`}>
                                    {isPositive ? "Owes" : "Owed"} ₹{Math.abs(diff).toLocaleString("en-IN")}
                                  </Badge>
                                )}
                                {diff === 0 && (
                                  <Badge className="bg-emerald-500/80 text-white border border-white/20">
                                    Settled
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 5. Category Breakdown */}
                  <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader className="border-b border-white/10 py-3">
                      <CardTitle className="flex items-center gap-2 text-base text-white">
                        <PieChartIcon className="h-4 w-4 text-indigo-300" />
                        Category Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      {Object.keys(categoryTotals).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([category, amount]) => {
                            const percentage = ((amount / totalSpent) * 100).toFixed(1);
                            const icon = CATEGORIES.find((c) => c.name === category)?.icon || "📦";
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
                      ) : (
                        <div className="text-center py-6">
                          <div className="text-4xl mb-2">📊</div>
                          <p className="text-white/70 text-sm">No data yet</p>
                          <p className="text-white/50 text-xs mt-1">Add expenses to see the breakdown</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 6. Payment Mode Breakdown */}
                  <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader className="border-b border-white/10 py-3">
                      <CardTitle className="flex items-center gap-2 text-base text-white">
                        <CreditCard className="h-4 w-4 text-amber-300" />
                        Payment Mode Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        {["UPI", "Cash", "FASTag"].map((mode) => (
                          <div key={mode} className="flex items-center justify-between bg-white/10 rounded-lg p-2">
                            <span className="text-white text-sm">{mode}</span>
                            <span className="text-white font-semibold text-sm">₹{(paymentModeTotals[mode] || 0).toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 7. Per Person */}
                  <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader className="border-b border-white/10 py-3">
                      <CardTitle className="flex items-center gap-2 text-base text-white">
                        <Users className="h-4 w-4 text-indigo-300" />
                        Per Person
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        {PEOPLE.map((person) => (
                          <div key={person.id} className="flex items-center justify-between bg-white/10 rounded-lg p-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full ${person.color} flex items-center justify-center text-white text-sm font-bold`}>
                                {person.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-white text-sm">{person.name}</span>
                            </div>
                            <span className="text-white font-semibold text-sm">₹{(personTotals[person.id] || 0).toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 8. Top Category */}
                  <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader className="border-b border-white/10 py-3">
                      <CardTitle className="flex items-center gap-2 text-base text-white">
                        <TrendingUp className="h-4 w-4 text-indigo-300" />
                        Top Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      {topCategory ? (
                        <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{CATEGORIES.find((c) => c.name === topCategory[0])?.icon || "📦"}</span>
                            <div>
                              <p className="text-white font-semibold text-sm">{topCategory[0]}</p>
                              <p className="text-white/50 text-xs">Highest spending category</p>
                            </div>
                          </div>
                          <span className="text-white font-bold text-lg">₹{topCategory[1].toLocaleString("en-IN")}</span>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-white/70 text-sm">No data yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 9. Top Spender */}
                  <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader className="border-b border-white/10 py-3">
                      <CardTitle className="flex items-center gap-2 text-base text-white">
                        <IndianRupee className="h-4 w-4 text-amber-300" />
                        Top Spender
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      {expenses.length > 0 ? (
                        <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-full ${topSpender.color} flex items-center justify-center text-white font-bold`}>
                              {topSpender.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-semibold text-sm">{topSpender.name}</p>
                              <p className="text-white/50 text-xs">Highest spender</p>
                            </div>
                          </div>
                          <span className="text-white font-bold text-lg">₹{(personTotals[topSpender.id] || 0).toLocaleString("en-IN")}</span>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-white/70 text-sm">No data yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 10. Export */}
                  <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader className="border-b border-white/10 py-3">
                      <CardTitle className="flex items-center gap-2 text-base text-white">
                        <FileSpreadsheet className="h-4 w-4 text-emerald-300" />
                        Export
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <button
                        onClick={() => setShowExportModal(true)}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg border bg-emerald-500/20 text-emerald-200 border-emerald-400/30 hover:bg-emerald-500/30"
                      >
                        <Download className="h-5 w-5" />
                        Export to Excel
                      </button>
                      <p className="text-center text-white/50 text-xs mt-2">
                        Download all expenses with summary and split details
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "add" && (
                <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                  <CardHeader className="border-b border-white/10 py-3">
                    <CardTitle className="flex items-center gap-2 text-base text-white">
                      <Plus className="h-4 w-4 text-indigo-300" />
                      Add Expense
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <ExpenseForm people={PEOPLE} categories={CATEGORIES} onAdd={addExpense} splitAll={splitAll} />
                  </CardContent>
                </Card>
              )}

              {activeTab === "history" && (
                <div className="space-y-3">
                  <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader className="border-b border-white/10 py-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base text-white">
                          <History className="h-4 w-4 text-indigo-300" />
                          All Expenses
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs bg-white/10 text-white border border-white/20">
                          {expenses.length} entries
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3">
                      {expenses.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-4xl mb-2">📄</div>
                          <p className="text-white/70 text-sm">No expenses recorded yet</p>
                          <p className="text-white/50 text-xs mt-1">Your trip expenses will appear here</p>
                        </div>
                      ) : (
                        <ExpenseList
                          expenses={expenses}
                          onDelete={deleteExpense}
                          onSelect={setSelectedExpense}
                          selectedExpense={selectedExpense}
                          people={PEOPLE}
                        />
                      )}

                      <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                        <button
                          onClick={() => setShowSplitModal(true)}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg border bg-indigo-500/20 text-indigo-200 border-indigo-400/30 hover:bg-indigo-500/30"
                        >
                          <Split className="h-5 w-5" />
                          Split Among 4
                        </button>
                        <button
                          onClick={() => setShowExportModal(true)}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg border bg-emerald-500/20 text-emerald-200 border-emerald-400/30 hover:bg-emerald-500/30"
                        >
                          <FileSpreadsheet className="h-5 w-5" />
                          Export to Excel
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "stats" && (
                <div className="space-y-3">
                  <StatsCards totalSpent={totalSpent} personTotals={personTotals} people={PEOPLE} categoryTotals={categoryTotals} />

                  {/* Equal Split Status */}
                  <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader className="border-b border-white/10 py-3">
                      <CardTitle className="flex items-center gap-2 text-base text-white">
                        <Scale className="h-4 w-4 text-emerald-300" />
                        Equal Split Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="bg-emerald-500/20 rounded-xl p-3 mb-3">
                        <p className="text-xs text-emerald-200">Each person should pay</p>
                        <p className="text-2xl font-bold text-white">₹{splitAmount.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="space-y-2">
                        {PEOPLE.map((person) => {
                          const diff = personDifferences[person.id];
                          const isPositive = diff > 0;
                          return (
                            <div key={person.id} className="flex items-center justify-between bg-white/10 rounded-lg p-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full ${person.color} flex items-center justify-center text-white text-xs font-bold`}>
                                  {person.name.charAt(0)}
                                </div>
                                <span className="text-white text-sm">{person.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-semibold text-sm">₹{(personTotals[person.id] || 0).toLocaleString("en-IN")}</span>
                                {diff !== 0 && (
                                  <Badge className={`${isPositive ? "bg-rose-500/80" : "bg-emerald-500/80"} text-white border border-white/20`}>
                                    {isPositive ? "Owes" : "Owed"} ₹{Math.abs(diff).toLocaleString("en-IN")}
                                  </Badge>
                                )}
                                {diff === 0 && (
                                  <Badge className="bg-emerald-500/80 text-white border border-white/20">
                                    Settled
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Category Breakdown */}
                  <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader className="border-b border-white/10 py-3">
                      <CardTitle className="flex items-center gap-2 text-base text-white">
                        <PieChartIcon className="h-4 w-4 text-indigo-300" />
                        Category Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      {Object.keys(categoryTotals).length > 0 ? (
                        <CategoryBreakdown categoryTotals={categoryTotals} totalSpent={totalSpent} />
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-4xl mb-2">📊</div>
                          <p className="text-white/70 text-sm">No data yet</p>
                          <p className="text-white/50 text-xs mt-1">Add expenses to see the breakdown</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Payment Mode Breakdown */}
                  <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader className="border-b border-white/10 py-3">
                      <CardTitle className="flex items-center gap-2 text-base text-white">
                        <CreditCard className="h-4 w-4 text-amber-300" />
                        Payment Mode Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        {["UPI", "Cash", "FASTag"].map((mode) => (
                          <div key={mode} className="flex items-center justify-between bg-white/10 rounded-lg p-2">
                            <span className="text-white text-sm">{mode}</span>
                            <span className="text-white font-semibold text-sm">₹{(paymentModeTotals[mode] || 0).toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Split Details */}
                  <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader className="border-b border-white/10 py-3">
                      <CardTitle className="flex items-center gap-2 text-base text-white">
                        <Split className="h-4 w-4 text-indigo-300" />
                        Split Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="bg-indigo-500/20 rounded-xl p-4 mb-4">
                        <p className="text-sm text-indigo-200 font-medium">Total Amount</p>
                        <p className="text-3xl font-bold text-white mt-1">₹{totalSpent.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="space-y-3">
                        {PEOPLE.map((person) => (
                          <div key={person.id} className="flex items-center justify-between bg-white/10 rounded-xl p-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full ${person.color} flex items-center justify-center text-white font-bold`}>
                                {person.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-white text-sm">{person.name}</p>
                                <p className="text-xs text-white/70">Share</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-white">₹{splitAmount.toLocaleString("en-IN")}</p>
                              <p className="text-xs text-white/70">25% each</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 bg-emerald-500/20 rounded-xl p-4 border border-emerald-400/30">
                        <p className="text-sm text-emerald-200 font-medium">Each person pays</p>
                        <p className="text-2xl font-bold text-white mt-1">₹{splitAmount.toLocaleString("en-IN")}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          ) : (
            /* Desktop Layout */
            <>
              <StatsCards totalSpent={totalSpent} personTotals={personTotals} people={PEOPLE} categoryTotals={categoryTotals} />
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader className="border-b border-white/10">
                      <CardTitle className="flex items-center gap-2 text-lg text-white">
                        <Plus className="h-5 w-5 text-indigo-300" />
                        Add Expense
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ExpenseForm people={PEOPLE} categories={CATEGORIES} onAdd={addExpense} splitAll={splitAll} />
                    </CardContent>
                  </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                  <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader className="border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg text-white">
                          <TrendingUp className="h-5 w-5 text-indigo-300" />
                          Expense History
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowExportModal(true)}
                            className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
                          >
                            <FileSpreadsheet className="h-4 w-4" />
                            Export
                          </button>
                          <Badge variant="secondary" className="text-sm bg-white/10 text-white border border-white/20">
                            {expenses.length} entries
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ExpenseList
                        expenses={expenses}
                        onDelete={deleteExpense}
                        onSelect={setSelectedExpense}
                        selectedExpense={selectedExpense}
                        people={PEOPLE}
                      />
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <button
                          onClick={() => setShowSplitModal(true)}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg border bg-indigo-500/20 text-indigo-200 border-indigo-400/30 hover:bg-indigo-500/30"
                        >
                          <Split className="h-5 w-5" />
                          Split Among 4
                        </button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Equal Split Status */}
                  <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader className="border-b border-white/10">
                      <CardTitle className="flex items-center gap-2 text-lg text-white">
                        <Scale className="h-5 w-5 text-emerald-300" />
                        Equal Split Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-emerald-500/20 rounded-xl p-4">
                          <p className="text-sm text-emerald-200 font-medium">Each person should pay</p>
                          <p className="text-3xl font-bold text-white mt-1">₹{splitAmount.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="space-y-2">
                          {PEOPLE.map((person) => {
                            const diff = personDifferences[person.id];
                            const isPositive = diff > 0;
                            return (
                              <div key={person.id} className="flex items-center justify-between bg-white/10 rounded-lg p-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-full ${person.color} flex items-center justify-center text-white text-xs font-bold`}>
                                    {person.name.charAt(0)}
                                  </div>
                                  <span className="text-white text-sm">{person.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-semibold text-sm">₹{(personTotals[person.id] || 0).toLocaleString("en-IN")}</span>
                                  {diff !== 0 && (
                                    <Badge className={`${isPositive ? "bg-rose-500/80" : "bg-emerald-500/80"} text-white border border-white/20`}>
                                      {isPositive ? "Owes" : "Owed"} ₹{Math.abs(diff).toLocaleString("en-IN")}
                                    </Badge>
                                  )}
                                  {diff === 0 && (
                                    <Badge className="bg-emerald-500/80 text-white border border-white/20">
                                      Settled
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                      <CardHeader className="border-b border-white/10">
                        <CardTitle className="flex items-center gap-2 text-lg text-white">
                          <PieChartIcon className="h-5 w-5 text-indigo-300" />
                          Category Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        {Object.keys(categoryTotals).length > 0 ? (
                          <CategoryBreakdown categoryTotals={categoryTotals} totalSpent={totalSpent} />
                        ) : (
                          <div className="text-center py-8">
                            <div className="text-4xl mb-2">📊</div>
                            <p className="text-white/70 text-sm">No data yet</p>
                            <p className="text-white/50 text-xs mt-1">Add expenses to see the breakdown</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                      <CardHeader className="border-b border-white/10">
                        <CardTitle className="flex items-center gap-2 text-lg text-white">
                          <CreditCard className="h-5 w-5 text-amber-300" />
                          Payment Mode Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          {["UPI", "Cash", "FASTag"].map((mode) => (
                            <div key={mode} className="flex items-center justify-between bg-white/10 rounded-lg p-2">
                              <span className="text-white text-sm">{mode}</span>
                              <span className="text-white font-semibold text-sm">₹{(paymentModeTotals[mode] || 0).toLocaleString("en-IN")}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Install Prompt */}
      {showInstallPrompt && !isInstalled && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <Smartphone className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 text-sm">Install Trip Expense Tracker</h3>
                <p className="text-xs text-slate-600 mt-1">
                  {/iPad|iPhone|iPod/.test(navigator.userAgent)
                    ? "Tap the Share button in Safari, then select 'Add to Home Screen'"
                    : "Install this app on your device for quick access, even offline!"}
                </p>
                {!/iPad|iPhone|iPod/.test(navigator.userAgent) && (
                  <button
                    onClick={handleInstall}
                    className="mt-3 w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg text-sm"
                  >
                    <Download className="h-4 w-4" />
                    Install App
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="p-1.5 bg-slate-100 rounded-full hover:bg-slate-200 transition-all"
              >
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-xl border-t border-white/20">
          <div className="grid grid-cols-4 gap-1 p-2">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
                activeTab === "home" ? "bg-white/20 text-white" : "text-white/60"
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium">Home</span>
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
                activeTab === "add" ? "bg-white/20 text-white" : "text-white/60"
              }`}
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs font-medium">Add</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
                activeTab === "history" ? "bg-white/20 text-white" : "text-white/60"
              }`}
            >
              <History className="h-5 w-5" />
              <span className="text-xs font-medium">History</span>
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
                activeTab === "stats" ? "bg-white/20 text-white" : "text-white/60"
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs font-medium">Stats</span>
            </button>
          </div>
        </nav>
      )}

      {/* Split Modal */}
      {showSplitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowSplitModal(false)}
        >
          <div
            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Split Among 4</h2>
              <button
                onClick={() => setShowSplitModal(false)}
                className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-all"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-indigo-600 font-medium">Total Amount</p>
              <p className="text-3xl font-bold text-indigo-700 mt-1">₹{totalSpent.toLocaleString("en-IN")}</p>
            </div>
            <div className="space-y-3">
              {PEOPLE.map((person) => (
                <div key={person.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${person.color} flex items-center justify-center text-white font-bold`}>
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{person.name}</p>
                      <p className="text-xs text-slate-500">Share</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-800">₹{splitAmount.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-slate-500">25% each</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <p className="text-sm text-emerald-600 font-medium">Each person pays</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">₹{splitAmount.toLocaleString("en-IN")}</p>
            </div>
            <button
              onClick={() => setShowSplitModal(false)}
              className="w-full mt-6 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Export to Excel</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-all"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 mb-4 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <FileSpreadsheet className="h-5 w-5" />
                <p className="font-semibold">Export Summary</p>
              </div>
              <p className="text-sm text-slate-700">Total Expenses: {expenses.length} entries</p>
              <p className="text-sm text-slate-700">Total Amount: ₹{totalSpent.toLocaleString("en-IN")}</p>
              <p className="text-sm text-slate-700">Per Person: ₹{splitAmount.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-slate-600 mb-2">The export will include:</p>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• Complete expense history with all details</li>
                <li>• Individual spending summary</li>
                <li>• Equal split calculation</li>
                <li>• Difference amounts for each person</li>
                <li>• Category breakdown</li>
                <li>• Payment mode breakdown</li>
              </ul>
            </div>
            <button
              onClick={exportToExcel}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg"
            >
              <Download className="h-5 w-5" />
              Download Excel File
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Share App</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-all"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-slate-600">Copy this link to share with friends:</p>
              <div className="flex items-center gap-2 mt-2">
                <input
                  readOnly
                  value={window.location.href}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setShowShareModal(false);
                  }}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-semibold">Trip Summary</p>
              </div>
              <p className="text-sm text-slate-700">Total Spent: ₹{totalSpent.toLocaleString("en-IN")}</p>
              <p className="text-sm text-slate-700">Expenses: {expenses.length} entries</p>
              <p className="text-sm text-slate-700">People: 4 (Siva, Sai, Srinu, Santosh)</p>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Expanded Expense Modal */}
      {selectedExpense && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedExpense(null)}
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              {selectedExpense.photo ? (
                <img
                  src={selectedExpense.photo}
                  alt={selectedExpense.location}
                  className="w-full h-64 object-cover rounded-t-2xl"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center rounded-t-2xl">
                  <span className="text-8xl">{getCategoryIcon(selectedExpense.category)}</span>
                </div>
              )}
              <button
                onClick={() => setSelectedExpense(null)}
                className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-all"
              >
                <X className="h-5 w-5 text-slate-700" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {selectedExpense.subcategory || selectedExpense.category}
                  </h2>
                  <p className="text-slate-500 mt-1">{selectedExpense.category}</p>
                </div>
                <span className="text-3xl font-bold text-indigo-600">
                  ₹{selectedExpense.amount.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <Clock className="h-4 w-4" />
                    Date & Time
                  </div>
                  <p className="font-semibold text-slate-800">
                    {selectedExpense.dateTime.toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <User className="h-4 w-4" />
                    Paid By
                  </div>
                  <p className="font-semibold text-slate-800">{getPersonName(selectedExpense.paidBy)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <CreditCard className="h-4 w-4" />
                    Payment Mode
                  </div>
                  <p className="font-semibold text-slate-800">{selectedExpense.paymentMode}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <MapPin className="h-4 w-4" />
                    Location
                  </div>
                  <p className="font-semibold text-slate-800">{selectedExpense.location || "N/A"}</p>
                </div>
              </div>

              {selectedExpense.splitAmong && selectedExpense.splitAmong.length > 0 && (
                <div className="mt-4 bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                    <Users className="h-4 w-4" />
                    Split Among
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedExpense.splitAmong.map((personId) => {
                      const person = PEOPLE.find((p) => p.id === personId);
                      return (
                        <span key={personId} className={`px-3 py-1 rounded-full text-xs font-medium text-white ${person?.color}`}>
                          {person?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedExpense.address && (
                <div className="mt-4 bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <MapPin className="h-4 w-4" />
                    Address
                  </div>
                  <p className="font-semibold text-slate-800">{selectedExpense.address}</p>
                </div>
              )}

              {selectedExpense.notes && (
                <div className="mt-4 bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <StickyNote className="h-4 w-4" />
                    Notes
                  </div>
                  <p className="font-semibold text-slate-800">{selectedExpense.notes}</p>
                </div>
              )}

              <button
                onClick={() => setSelectedExpense(null)}
                className="w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}