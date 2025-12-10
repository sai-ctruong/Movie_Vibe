import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  showSearch: boolean;
  sidebarOpen: boolean;
  videoPlaying: boolean;
}

const initialState: UIState = {
  showSearch: false,
  sidebarOpen: false,
  videoPlaying: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSearch: (state) => {
      state.showSearch = !state.showSearch;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setVideoPlaying: (state, action: PayloadAction<boolean>) => {
      state.videoPlaying = action.payload;
    },
  },
});

export const { toggleSearch, toggleSidebar, setVideoPlaying } = uiSlice.actions;
export default uiSlice.reducer;
