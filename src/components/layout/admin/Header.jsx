"use client";

import React, { useState } from 'react'

import { getAuth, signOut } from 'firebase/auth'

import { LogOut, User } from "lucide-react";

import Image from "next/image";

import { useRouter } from 'next/navigation';

import { useAuth } from '@/utils/auth/context/AuthContext'

import { Search } from 'lucide-react';

import "@/components/styling/Admin.scss"

export default function Header() {
    const { user } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const auth = getAuth();
            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <header className='header'>
            <div className="header__container container">
                <div className="header__content">
                    <div className="profile">
                        {user?.photoURL ? (
                            <Image
                                src={user.photoURL}
                                alt="Profile"
                                width={user?.photoURL ? 500 : 40}
                                height={user?.photoURL ? 500 : 40}
                                className="profile-image"
                                style={{ borderRadius: "50%" }}
                            />
                        ) : (
                            <User size={40} />
                        )}

                        <div className="text">
                            <span className='name'>{user?.displayName || user?.email || 'Admin'}</span>
                            <span className='role'>Administrator</span>
                        </div>
                    </div>

                    <div className="search">
                        <Search size={30} />
                        <input type="text" placeholder='Search...' />
                    </div>

                    <div className="logout" onClick={handleLogout}>
                        <LogOut size={24} />
                        <span>Logout</span>
                    </div>
                </div>
            </div>
        </header>
    )
}
