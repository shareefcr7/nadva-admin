"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

/* ─── Types ─────────────────────────────────────────── */
type Variant = {
  _id?: string;
  name: string;
  price: string;
  description?: string;
  images: string[];       // base64 previews / stored URLs
  isDefault: boolean;
  duration?: string;
  capacity?: string;
  maxGuests?: string;
  roomType?: string;
  serviceType?: string;
};

type Product = {
  _id: string;
  name: string;
  description: string;
  category?: { _id: string; name: string } | null;
  variants: Variant[];
  isActive: boolean;
  amenities?: string[];
};

type Category = { _id: string; name: string };

const AVAILABLE_AMENITIES = [
  "AC",
  "WiFi",
  "Parking",
  "Swimming Pool",
  "Dining",
  "Stage",
  "Generator",
  "Projector"
];

const BLANK_VARIANT = (): Variant => ({
  name: "",
  price: "",
  description: "",
  images: [],
  isDefault: false,
  duration: "",
  capacity: "",
  maxGuests: "",
  roomType: "",
  serviceType: ""
});

/* ─── Helpers ────────────────────────────────────────── */
const toBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onloadend = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

const token = () => localStorage.getItem("token") || "";

const colorMap: Record<string, string> = {
  "sage green": "#8a9a86",
  "sage": "#8a9a86",
  "coffee brown": "#4b3621",
  "coffee": "#4b3621",
  "mauve pink": "#e0b0ff",
  "mauve": "#e0b0ff",
  "olive beige": "#a89f91",
  "olive": "#808000",
  "beige": "#f5f5dc",
  "navy blue": "#000080",
  "navy": "#000080",
  "sky blue": "#87ceeb",
  "mustard yellow": "#ffdb58",
  "mustard": "#ffdb58",
  "dusty pink": "#dcaebb",
  "dusty rose": "#cca0ac",
  "wine red": "#722f37",
  "wine": "#722f37",
  "burgundy": "#800020",
  "charcoal grey": "#36454f",
  "charcoal gray": "#36454f",
  "charcoal": "#36454f",
  "cream": "#fffdd0",
  "khaki": "#c3b091",
  "camel": "#c19a6b",
  "rust": "#b7410e",
  "terracotta": "#e2725b",
  "teal": "#008080",
  "lavender": "#e6e6fa",
  "lilac": "#c8a2c8",
  "peach": "#ffdab9",
  "coral": "#ff7f50",
  "mint green": "#98ff98",
  "mint": "#98ff98",
  "apricot": "#fbceb1",
  "emerald green": "#50c878",
  "emerald": "#50c878",
  "forest green": "#228b22",
  "olive green": "#bab86c",
  "maroon": "#800000",
  "bronze": "#cd7f32",
  "copper": "#b87333",
  "tan": "#d2b48c",
};

