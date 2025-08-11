import { useState, useCallback } from "react";
import { AdminUser } from "@/types/admin";

export type ModalType =
  | "view"
  | "edit"
  | "profile"
  | "delete"
  | "subscription"
  | "activate";

export interface UseAdminModalsReturn {
  activeModal: ModalType | null;
  selectedUser: AdminUser | null;
  openModal: (type: ModalType, user: AdminUser) => void;
  closeModal: () => void;
  isOpen: (type: ModalType) => boolean;
}

export function useAdminModals(): UseAdminModalsReturn {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const openModal = useCallback((type: ModalType, user: AdminUser) => {
    setActiveModal(type);
    setSelectedUser(user);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setSelectedUser(null);
  }, []);

  const isOpen = useCallback(
    (type: ModalType) => {
      return activeModal === type;
    },
    [activeModal]
  );

  return {
    activeModal,
    selectedUser,
    openModal,
    closeModal,
    isOpen,
  };
}
