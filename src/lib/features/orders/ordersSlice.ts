import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import apiEndPoints from "../../../utils/routes";
import { Order } from "../../types";
import { signOut } from "../user/userSlice";

const initialState = {
  orders: [] as Order[],
  loadingOrders: false,
  error: null as any,
};

const getOrders = createAsyncThunk(
  "orders/getOrders",
  async (data: any, { dispatch }) => {
    try {
      const response = await fetch(apiEndPoints.getOrders, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': 'Bearer '+data.token
        }
      });
      if(response.status === 401){
        console.log('Please sign in to view orders')
        dispatch(signOut());
        window.location.href = '/';
        return
      }
      if(response.status === 200){
        return response.json();
      }
    } catch (error) {
      console.error(error);
    }
  }
);

const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async (data: { orderId: string, orderStatus: string, paymentStatus?: string, token: string }, { dispatch, rejectWithValue }) => {
    
    // Destructuramos también paymentStatus
    const { orderId, orderStatus, paymentStatus, token } = data;

    try {
      const response = await fetch(apiEndPoints.updateOrder(orderId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ 
            orderStatus, 
            paymentStatus
        })
      });

      if (response.status === 401) {
        dispatch(signOut());
        window.location.href = '/';
        return rejectWithValue('Unauthorized');
      }

      if (!response.ok) {
        throw new Error('Error en la petición');
      }

      return await response.json();

    } catch (error) {
      console.error(error);
      return rejectWithValue(error);
    }
  }
);

const ordersSlice = createSlice({
  initialState,
  name: "orders",
  reducers:{},
  extraReducers: (builder) => {
    builder.addCase(getOrders.pending, (state) => {
      state.loadingOrders = true;
    });
    builder.addCase(getOrders.fulfilled, (state, action) => {
      state.loadingOrders = false;
      state.orders = action.payload.orders;
    });
    builder.addCase(getOrders.rejected, (state, action) => {
      state.loadingOrders = false;
      state.error = action.error;
    });
    builder.addCase(updateOrder.pending, (state) => {
      state.loadingOrders = true;
    });
    builder.addCase(updateOrder.fulfilled, (state, action) => {
      state.loadingOrders = false;
      state.orders = state.orders.map((order) => {
        if(order._id === action.payload.updatedOrder._id){
          return action.payload.updatedOrder;
        }
        return order;
      });
    });
    builder.addCase(updateOrder.rejected, (state, action) => {
      state.loadingOrders = false;
      state.error = action.error;
    });
  }
})

export default ordersSlice.reducer;
export { getOrders, updateOrder };