const getValidColor = (colorName: string): string => {
  if (!colorName) return "#ccc";
  const clean = colorName.trim().toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ");
  if (/^#([0-9a-f]{3}){1,2}$/i.test(clean)) return colorName;
  if (colorMap[clean]) return colorMap[clean];
  if (clean.includes("red")) return "#ff0000";
  if (clean.includes("blue")) return "#0000ff";
  if (clean.includes("green")) return "#008000";
  if (clean.includes("yellow")) return "#ffff00";
  if (clean.includes("pink")) return "#ffc0cb";
  if (clean.includes("brown")) return "#a52a2a";
  if (clean.includes("orange")) return "#ffa500";
  if (clean.includes("purple")) return "#800080";
  if (clean.includes("grey") || clean.includes("gray")) return "#808080";
  if (clean.includes("black")) return "#000000";
  if (clean.includes("white")) return "#ffffff";
  if (clean.includes("gold")) return "#ffd700";
  if (clean.includes("silver")) return "#c0c0c0";
  if (clean.includes("beige")) return "#f5f5dc";
  return colorName;
};

/* ─── Main Component ─────────────────────────────────── */
export default function Products() {
  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch]         = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [error, setError]           = useState("");
  const [saving, setSaving]         = useState(false);

  // form state
  const [name, setName]             = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amenities, setAmenities]   = useState<string[]>([]);
  const [variants, setVariants]     = useState<Variant[]>([{ ...BLANK_VARIANT(), isDefault: true }]);
  const api = process.env.NEXT_PUBLIC_API_URL;

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${api}/product`, { headers: { Authorization: token() } });
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (e) { console.error(e); }
  }, [api]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${api}/category`);
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (e) { console.error(e); }
  }, [api]);

  useEffect(() => { fetchProducts(); fetchCategories(); }, [fetchProducts, fetchCategories]);

  /* ── Variant helpers ── */
  const addVariant = () => setVariants(v => [...v, BLANK_VARIANT()]);

  const removeVariant = (i: number) => {
    setVariants(prev => {
      const next = prev.filter((_, idx) => idx !== i);
      if (next.length && !next.some(v => v.isDefault)) next[0].isDefault = true;
      return next;
    });
  };

  const updateVariant = (i: number, field: keyof Variant, value: unknown) => {
    setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  };

  const setDefault = (i: number) => {
    setVariants(prev => prev.map((v, idx) => ({ ...v, isDefault: idx === i })));
  };

  const addImages = async (i: number, files: FileList) => {
    const b64s = await Promise.all(Array.from(files).map(toBase64));
    setVariants(prev => prev.map((v, idx) =>
      idx === i ? { ...v, images: [...v.images, ...b64s] } : v
    ));
  };

  const removeImage = (vi: number, ii: number) => {
    setVariants(prev => prev.map((v, idx) =>
      idx === vi ? { ...v, images: v.images.filter((_, i) => i !== ii) } : v
    ));
  };

  /* ── Reset ── */
  const resetForm = () => {
    setName(""); setDescription(""); setCategoryId(""); setAmenities([]);
    setVariants([{ ...BLANK_VARIANT(), isDefault: true }]);
    setEditId(null); setError("");
  };

  /* ── Validate ── */
  const validate = (): string | null => {
    if (!name.trim()) return "Service name is required.";
    if (!description.trim()) return "Description is required.";
    if (variants.length === 0) return "At least one variant is required.";
    const names = variants.map(v => v.name.trim().toLowerCase());
    if (names.some(n => !n)) return "Every variant must have a name.";
    if (new Set(names).size !== names.length) return "Each variant name must be unique.";
    for (const v of variants) {
      if (!v.price || Number(v.price) <= 0) return "Every variant price must be > 0.";
    }
    return null;
  };

  /* ── Save ── */
  const saveProduct = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true); setError("");

    const payload = {
      name, description,
      category: categoryId || undefined,
      amenities,
      variants: variants.map(v => ({
        ...v,
        price: Number(v.price),
      })),
    };

    try {
      const url = editId
        ? `${api}/product/update/${editId}`
        : `${api}/product/add`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: token() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed"); return; }

      // update local state directly — no extra fetch needed
      if (editId) {
        setProducts(prev => prev.map(p => p._id === editId ? data.product : p));
      } else {
        setProducts(prev => [...prev, data.product]);
      }
      resetForm();
      setShowModal(false);
    } catch {
      setError("Network error. Is the server running?");
    } finally {
      setSaving(false);
    }
  };

  /* ── Edit ── */
  const handleEdit = (p: Product) => {
    setEditId(p._id);
    setName(p.name);
    setDescription(p.description);
    setCategoryId(p.category?._id || "");
    setAmenities(p.amenities || []);
    setVariants(p.variants.map(v => ({
      ...v,
      name: v.name || (v as any).color || "", // fallback copy of color to name for backward compatibility
      price: String(v.price),
      description: v.description || "",
      duration: v.duration || "",
      capacity: v.capacity || "",
      maxGuests: v.maxGuests || "",
      roomType: v.roomType || "",
      serviceType: v.serviceType || ""
    })));
    setError("");
    setShowModal(true);
  };

  /* ── Delete ── */
  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`${api}/product/delete/${id}`, {
      method: "DELETE", headers: { Authorization: token() },
    });
    if (res.ok) setProducts(prev => prev.filter(p => p._id !== id));
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <div style={{ width: "100%", maxWidth: "100%" }}>
      <style>{`
        .card{background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);}
        .btn-primary{background:#FF8C00;color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:13px;font-weight:600;cursor:pointer;}
        .btn-primary:hover{background:#E67E00;}
        .btn-primary:disabled{opacity:.5;cursor:not-allowed;}
        .btn-ghost{background:transparent;color:#1B5E20;border:1px solid #e2e8f0;border-radius:8px;padding:6px 12px;font-size:12px;cursor:pointer;}
        .btn-ghost:hover{color:#FF8C00;border-color:#FF8C00;background:#fff5f0;}
        .btn-sm{background:#f3f4f6;color:#1B5E20;border:none;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;border:1px solid #e2e8f0;}
        .btn-sm:hover{background:#e5e7eb;}
        .input{background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;color:#111827;padding:10px;width:100%;box-sizing:border-box;font-size:13px;outline:none;}
        .input:focus{border-color:#FF8C00;}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:100;}
        .variant-card{background:#f8f9fa;border:1px solid #e2e8f0;border-radius:10px;padding:16px;position:relative;}
        .variant-card.default{border-color:#FF8C00;}
        .err{color:#ef4444;font-size:12px;margin-bottom:12px;background:#ef444415;padding:8px 12px;border-radius:6px;}
        .trow td{padding:14px 20px;border-bottom:1px solid #e2e8f0;color:#111827;font-size:13px;}
        .color-dot{width:12px;height:12px;border-radius:50%;display:inline-block;margin-right:6px;border:1px solid #00000030;}
        .img-thumb{width:40px;height:40px;object-fit:cover;border-radius:6px;border:1px solid #e2e8f0;}
        .img-remove{position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
        .modal-card{scrollbar-width:none;-ms-overflow-style:none;}
        .modal-card::-webkit-scrollbar{display:none;}
        
        @media (max-width: 1024px) {
          .btn-primary { padding: 8px 16px; font-size: 12px; }
          .btn-ghost { padding: 5px 10px; font-size: 11px; }
          .trow td { padding: 10px 12px; font-size: 12px; }
        }
        @media (max-width: 768px) {
          .trow { display: block; margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
          .trow td { display: block; padding: 8px 0; border: none; margin-bottom: 8px; }
          .trow td:before { content: attr(data-label); font-weight: 600; color: #FF8C00; display: block; margin-bottom: 4px; }
          .overlay { padding: 16px; }
          .modal-card { width: calc(100% - 32px) !important; max-height: 90vh !important; }
        }
        @media (max-width: 640px) {
          .modal-card { width: calc(100% - 24px) !important; padding: 16px !important; }
          .input { font-size: 14px; }
          .btn-primary { padding: 8px 12px; font-size: 12px; width: 100%; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12, width: "100%" }}>
        <div>
          <h1 style={{ color: "#1B5E20", fontFamily: "'Syne',sans-serif", fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 800, margin: 0 }}>Products</h1>
          <p style={{ color: "#4b5563", fontSize: 13, margin: "4px 0 0 0" }}>{products.length} total</p>
        </div>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ Add Product</button>
      </div>

      {/* Search */}
      <input className="input" style={{ marginBottom: 20, width: "100%" }} placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />

      {/* Table */}
      <div className="card" style={{ overflowX: "auto", overflowY: "hidden", width: "100%" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
              <td style={{ padding: "12px 20px", fontSize: 11, color: "#4b5563", fontWeight: 600, textTransform: "uppercase" }}>Product</td>
              <td style={{ padding: "12px 20px", fontSize: 11, color: "#4b5563", fontWeight: 600, textTransform: "uppercase" }}>Description</td>
              <td style={{ padding: "12px 20px", fontSize: 11, color: "#4b5563", fontWeight: 600, textTransform: "uppercase" }}>Category</td>
              <td style={{ padding: "12px 20px", fontSize: 11, color: "#4b5563", fontWeight: 600, textTransform: "uppercase" }}>Variants</td>
              <td style={{ padding: "12px 20px", fontSize: 11, color: "#4b5563", fontWeight: 600, textTransform: "uppercase" }}>Actions</td>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#4b5563", fontSize: 13 }}>No products yet</td></tr>
            )}
            {filtered.map(p => {
              const def = p.variants?.find(v => v.isDefault) || p.variants?.[0];
              return (
                <tr key={p._id} className="trow">
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {def?.images?.[0]
                        ? <Image src={def.images[0]} className="img-thumb" alt={p.name} width={40} height={40} style={{ objectFit: "cover" }} />
                        : <div style={{ width: 40, height: 40, borderRadius: 6, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📦</div>
                      }
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        {def && <div style={{ fontSize: 11, color: "#4b5563" }}>${Number(def.price).toFixed(2)}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "#4b5563", fontSize: 12, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.description || "—"}
                  </td>
                  <td style={{ color: "#FF8C00", fontSize: 12 }}>{p.category?.name || "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {p.variants?.map(v => (
                        <span key={v._id} title={v.name || (v as any).color} style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          background: "#f3f4f6", borderRadius: 20, padding: "2px 8px", fontSize: 11, color: "#111827",
                          border: v.isDefault ? "1px solid #FF8C00" : "1px solid transparent"
                        }}>
                          {v.name || (v as any).color}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn-ghost" onClick={() => handleEdit(p)}>Edit</button>
                      <button className="btn-ghost" onClick={() => remove(p._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="card modal-card" style={{ width: "clamp(300px, 90vw, 620px)", padding: "clamp(16px, 4vw, 28px)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: "#1B5E20", marginBottom: 20 }}>
              {editId ? "Edit Product" : "New Product"}
            </div>

            {error && <div className="err">{error}</div>}

            {/* Base fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              <Field label="Service Name">
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Luxury A/C Room" />
              </Field>
              <Field label="Description">
                <textarea className="input" value={description} rows={3} onChange={e => setDescription(e.target.value)} placeholder="Service description" style={{ resize: "vertical" }} />
              </Field>
              <Field label="Category">
                <select className="input" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                  <option value="">— Select category —</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Amenities">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {AVAILABLE_AMENITIES.map(amenity => {
                    const selected = amenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => {
                          if (selected) {
                            setAmenities(amenities.filter(a => a !== amenity));
                          } else {
                            setAmenities([...amenities, amenity]);
                          }
                        }}
                        style={{
                          background: selected ? "#1B5E20" : "#fff",
                          color: selected ? "#fff" : "#1B5E20",
                          border: "1px solid",
                          borderColor: selected ? "#1B5E20" : "#e2e8f0",
                          borderRadius: 20,
                          padding: "6px 14px",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>

            {/* Variants */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                Variants <span style={{ color: "#4b5563", fontWeight: 400 }}>({variants.length})</span>
              </div>
              <button className="btn-sm" onClick={addVariant}>+ Add Variant</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {variants.map((v, i) => (
                <VariantCard
                  key={i}
                  variant={v}
                  index={i}
                  total={variants.length}
                  onUpdate={updateVariant}
                  onRemove={removeVariant}
                  onSetDefault={setDefault}
                  onAddImages={addImages}
                  onRemoveImage={removeImage}
                />
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button className="btn-ghost" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
              <button className="btn-primary" onClick={saveProduct} disabled={saving}>
                {saving ? "Saving…" : editId ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Field ─────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#FF8C00" }}>{label}</label>
      {children}
    </div>
  );
}

/* ─── VariantCard ────────────────────────────────────── */
function VariantCard({
  variant, index, total, onUpdate, onRemove, onSetDefault, onAddImages, onRemoveImage,
}: {
  variant: Variant;
  index: number;
  total: number;
  onUpdate: (i: number, field: keyof Variant, value: unknown) => void;
  onRemove: (i: number) => void;
  onSetDefault: (i: number) => void;
  onAddImages: (i: number, files: FileList) => void;
  onRemoveImage: (vi: number, ii: number) => void;
}) {
  return (
    <div className={`variant-card${variant.isDefault ? " default" : ""}`}>
      {total > 1 && (
        <button
          onClick={() => onRemove(index)}
          style={{ position: "absolute", top: 10, right: 10, background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}
        >×</button>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <Field label="Variant Name">
          <input className="input" value={variant.name} onChange={e => onUpdate(index, "name", e.target.value)} placeholder="e.g. Single Occupancy" />
        </Field>
        <Field label="Price ($)">
          <input className="input" type="number" min="0" value={variant.price} onChange={e => onUpdate(index, "price", e.target.value)} placeholder="0.00" />
        </Field>
      </div>

      <div style={{ marginBottom: 10 }}>
        <Field label="Variant Description">
          <textarea className="input" rows={2} value={variant.description || ""} onChange={e => onUpdate(index, "description", e.target.value)} placeholder="Description specific to this variant" style={{ resize: "vertical" }} />
        </Field>
      </div>

      {/* Optional Service Attributes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <Field label="Duration (Optional)">
          <input className="input" value={variant.duration || ""} onChange={e => onUpdate(index, "duration", e.target.value)} placeholder="e.g. 2 Hours, 1 Day" />
        </Field>
        <Field label="Capacity (Optional)">
          <input className="input" value={variant.capacity || ""} onChange={e => onUpdate(index, "capacity", e.target.value)} placeholder="e.g. 2 Adults, 50 Seats" />
        </Field>
        <Field label="Max Guests (Optional)">
          <input className="input" value={variant.maxGuests || ""} onChange={e => onUpdate(index, "maxGuests", e.target.value)} placeholder="e.g. 100" />
        </Field>
        <Field label="Room Type (Optional)">
          <input className="input" value={variant.roomType || ""} onChange={e => onUpdate(index, "roomType", e.target.value)} placeholder="e.g. Deluxe, Suite" />
        </Field>
      </div>
      <div style={{ marginBottom: 10 }}>
        <Field label="Service Type (Optional)">
          <input className="input" value={variant.serviceType || ""} onChange={e => onUpdate(index, "serviceType", e.target.value)} placeholder="e.g. Catering, Audio-Visual" />
        </Field>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <label style={{ fontSize: 12, color: "#FF8C00", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <input type="checkbox" checked={variant.isDefault} onChange={() => onSetDefault(index)} />
          Default variant
        </label>
      </div>

      {/* Images */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {variant.images.map((src, ii) => (
          <div key={ii} style={{ position: "relative" }}>
            <Image src={src} className="img-thumb" alt={`variant-${index}-img-${ii}`} width={40} height={40} style={{ objectFit: "cover" }} />
            <button className="img-remove" onClick={() => onRemoveImage(index, ii)}>×</button>
          </div>
        ))}
        <label style={{ cursor: "pointer", background: "#f3f4f6", borderRadius: 6, padding: "6px 10px", fontSize: 11, color: "#1B5E20" }}>
          + Image
          <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => e.target.files && onAddImages(index, e.target.files)} />
        </label>
      </div>
    </div>
  );
}
