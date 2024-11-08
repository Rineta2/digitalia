"use client";

import React from "react";

import UserTable from "@/components/hooks/admin/user/user/UserTable";

import Pagination from "@/components/hooks/admin/user/user/Pagination";

import { useUsers } from "@/components/hooks/admin/user/user/utils/useUsers";

import "@/components/styling/Admin.scss";

export default function UserManager() {
  const {
    currentUsers,
    searchTerm,
    setSearchTerm,
    handleSuspend,
    handleDelete,
    pageCount,
    currentPage,
    handlePageClick,
  } = useUsers();

  return (
    <section className="user">
      <div className="user__container container">
        <div className="heading">
          <h1>User Manager</h1>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <UserTable
          users={currentUsers}
          onSuspend={handleSuspend}
          onDelete={handleDelete}
        />

        <Pagination
          pageCount={pageCount}
          currentPage={currentPage}
          onPageChange={handlePageClick}
        />
      </div>
    </section>
  );
}
