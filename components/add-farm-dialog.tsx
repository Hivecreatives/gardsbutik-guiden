"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useFarm } from "@/hooks/useFarm";
import { createClient } from "@/lib/supabase/client";
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
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
} from "@/components/ui/file-upload";
import { Loader2, Store, X, ImageIcon, Images } from "lucide-react";

const MAX_SIZE = 1 * 1024 * 1024; // 1 MB

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
  const supabase = createClient();

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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Image state
  const [coverFiles, setCoverFiles] = useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

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
    setSelectedCategories([]);
    setCoverFiles([]);
    setGalleryFiles([]);
    setError(null);
    setUploadProgress(null);
  };

  // Upload a single file to a bucket, returns public URL
  const uploadFile = async (
    file: File,
    bucket: string,
    path: string,
  ): Promise<string> => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });
    if (error) throw new Error(`Uppladdning misslyckades: ${error.message}`);
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Upload cover image if provided
      let coverImageUrl: string | null = null;
      if (coverFiles[0]) {
        setUploadProgress("Laddar upp omslagsbild...");
        const ext = coverFiles[0].name.split(".").pop();
        coverImageUrl = await uploadFile(
          coverFiles[0],
          "farm-covers",
          `${user.id}/${Date.now()}-cover.${ext}`,
        );
      }

      // 2. Create the farm
      setUploadProgress("Sparar gård...");
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
          cover_image_url: coverImageUrl,
          submitted: true,
          is_published: false,
        },
        selectedCategories,
      );

      if (!farm) throw new Error(hookError ?? "Kunde inte spara gården.");

      // 3. Upload gallery images and insert into farm_images table
      if (galleryFiles.length > 0) {
        setUploadProgress(`Laddar upp ${galleryFiles.length} galleribilder...`);
        const galleryUrls = await Promise.all(
          galleryFiles.map((file, i) => {
            const ext = file.name.split(".").pop();
            return uploadFile(
              file,
              "farm-gallery",
              `${user.id}/${farm.id}/${Date.now()}-${i}.${ext}`,
            );
          }),
        );

        await supabase.from("farm_images").insert(
          galleryUrls.map((url, i) => ({
            farm_id: farm.id,
            url,
            sort_order: i,
          })),
        );
      }

      resetForm();
      onOpenChange(false);
      onSuccess?.(farm.id);
    } catch (err: any) {
      setError(err.message ?? "Något gick fel.");
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
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

          {/* Cover Image */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-moss" />
              Omslagsbild
              <span className="text-xs text-slate-400 font-normal">
                (max 1 MB)
              </span>
            </Label>
            <FileUpload
              accept="image/jpeg,image/png,image/webp"
              maxFiles={1}
              maxSize={MAX_SIZE}
              value={coverFiles}
              onValueChange={setCoverFiles}
              onFileReject={(_, msg) => setError(msg)}
            >
              <FileUploadDropzone className="border-soil/20 bg-cream/30 hover:bg-cream/60 data-dragging:border-moss data-dragging:bg-moss/5">
                <div className="flex flex-col items-center gap-1 text-center">
                  <ImageIcon className="w-8 h-8 text-soil/30" />
                  <p className="text-sm font-medium text-soil/60">
                    Dra hit eller klicka för att välja omslagsbild
                  </p>
                  <p className="text-xs text-slate-400">
                    JPG, PNG eller WebP · Max 1 MB
                  </p>
                </div>
              </FileUploadDropzone>
              <FileUploadList>
                {coverFiles.map((file) => (
                  <FileUploadItem
                    key={file.name}
                    value={file}
                    className="border-soil/10 bg-cream/30"
                  >
                    <FileUploadItemPreview className="rounded-md border-soil/10" />
                    <FileUploadItemMetadata />
                    <FileUploadItemDelete asChild>
                      <button className="ml-auto p-1 rounded hover:bg-soil/10 text-slate-400 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </FileUploadItemDelete>
                  </FileUploadItem>
                ))}
              </FileUploadList>
            </FileUpload>
          </div>

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
              <Label htmlFor="farmType">Gårdstyp *</Label>
              <Select value={farmType} onValueChange={setFarmType} required>
                <SelectTrigger
                  id="farmType"
                  className="bg-cream/50 border-soil/20 w-full"
                >
                  <SelectValue placeholder="Välj typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
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
              <Label htmlFor="region">Region *</Label>
              <Select value={regionId} onValueChange={setRegionId} required>
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
              <Label htmlFor="ownerName">Ägarens namn *</Label>
              <Input
                id="ownerName"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Anna Larsson"
                className="bg-cream/50 border-soil/20 focus-visible:ring-moss/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactNumber">Telefonnummer *</Label>
              <Input
                required
                id="contactNumber"
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+46 70 123 45 67"
                className="bg-cream/50 border-soil/20 focus-visible:ring-moss/40"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="contactEmail">E-post *</Label>
              <Input
                required
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
              <Label htmlFor="fullAddress">Fullständig adress *</Label>
              <Input
                required
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
                required
                id="locationLabel"
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                placeholder="t.ex. Skåne, nära Malmö"
                className="bg-cream/50 border-soil/20 focus-visible:ring-moss/40"
              />
            </div>
          </div>

          {/* Categories */}
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

          {/* Gallery Images */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Images className="w-4 h-4 text-moss" />
              Galleribilder
              <span className="text-xs text-slate-400 font-normal">
                (max 1 MB / bild · upp till 10 bilder)
              </span>
            </Label>
            <FileUpload
              accept="image/jpeg,image/png,image/webp"
              maxFiles={10}
              maxSize={MAX_SIZE}
              multiple
              value={galleryFiles}
              onValueChange={setGalleryFiles}
              onFileReject={(_, msg) => setError(msg)}
            >
              <FileUploadDropzone className="border-soil/20 bg-cream/30 hover:bg-cream/60 data-dragging:border-moss data-dragging:bg-moss/5">
                <div className="flex flex-col items-center gap-1 text-center">
                  <Images className="w-8 h-8 text-soil/30" />
                  <p className="text-sm font-medium text-soil/60">
                    Dra hit eller klicka för att välja galleribilder
                  </p>
                  <p className="text-xs text-slate-400">
                    JPG, PNG eller WebP · Max 1 MB per bild · Upp till 10 bilder
                  </p>
                </div>
              </FileUploadDropzone>
              <FileUploadList orientation="horizontal" className="mt-2">
                {galleryFiles.map((file) => (
                  <FileUploadItem
                    key={file.name}
                    value={file}
                    className="w-28 flex-col items-center border-soil/10 bg-cream/30 p-2 gap-1"
                  >
                    <FileUploadItemPreview className="w-20 h-20 rounded-md border-soil/10" />
                    <FileUploadItemMetadata
                      size="sm"
                      className="items-center text-center"
                    />
                    <FileUploadItemDelete asChild>
                      <button className="absolute top-1 right-1 p-0.5 rounded-full bg-white/80 hover:bg-red-50 text-slate-400 hover:text-red-500 shadow transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </FileUploadItemDelete>
                  </FileUploadItem>
                ))}
              </FileUploadList>
            </FileUpload>
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
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploadProgress ?? "Sparar..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Skicka för godkännande
                </span>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
