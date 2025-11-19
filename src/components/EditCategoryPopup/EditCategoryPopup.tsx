import { Category } from "../../lib/types";
import Image from 'next/image'
import { useAppDispatch } from "../../lib/hooks";
import { updateCategory } from "@/lib/features/categories/categoriesSlice";

export default function EditCategoryPopup({categories, category, setEditPopup}: {categories: Category[] | null, category: Category, setEditPopup: (value: boolean) => void}){
  const dispatch = useAppDispatch();
  function handleCategoryEdit(e: any) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      category: formData,
      token: localStorage.getItem('token'),
    };
    try {
      dispatch(updateCategory(data));
    } catch (error) {
      console.error(error);
    }
    setEditPopup(false);
    // setImagesToDelete([]);
  }

  return (
    <div className="update-category-popup">
      <form encType="multipart/form-data" onSubmit={handleCategoryEdit} >
        <input type="hidden" name="_id" value={category._id} />
        <input type="text" name="name" placeholder="Category Name" defaultValue={category.name}/>
        <Image
          src={`${process.env.NEXT_PUBLIC_IMAGES}${category.categoryImage}`}
          width={200}
          height={200}
          alt="Category Image"
        />
        <input type="file" accept="image/*" name='categoryImage' />
        <label htmlFor="parent">Parent Category</label>
        <select id="parent" name="parentId" defaultValue={category.parentId}>
          <option value="">None</option>
          { categories && categories.map((cat) => (
              (cat._id !== category._id) &&
              <option key={cat._id} value={cat._id} >{cat.name}</option>
          ))}
        </select>
        <button type="submit">Update</button>
      </form>
      <button onClick={() => setEditPopup(false)}>Cancel</button>
    </div>
  );
}