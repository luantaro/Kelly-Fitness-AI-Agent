"use client";

import { useState } from "react";
import AuthForm from "@/components/AuthForm";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
  };

  return <AuthForm mode={mode} onToggleMode={toggleMode} />;
}
