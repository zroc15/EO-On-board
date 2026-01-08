import { useState, useEffect } from 'react';
import { storageService } from '../services/localStorage';

interface Note {
  id: string;
  onboarding_id: string;
  engineer_name: string;
  engineer_email: string;
  note: string;
  created_at: string;
}

interface Props {
  onboardingId: string;
  currentUserEmail: string;
  currentUserName: string;
}

export default function EngineerNotes({ onboardingId, currentUserEmail, currentUserName }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [onboardingId]);

  const loadNotes = () => {
    const key = `notes_${onboardingId}`;
    const notesData = localStorage.getItem(key);
    setNotes(notesData ? JSON.parse(notesData) : []);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSaving(true);
    try {
      const note: Note = {
        id: crypto.randomUUID(),
        onboarding_id: onboardingId,
        engineer_name: currentUserName,
        engineer_email: currentUserEmail,
        note: newNote.trim(),
        created_at: new Date().toISOString()
      };

      const updatedNotes = [...notes, note];
      const key = `notes_${onboardingId}`;
      localStorage.setItem(key, JSON.stringify(updatedNotes));

      setNotes(updatedNotes);
      setNewNote('');

      // Touch the onboarding record to update timestamp
      storageService.touchOnboarding(onboardingId);
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Engineer Notes</h2>
        <p className="text-sm text-gray-600 mb-6">
          Add notes about this deployment. These notes are visible to all team members and cannot be deleted.
        </p>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="mb-6">
          <label htmlFor="new-note" className="block text-sm font-medium text-gray-700 mb-2">
            Add a new note
          </label>
          <textarea
            id="new-note"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={4}
            placeholder="Enter your note here..."
            className="block w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={!newNote.trim() || saving}
              className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 shadow-md hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Add Note'}
            </button>
          </div>
        </form>

        {/* Notes List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Previous Notes ({notes.length})
          </h3>
          {notes.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">No notes yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-gradient-to-br from-white to-primary-50/20 border border-primary-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                        {note.engineer_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{note.engineer_name}</p>
                        <p className="text-xs text-gray-500">{note.engineer_email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(note.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap pl-10">{note.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
