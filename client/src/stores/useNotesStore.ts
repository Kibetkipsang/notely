import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { api } from '../axios'; // Import your axios instance

// Types (keep your existing types)
export type NoteType = {
  id: string;
  title: string;
  content: string;
  synopsis?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isDeleted: boolean;
  userId: string;
};

export type NoteFormData = {
  title: string;
  content: string;
  synopsis?: string;
};

export type PaginationType = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type NoteFilterType = {
  search?: string;
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
};

export type NoteStatsType = {
  totalNotes: number;
  activeNotes: number;
  deletedNotes: number;
  recentNotes: number;
};

type NotesStore = {
  // State
  notes: NoteType[];
  deletedNotes: NoteType[];
  currentNote: NoteType | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationType | null;
  searchResults: NoteType[];
  stats: NoteStatsType | null;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // CRUD Operations (updated to use axios)
  createNote: (noteData: NoteFormData) => Promise<void>;
  getNote: (id: string) => Promise<void>;
  getAllNotes: (filters?: NoteFilterType) => Promise<void>;
  updateNote: (id: string, noteData: Partial<NoteFormData>) => Promise<void>;
  
  // Trash Management
  softDeleteNote: (id: string) => Promise<void>;
  getDeletedNotes: (page?: number, limit?: number) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  deleteNotePermanently: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  
  // Search & Filter
  searchNotes: (query: string, includeDeleted?: boolean) => Promise<void>;
  
  // Stats
  getNoteStats: () => Promise<void>;
  
  // Local State Management
  setCurrentNote: (note: NoteType | null) => void;
  clearCurrentNote: () => void;
  clearSearchResults: () => void;
  clearError: () => void;
  
  // Sync with Server (for optimistic updates)
  addNoteToLocal: (note: NoteType) => void;
  updateNoteLocal: (id: string, updates: Partial<NoteType>) => void;
  removeNoteLocal: (id: string, permanent?: boolean) => void;
  
  // Reset
  resetNotesStore: () => void;
};

// Initial State
const initialState = {
  notes: [],
  deletedNotes: [],
  currentNote: null,
  loading: false,
  error: null,
  pagination: null,
  searchResults: [],
  stats: null,
};

