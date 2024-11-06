import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { db } from "@/utils/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

export function useCategoryManager() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      const categoryCollection = collection(db, "categories");
      const categorySnapshot = await getDocs(categoryCollection);
      const categoryList = categorySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setCategories(categoryList);
    };

    fetchCategories();
  }, []);

  const addCategory = async () => {
    if (
      newCategory &&
      !categories.some((category) => category.name === newCategory)
    ) {
      try {
        const categoryCollection = collection(db, "categories");
        const docRef = await addDoc(categoryCollection, { name: newCategory });
        setCategories([...categories, { id: docRef.id, name: newCategory }]);
        setNewCategory("");
        toast.success("Category added successfully!");
      } catch (error) {
        console.error("Error adding category:", error);
        toast.error("Failed to add category. Please try again.");
      }
    } else {
      toast.error("Category name is required or already exists.");
    }
  };

  const deleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, "categories", id));
      setCategories(categories.filter((category) => category.id !== id));
      toast.success("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category. Please try again.");
    }
  };

  const editCategory = async (id, newName) => {
    try {
      const categoryDoc = doc(db, "categories", id);
      await updateDoc(categoryDoc, { name: newName });
      setCategories(
        categories.map((category) =>
          category.id === id ? { ...category, name: newName } : category
        )
      );
      toast.success("Category updated successfully!");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category. Please try again.");
    }
  };

  return {
    categories,
    newCategory,
    setNewCategory,
    addCategory,
    deleteCategory,
    editCategory, // Return the editCategory function
  };
}
