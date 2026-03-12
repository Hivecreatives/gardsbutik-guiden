"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AddFarmDialog } from "@/components/add-farm-dialog";
import { AddProductDialog } from "@/components/add-product-dialog";

export function FarmPageActions() {
  const [farmOpen, setFarmOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);

  return (
    <>
      <div className="flex gap-3 font-body">
        <button
          onClick={() => setProductOpen(true)}
          className="flex items-center gap-2 bg-white border border-soil/10 px-4 py-2 rounded-lg text-sm font-bold text-soil hover:shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Ny Produkt
        </button>
        <button
          onClick={() => setFarmOpen(true)}
          className="flex items-center gap-2 bg-moss px-4 py-2 rounded-lg text-sm font-bold text-white hover:brightness-110 shadow-lg shadow-moss/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Ny Gård
        </button>
      </div>

      <AddFarmDialog open={farmOpen} onOpenChange={setFarmOpen} />
      <AddProductDialog open={productOpen} onOpenChange={setProductOpen} />
    </>
  );
}
