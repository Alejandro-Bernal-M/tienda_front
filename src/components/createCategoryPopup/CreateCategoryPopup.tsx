import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { createCategory } from '@/lib/features/categories/categoriesSlice';

export default function CreateCategoryPopup() {
  const dispatch = useAppDispatch();
  const {loading, error} = useAppSelector((state) => state.categories);
  const { token } = useAppSelector((state) => state.user);
  const { categories } = useAppSelector((state) => state.categories);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let formData = new FormData(e.currentTarget);
    dispatch(createCategory({category:formData, token}));
    e.currentTarget.reset();
  };

  return (
    <div>
      <form encType="multipart/form-data" onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input type="text" id="name" name="name" required />
        <label htmlFor='image'>Image</label>
        <input type="file" id='image' name='categoryImage' accept="image/*" required />
        {categories && categories.length > 0 && (
          <>
            <label htmlFor="parent">Parent Category</label>
            <select id="parent" name="parentId">
              <option value="">None</option>
              {categories.map((category: any) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </>
          )}
        <button type="submit">Create Category</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
    </div>
  );
}