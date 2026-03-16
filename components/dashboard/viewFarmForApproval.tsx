"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  User,
  Store,
  AlertCircle,
  Eye,
  CircleCheck,
  CircleX,
  Loader2,
  Tag,
  Clock,
} from "lucide-react";
import NextImage from "next/image";
import { approveFarm, rejectFarm } from "@/app/actions/farm-approval";

export type FarmForApproval = {
  id: string;
  name: string;
  is_published: boolean;
  submitted: boolean;
  rejection_reason: string | null;
  farm_type: string | null;
  owner_name: string | null;
  contact_number: string | null;
  contact_email: string | null;
  full_address: string | null;
  location_label: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  region: { name: string } | null;
  municipality: { name: string } | null;
  owner: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  images: { url: string; caption: string | null }[];
  categories: { name: string }[];
  opening_hours: {
    day_of_week: string;
    open_time: string | null;
    close_time: string | null;
    is_closed: boolean;
  }[];
};

interface Props {
  farm: FarmForApproval;
}

const Empty = ({ text }: { text: string }) => (
  <p className="text-sm text-gray-400 italic">{text}</p>
);

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

export function ViewFarmForApproval({ farm }: Props) {
  const [open, setOpen] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Defensive defaults — Supabase returns null instead of [] for empty joins
  const categories = farm.categories ?? [];
  const images = farm.images ?? [];
  const openingHours = farm.opening_hours ?? [];

  const handleApprove = () => {
    startTransition(async () => {
      try {
        await approveFarm(farm.id);
        setFeedback({ type: "success", message: "Gården har publicerats!" });
        setTimeout(() => setOpen(false), 1200);
      } catch (e: any) {
        setFeedback({ type: "error", message: e.message });
      }
    });
  };

  const handleReject = () => {
    if (!reason.trim()) return;
    startTransition(async () => {
      try {
        await rejectFarm(farm.id, reason.trim());
        setFeedback({ type: "success", message: "Gården har avvisats." });
        setTimeout(() => setOpen(false), 1200);
      } catch (e: any) {
        setFeedback({ type: "error", message: e.message });
      }
    });
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setRejectMode(false);
      setReason("");
      setFeedback(null);
    }
    setOpen(v);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 text-moss hover:bg-moss/10 rounded"
        title="Granska"
      >
        <Eye className="w-4 h-4" />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto font-body p-6">
          {/* Cover image */}
          <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
            {farm.cover_image_url ? (
              <NextImage
                src={farm.cover_image_url}
                alt={farm.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-moss/10 to-wheat/20 flex items-center justify-center">
                <Store className="w-16 h-16 text-moss/30" />
              </div>
            )}
          </div>

          <div className="px-6 pb-6 space-y-6">
            {/* Title + badges */}
            <DialogHeader className="pt-4">
              <DialogTitle className="text-2xl font-display text-soil">
                {farm.name}
              </DialogTitle>
              <div className="flex gap-2 flex-wrap mt-2">
                {farm.farm_type && (
                  <Badge variant="default">{farm.farm_type}</Badge>
                )}
                {farm.region && (
                  <Badge variant="secondary">{farm.region.name}</Badge>
                )}
                {farm.municipality && (
                  <Badge variant="outline">{farm.municipality.name}</Badge>
                )}
                {categories.map((c) => (
                  <Badge
                    key={c.name}
                    variant="outline"
                    className="border-moss/30 text-moss"
                  >
                    {c.name}
                  </Badge>
                ))}
              </div>
            </DialogHeader>

            {/* Owner Information */}
            <section className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 font-display text-soil">
                <User className="w-5 h-5 text-blue-600" />
                Ägarinformation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Ägarens namn
                  </p>
                  {(farm.owner?.full_name ?? farm.owner_name) ? (
                    <p className="text-sm font-medium mt-1">
                      {farm.owner?.full_name ?? farm.owner_name}
                    </p>
                  ) : (
                    <Empty text="Inget namn angivet" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Ägar-ID
                  </p>
                  <p className="text-sm font-medium mt-1 font-mono text-gray-500 truncate">
                    {farm.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> Telefon
                  </p>
                  {farm.contact_number ? (
                    <a
                      href={`tel:${farm.contact_number}`}
                      className="text-sm font-medium mt-1 text-blue-600 hover:underline block"
                    >
                      {farm.contact_number}
                    </a>
                  ) : (
                    <Empty text="Inget telefonnummer" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> E-post
                  </p>
                  {farm.contact_email ? (
                    <a
                      href={`mailto:${farm.contact_email}`}
                      className="text-sm font-medium mt-1 text-blue-600 hover:underline break-all block"
                    >
                      {farm.contact_email}
                    </a>
                  ) : (
                    <Empty text="Ingen e-post angiven" />
                  )}
                </div>
                {/* Account email if different from contact */}
                {farm.owner?.email &&
                  farm.owner.email !== farm.contact_email && (
                    <div className="md:col-span-2">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Kontoe-post
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {farm.owner.email}
                      </p>
                    </div>
                  )}
              </div>
            </section>

            {/* Location */}
            <section className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 font-display text-soil">
                <MapPin className="w-5 h-5 text-red-500" />
                Platsinformation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Fullständig adress
                  </p>
                  {farm.full_address ? (
                    <p className="text-sm font-medium mt-1">
                      {farm.full_address}
                    </p>
                  ) : (
                    <Empty text="Ingen adress angiven" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Platsnamn
                  </p>
                  {farm.location_label ? (
                    <p className="text-sm font-medium mt-1">
                      {farm.location_label}
                    </p>
                  ) : (
                    <Empty text="Inget platsnamn" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Region
                  </p>
                  {farm.region ? (
                    <p className="text-sm font-medium mt-1">
                      {farm.region.name}
                    </p>
                  ) : (
                    <Empty text="Ingen region vald" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Kommun
                  </p>
                  {farm.municipality ? (
                    <p className="text-sm font-medium mt-1">
                      {farm.municipality.name}
                    </p>
                  ) : (
                    <Empty text="Ingen kommun vald" />
                  )}
                </div>
              </div>
            </section>

            {/* Opening Hours */}
            <section className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 font-display text-soil">
                <Clock className="w-5 h-5 text-amber-500" />
                Öppettider
              </h3>
              {openingHours.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {openingHours.map((h) => (
                    <div
                      key={h.day_of_week}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 text-sm"
                    >
                      <span className="font-medium text-soil capitalize w-28">
                        {h.day_of_week}
                      </span>
                      {h.is_closed ? (
                        <span className="text-red-400 text-xs font-bold">
                          Stängt
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          {h.open_time} – {h.close_time}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Empty text="Inga öppettider angivna" />
              )}
            </section>

            {/* Gallery */}
            <section className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-3 font-display text-soil">
                Bilder {images.length > 0 && `(${images.length})`}
              </h3>
              {images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      <NextImage
                        src={img.url}
                        alt={img.caption ?? `Bild ${i + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-gray-200 text-gray-300">
                  <AlertCircle className="w-6 h-6 mb-1" />
                  <p className="text-xs italic">Inga bilder uppladdade</p>
                </div>
              )}
            </section>

            {/* Timestamps */}
            <section className="bg-gray-50 -mx-6 px-6 py-4 rounded-b-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Registrerad
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {formatDate(farm.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Senast uppdaterad
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {formatDate(farm.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Feedback banner */}
            {feedback && (
              <div
                className={`p-3 rounded-lg text-sm font-medium ${
                  feedback.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {feedback.message}
              </div>
            )}

            {/* Reject reason input */}
            {rejectMode && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-soil">
                  Anledning till avvisning *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Beskriv varför gården avvisas..."
                  className="w-full px-3 py-2 rounded-lg border border-red-200 bg-red-50/30 text-sm text-soil placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              {!rejectMode ? (
                <>
                  <button
                    onClick={() => setRejectMode(true)}
                    disabled={isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-all disabled:opacity-50"
                  >
                    <CircleX className="w-4 h-4" /> Avvisa
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isPending}
                    className="flex items-center gap-2 bg-moss px-5 py-2 rounded-lg text-sm font-bold text-white hover:brightness-110 shadow-lg shadow-moss/20 transition-all disabled:opacity-60"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CircleCheck className="w-4 h-4" />
                    )}
                    Godkänn & Publicera
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setRejectMode(false);
                      setReason("");
                    }}
                    disabled={isPending}
                    className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isPending || !reason.trim()}
                    className="flex items-center gap-2 bg-red-600 px-5 py-2 rounded-lg text-sm font-bold text-white hover:brightness-110 transition-all disabled:opacity-60"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CircleX className="w-4 h-4" />
                    )}
                    Bekräfta Avvisning
                  </button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
