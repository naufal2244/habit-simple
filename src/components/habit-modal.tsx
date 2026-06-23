"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Trash2, X } from "lucide-react";
import type { Habit, HabitInput } from "@/lib/habit-types";

const colors = ["#79d9a9", "#f2a9bb", "#77bfe8", "#f4cf68", "#a999e8", "#f3a170", "#68cfc8", "#afd86d"];

type HabitModalProps = {
  habit: Habit | null;
  onClose: () => void;
  onSubmit: (input: HabitInput) => Promise<void>;
  onDelete: (habit: Habit) => Promise<void>;
};

export function HabitModal({ habit, onClose, onSubmit, onDelete }: HabitModalProps) {
  const [form, setForm] = useState<HabitInput>({
    name: habit?.name ?? "",
    goal: habit?.goal ?? 20,
    color: habit?.color ?? colors[0],
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  }

  async function removeHabit() {
    if (!habit) return;
    setDeleting(true);
    try {
      await onDelete(habit);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="habit-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="habit-dialog glass-panel" role="dialog" aria-modal="true" aria-labelledby="habit-dialog-title" onSubmit={submit}>
        <header className="habit-dialog-header">
          <div>
            <span>{habit ? "Edit habit" : "Habit baru"}</span>
            <h2 id="habit-dialog-title">{habit ? "Perbarui rutinitas" : "Tambah rutinitas"}</h2>
          </div>
          <button className="icon-control" type="button" onClick={onClose} aria-label="Tutup editor" title="Tutup">
            <X size={19} />
          </button>
        </header>

        <div className="habit-form-grid">
          <label>
            Nama habit
            <input ref={nameRef} required maxLength={80} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Contoh: Morning Walk" />
          </label>
          <label>
            Goal bulanan
            <input required type="number" min="1" max="31" value={form.goal} onChange={(event) => setForm({ ...form, goal: Number(event.target.value) })} />
          </label>
        </div>

        <fieldset className="color-fieldset">
          <legend>Warna baris</legend>
          <div className="color-options">
            {colors.map((color) => (
              <button
                className={form.color === color ? "selected" : ""}
                key={color}
                type="button"
                style={{ "--swatch": color } as React.CSSProperties}
                onClick={() => setForm({ ...form, color })}
                aria-label={`Pilih warna ${color}`}
                aria-pressed={form.color === color}
              />
            ))}
          </div>
        </fieldset>

        {habit && (
          <section className={`delete-habit-section${confirmingDelete ? " is-confirming" : ""}`} aria-label="Hapus habit">
            {confirmingDelete ? (
              <>
                <p>Hapus <strong>{habit.name}</strong> beserta seluruh checklist-nya?</p>
                <div>
                  <button type="button" onClick={() => setConfirmingDelete(false)} disabled={deleting}>Batal</button>
                  <button className="danger-control" type="button" onClick={() => void removeHabit()} disabled={deleting}>
                    {deleting && <LoaderCircle className="spin" size={17} />}
                    Ya, hapus
                  </button>
                </div>
              </>
            ) : (
              <button className="delete-trigger" type="button" onClick={() => setConfirmingDelete(true)} disabled={saving}>
                <Trash2 size={17} />Hapus habit
              </button>
            )}
          </section>
        )}

        <footer className="habit-dialog-actions">
          <button type="button" onClick={onClose} disabled={saving || deleting}>Batal</button>
          <button className="primary-control" type="submit" disabled={saving || deleting || !form.name.trim()}>
            {saving && <LoaderCircle className="spin" size={17} />}
            {habit ? "Simpan perubahan" : "Tambah habit"}
          </button>
        </footer>
      </form>
    </div>
  );
}
