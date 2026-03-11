import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 font-body">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-soil font-display mb-2">
          Åtkomst nekad
        </h1>
        <p className="text-slate-500 text-sm mb-8">
          Du har inte behörighet att visa den här sidan.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-moss text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:brightness-110 shadow-lg shadow-moss/20 transition-all"
        >
          Tillbaka till startsidan
        </Link>
      </div>
    </div>
  );
}
