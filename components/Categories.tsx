// "use client";
// import { useState } from "react";

// const INITIAL = [
//   { id: 1, name: "Electronics", slug: "electronics", count: 142, color: "#6366f1" },
//   { id: 2, name: "Clothing", slug: "clothing", count: 89, color: "#ec4899" },
//   { id: 3, name: "Home & Garden", slug: "home-garden", count: 57, color: "#10b981" },
//   { id: 4, name: "Sports", slug: "sports", count: 33, color: "#f59e0b" },
//   { id: 5, name: "Books", slug: "books", count: 210, color: "#3b82f6" },
// ];

// export default function Categories() {
//   const [categories, setCategories] = useState(INITIAL);
//   const [showModal, setShowModal] = useState(false);
//   const [form, setForm] = useState({ name: "", slug: "", color: "#a78bfa" });

//   const addCategory = () => {
//     if (!form.name.trim()) return;
//     setCategories([...categories, { id: Date.now(), ...form, count: 0 }]);
//     setForm({ name: "", slug: "", color: "#a78bfa" });
//     setShowModal(false);
//   };

//   const remove = (id) => setCategories(categories.filter((c) => c.id !== id));

//   return (
//     <div>
//       <style>{`
//         .card { background: #13131a; border: 1px solid #1e1e2e; border-radius: 12px; transition: border-color 0.18s; }
//         .card:hover { border-color: #2a2a40; }
//         .btn-primary { background: #7c3aed; color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
//         .btn-primary:hover { background: #6d28d9; }
//         .btn-ghost { background: transparent; color: #555570; border: 1px solid #1e1e2e; border-radius: 8px; padding: 8px 14px; font-family: 'DM Sans', sans-serif; font-size: 12px; cursor: pointer; transition: all 0.15s; }
//         .btn-ghost:hover { color: #ef4444; border-color: #ef444440; }
//         .input { background: #0f0f13; border: 1px solid #1e1e2e; border-radius: 8px; color: #e8e8f0; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 10px 14px; width: 100%; outline: none; transition: border-color 0.15s; }
//         .input:focus { border-color: #7c3aed; }
//         .overlay { position: fixed; inset: 0; background: #000000aa; display: flex; align-items: center; justify-content: center; z-index: 100; }
//       `}</style>

//       <PageHeader title="Categories" sub={`${categories.length} total`} onAdd={() => setShowModal(true)} />

//       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginTop: 24 }}>
//         {categories.map((cat) => (
//           <div key={cat.id} className="card" style={{ padding: 20 }}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
//               <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//                 <div style={{ width: 40, height: 40, borderRadius: 10, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
//                   <div style={{ width: 14, height: 14, borderRadius: 3, background: cat.color }} />
//                 </div>
//                 <div>
//                   <div style={{ fontWeight: 600, fontSize: 14, color: "#e8e8f0" }}>{cat.name}</div>
//                   <div style={{ fontSize: 11, color: "#44445a", marginTop: 2 }}>/{cat.slug}</div>
//                 </div>
//               </div>
//               <button className="btn-ghost" onClick={() => remove(cat.id)}>✕</button>
//             </div>
//             <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #1e1e2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//               <span style={{ fontSize: 12, color: "#555570" }}>Products</span>
//               <span style={{ fontSize: 20, fontWeight: 700, color: cat.color, fontFamily: "'Syne', sans-serif" }}>{cat.count}</span>
//             </div>
//           </div>
//         ))}
//       </div>

//       {showModal && (
//         <div className="overlay" onClick={() => setShowModal(false)}>
//           <div className="card" style={{ width: 400, padding: 28 }} onClick={(e) => e.stopPropagation()}>
//             <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#e8e8f0", marginBottom: 20 }}>New Category</div>
//             <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//               <FieldLabel label="Name">
//                 <input className="input" value={form.name} placeholder="e.g. Accessories"
//                   onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} />
//               </FieldLabel>
//               <FieldLabel label="Slug">
//                 <input className="input" value={form.slug} placeholder="auto-generated"
//                   onChange={(e) => setForm({ ...form, slug: e.target.value })} />
//               </FieldLabel>
//               <FieldLabel label="Color">
//                 <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                   <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
//                     style={{ width: 40, height: 36, border: "none", borderRadius: 6, cursor: "pointer", background: "transparent" }} />
//                   <span style={{ fontSize: 12, color: "#555570" }}>{form.color}</span>
//                 </div>
//               </FieldLabel>
//             </div>
//             <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
//               <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
//               <button className="btn-primary" onClick={addCategory}>Add Category</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function FieldLabel({ label, children }) {
//   return (
//     <div>
//       <div style={{ fontSize: 11, fontWeight: 600, color: "#555570", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
//       {children}
//     </div>
//   );
// }

// function PageHeader({ title, sub, onAdd }) {
//   return (
//     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//       <div>
//         <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "#e8e8f0", letterSpacing: "-0.02em" }}>{title}</h1>
//         <p style={{ fontSize: 13, color: "#44445a", marginTop: 2 }}>{sub}</p>
//       </div>
//       <button className="btn-primary" onClick={onAdd}>+ Add New</button>
//     </div>
//   );
// }
"use client";
import { useState, useEffect, useCallback, ReactNode } from "react";

/* ================= TYPES ================= */

type Category = {
  _id: string;
  name: string;
 
  color?: string;
  count?: number;
};

type FormType = {
  name: string;
};

