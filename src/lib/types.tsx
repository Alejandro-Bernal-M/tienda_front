interface Product {
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: {name: string, _id: string};
  offer?: number;
  sizes?: string[];
  colors?: string[];
  slug?: string;
  productImages?: {img: string, _id: string}[];
  createdAt?: string;
  createdBy?: {firstName: string, lastName: string, _id: string, fullName: string};
  _id?: string;
}

interface Category {
  name: string;
  categoryImage: string
  parentId?: string;
  slug?: string;
  _id?: string;
  children: Category[];
}

interface ProductCart {
  _id: string;
  quantity: number;
  price: number;
  offer?: number;
  size: string;
  color: string;
  name?: string;
  description?: string;
  category?: {name: string, _id: string};
  slug?: string;
  productImages?: {img: string, _id: string}[];
  product?: string;
}

interface CartState {
  items: ProductCart [];
  totalProducts: number,
  totalPrices: number,
  showCart: boolean,
}

interface RemoveItem {
  _id: string;
  quantity: number;
}

type orderProduct = {
  product: string;
  quantity: number;
}

interface Order {
  _id: string;
  user?: string;
  address: {
    city: string;
    country: string;
    line1: string;
    line2?: string;
    postal_code: string;
    state: string;
  };
  email: string;
  name: string;
  totalAmount: number;
  products: orderProduct[];
  paymentStatus: string;
  paymentType: string;
  orderStatus: ['Order Placed', 'Order Accepted', 'Order Processing', 'Order Shipped', 'Order Delivered', 'Order Cancelled'];
  paymentInfo: {
    id: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface HomeSection {
  _id: string;
  title?: string;
  paragraphs?: string[];
  image?: string;
  order?: number;
}



export type { Product as ProductType, Category, CartState, ProductCart, RemoveItem, Order, HomeSection };