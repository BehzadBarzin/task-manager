import React, { useState } from "react";
import UserSearchModal from "./UserSearchModal";
import type { authTypes } from "@task-manager/data";

// -------------------------------------------------------------------------------------------------
type User = authTypes.components["schemas"]["UserResponseDto"];

// -------------------------------------------------------------------------------------------------
interface UserSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// -------------------------------------------------------------------------------------------------
const UserSearchInput: React.FC<UserSearchInputProps> = ({
  value,
  onChange,
  placeholder = "User ID",
  className = "",
}) => {
  // -----------------------------------------------------------------------------------------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  // -----------------------------------------------------------------------------------------------
  const handleSelectUser = (user: User) => {
    onChange(user.id);
  };

  // -----------------------------------------------------------------------------------------------
  // -----------------------------------------------------------------------------------------------
  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`input input-bordered w-full ${className}`}
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setIsModalOpen(true)}
          title="Search users"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="w-5 h-5"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>

      <UserSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectUser={handleSelectUser}
      />
    </div>
  );
};

export default UserSearchInput;
