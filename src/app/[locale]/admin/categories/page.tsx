'use client'
import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import CreateCategoryPopup from '@/components/createCategoryPopup/CreateCategoryPopup';
import EditCategoryPopup from '@/components/EditCategoryPopup/EditCategoryPopup';
import { Category } from '@/lib/types';
import { deleteCategory } from '@/lib/features/categories/categoriesSlice';

export default function AdminProducts() {
  const dispatch = useAppDispatch();
  const {categories, loading, error} = useAppSelector((state) => state.categories);
  const [displayCategoryPopup, setDisplayCategoryPopup] = useState(false);
  const [categoryForEdit, setCategoryForEdit] = useState({} as Category);
  const [editCategoryPopup, setEditCategoryPopup] = useState(false);
  const [categoriesForEdit, setCategoriesForEdit] = useState<null | Category[]>(null);

  function handleEdit(category: Category) {
    if (category) {
      setCategoryForEdit(category);
      if (categories.length > 0) {
        setCategoriesForEdit(categories);
      }
      setEditCategoryPopup(true);
    } else {
      console.error('Invalid category:', category);
    }
  }

  function handleDelete(category: Category) {
    const data = {
      _id: category._id,
      token: localStorage.getItem('token'),
    };
    try {
      dispatch(deleteCategory(data));
    } catch (error) {
      console.error(error);
    }
  }


  return (
    <div>
      <h1>Admin Categories</h1>
      <button onClick={() => setDisplayCategoryPopup(!displayCategoryPopup)}>Create Category</button>
      {displayCategoryPopup && <CreateCategoryPopup />}
      {editCategoryPopup && <EditCategoryPopup categories={categoriesForEdit} category={categoryForEdit} setEditPopup={setEditCategoryPopup} />}
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {categories && categories.length > 0 && categories.map((category) => (
        <>
          <div key={category._id}>
            <h2>{category.name}</h2>
            {category.parentId && <p>parent: {categories.find(cat => cat._id == category.parentId)?.name}</p>}
            <img src={`${process.env.NEXT_PUBLIC_IMAGES}${category.categoryImage}` } alt={category.name} height={50} width={50}/>
            <button onClick={() => {handleEdit(category)}}>Edit</button>
            <button onClick={() => {handleDelete(category)}}>Delete</button>
          </div>
          {category.children && category.children.length > 0 && 
            <p>Children categories</p> }
          {category.children && category.children.length > 0 && category.children.map((child) => (
            <div key={child._id + 'child'}>
              <h3>{child.name}</h3>
              <p>parent: {category.name}</p>
              <img src={`${process.env.NEXT_PUBLIC_IMAGES}${child.categoryImage}` } alt={child.name} height={50} width={50}/>
              <button onClick={() => {handleEdit(child)}}>Edit</button>
              <button onClick={() => {handleDelete(child)}}>Delete</button>
            </div>
          ))}
        </>
        ))
      }
    </div>
  );
}