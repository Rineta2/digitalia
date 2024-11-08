import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "@/utils/firebase";

export const fetchProducts = async (user) => {
  if (!user) throw new Error("User not authenticated");

  const querySnapshot = await getDocs(collection(db, "products"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const fetchCategories = async () => {
  const querySnapshot = await getDocs(collection(db, "categories"));
  return querySnapshot.docs.map((doc) => doc.data().name);
};

export const deleteProduct = async (id) => {
  const docRef = doc(db, "products", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const productData = docSnap.data();
    await deleteProductImages(productData);
    await deleteDoc(docRef);
  }
};

const deleteProductImages = async (productData) => {
  if (productData.imageUrl) {
    await deleteImageFromStorage(productData.imageUrl);
  }

  if (productData.additionalImageUrls?.length > 0) {
    await Promise.all(
      productData.additionalImageUrls.map((url) => deleteImageFromStorage(url))
    );
  }
};

const deleteImageFromStorage = async (imageUrl) => {
  try {
    const imagePath = decodeURIComponent(
      imageUrl.split("?")[0].split("/o/")[1]
    );
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
  } catch (error) {
    if (error.code !== "storage/object-not-found") {
      throw error;
    }
  }
};

export const addProductRating = async (productId, userId, rating, review) => {
  try {
    const ratingRef = collection(db, "products", productId, "ratings");
    await addDoc(ratingRef, {
      userId: userId,
      rating: rating,
      review: review,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};

export const getProductRatings = async (productId) => {
  try {
    const ratingRef = collection(db, "products", productId, "ratings");
    const querySnapshot = await getDocs(ratingRef);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      rating: Number(doc.data().rating),
    }));
  } catch (error) {
    console.error("Error getting ratings:", error);
    throw error;
  }
};
