'use client'
import { useAppDispatch } from "@/lib/hooks";
import { useAppSelector } from "@/lib/hooks";
import { getAllProducts } from '@/lib/features/products/productsSlice';
import { getCategories } from '@/lib/features/categories/categoriesSlice';
import  styles  from './products.module.css';
import { useEffect, useState } from "react";
import type { ProductType } from '@/lib/types';
import  Product  from '@/components/product/Product'

export default function Products() {
  const dispatch = useAppDispatch();
  const { products, error } = useAppSelector((state) => state.products);
  const { categories } = useAppSelector((state) => state.categories);
  const [selectedProducts, setSelectedProducts] = useState<ProductType[]>([]);
  const [ loadingProducts, setLoadingProducts ] = useState(false);
  const [categoryTittle, setCategoryTittle] = useState('' as string);
  const [ productsProccessed, setProductsProccessed ] = useState(false);

  const handleSelect = (id: any, name: string, all: boolean, element: HTMLLIElement ) => {
    setLoadingProducts(true);
    if (all) {
      setSelectedProducts(products);
      setCategoryTittle('All our');
    }else {
      let filteredProducts = products.filter((product) => product.category._id === id);
      setSelectedProducts(filteredProducts);
      setCategoryTittle(name);
    }
    setLoadingProducts(false);
    setProductsProccessed(true);
    element.classList.add('active');
    let allElements = document.querySelectorAll('.cat_li');
    allElements.forEach((li) => {
      if (li !== element) {
        li.classList.remove('active');
      }
    });
  }

  function displaySubCategories(event: React.MouseEvent<HTMLLIElement>) {
    const element = event.currentTarget as HTMLLIElement;
    const subCategories = element.nextElementSibling as HTMLUListElement;
    const top = element.getBoundingClientRect().top;
    const left = element.getBoundingClientRect().left;
    if (subCategories) {
      subCategories.classList.toggle('visible');
      subCategories.style.top = `${top + 20}px`;
      subCategories.style.left = `${left -15 }px`;
    }

  }

  useEffect(() => {
    dispatch(getCategories());
    dispatch(getAllProducts());
    let firstCategoryButton = document.querySelector('.cat_li') as HTMLLIElement;
    if (firstCategoryButton) {
      firstCategoryButton.click();
    }
  }, []);

  return (
    <div className={styles.section} >
      <div className={styles.categories_section}>
        <h1 className={styles.page_title} > Our products</h1>
        { categories.length > 0 && (
          <ul className={styles.cat_ul}>
            <li className="cat_li" onClick={(event: React.MouseEvent<HTMLLIElement>) => {handleSelect(0, '', true, event.currentTarget)}} >All products</li>
            {categories.map((category) => (
              <>
              <li className="cat_li" key={category._id} onClick={(event) => {handleSelect(category._id, category.name, false, event.currentTarget as HTMLLIElement)}} onMouseEnter={displaySubCategories} onMouseLeave={displaySubCategories}>{category.name} </li>
              {category.children && category.children.length > 0 && (
                <ul className="cat_li_sub">
                  {category.children.map((child) => (
                    <li key={child._id} className="cat_li cat_li_sub_li" onClick={(event: React.MouseEvent<HTMLLIElement>) => {handleSelect(child._id, child.name, false, event.currentTarget as HTMLLIElement)}}>{child.name}</li>
                  ))}
                </ul>
              )
              }
              </>
            ))}
          </ul>
        )}
      </div>
      <h2 className={styles.subtitle} >{categoryTittle != '' ? categoryTittle : "All our" } products</h2>
      {loadingProducts && <p>Loading...</p>}
      {error && <p> We had an error loading our products, please try again</p>}
      <div className={styles.products_section}>
        {selectedProducts.length > 0 ? selectedProducts.map((product) => (
          <Product key={product._id} {...product} />
        ))
        :
        ((products.length > 0 && !loadingProducts && !productsProccessed ) && products.map((product) => (
          <Product key={product._id} {...product} />
        )))
      }
      </div>
      {selectedProducts.length === 0 && !loadingProducts && productsProccessed &&<p>No products found</p>}
    </div>
  );
}