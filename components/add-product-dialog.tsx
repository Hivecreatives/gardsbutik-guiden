"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useFarm } from "@/hooks/useFarm";
import type { Database } from "@/lib/supabase/database.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Package } from "lucide-react";

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultFarmId?: string;
  onSuccess?: () => void;
}

const PRODUCT_CATEGORIES = [
  "Grönsaker",
  "Frukt",
  "Bär",
  "Mejeriprodukter",
  "Kött",
  "Fågel",
  "Ägg",
  "Fisk & Skaldjur",
  "Bröd & Bakverk",
  "Honung & Sylt",
  "Drycker",
  "Örter & Kryddor",
  "Övrigt",
];

const UNITS = ["kg", "g", "liter", "dl", "st", "förpackning", "knippe", "låda"];

export function AddProductDialog({
  open,
  onOpenChange,
  defaultFarmId,
  onSuccess,
}: AddProductDialogProps) {
  const { user } = useUser();
  // Hook gives us the farms list + addProduct mutation
  const { farms, addProduct, error: hookError } = useFarm(user?.id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [farmId, setFarmId] = useState(defaultFarmId ?? "");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");
  const [inStock, setInStock] = useState(true);

  // Auto-select the only farm if there's just one
  useEffect(() => {
    if (defaultFarmId) {
      setFarmId(defaultFarmId);
      return;
    }
    if (farms.length === 1) setFarmId(farms[0].id);
  }, [defaultFarmId, farms]);

  const resetForm = () => {
    setFarmId(defaultFarmId ?? "");
    setName("");
    setDescription("");
    setPrice("");
    setUnit("");
    setCategory("");
    setInStock(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmId) {
      setError("Välj en gård.");
      return;
    }
    setLoading(true);
    setError(null);

    const payload: ProductInsert = {
      farm_id: farmId,
      name,
      description: description || null,
      price: price ? parseFloat(price) : null,
      unit: unit || null,
      category: category || null,
      in_stock: inStock,
    };

    const product = await addProduct(payload);

    setLoading(false);

    if (!product) {
      setError(hookError ?? "Kunde inte spara produkten.");
      return;
    }

    resetForm();
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-[90vw] w-full lg:max-w-3xl max-h-[90vh] overflow-y-auto font-body">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-soil font-display flex items-center gap-2">
            <Package className="w-5 h-5 text-moss" />
            Lägg till produkt
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Farm selector — hidden when defaultFarmId is set or only 1 farm */}
          {!defaultFarmId && farms.length > 1 && (
            <div className="space-y-1.5">
              <Label htmlFor="farmId">Gård *</Label>
              <Select value={farmId} onValueChange={setFarmId}>
                <SelectTrigger
                  id="farmId"
                  className="bg-cream/50 border-soil/20 w-full"
                >
                  <SelectValue placeholder="Välj gård" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {farms.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="productName">Produktnamn *</Label>
            <Input
              id="productName"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="t.ex. Ekologiska äpplen"
              className="bg-cream/50 border-soil/20 focus-visible:ring-moss/40"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Beskrivning</Label>
            <textarea
              id="description"
              value={description}
              rows={3}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beskriv produkten kortfattat..."
              className="w-full px-3 py-2 rounded-lg border border-soil/20 bg-cream/50 text-sm text-soil placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-moss/40 focus:border-moss transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">Pris (SEK)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="bg-cream/50 border-soil/20 focus-visible:ring-moss/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit">Enhet</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger
                  id="unit"
                  className="bg-cream/50 border-soil/20 w-full"
                >
                  <SelectValue placeholder="Välj enhet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Kategori</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                id="category"
                className="bg-cream/50 border-soil/20 w-full"
              >
                <SelectValue placeholder="Välj kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* In stock toggle */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-soil/5 border border-soil/10">
            <button
              type="button"
              role="switch"
              aria-checked={inStock}
              onClick={() => setInStock(!inStock)}
              className={`relative w-10 h-5 rounded-full transition-colors ${inStock ? "bg-moss" : "bg-slate-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${inStock ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
            <span className="text-sm font-medium text-soil">
              {inStock ? "I lager" : "Slut i lager"}
            </span>
          </div>

          <DialogFooter className="pt-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-soil/5 transition-all"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-moss px-5 py-2 rounded-lg text-sm font-bold text-white hover:brightness-110 shadow-lg shadow-moss/20 transition-all disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Package className="w-4 h-4" />
              )}
              Spara produkt
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
