"use client";
import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import toast from 'react-hot-toast';

import Image from 'next/image';

export default function Settings() {
    const [name, setName] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [oldPhotoURL, setOldPhotoURL] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            setName(user.displayName || '');
            setProfilePicture(user.photoURL || null);
            setOldPhotoURL(user.photoURL || null);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        const user = auth.currentUser;

        if (!name || !profilePicture) {
            toast.error('Name and profile picture are required.');
            return;
        }

        if (!(profilePicture instanceof File)) {
            toast.error('Invalid profile picture file.');
            return;
        }

        if (profilePicture && oldPhotoURL) {
            const newPhotoURL = URL.createObjectURL(profilePicture);
            if (newPhotoURL === oldPhotoURL) {
                toast.error('The new profile picture is the same as the current one.');
                return;
            }
        }

        if (user) {
            try {
                let photoURL = null;
                if (profilePicture) {
                    const storage = getStorage();
                    const storageRef = ref(storage, `profilePictures/${user.uid}`);

                    if (oldPhotoURL) {
                        const oldPhotoRef = ref(storage, oldPhotoURL);
                        await deleteObject(oldPhotoRef);
                    }

                    await uploadBytes(storageRef, profilePicture);
                    photoURL = await getDownloadURL(storageRef);
                }

                await updateProfile(user, {
                    displayName: name,
                    photoURL: photoURL
                });
                toast.success('Profile updated successfully!');
            } catch (error) {
                console.error('Error updating profile:', error);
                toast.error(`Failed to update profile: ${error.message}`);
            }
        } else {
            toast.error('No user is signed in.');
        }
    };

    return (
        <section>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div>
                    <label>Profile Picture:</label>
                    <input
                        type="file"
                        onChange={(e) => setProfilePicture(e.target.files[0])}
                    />
                    {profilePicture && profilePicture instanceof File && (
                        <Image
                            src={URL.createObjectURL(profilePicture)}
                            alt="Profile"
                            width={100}
                            height={100}
                        />
                    )}
                </div>
                <button type="submit">Update Profile</button>
            </form>
        </section>
    );
}
