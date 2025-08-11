"use client";

import { useState } from "react";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import {
  calculateMacroTargets,
  getGoalDescription,
  type UserProfile,
} from "../lib/macroCalculator";

interface DocumentExporterProps {
  nutritionContent: string;
  userProfile?: UserProfile | null;
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

const DocumentExporter: React.FC<DocumentExporterProps> = ({
  nutritionContent,
  userProfile,
  className = "",
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const parseMealPlan = (content: string): MealPlan => {
    const mealPlan: MealPlan = {};
    const lines = content.split("\n");
    let currentDay = 0;
    let currentMeal = "";

    console.log("🔍 DEBUG: Starting to parse content...");
    console.log("📄 Content preview:", content.substring(0, 500));

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Day detection - enhanced for "NGÀY 1,2,3..." format (also supports legacy formats)
      if (
        trimmedLine.match(/(?:ngày|day)\s*\d+/i) ||
        trimmedLine.match(/(?:thứ)\s*\d+/i) ||
        trimmedLine.match(/chủ\s*nhật/i) ||
        /^(?:ngày\s*)?[1-7]$/i.test(trimmedLine) ||
        trimmedLine.match(/^\*\*(?:ngày|day)\s*\d+/i)
      ) {
        // Extract number from various formats
        let dayMatch = trimmedLine.match(/\d+/);
        if (dayMatch) {
          let dayNum = parseInt(dayMatch[0]);
          // Convert legacy "Thứ" format to day numbers (Thứ 2 = Day 1, etc.) for backward compatibility
          if (trimmedLine.match(/thứ\s*\d+/i)) {
            currentDay = dayNum === 1 ? 7 : dayNum - 1; // Thứ 2 = Day 1, Chủ nhật = Day 7
          } else {
            // Standard NGÀY format: NGÀY 1 = Day 1, NGÀY 7 = Day 7
            currentDay = dayNum;
          }
        } else if (trimmedLine.match(/chủ\s*nhật/i)) {
          // Legacy Sunday format for backward compatibility
          currentDay = 7;
        }

        if (currentDay > 0 && currentDay <= 7) {
          if (!mealPlan[currentDay]) mealPlan[currentDay] = {};
          console.log(`📅 Found Day ${currentDay}: "${trimmedLine}"`);
        }
        return;
      }

      // Meal detection
      const lowerLine = trimmedLine.toLowerCase();
      if (
        lowerLine.includes("sáng") ||
        lowerLine.includes("morning") ||
        lowerLine.includes("🌅")
      ) {
        currentMeal = "morning";
        console.log(`🌅 Found Morning meal for Day ${currentDay}`);
      } else if (
        lowerLine.includes("trưa") ||
        lowerLine.includes("lunch") ||
        lowerLine.includes("🌞")
      ) {
        currentMeal = "lunch";
        console.log(`🌞 Found Lunch meal for Day ${currentDay}`);
      } else if (
        lowerLine.includes("tối") ||
        lowerLine.includes("dinner") ||
        lowerLine.includes("🌙")
      ) {
        currentMeal = "dinner";
        console.log(`🌙 Found Dinner meal for Day ${currentDay}`);
      } else if (
        lowerLine.includes("snack") ||
        lowerLine.includes("🍎") ||
        lowerLine.includes("phụ")
      ) {
        currentMeal = "snack";
        console.log(`🍎 Found Snack meal for Day ${currentDay}`);
      } else if (
        currentDay > 0 &&
        currentMeal &&
        mealPlan[currentDay] &&
        trimmedLine.length > 2 &&
        (trimmedLine.includes("gram") ||
          trimmedLine.includes("ml") ||
          trimmedLine.includes("chiếc") ||
          trimmedLine.includes("thìa") ||
          trimmedLine.includes("cốc") ||
          trimmedLine.includes("chén") ||
          trimmedLine.includes("miếng") ||
          trimmedLine.includes("lát") ||
          /\d+/g.test(trimmedLine)) &&
        (trimmedLine.startsWith("-") ||
          trimmedLine.startsWith("•") ||
          trimmedLine.startsWith("*") ||
          /^\d+\./.test(trimmedLine) ||
          (!lowerLine.includes("macro") &&
            !lowerLine.includes("protein") &&
            !lowerLine.includes("carb") &&
            !lowerLine.includes("fat") &&
            !lowerLine.includes("cal") &&
            !lowerLine.includes("kcal") &&
            !trimmedLine.includes("🌅") &&
            !trimmedLine.includes("🌞") &&
            !trimmedLine.includes("🌙") &&
            !trimmedLine.includes("🍎")))
      ) {
        // Initialize meal array if needed
        if (!mealPlan[currentDay][currentMeal as keyof (typeof mealPlan)[1]]) {
          mealPlan[currentDay][currentMeal as keyof (typeof mealPlan)[1]] = [];
        }

        // Clean up the line
        let cleanLine = trimmedLine
          .replace(/^[-•*]\s*/, "")
          .replace(/^\d+\.\s*/, "")
          .trim();

        // Remove macro info in parentheses
        cleanLine = cleanLine.replace(/\s*\([^)]*\)\s*$/g, "");

        if (cleanLine.length > 3) {
          mealPlan[currentDay][currentMeal as keyof (typeof mealPlan)[1]]?.push(
            cleanLine
          );
          console.log(
            `✅ Added to Day ${currentDay} ${currentMeal}: "${cleanLine}"`
          );
        }
      }
    });

