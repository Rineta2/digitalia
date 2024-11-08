"use client";
import React, { useState, useEffect } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import toast from "react-hot-toast";
import Image from "next/image";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

export default function Seting() {
  const [name, setName] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [oldPhotoURL, setOldPhotoURL] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setName(user.displayName || "");
      setProfilePicture(user.photoURL || null);
      setOldPhotoURL(user.photoURL || null);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!name || !profilePicture) {
      toast.error("Nama dan foto profil diperlukan.");
      return;
    }

    if (!(profilePicture instanceof File)) {
      toast.error("File foto profil tidak valid.");
      return;
    }

    if (profilePicture && oldPhotoURL) {
      const newPhotoURL = URL.createObjectURL(profilePicture);
      if (newPhotoURL === oldPhotoURL) {
        toast.error("Foto profil baru sama dengan yang sekarang.");
        return;
      }
    }

    if (user) {
      try {
        let photoURL = null;
        if (profilePicture) {
          const storage = getStorage();
          const storageRef = ref(storage, `usersPhoto/${user.uid}`);

          if (oldPhotoURL) {
            const oldPhotoRef = ref(storage, oldPhotoURL);
            await deleteObject(oldPhotoRef);
          }

          await uploadBytes(storageRef, profilePicture);
          photoURL = await getDownloadURL(storageRef);

          const db = getFirestore();
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            photoURL: photoURL,
          });
        }

        await updateProfile(user, {
          displayName: name,
          photoURL: photoURL,
        });
        toast.success("Profil berhasil diperbarui!");
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error(`Gagal memperbarui profil: ${error.message}`);
      }
    } else {
      toast.error("Tidak ada user yang masuk.");
    }
  };

  return (
    <section className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Pengaturan Profil</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Foto Profil */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
              {profilePicture && profilePicture instanceof File ? (
                <Image
                  src={URL.createObjectURL(profilePicture)}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : profilePicture ? (
                <Image
                  src={profilePicture}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            <input
              type="file"
              onChange={(e) => setProfilePicture(e.target.files[0])}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Tombol Simpan */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
