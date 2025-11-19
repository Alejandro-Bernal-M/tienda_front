import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import apiEndPoints from "../../../utils/routes";
import { signOut } from "../user/userSlice";
import { Category } from "../../types";

const initialState = {
  categories: [] as Category[],
  loading: false,
  error: null as any,
};

const getCategories = createAsyncThunk(
  "categories/getCategories",
  async () => {
    const response = await fetch(apiEndPoints.getCategories);
    return response.json();
  }
);

const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (data: any, { dispatch }) => {
    const category = data.category;
    const token = data.token;
    try {
      const response: any = await fetch(apiEndPoints.createCategory, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: category,
      });
      if (response.status == 400) {
        console.log('Please sign in to create a category')
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

const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async (data: any, { dispatch }) => {
    const category = data.category;
    const token = data.token;
    console.log('category', category)
    try {
      const response: any = await fetch(apiEndPoints.updateCategory(category.get('_id')), {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: category,
      });
      if (response.status === 401) {
        dispatch(signOut());
        window.location.href = '/session ';
        alert('Session expired, please sign in');
        return
      }

      if (response.status === 400) {
        alert('Error updating category');
        return
      }
      return response.json();
    } catch (error) {
      console.log(error);
    }
  }
);

const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (data: any, { dispatch }) => {
    const categoryId = data._id;
    const token = data.token;
    try {
      const response: any = await fetch(apiEndPoints.deleteCategory(categoryId), {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });
      if (response.status == 400) {
        alert('Error deleting category');
        return
      }

      if (response.status == 401) {
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

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getCategories.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = action.payload.categoryList;
    });
    builder.addCase(getCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error;
    });
    builder.addCase(createCategory.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createCategory.fulfilled, (state, action) => {
      state.loading = false;
      state.categories.push(action.payload.savedCategory);
    });
    builder.addCase(createCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error;
    });
    builder.addCase(updateCategory.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateCategory.fulfilled, (state, action) => {
      state.loading = false;
      if(action.payload.updatedCategory.parentId) {
        const parentIndex = state.categories.findIndex((category) => category._id == action.payload.updatedCategory.parentId);
        const childIndex = state.categories[parentIndex].children.findIndex((child) => child._id == action.payload.updatedCategory._id);
        if(childIndex === -1){
          state.categories[parentIndex].children.push(action.payload.updatedCategory);
        }
        state.categories.forEach((category) => {
          if(category._id !== action.payload.updatedCategory.parentId) {
            category.children = category.children.filter((child) => child._id !== action.payload.updatedCategory._id);
          }
        });
        state.categories[parentIndex].children[childIndex] = action.payload.updatedCategory;
        return;
      }
      const index = state.categories.findIndex((category) => category._id == action.payload.updatedCategory._id);
      state.categories[index] = action.payload.updatedCategory;
    });
    builder.addCase(updateCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error;
    });
    builder.addCase(deleteCategory.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteCategory.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = action.payload.updatedCategories;
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