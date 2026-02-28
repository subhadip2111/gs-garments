import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setCategoriesList, setCategoriesLoading, setCategoriesError } from '@/store/categorySlice';
import { setSubCategoriesList, setSubCategoriesLoading, setSubCategoriesError } from '@/store/subcategorySlice';
import { getAllcategoryList } from '@/api/auth/categoryApi';
import { getAllSubCategories } from '@/api/auth/subcategory.Api';

/**
 * Fetches categories and subcategories into Redux on mount.
 * Safe to call from multiple components — skips fetch if data already loaded.
 */
export const useCategoryData = () => {
    const dispatch = useAppDispatch();
    const { categories, isLoading: catLoading, error: catError } = useAppSelector(s => s.category);
    const { subcategories, isLoading: subLoading, error: subError } = useAppSelector(s => s.subcategory);

    useEffect(() => {
        // Skip if already loaded
        if (categories.length > 0) return;

        const fetchCategories = async () => {
            dispatch(setCategoriesLoading(true));
            try {
                const data = await getAllcategoryList();
                const list = data.results || data;
                dispatch(setCategoriesList(list));
            } catch (err: any) {
                dispatch(setCategoriesError(err?.response?.data?.message || 'Failed to load categories'));
            }
        };
        fetchCategories();
    }, [dispatch, categories.length]);

    useEffect(() => {
        // Skip if already loaded
        if (subcategories.length > 0) return;

        const fetchSubCategories = async () => {
            dispatch(setSubCategoriesLoading(true));
            try {
                const data = await getAllSubCategories(1, 100); // fetch all subcategories
                const list = data.results || data;
                dispatch(setSubCategoriesList(list));
            } catch (err: any) {
                dispatch(setSubCategoriesError(err?.response?.data?.message || 'Failed to load subcategories'));
            }
        };
        fetchSubCategories();
    }, [dispatch, subcategories.length]);

    // Helper: get subcategories for a given category id
    const getSubcategoriesForCategory = (categoryId: string) =>
        subcategories.filter(s => {
            const sCat = typeof s.category === 'object' ? (s.category?._id || (s.category as any)?.id) : s.category;
            return sCat === categoryId;
        });

    // Helper: get category name by id
    const getCategoryName = (id: string) => {
        const cat = categories.find(c => (c.id || c._id) === id);
        return cat?.name || id;
    };

    // Helper: get subcategory name by id
    const getSubcategoryName = (id: string) => {
        const sub = subcategories.find(s => (s.id || s._id) === id);
        return sub?.name || id;
    };

    return {
        categories,
        subcategories,
        isLoading: catLoading || subLoading,
        error: catError || subError,
        getSubcategoriesForCategory,
        getCategoryName,
        getSubcategoryName,
    };
};
