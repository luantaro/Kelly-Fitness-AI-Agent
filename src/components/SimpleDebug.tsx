"use client";

export default function SimpleDebug({ users }: { users: any[] }) {
  console.log("=== SIMPLE DEBUG RENDER ===", users?.length || 0, "users");

  // Log each user status
  users?.forEach((user, index) => {
    console.log(`User ${index + 1}:`, {
      email: user.email,
      status: user.status,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
    });
  });

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        background: "red",
        color: "white",
        padding: "20px",
        zIndex: 9999,
        fontSize: "14px",
        borderRadius: "8px",
        maxWidth: "300px",
        border: "3px solid yellow",
      }}
    >
      <h3>🚨 SIMPLE DEBUG</h3>
      <p>Total users: {users?.length || 0}</p>
      <p>
        Pending users:{" "}
        {users?.filter((u) => u.status === "pending_activation").length || 0}
      </p>
      {users?.slice(0, 3).map((user, i) => (
        <div key={i} style={{ marginBottom: "5px", fontSize: "12px" }}>
          <strong>{user.email}</strong>
          <br />
          Status: {user.status || "undefined"}
          <br />
          Admin: {user.isAdmin ? "yes" : "no"}
        </div>
      ))}
    </div>
  );
}
