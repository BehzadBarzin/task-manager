import React, { useState } from "react";
import { authClient } from "../api/api";
import type { authTypes } from "@task-manager/data";

// -------------------------------------------------------------------------------------------------
type User = authTypes.components["schemas"]["UserResponseDto"];

// -------------------------------------------------------------------------------------------------
interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
}

// -------------------------------------------------------------------------------------------------
const UserSearchModal: React.FC<UserSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
}) => {
  // -----------------------------------------------------------------------------------------------
  const [searchTerm, setSearchTerm] = useState("");
  // -----------------------------------------------------------------------------------------------
  const [users, setUsers] = useState<User[]>([]);
  // -----------------------------------------------------------------------------------------------
  const [isLoading, setIsLoading] = useState(false);
  // -----------------------------------------------------------------------------------------------
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      const { data } = await authClient.GET("/auth/search", {
        params: { query: { searchTerm } },
      });

      if (data) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------------------------------------------------------------------------
  const handleUserSelect = (user: User) => {
    onSelectUser(user);
    onClose();
  };
  // -----------------------------------------------------------------------------------------------
  if (!isOpen) return null;
  // -----------------------------------------------------------------------------------------------
  // -----------------------------------------------------------------------------------------------
  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Search Users</h3>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by email or name..."
            className="input input-bordered flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={isLoading || !searchTerm.trim()}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              "Search"
            )}
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {users.length > 0 ? (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 hover:bg-base-200 rounded-lg cursor-pointer"
                  onClick={() => handleUserSelect(user)}
                >
                  <div>
                    <div className="font-medium">
                      {user.displayName || user.email}
                    </div>
                    <div className="text-sm text-base-content/70">
                      {user.email}
                    </div>
                  </div>
                  <div className="text-xs font-mono text-base-content/50">
                    {user.id.substring(0, 8)}...
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm && !isLoading ? (
            <div className="text-center py-8 text-base-content/70">
              No users found
            </div>
          ) : null}
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
