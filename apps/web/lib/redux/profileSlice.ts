import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { FormData } from '@/components/dashboard/profile/types';

export interface ProfileState {
  data: FormData | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  status: 'idle',
  error: null,
};

// Thunk para cargar el perfil bajo demanda
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (userId: string, { rejectWithValue }: { rejectWithValue: (value: string) => unknown }) => {
    try {
      const res = await fetch(`/api/profile?userId=${userId}`);
      if (!res.ok) throw new Error('Error al cargar el perfil');
      const data: FormData = await res.json();
      return data;
    } catch (err) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Error desconocido');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile(state: ProfileState) {
      state.data = null;
      state.status = 'idle';
      state.error = null;
    },
    setProfile(state: ProfileState, action: { payload: FormData }) {
      state.data = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state: ProfileState) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state: ProfileState, action) => {
        state.data = action.payload as FormData;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state: ProfileState, action: { payload: unknown }) => {
        state.status = 'failed';
        state.error = typeof action.payload === 'string' ? action.payload : 'Error al cargar perfil';
      });
  },
});

export const { clearProfile, setProfile } = profileSlice.actions;
export default profileSlice.reducer;
