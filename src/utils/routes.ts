
const apiEndPoints = {
  signup: process.env.NEXT_PUBLIC_API+'/signup', // method: POST
  signin: process.env.NEXT_PUBLIC_API+'/signin', // method: POST
  getAllProducts: process.env.NEXT_PUBLIC_API+'/products', // method: GET
  getProduct: process.env.NEXT_PUBLIC_API+'/product', // method: GET
  createProduct: process.env.NEXT_PUBLIC_API+'/products', // method: POST
  updateProduct: (id: string) => process.env.NEXT_PUBLIC_API+`/product/${id}`, // method: PUT
  deleteProduct: (id: string) => process.env.NEXT_PUBLIC_API+`/product/${id}`, // method: DELETE
  addReviewToProduct: process.env.NEXT_PUBLIC_API+'/product/review', // method: POST
  getCategories: process.env.NEXT_PUBLIC_API+'/categories', // method: GET
  createCategory: process.env.NEXT_PUBLIC_API+'/categories', // method: POST
  updateCategory: (id: string) => process.env.NEXT_PUBLIC_API+`/categories/${id}`, // method: PUT
  deleteCategory: (id: string) => process.env.NEXT_PUBLIC_API+`/categories/${id}`, // method: DELETE
  addProductToCart: process.env.NEXT_PUBLIC_API+'/cart/add', // method: POST
  mergeCart: process.env.NEXT_PUBLIC_API+'/cart/merge', // method: POST
  subtractQuantityFromCart: process.env.NEXT_PUBLIC_API+'/cart/subtract', // method: POST
  removeProductFromCart: (id: string) => process.env.NEXT_PUBLIC_API+`/cart/remove/${id}`, // method: DELETE
  clearCart: process.env.NEXT_PUBLIC_API+'/cart/clear', // method: DELETE
  checkProductsForCheckout: process.env.NEXT_PUBLIC_API+'/cart/checkout', // method: POST
  getCartItems: process.env.NEXT_PUBLIC_API+'/cart/items', // method: GET
  saveCart: process.env.NEXT_PUBLIC_API+'/cart/save', // method: POST
  checkoutSession: process.env.NEXT_PUBLIC_API+'/stripe/create-session', // method: POST
  getOrders: process.env.NEXT_PUBLIC_API+'/orders', // method: GET
  updateOrderStatus: (id: string) =>  process.env.NEXT_PUBLIC_API+`/order/${id}`, // method: PUT
  createHomeSection: process.env.NEXT_PUBLIC_API+'/homeSection/create', // method: POST
  getHomeSections: process.env.NEXT_PUBLIC_API+'/homeSections', // method: GET
  updateHomeSection: (id: string) => process.env.NEXT_PUBLIC_API+`/homeSection/update/${id}`, // method: PUT
  deleteHomeSection: (id: string) => process.env.NEXT_PUBLIC_API+`/homeSection/delete/${id}`, // method: DELETE
  createPreference: `${process.env.NEXT_PUBLIC_API}/payment/create-preference`, // method: POST
}

export default apiEndPoints;