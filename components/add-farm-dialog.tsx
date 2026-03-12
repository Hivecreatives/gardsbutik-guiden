"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useFarm } from "@/hooks/useFarm";
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
import { Loader2, Store } from "lucide-react";

interface AddFarmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (farmId: string) => void;
}

export function AddFarmDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddFarmDialogProps) {
  const { user } = useUser();
  const {
    addFarm,
    allRegions,
    allCategories,
    error: hookError,
  } = useFarm(user?.id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [farmType, setFarmType] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [regionId, setRegionId] = useState("");
  const [FarmImage, setFarmImage] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const resetForm = () => {
    setName("");
    setFarmType("");
    setOwnerName("");
    setContactNumber("");
    setContactEmail("");
    setFullAddress("");
    setLocationLabel("");
    setRegionId("");
    setFarmImage("");
    setSelectedCategories([]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const farm = await addFarm(
      {
        name,
        farm_type: farmType || null,
        owner_name: ownerName || null,
        contact_number: contactNumber || null,
        contact_email: contactEmail || null,
        full_address: fullAddress || null,
        location_label: locationLabel || null,
        region_id: regionId || null,
        cover_image_url: FarmImage,
        submitted: false,
        is_published: false,
      },
      selectedCategories,
    );

    setLoading(false);

    if (!farm) {
      setError(hookError ?? "Kunde inte spara gården.");
      return;
    }

    resetForm();
    onOpenChange(false);
    onSuccess?.(farm.id);
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
            <Store className="w-5 h-5 text-moss" />
            Lägg till ny gård
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Basic info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="name">Gårdsnamn *</Label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="t.ex. Lilla Gröna Gården"
                className="bg-cream/50 border-soil/20 focus-visible:ring-moss/40"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="farmType">Gårdstyp</Label>
              <Select value={farmType} onValueChange={setFarmType}>
                <SelectTrigger
                  id="farmType"
                  className="bg-cream/50 border-soil/20 w-full"
                >
                  <SelectValue placeholder="Välj typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {/* Farm types come from the categories table */}
                    {allCategories.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="region">Region</Label>
              <Select value={regionId} onValueChange={setRegionId}>
                <SelectTrigger
                  id="region"
                  className="bg-cream/50 border-soil/20 w-full"
                >
                  <SelectValue placeholder="Välj region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {allRegions.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ownerName">Ägarens namn</Label>
              <Input
                id="ownerName"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Anna Larsson"
                className="bg-cream/50 border-soil/20 focus-visible:ring-moss/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactNumber">Telefonnummer</Label>
              <Input
                id="contactNumber"
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+46 70 123 45 67"
                className="bg-cream/50 border-soil/20 focus-visible:ring-moss/40"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="contactEmail">E-post</Label>
              <Input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="kontakt@gard.se"
                className="bg-cream/50 border-soil/20 focus-visible:ring-moss/40"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="fullAddress">Fullständig adress</Label>
              <Input
                id="fullAddress"
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="Lantvägen 12, 123 45 Skåne"
                className="bg-cream/50 border-soil/20 focus-visible:ring-moss/40"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="locationLabel">Platsnamn (kort)</Label>
              <Input
                id="locationLabel"
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                placeholder="t.ex. Skåne, nära Malmö"
                className="bg-cream/50 border-soil/20 focus-visible:ring-moss/40"
              />
            </div>
          </div>

          {/* Categories — multi-select pills from hook data */}
          <div className="space-y-2">
            <Label>Kategorier</Label>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => {
                const selected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      selected
                        ? "bg-moss text-white border-moss"
                        : "bg-white border-soil/20 text-soil hover:border-moss hover:text-moss"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
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
                <Store className="w-4 h-4" />
              )}
              Spara som utkast
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
