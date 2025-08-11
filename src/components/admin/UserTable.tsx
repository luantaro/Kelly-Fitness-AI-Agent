"use client";

import { useState } from "react";
import { AdminUser } from "@/types/admin";
import UserRow from "./UserRow";
import LoadingSpinner from "./LoadingSpinner";
import Pagination from "./Pagination";

export interface UserTableProps {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  onView: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
  onEditProfile: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onToggleStatus: (user: AdminUser) => void;
  onManageSubscription: (user: AdminUser) => void;
  onActivateUser: (user: AdminUser) => void;
  itemsPerPage?: number;
}

export default function UserTable({
  users,
  loading,
  error,
  onView,
  onEdit,
  onEditProfile,
  onDelete,
  onToggleStatus,
  onManageSubscription,
  onActivateUser,
  itemsPerPage = 10,
}: UserTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (loading) {
    return <LoadingSpinner message="Đang tải danh sách người dùng..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Lỗi: {error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">Không có người dùng nào</p>
      </div>
    );
  }

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200/50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số chat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <UserRow
                  key={`${user.id}-${user.status}-${user.isActive}`}
                  user={user}
                  onView={onView}
                  onEdit={onEdit}
                  onEditProfile={onEditProfile}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                  onManageSubscription={onManageSubscription}
                  onActivateUser={onActivateUser}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={users.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
