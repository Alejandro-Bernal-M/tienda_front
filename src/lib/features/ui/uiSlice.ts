import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  globalError: string | null; // Guardaremos la "Key" de traducción (ej: 'session_expired')
  globalSuccess: string | null;
}

const initialState: UiState = {
  globalError: null,
  globalSuccess: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Acción para disparar un error desde cualquier lado
    setGlobalError: (state, action: PayloadAction<string>) => {
      state.globalError = action.payload;
    },
    // Acción para limpiar el error (reset)
    clearGlobalError: (state) => {
      state.globalError = null;
    },
    // Opcional: Para mensajes de éxito globales
    setGlobalSuccess: (state, action: PayloadAction<string>) => {
      state.globalSuccess = action.payload;
    },
    clearGlobalSuccess: (state) => {
      state.globalSuccess = null;
    }
  },
});

export const { setGlobalError, clearGlobalError, setGlobalSuccess, clearGlobalSuccess } = uiSlice.actions;
export default uiSlice.reducer;