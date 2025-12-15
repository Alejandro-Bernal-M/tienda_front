import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import apiEndPoints from "../../../utils/routes";
import { signOut } from "../user/userSlice";
import { Category } from "../../types";

const initialState = {
  categories: [] as Category[],
  loading: false,
  error: null as any,
};

// --- GET ---
const getCategories = createAsyncThunk(
  "categories/getCategories",
  async () => {
    const response = await fetch(apiEndPoints.getCategories);
    return response.json();
  }
);

// --- CREATE ---
const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (data: any, { dispatch }) => {
    const category = data.category;
    const token = data.token;
    try {
      const response: any = await fetch(apiEndPoints.createCategory, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: category,
      });
      if (response.status === 400) {
        dispatch(signOut());
        window.location.href = '/';
        return;
      }
      const result = await response.json();
      
      // Refetch para asegurar orden correcto
      dispatch(getCategories());
      
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
);

// --- UPDATE (SOLUCIÓN REFETCH) ---
const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async (data: any, { dispatch }) => {
    const category = data.category;
    const token = data.token;
    
    try {
      const categoryId = category.get('_id'); 
      const response: any = await fetch(apiEndPoints.updateCategory(categoryId), {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
        body: category,
      });

      if (response.status === 401) {
        dispatch(signOut());
        window.location.href = '/session';
        return;
      }
      if (response.status === 400) throw new Error('Error updating category');
      
      const result = await response.json();

      // 🔥 FORZAMOS RECARGA DE DATOS 🔥
      // Esto garantiza que la estructura padre/hijo sea idéntica a la DB.
      await dispatch(getCategories());

      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
);

// --- DELETE ---
const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (data: any, { dispatch }) => {
    const categoryId = data._id;
    const token = data.token;
    try {
      const response: any = await fetch(apiEndPoints.deleteCategory(categoryId), {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.status === 400) throw new Error('Error deleting');
      if (response.status === 401) {
        dispatch(signOut());
        window.location.href = '/';
        return;
      }
      
      const result = await response.json();
      
      // Si el backend no devuelve la lista completa actualizada, hacemos refetch
      if (!result.updatedCategories) {
          dispatch(getCategories());
      }
      
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
  },
  extraReducers: (builder) => {
    // GET
    builder.addCase(getCategories.pending, (state) => { state.loading = true; });
    builder.addCase(getCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = action.payload.categoryList || action.payload; // Ajusta según tu respuesta backend
    });
    builder.addCase(getCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error;
    });

    // CREATE
    builder.addCase(createCategory.pending, (state) => { state.loading = true; });
    builder.addCase(createCategory.fulfilled, (state) => {
      state.loading = false;
      // No hacemos push manual, esperamos al refetch de getCategories
    });
    builder.addCase(createCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error;
    });

    // UPDATE
    builder.addCase(updateCategory.pending, (state) => { state.loading = true; });
    builder.addCase(updateCategory.fulfilled, (state) => {
      state.loading = false; 
      // No tocamos state.categories, getCategories se encargará
    });
    builder.addCase(updateCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error;
    });

    // DELETE
    builder.addCase(deleteCategory.pending, (state) => { state.loading = true; });
    builder.addCase(deleteCategory.fulfilled, (state, action) => {
      state.loading = false;
      if(action.payload && action.payload.updatedCategories) {
          state.categories = action.payload.updatedCategories;
      }
      // Si no hay payload.updatedCategories, el dispatch(getCategories) del thunk se encargará
    });
    builder.addCase(deleteCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error;
    });
  },
});

export { getCategories, createCategory, updateCategory, deleteCategory };
export const { setCategories } = categoriesSlice.actions;
export default categoriesSlice.reducer;