type FieldProps = {
  label: string;
  children: ReactNode;
};

type HeaderProps = {
  title: string;
  sub: string;
  onAdd: () => void;
};

/* ================= COMPONENT ================= */

/* ================= COMPONENT ================= */

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormType>({ name: "" });
  const api = process.env.NEXT_PUBLIC_API_URL;

  const fetchCategories = useCallback(async () => {
    fetch(`${api}/category`)
      .then(res => res.json())
      .then(data => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(console.error);
  }, [api]);
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  const handleEdit = (cat: Category) => {
    setEditId(cat._id);
    setForm({ name: cat.name });
    setShowModal(true);
  };

  const addCategory = async () => {
    if (!form.name.trim()) return;

    try {
      const token = localStorage.getItem("token") || "";
      let res;

      if (editId) {
        res = await fetch(`${api}/category/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": token },
          body: JSON.stringify({ category: { name: form.name, description: "Updated from Admin" } }),
        });
      } else {
        res = await fetch(`${api}/category/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": token },
          body: JSON.stringify({ name: form.name, description: "Added from Admin", isActive: true }),
        });
      }
      
      if (!res.ok) {
        if (res.status === 401) {
          alert("Unauthorized. Please log in.");
          return;
        }
        const text = await res.text();
        alert(`Error: ${text}`);
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        fetchCategories();
        setForm({ name: "" });
        setEditId(null);
        setShowModal(false);
      } else {
        alert(data.error || "Failed to save category");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const remove = async (id: string) => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${api}/category/delete/${id}`, {
        method: "DELETE",
        headers: { "Authorization": token }
      });

      if (!res.ok) {
        if (res.status === 401) return alert("Unauthorized. Please log in.");
        const text = await res.text();
        return alert(`Error: ${text}`);
      }

      const data = await res.json();
      if (data.success) {
        fetchCategories();
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <style>{`
        .card { background: #13131a; border: 1px solid #1e1e2e; border-radius: 12px; transition: border-color 0.18s; }
        .card:hover { border-color: #2a2a40; }
        .btn-primary { background: #7c3aed; color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .btn-primary:hover { background: #6d28d9; }
        .btn-ghost { background: transparent; color: #555570; border: 1px solid #1e1e2e; border-radius: 8px; padding: 8px 14px; font-family: 'DM Sans', sans-serif; font-size: 12px; cursor: pointer; transition: all 0.15s; }
        .btn-ghost:hover { color: #ef4444; border-color: #ef444440; }
        .input { background: #0f0f13; border: 1px solid #1e1e2e; border-radius: 8px; color: #e8e8f0; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 10px 14px; width: 100%; outline: none; transition: border-color 0.15s; }
        .input:focus { border-color: #7c3aed; }
        .overlay { position: fixed; inset: 0; background: #000000aa; display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px; }
        
        @media (max-width: 768px) {
          .btn-primary { padding: 8px 16px; font-size: 12px; }
          .btn-ghost { padding: 6px 10px; font-size: 11px; }
          .input { font-size: 14px; padding: 8px 10px; }
        }
        @media (max-width: 640px) {
          .btn-primary { width: 100%; }
          .overlay { padding: 12px; }
        }
      `}</style>

      <PageHeader title="Categories" sub={`${categories.length} total`} onAdd={() => setShowModal(true)} />

      {/* CATEGORY LIST */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(clamp(200px, 90vw, 280px), 1fr))", gap: "clamp(12px, 3vw, 16px)", marginTop: 24, width: "100%" }}>
        {categories.map((cat) => (
          <div key={cat._id!} className="card" style={{ padding: "clamp(12px, 3vw, 20px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: cat.color }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "clamp(12px, 2vw, 14px)", color: "#e8e8f0", wordBreak: "break-word" }}>{cat.name}</div>
                </div>
              </div>
              <button className="btn-ghost" onClick={() => remove(cat._id!)} style={{ flexShrink: 0 }}>✕</button>
            </div>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #1e1e2e", display: "flex", justifyContent: "flex-start" }}>
              <button className="btn-ghost" onClick={() => handleEdit(cat)}>Edit</button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="card" style={{ width: "clamp(300px, 90vw, 400px)", padding: "clamp(16px, 4vw, 28px)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(16px, 4vw, 18px)", fontWeight: 700, color: "#e8e8f0", marginBottom: 20 }}>
              {editId ? "Edit Category" : "New Category"}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FieldLabel label="Category Name">
                <input
                  className="input"
                  value={form.name}
                  placeholder="e.g. Accessories"
                  onChange={(e) => setForm({ name: e.target.value })}
                />
              </FieldLabel>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button className="btn-ghost" onClick={() => { setShowModal(false); setEditId(null); }} style={{ flex: "1 0 auto", minWidth: "80px" }}>Cancel</button>
              <button className="btn-primary" onClick={addCategory} style={{ flex: "1 0 auto", minWidth: "80px" }}>{editId ? "Save Changes" : "Add Category"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function FieldLabel({ label, children }: FieldProps) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#555570", marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function PageHeader({ title, sub, onAdd }: HeaderProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, width: "100%" }}>
      <div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 800, color: "#e8e8f0", margin: 0 }}>{title}</h1>
        <p style={{ fontSize: 13, color: "#44445a", margin: "4px 0 0 0" }}>{sub}</p>
      </div>
      <button className="btn-primary" onClick={onAdd}>+ Add New</button>
    </div>
  );
}