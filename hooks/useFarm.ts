'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

// ── Row types from generated types ──────────────────────────────────────────
type FarmRow        = Database['public']['Tables']['farms']['Row']
type ProductRow     = Database['public']['Tables']['products']['Row']
type ImageRow       = Database['public']['Tables']['farm_images']['Row']
type LinkRow        = Database['public']['Tables']['farm_links']['Row']
type HoursRow       = Database['public']['Tables']['farm_opening_hours']['Row']
type CategoryRow    = Database['public']['Tables']['farm_categories']['Row']
type RegionRow      = Database['public']['Tables']['regions']['Row']
type MunicipalityRow = Database['public']['Tables']['municipalities']['Row']

// ── Insert types ─────────────────────────────────────────────────────────────
type FarmInsert     = Database['public']['Tables']['farms']['Insert']
type ProductInsert  = Database['public']['Tables']['products']['Insert']
type ImageInsert    = Database['public']['Tables']['farm_images']['Insert']
type LinkInsert     = Database['public']['Tables']['farm_links']['Insert']
type HoursInsert    = Database['public']['Tables']['farm_opening_hours']['Insert']

// ── Update types ─────────────────────────────────────────────────────────────
type FarmUpdate     = Database['public']['Tables']['farms']['Update']
type ProductUpdate  = Database['public']['Tables']['products']['Update']
type ImageUpdate    = Database['public']['Tables']['farm_images']['Update']
type LinkUpdate     = Database['public']['Tables']['farm_links']['Update']
type HoursUpdate    = Database['public']['Tables']['farm_opening_hours']['Update']

// ── Enriched farm type (farm + all related data joined) ──────────────────────
export type FarmFull = FarmRow & {
  products:      ProductRow[]
  images:        ImageRow[]
  links:         LinkRow[]
  opening_hours: HoursRow[]
  categories:    CategoryRow[]
  region:        RegionRow | null
  municipality:  MunicipalityRow | null
}

// ── Return shape of the hook ─────────────────────────────────────────────────
export interface UseFarmReturn {
  // State
  farms:        FarmFull[]
  loading:      boolean
  error:        string | null
  // Reference data (for dropdowns)
  allRegions:   RegionRow[]
  allCategories: CategoryRow[]
  allMunicipalities: MunicipalityRow[]

  // Farm CRUD
  refetch:      () => Promise<void>
  addFarm:      (data: Omit<FarmInsert, 'owner_id'>, categoryIds?: string[]) => Promise<FarmRow | null>
  updateFarm:   (farmId: string, data: FarmUpdate, categoryIds?: string[]) => Promise<boolean>
  deleteFarm:   (farmId: string) => Promise<boolean>
  submitFarm:   (farmId: string) => Promise<boolean>

  // Product CRUD
  addProduct:   (data: ProductInsert) => Promise<ProductRow | null>
  updateProduct:(productId: string, data: ProductUpdate) => Promise<boolean>
  deleteProduct:(productId: string) => Promise<boolean>

  // Image CRUD
  addImage:     (data: ImageInsert) => Promise<ImageRow | null>
  updateImage:  (imageId: string, data: ImageUpdate) => Promise<boolean>
  deleteImage:  (imageId: string) => Promise<boolean>

  // Link CRUD
  addLink:      (data: LinkInsert) => Promise<LinkRow | null>
  updateLink:   (linkId: string, data: LinkUpdate) => Promise<boolean>
  deleteLink:   (linkId: string) => Promise<boolean>

  // Opening hours CRUD
  addHours:     (data: HoursInsert) => Promise<HoursRow | null>
  updateHours:  (hoursId: string, data: HoursUpdate) => Promise<boolean>
  deleteHours:  (hoursId: string) => Promise<boolean>
  upsertHours:  (farmId: string, hours: Omit<HoursInsert, 'farm_id'>[]) => Promise<boolean>
}

// ─────────────────────────────────────────────────────────────────────────────

