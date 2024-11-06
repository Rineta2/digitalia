import React, { useState } from 'react'

import { navbar } from '@/components/data/Admin'

import Link from 'next/link'

export default function Navbar() {
    const [openSubmenu, setOpenSubmenu] = useState(null)

    const toggleSubmenu = (itemId) => {
        setOpenSubmenu(openSubmenu === itemId ? null : itemId)
    }

    return (
        <nav className='nav container'>
            <ul className='nav__list'>
                {navbar.map((item) => (
                    <li key={item.id} className='nav__item'>
                        {item.submenu ? (
                            <>
                                <div
                                    onClick={() => toggleSubmenu(item.id)}
                                    className='nav__link'
                                >
                                    <span className='nav__icon'>
                                        {item.icon}
                                    </span>

                                    <span className='nav__name'>
                                        {item.name}
                                    </span>
                                </div>

                                {openSubmenu === item.id && (
                                    <ul className='nav__submenu'>
                                        {item.submenu.map((subItem) => (
                                            <li key={subItem.id} className='nav__submenu-item'>
                                                <Link href={subItem.path}>
                                                    {subItem.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        ) : (
                            <Link href={item.path} className='nav__link'>
                                <span className='nav__icon'>
                                    {item.icon}
                                </span>

                                <span className='nav__name'>
                                    {item.name}
                                </span>
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    )
}
