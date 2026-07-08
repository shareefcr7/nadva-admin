"use client";
import { useState, useEffect, useCallback, ReactNode } from "react";

type Facility = {
  _id: string;
  name: string;
  icon: string;
  description: string;
  displayOrder: number;
  status: "active" | "inactive";
};

type FieldProps = { label: string; children: ReactNode };

const FieldLabel = ({ label, children }: FieldProps) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {label}
    </label>
    {children}
  </div>
);

const emptyForm: { name: string; icon: string; description: string; displayOrder: number; status: "active" | "inactive" } = { name: "", icon: "", description: "", displayOrder: 0, status: "active" };

export default function Facilities() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Facility | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const api = process.env.NEXT_PUBLIC_API_URL;

  const fetchFacilities = useCallback(async () => {
    try {
      const res = await fetch(`${api}/facility`);
      const data = await res.json();
      if (data.facilities) setFacilities(data.facilities);
    } catch (err) {
      console.error(err);
    }
  }, [api]);

  useEffect(() => { fetchFacilities(); }, [fetchFacilities]);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...emptyForm, displayOrder: facilities.length });
    setShowModal(true);
  };

  const openEdit = (f: Facility) => {
    setEditTarget(f);
    setForm({ name: f.name, icon: f.icon, description: f.description, displayOrder: f.displayOrder, status: f.status });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditTarget(null); };

  const handleSave = async () => {
    if (!form.name.trim()) { alert("Name is required."); return; }
    setLoading(true);
    const token = localStorage.getItem("token") || "";
    try {
      if (editTarget) {
        const res = await fetch(`${api}/facility/${editTarget._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify(form),
        });
        if (res.ok) { await fetchFacilities(); closeModal(); }
        else { const d = await res.json(); alert(d.error || "Failed to update"); }
      } else {
        const res = await fetch(`${api}/facility/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify(form),
        });
        if (res.ok) { await fetchFacilities(); closeModal(); }
        else { const d = await res.json(); alert(d.error || "Failed to add"); }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (f: Facility) => {
    const token = localStorage.getItem("token") || "";
    const newStatus = f.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`${api}/facility/${f._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setFacilities(prev => prev.map(x => x._id === f._id ? { ...x, status: newStatus } : x));
      }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token") || "";
    try {
      const res = await fetch(`${api}/facility/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      if (res.ok) { setFacilities(prev => prev.filter(f => f._id !== id)); }
    } catch (err) { console.error(err); }
    setDeleteId(null);
  };

  const move = async (index: number, dir: "up" | "down") => {
    const arr = [...facilities];
    const swapIndex = dir === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= arr.length) return;
    [arr[index], arr[swapIndex]] = [arr[swapIndex], arr[index]];
    const reordered = arr.map((f, i) => ({ ...f, displayOrder: i }));
    setFacilities(reordered);
    const token = localStorage.getItem("token") || "";
    try {
      await fetch(`${api}/facility/reorder/batch`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ order: reordered.map(f => ({ id: f._id, displayOrder: f.displayOrder })) }),
      });
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <style>{`
        .fac-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .fac-title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin: 0; }
        .fac-subtitle { font-size: 13px; color: #888; margin: 4px 0 0; }
        .btn-add { background: #FF8C00; color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; white-space: nowrap; }
        .btn-add:hover { background: #E67E00; }
        .fac-table-wrap { background: #fff; border-radius: 12px; border: 1px solid #f0f0f0; overflow: hidden; }
        .fac-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .fac-table thead { background: #fafafa; }
        .fac-table th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 700; color: #999; letter-spacing: 0.08em; text-transform: uppercase; border-bottom: 1px solid #f0f0f0; }
        .fac-table td { padding: 14px 16px; border-bottom: 1px solid #f9f9f9; vertical-align: middle; color: #333; }
        .fac-table tr:last-child td { border-bottom: none; }
        .fac-table tr:hover td { background: #fff8f0; }
        .fac-icon-preview { width: 40px; height: 40px; border-radius: 8px; object-fit: contain; border: 1px solid #f0f0f0; background: #fafafa; }
        .fac-icon-placeholder { width: 40px; height: 40px; border-radius: 8px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .badge-active { background: #dcfce7; color: #16a34a; }
        .badge-inactive { background: #fee2e2; color: #dc2626; }
        .action-btns { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
        .btn-icon { background: none; border: 1px solid #e2e8f0; border-radius: 6px; padding: 5px 10px; cursor: pointer; font-size: 12px; color: #555; transition: all 0.15s; white-space: nowrap; }
        .btn-icon:hover { border-color: #FF8C00; color: #FF8C00; }
        .btn-del { background: none; border: 1px solid #e2e8f0; border-radius: 6px; padding: 5px 10px; cursor: pointer; font-size: 12px; color: #555; transition: all 0.15s; }
        .btn-del:hover { border-color: #ef4444; color: #ef4444; }
        .btn-order { background: none; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 8px; cursor: pointer; font-size: 14px; color: #888; transition: all 0.15s; line-height: 1; }
        .btn-order:hover { background: #f5f5f5; color: #333; }
        .btn-order:disabled { opacity: 0.3; cursor: default; }
        .empty-state { text-align: center; padding: 60px 24px; color: #aaa; font-size: 14px; }
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px; }
        .modal { background: #fff; border-radius: 14px; width: 100%; max-width: 480px; padding: 28px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); max-height: 90vh; overflow-y: auto; }
        .modal-title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 20px; }
        .modal-fields { display: flex; flex-direction: column; gap: 14px; }
        .modal-input { background: #f9f9f9; border: 1px solid #e2e8f0; border-radius: 8px; color: #333; font-size: 13px; padding: 10px 14px; width: 100%; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
        .modal-input:focus { border-color: #FF8C00; background: #fff; }
        .modal-textarea { background: #f9f9f9; border: 1px solid #e2e8f0; border-radius: 8px; color: #333; font-size: 13px; padding: 10px 14px; width: 100%; outline: none; resize: vertical; min-height: 80px; transition: border-color 0.15s; box-sizing: border-box; }
        .modal-textarea:focus { border-color: #FF8C00; background: #fff; }
        .modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
        .btn-cancel { background: #f5f5f5; color: #555; border: none; border-radius: 8px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .btn-cancel:hover { background: #ebebeb; }
        .btn-save { background: #FF8C00; color: #fff; border: none; border-radius: 8px; padding: 10px 24px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .btn-save:hover:not(:disabled) { background: #E67E00; }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .icon-preview-row { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
        .status-select { background: #f9f9f9; border: 1px solid #e2e8f0; border-radius: 8px; color: #333; font-size: 13px; padding: 10px 14px; width: 100%; outline: none; cursor: pointer; }
        .confirm-modal { background: #fff; border-radius: 12px; padding: 24px; max-width: 360px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
        @media (max-width: 640px) {
          .fac-table th:nth-child(3), .fac-table td:nth-child(3) { display: none; }
          .fac-table th:nth-child(4), .fac-table td:nth-child(4) { display: none; }
        }
      `}</style>

      {/* Header */}
      <div className="fac-header">
        <div>
          <h1 className="fac-title">Facilities</h1>
          <p className="fac-subtitle">{facilities.length} total facility{facilities.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="btn-add" onClick={openAdd}>+ Add Facility</button>
      </div>

      {/* Table */}
      <div className="fac-table-wrap">
        {facilities.length === 0 ? (
          <div className="empty-state">No facilities yet. Click <strong>+ Add Facility</strong> to get started.</div>
        ) : (
          <table className="fac-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Icon</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((f, i) => (
                <tr key={f._id}>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn-order" onClick={() => move(i, "up")} disabled={i === 0} title="Move up">▲</button>
                      <button className="btn-order" onClick={() => move(i, "down")} disabled={i === facilities.length - 1} title="Move down">▼</button>
                    </div>
                  </td>
                  <td>
                    {f.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.icon} alt={f.name} className="fac-icon-preview" />
                    ) : (
                      <div className="fac-icon-placeholder">🏨</div>
                    )}
                  </td>
                  <td><strong>{f.name}</strong></td>
                  <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.description || <span style={{ color: "#bbb" }}>—</span>}
                  </td>
                  <td>
                    <span className={`badge ${f.status === "active" ? "badge-active" : "badge-inactive"}`}>
                      {f.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon" onClick={() => openEdit(f)}>Edit</button>
                      <button className="btn-icon" onClick={() => toggleStatus(f)}>
                        {f.status === "active" ? "Disable" : "Enable"}
                      </button>
                      <button className="btn-del" onClick={() => setDeleteId(f._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editTarget ? "Edit Facility" : "Add Facility"}</h2>
            <div className="modal-fields">
              <FieldLabel label="Name *">
                <input
                  className="modal-input"
                  value={form.name}
                  placeholder="e.g. Swimming Pool"
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </FieldLabel>
              <FieldLabel label="Icon URL">
                <input
                  className="modal-input"
                  value={form.icon}
                  placeholder="https://example.com/icon.png"
                  onChange={e => setForm({ ...form, icon: e.target.value })}
                />
                {form.icon && (
                  <div className="icon-preview-row">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.icon} alt="preview" style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 8, border: "1px solid #e2e8f0" }} />
                    <span style={{ fontSize: 12, color: "#888" }}>Icon preview</span>
                  </div>
                )}
              </FieldLabel>
              <FieldLabel label="Description">
                <textarea
                  className="modal-textarea"
                  value={form.description}
                  placeholder="Brief description (optional)"
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </FieldLabel>
              <FieldLabel label="Display Order">
                <input
                  type="number"
                  className="modal-input"
                  value={form.displayOrder}
                  min={0}
                  onChange={e => setForm({ ...form, displayOrder: Number(e.target.value) })}
                />
              </FieldLabel>
              <FieldLabel label="Status">
                <select
                  className="status-select"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </FieldLabel>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="btn-save" disabled={loading} onClick={handleSave}>
                {loading ? "Saving..." : editTarget ? "Update" : "Add Facility"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="overlay" onClick={() => setDeleteId(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>Delete Facility?</h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#666" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
              <button
                style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                onClick={() => handleDelete(deleteId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
