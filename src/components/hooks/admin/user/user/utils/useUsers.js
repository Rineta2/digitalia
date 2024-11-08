import { useState, useEffect } from "react";
import { db } from "@/utils/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const usersPerPage = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const snapshot = await getDocs(usersCollection);
        const usersData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => user.role !== "admin");
        setUsers(usersData);
      } catch (error) {
        toast.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleSuspend = async (userId, currentStatus) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        suspended: !currentStatus,
      });
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, suspended: !currentStatus } : user
        )
      );
    } catch (error) {
      toast.error("Error updating user suspension status:", error);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      try {
        const userRef = doc(db, "users", userId);
        await deleteDoc(userRef);
        setUsers(users.filter((user) => user.id !== userId));
      } catch (error) {
        toast.error("Error deleting user:", error);
      }
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.firstName + " " + user.lastName)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.ceil(filteredUsers.length / usersPerPage);
  const offset = currentPage * usersPerPage;
  const currentUsers = filteredUsers.slice(offset, offset + usersPerPage);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  return {
    currentUsers,
    searchTerm,
    setSearchTerm,
    handleSuspend,
    handleDelete,
    pageCount,
    currentPage,
    handlePageClick,
  };
}
