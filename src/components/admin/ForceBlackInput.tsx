import React from "react";

interface ForceBlackInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const ForceBlackInput: React.FC<ForceBlackInputProps> = ({
  label,
  className = "",
  style = {},
  ...props
}) => {
  const inputStyle = {
    color: "#000000",
    backgroundColor: "#ffffff",
    fontWeight: "bold",
    fontSize: "16px",
    WebkitTextFillColor: "#000000",
    textShadow: "none",
    border: "2px solid #d1d5db",
    borderRadius: "0.5rem",
    padding: "0.5rem 1rem",
    width: "100%",
    outline: "none",
    transition: "all 0.2s",
    ...style,
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${className}`}
        style={inputStyle}
      />
    </div>
  );
};

export default ForceBlackInput;
