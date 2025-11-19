import { configureStore } from '@reduxjs/toolkit'
import userSlice from './features/user/userSlice'
import productsSlice from './features/products/productsSlice'
import categoriesSlice from './features/categories/categoriesSlice'
import cartSlice from './features/cart/cartSlice'
import ordersSlice from './features/orders/ordersSlice'
import homeSectionSlice from './features/homeSection/homeSectionsSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userSlice,
      products : productsSlice,
      categories: categoriesSlice,
      cart: cartSlice,
      orders: ordersSlice,
      homeSections: homeSectionSlice,
    }
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']