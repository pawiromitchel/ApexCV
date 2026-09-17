"use client";

import React from "react";
import { CertificationItem } from "@/lib/types";
import { Plus, Trash2, Award } from "lucide-react";

interface CertificationsFormProps {
  certifications: CertificationItem[];
  onChange: (certifications: CertificationItem[]) => void;
}

export function CertificationsForm({
  certifications,
  onChange,
}: CertificationsFormProps) {
  const handleAdd = () => {
    const newItem: CertificationItem = {
      id: `cert_${Date.now()}`,
      name: "",
      issuer: "",
      date: "",
      url: "",
    };
    onChange([...certifications, newItem]);
  };

  const handleUpdate = (id: string, updated: Partial<CertificationItem>) => {
    onChange(
      certifications.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const handleDelete = (id: string) => {
    onChange(certifications.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Certifications & Licenses ({certifications.length})
          </h3>
          <p className="text-[11px] text-slate-500">
            Industry accreditations, cloud certificates, or professional awards.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 text-xs font-bold transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Certification</span>
        </button>
      </div>

      {certifications.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
          <Award className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-400">No certifications added yet</p>
          <button
            type="button"
            onClick={handleAdd}
            className="mt-3 text-xs font-bold text-sky-400 hover:underline"
          >
            + Add accreditation
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {certifications.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-200">
                  {item.name || "Certification Name"}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Certification Name *
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdate(item.id, { name: e.target.value })}
                    placeholder="e.g. AWS Certified Solutions Architect"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Issuing Organization *
                  </label>
                  <input
                    type="text"
                    value={item.issuer}
                    onChange={(e) => handleUpdate(item.id, { issuer: e.target.value })}
                    placeholder="e.g. Amazon Web Services"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Year / Date Received
                  </label>
                  <input
                    type="text"
                    value={item.date}
                    onChange={(e) => handleUpdate(item.id, { date: e.target.value })}
                    placeholder="e.g. 2023"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Verification URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={item.url || ""}
                    onChange={(e) => handleUpdate(item.id, { url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
