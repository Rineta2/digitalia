import React from "react";

export default function UserTable({ users, onSuspend, onDelete }) {
  return (
    <table className="user__table">
      <thead>
        <tr>
          <th>Photo</th>
          <th>Name</th>
          <th>Email</th>
          <th>Telepon</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>
              <div className="user__photo">
                <img
                  src={user.photoURL || "/default-avatar.png"}
                  alt={user.name ? `${user.name}'s photo` : "User photo"}
                  className="user__avatar"
                />
              </div>
            </td>
            <td>
              {user.firstName} {user.lastName}
            </td>
            <td>{user.email}</td>
            <td>{user.phoneNumber}</td>
            <td>{user.suspended ? "Suspended" : "Active"}</td>
            <td>
              <button
                onClick={() => onSuspend(user.id, user.suspended)}
                className={user.suspended ? "unsuspend-btn" : "suspend-btn"}
              >
                {user.suspended ? "Unsuspend" : "Suspend"}
              </button>
              <button onClick={() => onDelete(user.id)} className="delete-btn">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
