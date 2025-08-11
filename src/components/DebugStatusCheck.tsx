// Debug component to test status rendering
import React from "react";

("use client");

interface AdminUser {
  id: string;
  email: string;
  displayName?: string;
  isActive: boolean;
  isAdmin: boolean;
  status?: string;
  subscriptionStatus?: string;
  subscriptionEnd?: Date;
  subscription?: {
    status: string;
    endDate?: Date;
  };
  permissions?: {
    canAccessChat: boolean;
  };
}

interface DebugStatusCheckProps {
  users: AdminUser[];
}

const DebugStatusCheck: React.FC<DebugStatusCheckProps> = ({ users }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "white",
        border: "2px solid red",
        padding: "10px",
        zIndex: 9999,
        maxWidth: "400px",
        fontSize: "12px",
      }}
    >
      <h3>🔍 DEBUG STATUS CHECK</h3>
      {users?.slice(0, 5).map((user, index) => (
        <div
          key={index}
          style={{
            marginBottom: "10px",
            borderBottom: "1px solid #ccc",
            paddingBottom: "5px",
          }}
        >
          <strong>Email:</strong> {user.email}
          <br />
          <strong>Status:</strong> <code>{user.status || "undefined"}</code>
          <br />
          <strong>IsAdmin:</strong>{" "}
          <code>{user.isAdmin ? "true" : "false"}</code>
          <br />
          <strong>IsActive:</strong>{" "}
          <code>{user.isActive ? "true" : "false"}</code>
          <br />
          <strong>Subscription:</strong>{" "}
          <code>{JSON.stringify(user.subscription) || "undefined"}</code>
          <br />
          {/* Render status badge logic */}
          <strong>Should Show Badge:</strong>{" "}
          <code>
            {(() => {
              if (user.isAdmin) return "Admin";
              if (!user.isActive) return "Tạm khóa";
              if (user.status === "trial") return "Dùng thử";
              if (user.status === "pending_activation") return "Chờ kích hoạt";
              return "Hoạt động";
            })()}
          </code>
          <br />
          {/* Check activate button */}
          <strong>Show Activate:</strong>{" "}
          <code>
            {!user.isAdmin &&
            (user.status === "trial" || user.status === "pending_activation")
              ? "YES"
              : "NO"}
          </code>
        </div>
      ))}
    </div>
  );
};

export default DebugStatusCheck;
