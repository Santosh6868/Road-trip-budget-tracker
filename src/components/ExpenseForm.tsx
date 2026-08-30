import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, MapPin, Users, CreditCard, StickyNote, X } from "lucide-react";
import { Expense, Person, PaymentMode } from "@/types/expense";

interface ExpenseFormProps {
  people: Person[];
  categories: { name: string; icon: string; subcategories: string[] }[];
  onAdd: (expense: Expense) => void;
  splitAll: boolean;
}

export function ExpenseForm({ people, categories, onAdd, splitAll }: ExpenseFormProps) {
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitAmong, setSplitAmong] = useState<string[]>(splitAll ? people.map((p) => p.id) : []);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("UPI");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c.name === category);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount || !paidBy) return;

    const expense: Expense = {
      id: Date.now().toString(),
      dateTime: new Date(),
      category,
      subcategory,
      amount: parseFloat(amount),
      paidBy,
      splitAmong: splitAmong.length > 0 ? splitAmong : [paidBy],
      paymentMode,
      location,
      address,
      notes,
      photo: photo || undefined,
    };

    onAdd(expense);

    // Reset form
    setCategory("");
    setSubcategory("");
    setAmount("");
    setPaidBy("");
    setSplitAmong(splitAll ? people.map((p) => p.id) : []);
    setPaymentMode("UPI");
    setLocation("");
    setAddress("");
    setNotes("");
    setPhoto(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category */}
      <div className="space-y-2">
        <Label className="text-white">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.name} value={cat.name}>
                {cat.icon} {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subcategory */}
      {selectedCategory && (
        <div className="space-y-2">
          <Label className="text-white">Subcategory</Label>
          <Select value={subcategory} onValueChange={setSubcategory}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Select subcategory" />
            </SelectTrigger>
            <SelectContent>
              {selectedCategory.subcategories.map((sub) => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Amount */}
      <div className="space-y-2">
        <Label className="text-white">Amount (₹)</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          required
        />
      </div>

      {/* Paid By */}
      <div className="space-y-2">
        <Label className="text-white">Paid By</Label>
        <Select value={paidBy} onValueChange={setPaidBy}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Who paid?" />
          </SelectTrigger>
          <SelectContent>
            {people.map((person) => (
              <SelectItem key={person.id} value={person.id}>
                {person.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Split Among */}
      <div className="space-y-2">
        <Label className="text-white">Split Among</Label>
        <div className="flex flex-wrap gap-2">
          {people.map((person) => (
            <button
              key={person.id}
              type="button"
              onClick={() => {
                setSplitAmong((prev) =>
                  prev.includes(person.id)
                    ? prev.filter((id) => id !== person.id)
                    : [...prev, person.id]
                );
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                splitAmong.includes(person.id)
                  ? "bg-indigo-500 text-white border-indigo-400"
                  : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20"
              }`}
            >
              {person.name}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Mode */}
      <div className="space-y-2">
        <Label className="text-white">Payment Mode</Label>
        <div className="grid grid-cols-3 gap-2">
          {(["UPI", "Cash", "FASTag"] as PaymentMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPaymentMode(mode)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                paymentMode === mode
                  ? "bg-indigo-500 text-white border-indigo-400"
                  : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label className="text-white">Location</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-10"
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label className="text-white">Address</Label>
        <Textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter address"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          rows={2}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label className="text-white">Notes</Label>
        <div className="relative">
          <StickyNote className="absolute left-3 top-3 h-4 w-4 text-white/50" />
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-10"
            rows={2}
          />
        </div>
      </div>

      {/* Photo Upload */}
      <div className="space-y-2">
        <Label className="text-white">Photo</Label>
        {photo ? (
          <div className="relative">
            <img src={photo} alt="Expense" className="w-full h-32 object-cover rounded-lg" />
            <button
              type="button"
              onClick={() => setPhoto(null)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-dashed border-white/30 rounded-lg cursor-pointer hover:bg-white/20 transition-all">
            <Camera className="h-5 w-5 text-white/70" />
            <span className="text-white/70 text-sm">Upload photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg"
      >
        Add Expense
      </Button>
    </form>
  );
}