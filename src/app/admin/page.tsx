"use client";

import RefactoredUserManagement from "@/components/admin/RefactoredUserManagement";

/**
 * The main entry point for the admin section.
 * Uses the new refactored admin dashboard with clean architecture.
 * The parent layout (`/admin/layout.tsx`) handles authentication and authorization.
 */
export default function AdminPage() {
  return <RefactoredUserManagement />;
}
