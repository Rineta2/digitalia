import {
  collection,
  getDocs,
  deleteDoc,
  getDoc,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  doc,
} from "firebase/firestore";

import { deleteObject, ref } from "firebase/storage";

import { db, storage } from "@/utils/firebase";

export const fetchProducts = async (user) => {
  if (!user) throw new Error("User not authenticated");

  const querySnapshot = await getDocs(
    collection(db, process.env.NEXT_PUBLIC_API_PRODUCT)
  );
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const fetchCategories = async () => {
  const querySnapshot = await getDocs(
    collection(db, process.env.NEXT_PUBLIC_API_CATEGORY)
  );
  return querySnapshot.docs.map((doc) => doc.data().name);
};

export const deleteProduct = async (id) => {
  const docRef = doc(db, process.env.NEXT_PUBLIC_API_PRODUCT, id);
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
    const ratingRef = collection(db, process.env.NEXT_PUBLIC_API_RATING);

    // Get user data
    const userDocRef = doc(db, process.env.NEXT_PUBLIC_API_USER, userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      throw new Error("User data not found");
    }

    const userData = userDocSnap.data();

    // Check existing rating
    const existingRatingQuery = query(
      ratingRef,
      where("productId", "==", productId),
      where("userId", "==", userId)
    );
    const existingRatingDocs = await getDocs(existingRatingQuery);

    if (!existingRatingDocs.empty) {
      throw new Error("Anda sudah memberikan rating untuk produk ini");
    }

    // Add new rating with user data
    const ratingData = {
      productId,
      userId,
      rating,
      review,
      createdAt: serverTimestamp(),
      userInfo: {
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        photoURL: userData.photoURL || null,
      },
    };

    await addDoc(ratingRef, ratingData);
  } catch (error) {
    console.error("Error adding rating:", error);
    throw error;
  }
};

export const getProductRatings = async (productId) => {
  try {
    const ratingRef = collection(db, process.env.NEXT_PUBLIC_API_RATING);
    const q = query(
      ratingRef,
      where("productId", "==", productId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const ratings = [];

    for (const docSnapshot of querySnapshot.docs) {
      const ratingData = docSnapshot.data();

      // Handle the date conversion safely
      const createdAt = ratingData.createdAt
        ? new Date(ratingData.createdAt.seconds * 1000)
        : new Date();

      // Fetch user data if needed
      if (!ratingData.userInfo || !ratingData.userInfo.photoURL) {
        try {
          const userDocRef = doc(
            db,
            process.env.NEXT_PUBLIC_API_USER,
            ratingData.userId
          );
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            ratingData.userInfo = {
              firstName: userData?.firstName || "",
              lastName: userData?.lastName || "",
              photoURL: userData?.photoURL || null,
            };
          }
        } catch (userError) {
          console.error("Error fetching user data:", userError);
          ratingData.userInfo = {
            firstName: "",
            lastName: "",
            photoURL: null,
          };
        }
      }

      ratings.push({
        id: docSnapshot.id,
        ...ratingData,
        createdAt, // Use the converted date
      });
    }

    return ratings;
  } catch (error) {
    console.error("Error getting ratings:", error);
    throw error;
  }
};
