import { useState, useEffect } from "react";
import { db } from "@/utils/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import toast from "react-hot-toast";

export function useTypes(selectedCategory, newType, setNewType) {
  const [types, setTypes] = useState([]);

  const fetchTypes = async () => {
    const typeCollection = collection(db, "types");
    const typeSnapshot = await getDocs(typeCollection);
    const typeList = typeSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTypes(typeList);
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const addType = async () => {
    if (!selectedCategory) {
      alert("Please select a category first.");
      return;
    }
    const typeCollection = collection(db, "types");
    await addDoc(typeCollection, { name: newType, category: selectedCategory });
    setNewType("");
    fetchTypes();
    toast.success("Type berhasil ditambahkan!");
  };

  const deleteType = async (typeId) => {
    const typeDoc = doc(db, "types", typeId);
    await deleteDoc(typeDoc);
    fetchTypes();
    toast.success("Type berhasil dihapus!");
  };

  return { types, fetchTypes, addType, deleteType };
}
