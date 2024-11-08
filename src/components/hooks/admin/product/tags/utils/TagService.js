import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/utils/firebase";
import toast from "react-hot-toast";

export const fetchTags = async (setTags) => {
  try {
    const querySnapshot = await getDocs(
      collection(db, process.env.NEXT_PUBLIC_API_TAG)
    );
    const tagsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTags(tagsList);
  } catch (error) {
    console.error("Error fetching tags:", error);
    toast.error("Failed to fetch tags");
  }
};

export const addTag = async (name, category, setNewTag, setTags) => {
  try {
    // Tambahkan loading toast
    const loadingToast = toast.loading("Adding tag...");

    // Log untuk debugging
    console.log("Adding tag with data:", { name, category });

    // Validasi input
    if (!name || !category) {
      toast.dismiss(loadingToast);
      toast.error("Name and category are required");
      return;
    }

    // Tambahkan tag ke Firestore
    const docRef = await addDoc(
      collection(db, process.env.NEXT_PUBLIC_API_TAG),
      {
        name: name.trim(),
        category: category.trim(),
        createdAt: new Date().toISOString(),
      }
    );

    // Log success
    console.log("Tag added with ID:", docRef.id);

    // Reset form dan refresh data
    setNewTag("");
    await fetchTags(setTags);

    // Success toast
    toast.dismiss(loadingToast);
    toast.success("Tag added successfully");
  } catch (error) {
    console.error("Error adding tag:", error);
    toast.error(`Failed to add tag: ${error.message}`);
  }
};

export const updateTag = async (id, name, category, setTags) => {
  try {
    const loadingToast = toast.loading("Updating tag...");

    const tagRef = doc(db, process.env.NEXT_PUBLIC_API_TAG, id);
    await updateDoc(tagRef, {
      name: name.trim(),
      category: category.trim(),
      updatedAt: new Date().toISOString(),
    });

    await fetchTags(setTags);

    toast.dismiss(loadingToast);
    toast.success("Tag updated successfully");
  } catch (error) {
    console.error("Error updating tag:", error);
    toast.error(`Failed to update tag: ${error.message}`);
  }
};

export const deleteTag = async (id, setTags) => {
  try {
    const loadingToast = toast.loading("Deleting tag...");

    await deleteDoc(doc(db, process.env.NEXT_PUBLIC_API_TAG, id));
    await fetchTags(setTags);

    toast.dismiss(loadingToast);
    toast.success("Tag deleted successfully");
  } catch (error) {
    console.error("Error deleting tag:", error);
    toast.error(`Failed to delete tag: ${error.message}`);
  }
};
