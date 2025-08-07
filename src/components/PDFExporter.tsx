"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import {
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

interface PDFExporterProps {
  nutritionContent: string;
  fileName?: string;
  className?: string;
}

interface MealPlan {
  [day: number]: {
    morning?: string[];
    lunch?: string[];
    dinner?: string[];
    snack?: string[];
  };
}

const PDFExporter: React.FC<PDFExporterProps> = ({
  nutritionContent,
  fileName = "thuc-don-dinh-duong-7-ngay",
  className = "",
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");

  // Enhanced content parsing for better meal plan extraction
  const parseMealPlan = (content: string): MealPlan => {
    const mealPlan: MealPlan = {};
    const lines = content.split("\n");
    let currentDay = 0;
    let currentMeal = "";

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (
        !trimmedLine ||
        trimmedLine.startsWith("##") ||
        trimmedLine.startsWith("*") ||
        trimmedLine.startsWith("---") ||
        trimmedLine.startsWith(">")
      )
        return;

      // Enhanced day detection - support new format
      const dayMatch = trimmedLine.match(
        /(?:###\s*📅\s*)?(?:NGÀY|Ngày)\s*(\d+)/i
      );
      if (dayMatch) {
        currentDay = parseInt(dayMatch[1]);
        if (!mealPlan[currentDay]) mealPlan[currentDay] = {};
        return;
      }

      // Enhanced meal detection with emoji and text
      if (
        trimmedLine.includes("🌅") ||
        trimmedLine.toLowerCase().includes("sáng")
      ) {
        currentMeal = "morning";
      } else if (
        trimmedLine.includes("🌞") ||
        trimmedLine.toLowerCase().includes("trưa")
      ) {
        currentMeal = "lunch";
      } else if (
        trimmedLine.includes("🌙") ||
        trimmedLine.toLowerCase().includes("tối")
      ) {
        currentMeal = "dinner";
      } else if (
        trimmedLine.toLowerCase().includes("snack") ||
        trimmedLine.toLowerCase().includes("phụ") ||
        trimmedLine.includes("🍎")
      ) {
        currentMeal = "snack";
      }

      // Add meal content - improved filtering for new compact format
      if (currentDay > 0 && currentMeal && trimmedLine.length > 5) {
        // Initialize meal array if doesn't exist
        if (!mealPlan[currentDay][currentMeal as keyof (typeof mealPlan)[1]]) {
          mealPlan[currentDay][currentMeal as keyof (typeof mealPlan)[1]] = [];
        }

        // Filter out headers and emoji-only lines, support new compact format
        if (
          !trimmedLine.match(/(?:###|NGÀY|Ngày|🌅|🌞|🌙|🍎|^\*\*)/i) &&
          !trimmedLine.includes("kcal") &&
          trimmedLine.includes("-")
        ) {
          // Clean up the line and extract meal details
          let cleanLine = trimmedLine.replace(/^-\s*/, "").trim();

          // Remove macro info in parentheses (P: Xg | C: Xg | F: Xg) to make PDF cleaner
          cleanLine = cleanLine.replace(
            /\s*\(P:\s*\d+g\s*\|\s*C:\s*\d+g\s*\|\s*F:\s*\d+g\)\s*$/i,
            ""
          );

          if (cleanLine.length > 3) {
            mealPlan[currentDay][
              currentMeal as keyof (typeof mealPlan)[1]
            ]?.push(cleanLine);
          }
        }
      }
    });

    return mealPlan;
  };

  // Extract user info from content - improved for new format
  const extractUserInfo = (content: string) => {
    const info: { [key: string]: string } = {};
    const lines = content.split("\n");

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      // Extract BMR
      if (trimmedLine.includes("BMR")) {
        const match = trimmedLine.match(/BMR.*?(\d+)\s*kcal/i);
        if (match) info.bmr = match[1] + " kcal/ngày";
      }

      // Extract TDEE
      if (trimmedLine.includes("TDEE")) {
        const match = trimmedLine.match(/TDEE.*?(\d+)\s*kcal/i);
        if (match) info.tdee = match[1] + " kcal/ngày";
      }

      // Extract target calories
      if (trimmedLine.includes("Mục tiêu calo")) {
        const match = trimmedLine.match(/(\d+)\s*kcal/i);
        if (match) info.targetCalories = match[1] + " kcal/ngày";
      }

      // Extract macros - improved patterns
      if (trimmedLine.includes("Protein:") && trimmedLine.includes("g/ngày")) {
        const match = trimmedLine.match(/Protein:\s*\*\*(\d+)g/i);
        if (match) info.protein = match[1] + "g/ngày";
      }

      if (trimmedLine.includes("Carb:") && trimmedLine.includes("g/ngày")) {
        const match = trimmedLine.match(/Carb:\s*\*\*(\d+)g/i);
        if (match) info.carb = match[1] + "g/ngày";
      }

      if (trimmedLine.includes("Fat:") && trimmedLine.includes("g/ngày")) {
        const match = trimmedLine.match(/Fat:\s*\*\*(\d+)g/i);
        if (match) info.fat = match[1] + "g/ngày";
      }
    });

    return info;
  };

  const generatePDF = async () => {
    try {
      setIsExporting(true);
      setExportStatus("idle");
      setStatusMessage("");

      const mealPlan = parseMealPlan(nutritionContent);
      const userInfo = extractUserInfo(nutritionContent);

      // Create PDF with better settings
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Add Vietnamese font support
      pdf.setFont("helvetica");

      let yPosition = 20;
      const leftMargin = 15;
      const pageHeight = 297;
      const lineHeight = 7;

      // Helper function to check if we need a new page
      const checkPageBreak = (neededSpace: number) => {
        if (yPosition + neededSpace > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
      };

      // Title
      pdf.setFontSize(20);
      pdf.setTextColor(41, 128, 185);
      pdf.text("🍽️ THỰC ĐƠN DINH DƯỠNG 7 NGÀY", leftMargin, yPosition);
      yPosition += 15;

      // User info section
      pdf.setFontSize(12);
      pdf.setTextColor(52, 73, 94);
      pdf.text("📊 THÔNG TIN DINH DƯỠNG", leftMargin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setTextColor(85, 85, 85);

      if (userInfo.bmr) {
        pdf.text(`• BMR: ${userInfo.bmr}`, leftMargin + 5, yPosition);
        yPosition += lineHeight;
      }
      if (userInfo.tdee) {
        pdf.text(`• TDEE: ${userInfo.tdee}`, leftMargin + 5, yPosition);
        yPosition += lineHeight;
      }
      if (userInfo.protein || userInfo.carb || userInfo.fat) {
        pdf.text(
          `• Macro: Protein ${userInfo.protein || "N/A"} | Carb ${
            userInfo.carb || "N/A"
          } | Fat ${userInfo.fat || "N/A"}`,
          leftMargin + 5,
          yPosition
        );
        yPosition += lineHeight + 5;
      }

      // Days 1-3 on page 1
      checkPageBreak(80);
      pdf.setFontSize(14);
      pdf.setTextColor(22, 160, 133);
      pdf.text("📅 NGÀY 1-3", leftMargin, yPosition);
      yPosition += 12;

      for (let day = 1; day <= 3; day++) {
        if (mealPlan[day]) {
          checkPageBreak(50);

          // Day header
          pdf.setFontSize(12);
          pdf.setTextColor(231, 76, 60);
          pdf.text(`NGÀY ${day}`, leftMargin + (day - 1) * 60, yPosition);

          let dayYPosition = yPosition + 8;
          pdf.setFontSize(9);
          pdf.setTextColor(85, 85, 85);

          // Morning
          if (mealPlan[day].morning?.length) {
            pdf.setTextColor(52, 152, 219);
            pdf.text("🌅 Sáng:", leftMargin + (day - 1) * 60, dayYPosition);
            dayYPosition += 5;
            pdf.setTextColor(85, 85, 85);
            mealPlan[day].morning?.slice(0, 3).forEach((item) => {
              const cleanItem = item
                .replace(/[^\w\s\d\(\)\-\|\+\:]/g, "")
                .slice(0, 25);
              pdf.text(
                `• ${cleanItem}`,
                leftMargin + (day - 1) * 60 + 2,
                dayYPosition
              );
              dayYPosition += 4;
            });
            dayYPosition += 2;
          }

          // Lunch
          if (mealPlan[day].lunch?.length) {
            pdf.setTextColor(46, 204, 113);
            pdf.text("🌞 Trưa:", leftMargin + (day - 1) * 60, dayYPosition);
            dayYPosition += 5;
            pdf.setTextColor(85, 85, 85);
            mealPlan[day].lunch?.slice(0, 3).forEach((item) => {
              const cleanItem = item
                .replace(/[^\w\s\d\(\)\-\|\+\:]/g, "")
                .slice(0, 25);
              pdf.text(
                `• ${cleanItem}`,
                leftMargin + (day - 1) * 60 + 2,
                dayYPosition
              );
              dayYPosition += 4;
            });
            dayYPosition += 2;
          }

          // Dinner
          if (mealPlan[day].dinner?.length) {
            pdf.setTextColor(155, 89, 182);
            pdf.text("🌙 Tối:", leftMargin + (day - 1) * 60, dayYPosition);
            dayYPosition += 5;
            pdf.setTextColor(85, 85, 85);
            mealPlan[day].dinner?.slice(0, 3).forEach((item) => {
              const cleanItem = item
                .replace(/[^\w\s\d\(\)\-\|\+\:]/g, "")
                .slice(0, 25);
              pdf.text(
                `• ${cleanItem}`,
                leftMargin + (day - 1) * 60 + 2,
                dayYPosition
              );
              dayYPosition += 4;
            });
          }
        }
      }

      yPosition += 70;

      // Days 4-6
      checkPageBreak(80);
      pdf.setFontSize(14);
      pdf.setTextColor(22, 160, 133);
      pdf.text("📅 NGÀY 4-6", leftMargin, yPosition);
      yPosition += 12;

      for (let day = 4; day <= 6; day++) {
        if (mealPlan[day]) {
          // Day header
          pdf.setFontSize(12);
          pdf.setTextColor(231, 76, 60);
          pdf.text(`NGÀY ${day}`, leftMargin + (day - 4) * 60, yPosition);

          let dayYPosition = yPosition + 8;
          pdf.setFontSize(9);

          // Morning
          if (mealPlan[day].morning?.length) {
            pdf.setTextColor(52, 152, 219);
            pdf.text("🌅 Sáng:", leftMargin + (day - 4) * 60, dayYPosition);
            dayYPosition += 5;
            pdf.setTextColor(85, 85, 85);
            mealPlan[day].morning?.slice(0, 3).forEach((item) => {
              const cleanItem = item
                .replace(/[^\w\s\d\(\)\-\|\+\:]/g, "")
                .slice(0, 25);
              pdf.text(
                `• ${cleanItem}`,
                leftMargin + (day - 4) * 60 + 2,
                dayYPosition
              );
              dayYPosition += 4;
            });
            dayYPosition += 2;
          }

          // Lunch
          if (mealPlan[day].lunch?.length) {
            pdf.setTextColor(46, 204, 113);
            pdf.text("🌞 Trưa:", leftMargin + (day - 4) * 60, dayYPosition);
            dayYPosition += 5;
            pdf.setTextColor(85, 85, 85);
            mealPlan[day].lunch?.slice(0, 3).forEach((item) => {
              const cleanItem = item
                .replace(/[^\w\s\d\(\)\-\|\+\:]/g, "")
                .slice(0, 25);
              pdf.text(
                `• ${cleanItem}`,
                leftMargin + (day - 4) * 60 + 2,
                dayYPosition
              );
              dayYPosition += 4;
            });
            dayYPosition += 2;
          }

          // Dinner
          if (mealPlan[day].dinner?.length) {
            pdf.setTextColor(155, 89, 182);
            pdf.text("🌙 Tối:", leftMargin + (day - 4) * 60, dayYPosition);
            dayYPosition += 5;
            pdf.setTextColor(85, 85, 85);
            mealPlan[day].dinner?.slice(0, 3).forEach((item) => {
              const cleanItem = item
                .replace(/[^\w\s\d\(\)\-\|\+\:]/g, "")
                .slice(0, 25);
              pdf.text(
                `• ${cleanItem}`,
                leftMargin + (day - 4) * 60 + 2,
                dayYPosition
              );
              dayYPosition += 4;
            });
          }
        }
      }

      yPosition += 70;

      // Day 7 - Special layout
      checkPageBreak(60);
      pdf.setFontSize(14);
      pdf.setTextColor(142, 68, 173);
      pdf.text("📅 NGÀY 7", leftMargin, yPosition);
      yPosition += 12;

      if (mealPlan[7]) {
        pdf.setFontSize(9);

        // Morning
        if (mealPlan[7].morning?.length) {
          pdf.setTextColor(52, 152, 219);
          pdf.text("🌅 Sáng:", leftMargin, yPosition);
          yPosition += 5;
          pdf.setTextColor(85, 85, 85);
          mealPlan[7].morning?.slice(0, 4).forEach((item) => {
            const cleanItem = item
              .replace(/[^\w\s\d\(\)\-\|\+\:]/g, "")
              .slice(0, 50);
            pdf.text(`• ${cleanItem}`, leftMargin + 5, yPosition);
            yPosition += 4;
          });
          yPosition += 3;
        }

        // Lunch
        if (mealPlan[7].lunch?.length) {
          pdf.setTextColor(46, 204, 113);
          pdf.text("🌞 Trưa:", leftMargin, yPosition);
          yPosition += 5;
          pdf.setTextColor(85, 85, 85);
          mealPlan[7].lunch?.slice(0, 4).forEach((item) => {
            const cleanItem = item
              .replace(/[^\w\s\d\(\)\-\|\+\:]/g, "")
              .slice(0, 50);
            pdf.text(`• ${cleanItem}`, leftMargin + 5, yPosition);
            yPosition += 4;
          });
          yPosition += 3;
        }

        // Dinner
        if (mealPlan[7].dinner?.length) {
          pdf.setTextColor(155, 89, 182);
          pdf.text("🌙 Tối:", leftMargin, yPosition);
          yPosition += 5;
          pdf.setTextColor(85, 85, 85);
          mealPlan[7].dinner?.slice(0, 4).forEach((item) => {
            const cleanItem = item
              .replace(/[^\w\s\d\(\)\-\|\+\:]/g, "")
              .slice(0, 50);
            pdf.text(`• ${cleanItem}`, leftMargin + 5, yPosition);
            yPosition += 4;
          });
        }
      }

      // Footer
      checkPageBreak(20);
      yPosition = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(149, 165, 166);
      pdf.text(
        `💪 Được tạo bởi Kelly Fitness - AI Agent - ${new Date().toLocaleDateString(
          "vi-VN"
        )}`,
        leftMargin,
        yPosition
      );
      pdf.text(
        "🎯 Hãy tuân thủ thực đơn để đạt kết quả tốt nhất!",
        leftMargin,
        yPosition + 4
      );

      // Save the PDF
      const today = new Date();
      const dateStr = today.toLocaleDateString("vi-VN").replace(/\//g, "-");
      pdf.save(`${fileName}-${dateStr}.pdf`);

      setExportStatus("success");
      setStatusMessage("✅ Thực đơn đã được tải xuống thành công!");

      setTimeout(() => {
        setExportStatus("idle");
        setStatusMessage("");
      }, 3000);
    } catch (error) {
      console.error("PDF Export Error:", error);
      setExportStatus("error");
      setStatusMessage("❌ Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại!");

      setTimeout(() => {
        setExportStatus("idle");
        setStatusMessage("");
      }, 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const getButtonStyle = () => {
    if (isExporting)
      return "bg-gradient-to-r from-blue-400 to-blue-500 border-blue-300";
    if (exportStatus === "success")
      return "bg-gradient-to-r from-green-500 to-green-600 border-green-400";
    if (exportStatus === "error")
      return "bg-gradient-to-r from-red-500 to-red-600 border-red-400";
    return "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 border-purple-400";
  };

  const getButtonIcon = () => {
    if (isExporting) {
      return <DocumentArrowDownIcon className="w-5 h-5 animate-pulse" />;
    }
    if (exportStatus === "success") {
      return <CheckCircleIcon className="w-5 h-5" />;
    }
    if (exportStatus === "error") {
      return <ExclamationCircleIcon className="w-5 h-5" />;
    }
    return <DocumentArrowDownIcon className="w-5 h-5" />;
  };

  const getButtonText = () => {
    if (isExporting) return "Đang tạo PDF...";
    if (exportStatus === "success") return "Đã tải xuống!";
    if (exportStatus === "error") return "Thử lại";
    return "📄 Tải xuống PDF";
  };

  return (
    <div className={className}>
      <motion.button
        onClick={generatePDF}
        disabled={isExporting}
        whileTap={{ scale: 0.95 }}
        className={`
          inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl
          text-white font-medium text-sm shadow-lg border 
          transition-all duration-200 hover:shadow-xl
          disabled:opacity-50 disabled:cursor-not-allowed
          ${getButtonStyle()}
        `}
      >
        <motion.div
          animate={isExporting ? { rotate: 360 } : { rotate: 0 }}
          transition={
            isExporting ? { duration: 1, repeat: Infinity, ease: "linear" } : {}
          }
        >
          {getButtonIcon()}
        </motion.div>
        <span>{getButtonText()}</span>
      </motion.button>

      {/* Status Message */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
              mt-2 p-3 rounded-xl border text-sm font-medium
              ${
                exportStatus === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }
            `}
          >
            {statusMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PDFExporter;
