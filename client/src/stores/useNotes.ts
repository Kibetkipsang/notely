import useNotesStore from './useNotesStore';

export const useNotes = () => {
  const {
    notes,
    deletedNotes,
    currentNote,
    loading,
    error,
    pagination,
    searchResults,
    stats,
    createNote,
    getNote,
    getAllNotes,
    updateNote,
    softDeleteNote,
    getDeletedNotes,
    restoreNote,
    deleteNotePermanently,
    emptyTrash,
    searchNotes,
    getNoteStats,
    setCurrentNote,
    clearCurrentNote,
    clearError,
    resetNotesStore,
  } = useNotesStore();

  // Helper to refresh notes
  const refreshNotes = (filters = {}) => {
    getAllNotes(filters);
  };

  // Helper to check if note exists
  const noteExists = (id: string) => {
    return notes.some(note => note.id === id) || 
           deletedNotes.some(note => note.id === id);
  };

  // Get note by ID (from both active and deleted)
  const getNoteById = (id: string) => {
    return notes.find(note => note.id === id) || 
           deletedNotes.find(note => note.id === id) || 
           null;
  };

  // Get notes by search term locally
  const localSearch = (query: string) => {
    return notes.filter(note => 
      note.title.toLowerCase().includes(query.toLowerCase()) ||
      note.content.toLowerCase().includes(query.toLowerCase()) ||
      (note.synopsis && note.synopsis.toLowerCase().includes(query.toLowerCase()))
    );
  };

  return {
    // State
    notes,
    deletedNotes,
    currentNote,
    loading,
    error,
    pagination,
    searchResults,
    stats,
    
    // Actions
    createNote,
    getNote,
    getAllNotes,
    updateNote,
    softDeleteNote,
    getDeletedNotes,
    restoreNote,
    deleteNotePermanently,
    emptyTrash,
    searchNotes,
    getNoteStats,
    
    // Local Helpers
    setCurrentNote,
    clearCurrentNote,
    clearError,
    refreshNotes,
    noteExists,
    getNoteById,
    localSearch,
    resetNotesStore,
    
    // Derived State
    totalNotes: stats?.totalNotes || 0,
    activeNotes: stats?.activeNotes || notes.length,
    deletedNotesCount: stats?.deletedNotes || deletedNotes.length,
    recentNotes: stats?.recentNotes || 0,
  };
};