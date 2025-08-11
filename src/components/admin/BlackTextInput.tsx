import React from "react";

interface BlackTextInputProps {
  type?: "text" | "number" | "email";
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  className?: string;
}

const BlackTextInput: React.FC<BlackTextInputProps> = ({
  type = "text",
  value,
  onChange,
  placeholder,
  min,
  max,
  className = "",
}) => {
  const baseStyle = {
    color: "#000000",
    backgroundColor: "#ffffff",
    fontWeight: "700",
    WebkitTextFillColor: "#000000",
    fontSize: "16px",
    border: "2px solid #6b7280",
    outline: "none",
    textShadow: "none",
  };

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${className}`}
      style={baseStyle}
    />
  );
};

export default BlackTextInput;
