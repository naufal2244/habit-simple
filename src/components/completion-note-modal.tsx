"use client";

import { FormEvent, useState } from "react";
import { FileText, Loader2, X } from "lucide-react";
import type { Habit } from "@/lib/habit-types";

type CompletionNoteModalProps = {
  habit: Habit;
  day: number;
  dateLabel: string;
  initialNote: string;
  readOnly: boolean;
  onClose: () => void;
  onSubmit: (note: string) => Promise<void>;
};

export function CompletionNoteModal({
  habit,
  day,
  dateLabel,
  initialNote,
  readOnly,
  onClose,
  onSubmit,
}: CompletionNoteModalProps) {
  const [note, setNote] = useState(initialNote);
  const [isSaving, setIsSaving] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (readOnly) {
      onClose();
      return;
    }

    setIsSaving(true);
    void onSubmit(note)
      .catch(() => undefined)
      .finally(() => setIsSaving(false));
  }

  return (
    <div className="habit-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <form className="habit-dialog note-dialog glass-panel" onSubmit={handleSubmit} onMouseDown={(event) => event.stopPropagation()}>
        <header className="habit-dialog-header">
          <div>
            <span>Catatan tanggal {day}</span>
            <h2>{habit.name}</h2>
            <p>{dateLabel}</p>
          </div>
          <button className="icon-control" type="button" onClick={onClose} aria-label="Tutup catatan">
            <X size={18} />
          </button>
        </header>

        <label className="note-field">
          <span><FileText size={15} /> Catatan harian</span>
          <textarea
            autoFocus={!readOnly}
            disabled={readOnly}
            maxLength={500}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Contoh: Stimuler tanggal ini selesai 30 menit, fokus ke materi baru."
          />
        </label>
        <div className="note-meta">
          <span>{note.trim() ? "Catatan akan tersimpan untuk tanggal ini." : "Kosongkan untuk menghapus catatan."}</span>
          <strong>{note.length}/500</strong>
        </div>

        <div className="habit-dialog-actions">
          <button type="button" onClick={onClose}>{readOnly ? "Tutup" : "Batal"}</button>
          {!readOnly && (
            <button className="primary-control" type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="spin" size={16} />}
              Simpan
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
