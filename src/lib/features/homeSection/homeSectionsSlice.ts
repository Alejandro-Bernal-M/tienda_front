import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiEndPoints from "../../../utils/routes";
import { HomeSection } from "../../types";
import { signOut } from "../user/userSlice";

const initialState = {
  homeSections: [] as HomeSection[],
  loading: false,
  error: null as any,
};

const getHomeSections = createAsyncThunk(
  "homeSections/getHomeSections",
  async () => {
    const response = await fetch(apiEndPoints.getHomeSections);
    return response.json();
  }
);

const createHomeSection = createAsyncThunk(
  "homeSections/createHomeSection",
  async (data: any, { dispatch }) => {
    const homeSection = data.homeSection;
    const token = data.token;
    try {
      const response: any = await fetch(apiEndPoints.createHomeSection, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: homeSection,
      });
      if (response.status == 400) {
        console.log('Please sign in to create a home section')
        dispatch(signOut());
        window.location.href = '/';
        return
      }
      return response.json();
    } catch (error) {
      console.log(error);
    }
  }
);

const updateHomeSection = createAsyncThunk(
  "homeSections/updateHomeSection",
  async (data: any, { dispatch }) => {
    const homeSection = data.homeSection;
    const token = data.token;
    try {
      const response: any = await fetch(apiEndPoints.updateHomeSection(homeSection.get('_id')), {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: homeSection,
      });
      if (response.status === 401 || response.status === 400) {
        console.log('Please sign in to update home section')
        dispatch(signOut());
        window.location.href = '/';
        return
      }
      return response.json();
    } catch (error) {
      console.log(error);
    }
  }
);

const deleteHomeSection = createAsyncThunk(
  "homeSections/deleteHomeSection",
  async (data: any, { dispatch }) => {
    const homeSectionId = data.homeSectionId;
    const token = data.token;
    try {
      const response: any = await fetch(apiEndPoints.deleteHomeSection(homeSectionId), {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });
      if (response.status === 401 || response.status === 400) {
        console.log('Please sign in to delete home section')
        dispatch(signOut());
        window.location.href = '/';
        return
      }
      return response.json();
    } catch (error) {
      console.log(error);
    }
  }
);

const homeSectionsSlice = createSlice({
  name: "homeSections",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getHomeSections.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(getHomeSections.fulfilled, (state, action) => {
      state.loading = false;
      state.homeSections = action.payload.homeSections;
    });
    builder.addCase(getHomeSections.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error;
    });

    builder.addCase(createHomeSection.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(createHomeSection.fulfilled, (state, action) => {
      state.loading = false;
      let newHomeSections = [...state.homeSections, action.payload.homeSection].sort((a: HomeSection, b: HomeSection) => (a.order ?? 0) - (b.order ?? 0));
      state.homeSections = newHomeSections;
    });
    builder.addCase(createHomeSection.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error;
    });

    builder.addCase(updateHomeSection.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(updateHomeSection.fulfilled, (state, action) => {
      state.loading = false;
      state.homeSections = state.homeSections.map((homeSection) => {
        if (homeSection._id === action.payload.updatedHomeSection._id) {
          return action.payload.updatedHomeSection;
        }
        return homeSection;
      });
    });
    builder.addCase(updateHomeSection.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error;
    });

    builder.addCase(deleteHomeSection.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(deleteHomeSection.fulfilled, (state, action) => {
      state.loading = false;
      state.homeSections = state.homeSections.filter((homeSection) => homeSection._id !== action.payload.id);
    });
    builder.addCase(deleteHomeSection.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error;
    });
  }
});

export { getHomeSections, createHomeSection, updateHomeSection, deleteHomeSection };
export default homeSectionsSlice.reducer;