export function useFarm(ownerId?: string): UseFarmReturn {
  const supabase = createClient()

  const [farms, setFarms]                     = useState<FarmFull[]>([])
  const [allRegions, setAllRegions]           = useState<RegionRow[]>([])
  const [allCategories, setAllCategories]     = useState<CategoryRow[]>([])
  const [allMunicipalities, setAllMunicipalities] = useState<MunicipalityRow[]>([])
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState<string | null>(null)

  // ── Fetch all farms (with related data) for this owner ──────────────────
  const refetch = useCallback(async () => {
    if (!ownerId) { setLoading(false); return }
    setLoading(true)
    setError(null)

    try {
      // Single query — Supabase joins via FK relationships
      const { data, error: fetchError } = await supabase
        .from('farms')
        .select(`
          *,
          products ( * ),
          farm_images ( * ),
          farm_links ( * ),
          farm_opening_hours ( * ),
          farm_category_links (
            category_id,
            farm_categories ( id, name )
          ),
          regions ( id, name ),
          municipalities ( id, name, region_id )
        `)
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Flatten farm_category_links → categories array
      const normalized: FarmFull[] = (data ?? []).map((farm: any) => ({
        ...farm,
        products:      farm.products      ?? [],
        images:        farm.farm_images   ?? [],
        links:         farm.farm_links    ?? [],
        opening_hours: farm.farm_opening_hours ?? [],
        categories:    (farm.farm_category_links ?? [])
                         .map((l: any) => l.farm_categories)
                         .filter(Boolean),
        region:        farm.regions       ?? null,
        municipality:  farm.municipalities ?? null,
      }))

      setFarms(normalized)
    } catch (err: any) {
      setError(err.message ?? 'Failed to fetch farms')
    } finally {
      setLoading(false)
    }
  }, [ownerId])

  // ── Fetch reference data (regions, categories, municipalities) ───────────
  const fetchReferenceData = useCallback(async () => {
    const [{ data: regions }, { data: categories }, { data: municipalities }] =
      await Promise.all([
        supabase.from('regions').select('*').order('name'),
        supabase.from('farm_categories').select('*').order('name'),
        supabase.from('municipalities').select('*').order('name'),
      ])
    setAllRegions(regions ?? [])
    setAllCategories(categories ?? [])
    setAllMunicipalities(municipalities ?? [])
  }, [])

  useEffect(() => {
    fetchReferenceData()
  }, [fetchReferenceData])

  useEffect(() => {
    refetch()
  }, [refetch])

  // ── Helper: optimistic local update for a single farm ───────────────────
  const patchFarm = (farmId: string, patch: Partial<FarmFull>) => {
    setFarms((prev) =>
      prev.map((f) => (f.id === farmId ? { ...f, ...patch } : f))
    )
  }

  // ════════════════════════════════════════════════════════════════
  // FARM CRUD
  // ════════════════════════════════════════════════════════════════

  const addFarm = async (
    data: Omit<FarmInsert, 'owner_id'>,
    categoryIds: string[] = []
  ): Promise<FarmRow | null> => {
    if (!ownerId) return null

    const { data: farm, error: err } = await supabase
      .from('farms')
      .insert({ ...data, owner_id: ownerId })
      .select('*')
      .single()

    if (err || !farm) { setError(err?.message ?? 'Insert failed'); return null }

    if (categoryIds.length > 0) {
      await supabase.from('farm_category_links').insert(
        categoryIds.map((category_id) => ({ farm_id: farm.id, category_id }))
      )
    }

    await refetch()
    return farm
  }

  const updateFarm = async (
    farmId: string,
    data: FarmUpdate,
    categoryIds?: string[]
  ): Promise<boolean> => {
    const { error: err } = await supabase
      .from('farms')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', farmId)

    if (err) { setError(err.message); return false }

    // Sync categories if provided
    if (categoryIds !== undefined) {
      await supabase.from('farm_category_links').delete().eq('farm_id', farmId)
      if (categoryIds.length > 0) {
        await supabase.from('farm_category_links').insert(
          categoryIds.map((category_id) => ({ farm_id: farmId, category_id }))
        )
      }
    }

    await refetch()
    return true
  }

  const deleteFarm = async (farmId: string): Promise<boolean> => {
    const { error: err } = await supabase.from('farms').delete().eq('id', farmId)
    if (err) { setError(err.message); return false }
    setFarms((prev) => prev.filter((f) => f.id !== farmId))
    return true
  }

  /** Marks a farm as submitted for admin review */
  const submitFarm = async (farmId: string): Promise<boolean> => {
    const { error: err } = await supabase
      .from('farms')
      .update({ submitted: true, updated_at: new Date().toISOString() })
      .eq('id', farmId)

    if (err) { setError(err.message); return false }
    patchFarm(farmId, { submitted: true })
    return true
  }

  // ════════════════════════════════════════════════════════════════
  // PRODUCT CRUD
  // ════════════════════════════════════════════════════════════════

  const addProduct = async (data: ProductInsert): Promise<ProductRow | null> => {
    const { data: product, error: err } = await supabase
      .from('products').insert(data).select('*').single()

    if (err || !product) { setError(err?.message ?? 'Insert failed'); return null }

    patchFarm(data.farm_id, {
      products: [...(farms.find((f) => f.id === data.farm_id)?.products ?? []), product],
    })
    return product
  }

  const updateProduct = async (productId: string, data: ProductUpdate): Promise<boolean> => {
    const { data: updated, error: err } = await supabase
      .from('products').update(data).eq('id', productId).select('*').single()

    if (err || !updated) { setError(err?.message ?? 'Update failed'); return false }

    setFarms((prev) =>
      prev.map((f) => ({
        ...f,
        products: f.products.map((p) => (p.id === productId ? updated : p)),
      }))
    )
    return true
  }

  const deleteProduct = async (productId: string): Promise<boolean> => {
    const { error: err } = await supabase.from('products').delete().eq('id', productId)
    if (err) { setError(err.message); return false }

    setFarms((prev) =>
      prev.map((f) => ({
        ...f,
        products: f.products.filter((p) => p.id !== productId),
      }))
    )
    return true
  }

  // ════════════════════════════════════════════════════════════════
  // IMAGE CRUD
  // ════════════════════════════════════════════════════════════════

  const addImage = async (data: ImageInsert): Promise<ImageRow | null> => {
    const { data: image, error: err } = await supabase
      .from('farm_images').insert(data).select('*').single()

    if (err || !image) { setError(err?.message ?? 'Insert failed'); return null }

    patchFarm(data.farm_id, {
      images: [...(farms.find((f) => f.id === data.farm_id)?.images ?? []), image],
    })
    return image
  }

  const updateImage = async (imageId: string, data: ImageUpdate): Promise<boolean> => {
    const { data: updated, error: err } = await supabase
      .from('farm_images').update(data).eq('id', imageId).select('*').single()

    if (err || !updated) { setError(err?.message ?? 'Update failed'); return false }

    setFarms((prev) =>
      prev.map((f) => ({
        ...f,
        images: f.images.map((i) => (i.id === imageId ? updated : i)),
      }))
    )
    return true
  }

  const deleteImage = async (imageId: string): Promise<boolean> => {
    const { error: err } = await supabase.from('farm_images').delete().eq('id', imageId)
    if (err) { setError(err.message); return false }

    setFarms((prev) =>
      prev.map((f) => ({
        ...f,
        images: f.images.filter((i) => i.id !== imageId),
      }))
    )
    return true
  }

  // ════════════════════════════════════════════════════════════════
  // LINK CRUD
  // ════════════════════════════════════════════════════════════════

  const addLink = async (data: LinkInsert): Promise<LinkRow | null> => {
    const { data: link, error: err } = await supabase
      .from('farm_links').insert(data).select('*').single()

    if (err || !link) { setError(err?.message ?? 'Insert failed'); return null }

    patchFarm(data.farm_id, {
      links: [...(farms.find((f) => f.id === data.farm_id)?.links ?? []), link],
    })
    return link
  }

  const updateLink = async (linkId: string, data: LinkUpdate): Promise<boolean> => {
    const { data: updated, error: err } = await supabase
      .from('farm_links').update(data).eq('id', linkId).select('*').single()

    if (err || !updated) { setError(err?.message ?? 'Update failed'); return false }

    setFarms((prev) =>
      prev.map((f) => ({
        ...f,
        links: f.links.map((l) => (l.id === linkId ? updated : l)),
      }))
    )
    return true
  }

  const deleteLink = async (linkId: string): Promise<boolean> => {
    const { error: err } = await supabase.from('farm_links').delete().eq('id', linkId)
    if (err) { setError(err.message); return false }

    setFarms((prev) =>
      prev.map((f) => ({
        ...f,
        links: f.links.filter((l) => l.id !== linkId),
      }))
    )
    return true
  }

  // ════════════════════════════════════════════════════════════════
  // OPENING HOURS CRUD
  // ════════════════════════════════════════════════════════════════

  const addHours = async (data: HoursInsert): Promise<HoursRow | null> => {
    const { data: hours, error: err } = await supabase
      .from('farm_opening_hours').insert(data).select('*').single()

    if (err || !hours) { setError(err?.message ?? 'Insert failed'); return null }

    patchFarm(data.farm_id, {
      opening_hours: [
        ...(farms.find((f) => f.id === data.farm_id)?.opening_hours ?? []),
        hours,
      ],
    })
    return hours
  }

  const updateHours = async (hoursId: string, data: HoursUpdate): Promise<boolean> => {
    const { data: updated, error: err } = await supabase
      .from('farm_opening_hours').update(data).eq('id', hoursId).select('*').single()

    if (err || !updated) { setError(err?.message ?? 'Update failed'); return false }

    setFarms((prev) =>
      prev.map((f) => ({
        ...f,
        opening_hours: f.opening_hours.map((h) => (h.id === hoursId ? updated : h)),
      }))
    )
    return true
  }

  const deleteHours = async (hoursId: string): Promise<boolean> => {
    const { error: err } = await supabase.from('farm_opening_hours').delete().eq('id', hoursId)
    if (err) { setError(err.message); return false }

    setFarms((prev) =>
      prev.map((f) => ({
        ...f,
        opening_hours: f.opening_hours.filter((h) => h.id !== hoursId),
      }))
    )
    return true
  }

  /**
   * Replace all opening hours for a farm in one shot.
   * Useful when saving a full week schedule from a form.
   */
  const upsertHours = async (
    farmId: string,
    hours: Omit<HoursInsert, 'farm_id'>[]
  ): Promise<boolean> => {
    const { error: delErr } = await supabase
      .from('farm_opening_hours').delete().eq('farm_id', farmId)

    if (delErr) { setError(delErr.message); return false }

    if (hours.length > 0) {
      const { error: insErr } = await supabase
        .from('farm_opening_hours')
        .insert(hours.map((h) => ({ ...h, farm_id: farmId })))

      if (insErr) { setError(insErr.message); return false }
    }

    await refetch()
    return true
  }

  return {
    farms, loading, error,
    allRegions, allCategories, allMunicipalities,
    refetch,
    addFarm, updateFarm, deleteFarm, submitFarm,
    addProduct, updateProduct, deleteProduct,
    addImage, updateImage, deleteImage,
    addLink, updateLink, deleteLink,
    addHours, updateHours, deleteHours, upsertHours,
  }
}