const useNotesStore = create<NotesStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setLoading: (loading) => set({ loading }),
        
        setError: (error) => set({ error }),
        
        clearError: () => set({ error: null }),
        
        setCurrentNote: (note) => set({ currentNote: note }),
        
        clearCurrentNote: () => set({ currentNote: null }),
        
        clearSearchResults: () => set({ searchResults: [] }),
        
        // Create Note - USING AXIOS
        createNote: async (noteData) => {
          try {
            set({ loading: true, error: null });
            
            const response = await api.post('/notes/create', noteData);
            
            // Axios automatically handles JSON parsing
            const { data: note } = response.data;
            
            // Update local state
            set((state) => ({
              notes: [note, ...state.notes],
              loading: false,
              currentNote: note,
            }));
            
          } catch (error: any) {
            console.error('Create note error:', error);
            set({ 
              error: error?.response?.data?.error || 
                   error?.response?.data?.message || 
                   error?.message || 
                   'Failed to create note',
              loading: false 
            });
          }
        },
        
        // Get Single Note - USING AXIOS
        getNote: async (id) => {
          try {
            set({ loading: true, error: null });
            
            const response = await api.get(`/notes/${id}`);
            
            const { data: note } = response.data;
            
            set({ 
              currentNote: note,
              loading: false 
            });
            
          } catch (error: any) {
            console.error('Get note error:', error);
            set({ 
              error: error?.response?.data?.error || 
                   error?.response?.data?.message || 
                   error?.message || 
                   'Failed to fetch note',
              loading: false 
            });
          }
        },
        
        // Get All Notes with filters - USING AXIOS
        getAllNotes: async (filters = {}) => {
  try {
    console.log('=== GET ALL NOTES DEBUG ===');
    console.log('Filters:', filters);
    
    set({ loading: true, error: null });
    
    const { page = 1, limit = 10, search = '', includeDeleted = false } = filters;
    
    const params = {
      page,
      limit,
      ...(search && { search }),
      ...(includeDeleted && { includeDeleted: true }),
    };
    
    console.log('Making API call to /notes with params:', params);
    
    const response = await api.get('/notes', { params });
    
    console.log('API Response:', response);
    console.log('Response data:', response.data);
    console.log('Response status:', response.status);
    
    const { data: notes, pagination } = response.data;
    
    console.log('Notes from API:', notes);
    console.log('Notes array length:', notes?.length || 0);
    
    set({ 
      notes: includeDeleted ? notes : notes.filter((note: NoteType) => !note.isDeleted),
      deletedNotes: includeDeleted ? notes.filter((note: NoteType) => note.isDeleted) : get().deletedNotes,
      pagination,
      loading: false 
    });
    
    console.log('Store updated successfully');
    
  } catch (error: any) {
    console.error('Get all notes error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data
    });
    
    set({ 
      error: error?.response?.data?.error || 
           error?.response?.data?.message || 
           error?.message || 
           'Failed to fetch notes',
      loading: false 
    });
  }
},
        
        // Update Note - USING AXIOS
        updateNote: async (id, noteData) => {
          try {
            set({ loading: true, error: null });
            
            const response = await api.put(`/notes/${id}`, noteData);
            
            const { data: updatedNote } = response.data;
            
            // Update in local state
            set((state) => ({
              notes: state.notes.map((note) => 
                note.id === id ? { ...note, ...updatedNote } : note
              ),
              currentNote: state.currentNote?.id === id 
                ? { ...state.currentNote, ...updatedNote }
                : state.currentNote,
              loading: false,
            }));
            
          } catch (error: any) {
            console.error('Update note error:', error);
            set({ 
              error: error?.response?.data?.error || 
                   error?.response?.data?.message || 
                   error?.message || 
                   'Failed to update note',
              loading: false 
            });
          }
        },
        
        // Soft Delete (Move to Trash) - USING AXIOS
        softDeleteNote: async (id) => {
          try {
            set({ loading: true, error: null });
            
            await api.patch(`/notes/${id}/soft-delete`);
            
            // Update local state
            set((state) => {
              const noteToDelete = state.notes.find((note) => note.id === id);
              
              return {
                notes: state.notes.filter((note) => note.id !== id),
                deletedNotes: noteToDelete 
                  ? [{ ...noteToDelete, isDeleted: true, deletedAt: new Date() }, ...state.deletedNotes]
                  : state.deletedNotes,
                currentNote: state.currentNote?.id === id ? null : state.currentNote,
                loading: false,
              };
            });
            
          } catch (error: any) {
            console.error('Delete note error:', error);
            set({ 
              error: error?.response?.data?.error || 
                   error?.response?.data?.message || 
                   error?.message || 
                   'Failed to delete note',
              loading: false 
            });
          }
        },
        
        // Get Deleted Notes (Trash) - USING AXIOS
        getDeletedNotes: async (page = 1, limit = 10) => {
          try {
            set({ loading: true, error: null });
            
            const params = { page, limit };
            const response = await api.get('/notes/trash', { params });
            
            const { data: deletedNotes, pagination } = response.data;
            
            set({ 
              deletedNotes,
              pagination,
              loading: false 
            });
            
          } catch (error: any) {
            console.error('Get deleted notes error:', error);
            set({ 
              error: error?.response?.data?.error || 
                   error?.response?.data?.message || 
                   error?.message || 
                   'Failed to fetch deleted notes',
              loading: false 
            });
          }
        },
        
        // Restore from Trash - USING AXIOS
        restoreNote: async (id) => {
          try {
            set({ loading: true, error: null });
            
            await api.post(`/notes/${id}/restore`);
            
            // Update local state
            set((state) => {
              const noteToRestore = state.deletedNotes.find((note) => note.id === id);
              
              return {
                deletedNotes: state.deletedNotes.filter((note) => note.id !== id),
                notes: noteToRestore 
                  ? [{ ...noteToRestore, isDeleted: false, deletedAt: undefined }, ...state.notes]
                  : state.notes,
                loading: false,
              };
            });
            
          } catch (error: any) {
            console.error('Restore note error:', error);
            set({ 
              error: error?.response?.data?.error || 
                   error?.response?.data?.message || 
                   error?.message || 
                   'Failed to restore note',
              loading: false 
            });
          }
        },
        
        // Permanently Delete - USING AXIOS
        deleteNotePermanently: async (id) => {
          try {
            set({ loading: true, error: null });
            
            await api.delete(`/notes/${id}`);
            
            // Remove from local state
            set((state) => ({
              deletedNotes: state.deletedNotes.filter((note) => note.id !== id),
              notes: state.notes.filter((note) => note.id !== id),
              currentNote: state.currentNote?.id === id ? null : state.currentNote,
              loading: false,
            }));
            
          } catch (error: any) {
            console.error('Delete note permanently error:', error);
            set({ 
              error: error?.response?.data?.error || 
                   error?.response?.data?.message || 
                   error?.message || 
                   'Failed to delete note',
              loading: false 
            });
          }
        },
        
        // Empty Trash - USING AXIOS
        emptyTrash: async () => {
          try {
            set({ loading: true, error: null });
            
            await api.delete('/notes/trash/empty');
            
            set({ 
              deletedNotes: [],
              loading: false 
            });
            
          } catch (error: any) {
            console.error('Empty trash error:', error);
            set({ 
              error: error?.response?.data?.error || 
                   error?.response?.data?.message || 
                   error?.message || 
                   'Failed to empty trash',
              loading: false 
            });
          }
        },
        
        // Search Notes - USING AXIOS
        searchNotes: async (query, includeDeleted = false) => {
          try {
            set({ loading: true, error: null });
            
            const params = {
              query,
              includeDeleted: includeDeleted.toString(),
            };
            
            const response = await api.get('/notes/search', { params });
            
            const { data: results } = response.data;
            
            set({ 
              searchResults: results,
              loading: false 
            });
            
          } catch (error: any) {
            console.error('Search notes error:', error);
            set({ 
              error: error?.response?.data?.error || 
                   error?.response?.data?.message || 
                   error?.message || 
                   'Failed to search notes',
              loading: false 
            });
          }
        },
        
        // Get Note Statistics - USING AXIOS
        getNoteStats: async () => {
          try {
            set({ loading: true, error: null });
            
            const response = await api.get('/notes/stats');
            
            const { data: stats } = response.data;
            
            set({ 
              stats,
              loading: false 
            });
            
          } catch (error: any) {
            console.error('Get note stats error:', error);
            set({ 
              error: error?.response?.data?.error || 
                   error?.response?.data?.message || 
                   error?.message || 
                   'Failed to fetch statistics',
              loading: false 
            });
          }
        },
        
        // Local State Management Helpers (keep as is)
        addNoteToLocal: (note) => {
          set((state) => ({
            notes: [note, ...state.notes],
          }));
        },
        
        updateNoteLocal: (id, updates) => {
          set((state) => ({
            notes: state.notes.map((note) => 
              note.id === id ? { ...note, ...updates } : note
            ),
            currentNote: state.currentNote?.id === id 
              ? { ...state.currentNote, ...updates }
              : state.currentNote,
          }));
        },
        
        removeNoteLocal: (id, permanent = false) => {
          set((state) => {
            if (permanent) {
              return {
                notes: state.notes.filter((note) => note.id !== id),
                deletedNotes: state.deletedNotes.filter((note) => note.id !== id),
                currentNote: state.currentNote?.id === id ? null : state.currentNote,
              };
            }
            
            // Soft delete
            const noteToDelete = state.notes.find((note) => note.id === id);
            return {
              notes: state.notes.filter((note) => note.id !== id),
              deletedNotes: noteToDelete 
                ? [{ ...noteToDelete, isDeleted: true, deletedAt: new Date() }, ...state.deletedNotes]
                : state.deletedNotes,
              currentNote: state.currentNote?.id === id ? null : state.currentNote,
            };
          });
        },
        
        // Reset store
        resetNotesStore: () => set(initialState),
        
      }),
      {
        name: 'notes-storage',
        partialize: (state) => ({ 
          // Only persist notes, not loading/error states
          notes: state.notes,
          deletedNotes: state.deletedNotes,
          stats: state.stats,
        }),
      }
    ),
    { name: 'NotesStore' }
  )
);

export default useNotesStore;