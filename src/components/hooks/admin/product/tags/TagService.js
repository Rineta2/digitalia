import { db } from "@/utils/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import toast from "react-hot-toast";

export const fetchTags = async (setTags) => {
  try {
    const tagsCollection = collection(db, "tags");
    const tagsSnapshot = await getDocs(tagsCollection);
    const tagsList = tagsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTags(tagsList);
  } catch (error) {
    toast.error("Gagal mengambil data tag.");
  }
};

export const addTag = async (newTag, setNewTag, setTags) => {
  try {
    const tagsCollection = collection(db, "tags");
    await addDoc(tagsCollection, { name: newTag });
    setNewTag("");
    fetchTags(setTags);
    toast.success("Tag berhasil ditambahkan!");
  } catch (error) {
    toast.error("Gagal menambahkan tag.");
  }
};

export const updateTag = async (id, newName, setTags) => {
  try {
    const tagDoc = doc(db, "tags", id);
    await updateDoc(tagDoc, { name: newName });
    fetchTags(setTags);
    toast.success("Tag berhasil diperbarui!");
  } catch (error) {
    toast.error("Gagal memperbarui tag.");
  }
};

export const deleteTag = async (id, setTags) => {
  try {
    const tagDoc = doc(db, "tags", id);
    await deleteDoc(tagDoc);
    fetchTags(setTags);
    toast.success("Tag berhasil dihapus!");
  } catch (error) {
    toast.error("Gagal menghapus tag.");
  }
};
