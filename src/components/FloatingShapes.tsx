"use client";

import React from "react";

const FloatingShapes: React.FC = () => {
  const shapes = [
    // Circles
    { type: "circle", size: "w-12 h-12", color: "bg-pastel-lavender/20" },
    { type: "circle", size: "w-8 h-8", color: "bg-pastel-sky/20" },
    { type: "circle", size: "w-16 h-16", color: "bg-pastel-mint/20" },
    { type: "circle", size: "w-6 h-6", color: "bg-pastel-rose/20" },

    // Squares
    { type: "square", size: "w-10 h-10", color: "bg-pastel-cream/20" },
    { type: "square", size: "w-14 h-14", color: "bg-pastel-lavender/15" },

    // Triangles (using border trick)
    { type: "triangle", size: "w-0 h-0", color: "border-pastel-sky/20" },
    { type: "triangle", size: "w-0 h-0", color: "border-pastel-mint/20" },
  ];

  return (
    <div className="floating-shapes">
      {shapes.map((shape, index) => (
        <div
          key={index}
          className={`floating-shape ${
            shape.type === "circle"
              ? `${shape.size} ${shape.color} rounded-full`
              : shape.type === "square"
              ? `${shape.size} ${shape.color} rotate-45`
              : shape.type === "triangle"
              ? `border-l-[10px] border-r-[10px] border-b-[15px] border-l-transparent border-r-transparent ${shape.color.replace(
                  "bg-",
                  "border-b-"
                )}`
              : ""
          }`}
        />
      ))}

      {/* Additional decorative elements */}
      <div
        className="floating-shape w-20 h-20 bg-gradient-to-r from-pastel-lavender/10 to-pastel-sky/10 rounded-full blur-xl"
        style={{ left: "15%", animationDelay: "3s", animationDuration: "35s" }}
      />
      <div
        className="floating-shape w-32 h-32 bg-gradient-to-r from-pastel-mint/10 to-pastel-rose/10 rounded-full blur-2xl"
        style={{ left: "65%", animationDelay: "7s", animationDuration: "40s" }}
      />
      <div
        className="floating-shape w-16 h-16 bg-gradient-to-r from-pastel-cream/10 to-pastel-lavender/10 rounded-full blur-lg"
        style={{ left: "85%", animationDelay: "12s", animationDuration: "28s" }}
      />
    </div>
  );
};

export default FloatingShapes;