    console.log("📊 Final meal plan:", mealPlan);
    return mealPlan;
  };

  const generateWordDocument = async (mealPlan: MealPlan) => {
    try {
      const children: any[] = [];

      // Validate meal plan input
      if (!mealPlan || typeof mealPlan !== "object") {
        console.warn("Invalid meal plan data:", mealPlan);
        // Create a simple document with error message
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Lỗi: Không có dữ liệu thực đơn để xuất",
                size: 24,
                color: "FF0000",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 400 },
          })
        );
      } else {
        // Title - Professional Header
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "THỰC ĐƠN DINH DƯỠNG 7 NGÀY",
                bold: true,
                size: 36,
                color: "2980B9",
              }),
            ],
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          })
        );

        // Subtitle
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Kelly Fitness - AI Agent",
                size: 24,
                color: "7F8C8D",
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          })
        );

        // User Profile Information (if available)
        if (userProfile) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "THÔNG TIN CÁ NHÂN",
                  bold: true,
                  size: 28,
                  color: "34495E",
                }),
              ],
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 300 },
            })
          );

          const profileInfo = [
            (userProfile as any).name &&
              `👤 Họ tên: ${(userProfile as any).name}`,
            userProfile.age && `🎂 Tuổi: ${userProfile.age} tuổi`,
            userProfile.gender &&
              `⚧ Giới tính: ${
                userProfile.gender === "male"
                  ? "Nam"
                  : userProfile.gender === "female"
                  ? "Nữ"
                  : userProfile.gender
              }`,
            userProfile.height && `📏 Chiều cao: ${userProfile.height}cm`,
            userProfile.weight && `⚖ Cân nặng: ${userProfile.weight}kg`,
            userProfile.goal &&
              `🎯 Mục tiêu: ${getGoalDescription(userProfile.goal)}`,
            userProfile.activityLevel &&
              `🏃‍♂️ Mức độ hoạt động: ${userProfile.activityLevel}`,
          ]
            .filter(Boolean)
            .filter((item) => typeof item === "string" && item.length > 0);

          // Create professional profile info table
          const profileRows: TableRow[] = [];

          // Ensure we have valid data before creating table
          if (profileInfo.length === 0) {
            profileRows.push(
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Chưa có thông tin profile",
                            size: 24,
                            color: "666666",
                          }),
                        ],
                        spacing: { before: 100, after: 100 },
                      }),
                    ],
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    margins: { top: 200, bottom: 200, left: 300, right: 300 },
                    borders: {},
                  }),
                ],
              })
            );
          } else {
            for (let i = 0; i < profileInfo.length; i += 2) {
              const leftInfo = profileInfo[i] || "";
              const rightInfo = profileInfo[i + 1] || "";

              profileRows.push(
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: leftInfo,
                              size: 24,
                              color: "2C3E50",
                            }),
                          ],
                          spacing: { before: 100, after: 100 },
                        }),
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      margins: { top: 200, bottom: 200, left: 300, right: 300 },
                      borders: {},
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: rightInfo,
                              size: 24,
                              color: "2C3E50",
                            }),
                          ],
                          spacing: { before: 100, after: 100 },
                        }),
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      margins: { top: 200, bottom: 200, left: 300, right: 300 },
                      borders: {},
                    }),
                  ],
                })
              );
            }
          }

          children.push(
            new Table({
              rows: profileRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
            })
          );

          // Macro targets if available
          if (
            userProfile.weight &&
            userProfile.height &&
            userProfile.age &&
            userProfile.gender
          ) {
            const macroInfo = calculateMacroTargets(userProfile);
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: "MỤC TIÊU DINH DƯỠNG HÀNG NGÀY",
                    bold: true,
                    size: 28,
                    color: "27AE60",
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 400, after: 300 },
              })
            );

            const macroTargets = [
              `🔥 Calories: ${macroInfo.calories} kcal`,
              `🥩 Protein: ${macroInfo.protein}g (${macroInfo.proteinPercent}%)`,
              `🍞 Carbs: ${macroInfo.carbs}g (${macroInfo.carbsPercent}%)`,
              `🥑 Fat: ${macroInfo.fat}g (${macroInfo.fatPercent}%)`,
            ].filter((item) => typeof item === "string" && item.length > 0);

            // Create professional macro targets table
            const macroRows: TableRow[] = [];

            // Ensure we have valid macro data
            if (macroTargets.length === 0) {
              macroRows.push(
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Chưa có thông tin macro",
                              size: 22,
                              color: "666666",
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                          spacing: { before: 100, after: 100 },
                        }),
                      ],
                      width: { size: 100, type: WidthType.PERCENTAGE },
                      margins: { top: 200, bottom: 200, left: 300, right: 300 },
                      borders: {},
                    }),
                  ],
                })
              );
            } else {
              for (let i = 0; i < macroTargets.length; i += 2) {
                const leftMacro = macroTargets[i] || "";
                const rightMacro = macroTargets[i + 1] || "";

                macroRows.push(
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: leftMacro,
                                size: 22,
                                color: "2C3E50",
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 100, after: 100 },
                          }),
                        ],
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        margins: {
                          top: 200,
                          bottom: 200,
                          left: 300,
                          right: 300,
                        },
                        borders: {},
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: rightMacro,
                                size: 22,
                                color: "2C3E50",
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 100, after: 100 },
                          }),
                        ],
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        margins: {
                          top: 200,
                          bottom: 200,
                          left: 300,
                          right: 300,
                        },
                        borders: {},
                      }),
                    ],
                  })
                );
              }
            }

            children.push(
              new Table({
                rows: macroRows,
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
              })
            );
          }
        }

        // Add spacing before meal plan table
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "",
              }),
            ],
            spacing: { before: 600 },
          })
        );

        // Generate professional meal plan table
        const tableRows: TableRow[] = [];

        // Header row with professional styling
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "NGÀY",
                        bold: true,
                        size: 28,
                        color: "FFFFFF",
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                width: { size: 12, type: WidthType.PERCENTAGE },
                shading: { fill: "2980B9" },
                margins: { top: 300, bottom: 300, left: 200, right: 200 },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "🌅 SÁNG",
                        bold: true,
                        size: 28,
                        color: "FFFFFF",
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                width: { size: 22, type: WidthType.PERCENTAGE },
                shading: { fill: "3498DB" },
                margins: { top: 300, bottom: 300, left: 200, right: 200 },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "🌞 TRƯA",
                        bold: true,
                        size: 28,
                        color: "FFFFFF",
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                width: { size: 22, type: WidthType.PERCENTAGE },
                shading: { fill: "2ECC71" },
                margins: { top: 300, bottom: 300, left: 200, right: 200 },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "🌙 TỐI",
                        bold: true,
                        size: 28,
                        color: "FFFFFF",
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                width: { size: 22, type: WidthType.PERCENTAGE },
                shading: { fill: "9B59B6" },
                margins: { top: 300, bottom: 300, left: 200, right: 200 },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "🍎 SNACK",
                        bold: true,
                        size: 28,
                        color: "FFFFFF",
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                width: { size: 22, type: WidthType.PERCENTAGE },
                shading: { fill: "E67E22" },
                margins: { top: 300, bottom: 300, left: 200, right: 200 },
              }),
            ],
          })
        );

        // Data rows for each day with consistent formatting
        for (let dayNum = 1; dayNum <= 7; dayNum++) {
          const day = mealPlan && mealPlan[dayNum] ? mealPlan[dayNum] : {};

          const morningItems = Array.isArray(day?.morning) ? day.morning : [];
          const lunchItems = Array.isArray(day?.lunch) ? day.lunch : [];
          const dinnerItems = Array.isArray(day?.dinner) ? day.dinner : [];
          const snackItems = Array.isArray(day?.snack) ? day.snack : [];

          // Create meal paragraphs with professional formatting
          const createMealParagraphs = (items: string[], mealType: string) => {
            const paragraphs: Paragraph[] = [];

            if (items.length === 0) {
              paragraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Chưa có thực đơn ${mealType.toLowerCase()}`,
                      size: 20,
                      color: "95A5A6",
                      italics: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 200, after: 200 },
                })
              );
            } else {
              items.forEach((item, index) => {
                const cleanItem = item
                  .replace(/[•\-*]\s*/, "")
                  .replace(/\*\*/g, "")
                  .trim();

                if (cleanItem) {
                  paragraphs.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `• ${cleanItem}`,
                          size: 20,
                          color: "2C3E50",
                        }),
                      ],
                      spacing: {
                        before: index === 0 ? 150 : 80,
                        after: index === items.length - 1 ? 150 : 80,
                      },
                    })
                  );
                }
              });
            }

            return paragraphs;
          };

          tableRows.push(
            new TableRow({
              children: [
                // Day column with alternating background
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `NGÀY ${dayNum}`,
                          bold: true,
                          size: 24,
                          color: "E74C3C",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 200, after: 200 },
                    }),
                  ],
                  width: { size: 12, type: WidthType.PERCENTAGE },
                  shading: { fill: dayNum % 2 === 0 ? "F8F9FA" : "FFFFFF" },
                  margins: { top: 300, bottom: 300, left: 200, right: 200 },
                }),
                // Morning column
                new TableCell({
                  children: createMealParagraphs(morningItems, "SÁNG"),
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  margins: { top: 200, bottom: 200, left: 300, right: 300 },
                  shading: { fill: dayNum % 2 === 0 ? "F8F9FA" : "FFFFFF" },
                }),
                // Lunch column
                new TableCell({
                  children: createMealParagraphs(lunchItems, "TRƯA"),
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  margins: { top: 200, bottom: 200, left: 300, right: 300 },
                  shading: { fill: dayNum % 2 === 0 ? "F8F9FA" : "FFFFFF" },
                }),
                // Dinner column
                new TableCell({
                  children: createMealParagraphs(dinnerItems, "TỐI"),
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  margins: { top: 200, bottom: 200, left: 300, right: 300 },
                  shading: { fill: dayNum % 2 === 0 ? "F8F9FA" : "FFFFFF" },
                }),
                // Snack column
                new TableCell({
                  children: createMealParagraphs(snackItems, "SNACK"),
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  margins: { top: 200, bottom: 200, left: 300, right: 300 },
                  shading: { fill: dayNum % 2 === 0 ? "F8F9FA" : "FFFFFF" },
                }),
              ],
            })
          );
        }

        // Add the professional meal plan table - ensure we have valid rows
        if (tableRows.length > 0) {
          children.push(
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2, color: "BDC3C7" },
                bottom: { style: BorderStyle.SINGLE, size: 2, color: "BDC3C7" },
                left: { style: BorderStyle.SINGLE, size: 2, color: "BDC3C7" },
                right: { style: BorderStyle.SINGLE, size: 2, color: "BDC3C7" },
                insideHorizontal: {
                  style: BorderStyle.SINGLE,
                  size: 1,
                  color: "E8E8E8",
                },
                insideVertical: {
                  style: BorderStyle.SINGLE,
                  size: 1,
                  color: "E8E8E8",
                },
              },
            })
          );
        } else {
          // Fallback if no meal plan data
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "Chưa có dữ liệu thực đơn để xuất",
                  size: 24,
                  color: "666666",
                  italics: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 400 },
            })
          );
        }

        // Health Tips Section
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "💡 TIPS CẢI THIỆN SỨC KHỎE",
                bold: true,
                size: 24,
                color: "16A085",
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 600, after: 300 },
          })
        );

        const healthTips = [
          "💧 Uống đủ 2-3 lít nước mỗi ngày để duy trì cơ thể khỏe mạnh",
          "🚶‍♂️ Tập thể dục đều đặn ít nhất 30 phút/ngày, 5 ngày/tuần",
          "😴 Ngủ đủ 7-9 tiếng mỗi đêm để cơ thể phục hồi và tái tạo",
          "🧘‍♀️ Quản lý stress thông qua thiền định, yoga hoặc các hoạt động thư giãn",
          "🥗 Ăn nhiều rau xanh và trái cây để bổ sung vitamin và khoáng chất",
          "🚭 Tránh thuốc lá, rượu bia và các chất kích thích có hại",
          "📱 Hạn chế thời gian sử dụng thiết bị điện tử trước khi ngủ",
          "👨‍⚕️ Kiểm tra sức khỏe định kỳ để phát hiện sớm các vấn đề sức khỏe",
        ];

        for (const tip of healthTips) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: tip,
                  size: 18,
                  color: "2C3E50",
                }),
              ],
              indent: { left: 720 },
              spacing: { after: 150 },
            })
          );
        }

        // Disclaimer Section
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "⚠️ DISCLAIMER - TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM",
                bold: true,
                size: 20,
                color: "E74C3C",
              }),
            ],
            spacing: { before: 400, after: 300 },
          })
        );

        // Disclaimer intro
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Kelly Fitness AI Agent chỉ mang tính chất tham khảo và hỗ trợ trong việc lập kế hoạch dinh dưỡng. Thông tin được cung cấp KHÔNG thay thế cho lời khuyên y tế chuyên nghiệp.",
                size: 16,
                color: "7F8C8D",
                italics: true,
              }),
            ],
            indent: { left: 360 },
            spacing: { after: 200 },
          })
        );

        // Disclaimer points
        const disclaimerPoints = [
          "🔸 AI có thể mắc sai lầm trong việc tính toán hoặc đưa ra khuyến nghị",
          "🔸 Mỗi cơ thể là duy nhất và có thể phản ứng khác nhau với chế độ dinh dưỡng",
          "🔸 Hãy tham khảo ý kiến của bác sĩ, chuyên gia dinh dưỡng trước khi áp dụng",
          "🔸 Nếu có bất kỳ tình trạng sức khỏe đặc biệt, vui lòng tham khảo chuyên gia",
          "🔸 Ngừng sử dụng và tìm kiếm tư vấn y tế nếu có phản ứng bất thường",
        ];

        for (const point of disclaimerPoints) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: point,
                  size: 16,
                  color: "7F8C8D",
                }),
              ],
              indent: { left: 720 },
              spacing: { after: 120 },
            })
          );
        }

        // Footer
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Được tạo bởi Kelly Fitness AI - ${new Date().toLocaleDateString(
                  "vi-VN"
                )}`,
                size: 16,
                color: "95A5A6",
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 600 },
          })
        );
      } // End of else block

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: children,
          },
        ],
      });

      return doc;
    } catch (error) {
      console.error("Error generating Word document:", error);
      // Return basic document with error message
      const errorDoc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Lỗi khi tạo tài liệu Word. Vui lòng thử lại.",
                    size: 24,
                    color: "FF0000",
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          },
        ],
      });
      return errorDoc;
    }
  };

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    setExportStatus("idle");
    setStatusMessage("");

    try {
      const mealPlan = parseMealPlan(nutritionContent);
      console.log("📈 Days found:", Object.keys(mealPlan).length);

      if (Object.keys(mealPlan).length === 0) {
        throw new Error(
          "Không tìm thấy dữ liệu thực đơn. Vui lòng kiểm tra format nội dung."
        );
      }

      const today = new Date();
      const dateStr = today.toLocaleDateString("vi-VN");

      // Generate Word document
      const doc = await generateWordDocument(mealPlan);
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([new Uint8Array(buffer)], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      saveAs(blob, `thuc-don-${dateStr.replace(/\//g, "-")}.docx`);
      setStatusMessage("✅ Thực đơn đã được tải xuống thành công!");

      setExportStatus("success");

      setTimeout(() => {
        setExportStatus("idle");
        setStatusMessage("");
      }, 3000);
    } catch (error) {
      console.error(`❌ Export Error:`, error);
      setExportStatus("error");
      setStatusMessage(
        `❌ ${
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi tạo thực đơn"
        }`
      );

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
    return "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-blue-400";
  };

  const getButtonIcon = () => {
    if (isExporting) {
      return <DocumentTextIcon className="w-5 h-5 animate-pulse" />;
    }
    if (exportStatus === "success") {
      return <CheckCircleIcon className="w-5 h-5" />;
    }
    if (exportStatus === "error") {
      return <ExclamationCircleIcon className="w-5 h-5" />;
    }
    return <DocumentTextIcon className="w-5 h-5" />;
  };

  const getButtonText = () => {
    if (isExporting) {
      return "Đang tạo thực đơn...";
    }
    if (exportStatus === "success") {
      return "Đã tải xuống!";
    }
    if (exportStatus === "error") {
      return "Thử lại";
    }
    return "📄 Tải thực đơn";
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-3">
        {/* Word Export Button */}
        <motion.button
          onClick={handleExport}
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
              isExporting
                ? { duration: 1, repeat: Infinity, ease: "linear" }
                : {}
            }
          >
            {getButtonIcon()}
          </motion.div>
          <span>{getButtonText()}</span>
        </motion.button>
      </div>

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

      {/* Info text */}
      <div className="mt-2 text-xs text-gray-500">
        📋 Thực đơn có thể tải xuống dưới dạng file Word để chỉnh sửa
      </div>
    </div>
  );
};

export default DocumentExporter;
