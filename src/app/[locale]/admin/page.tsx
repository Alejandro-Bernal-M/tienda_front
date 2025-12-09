'use client'
import Link from "next/link";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getAllProducts } from '@/lib/features/products/productsSlice';
import { getCategories } from '@/lib/features/categories/categoriesSlice';
import { getOrders } from "@/lib/features/orders/ordersSlice";

export default function AdminPage() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(getCategories());
    dispatch(getAllProducts());
    dispatch(getOrders({token: token }));
  }, []);

  return (
    <div className="adminContainer">
      <h1 className="adminTitle">Admin Page</h1>

      <div>
        <ul className="adminList">
          <li className="adminListItem">
            <Link href="/admin/products">Products</Link>
          </li>
          <li className="adminListItem">
            <Link href="/admin/categories">Categories</Link>
          </li>
          <li className="adminListItem">
            <Link href="/admin/orders">Orders</Link>
          </li>
          <li className="adminListItem">
            <Link href="/admin/home-sections">Home Sections</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};
