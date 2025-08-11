"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckIcon,
  StarIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon as CheckIconSolid } from "@heroicons/react/24/solid";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
}

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const plans: PricingPlan[] = [
    {
      id: "free",
      name: "Gói Free",
      price: 0,
      period: "mãi mãi",
      description: "Trải nghiệm Kelly AI với giới hạn hợp lý",
      features: [
        "🤖 Tư vấn dinh dưỡng chuyên nghiệp (5 câu hỏi/ngày)",
        "📋 Lập thực đơn cá nhân hóa 7 ngày (1 lần/tuần)",
        "🧮 Tính toán macro và calories chính xác (giới hạn)",
        "🍎 Tư vấn chế độ ăn theo mục tiêu (cơ bản)",
        "📊 Phân tích thể trạng thông minh (giới hạn)",
        "💡 Tư vấn lối sống lành mạnh (cơ bản)",
        "🎯 6 cá tính AI đa dạng (giới hạn 2 cá tính)",
        "📱 Tính năng tiện ích (export 1 file/ngày)",
      ],
      color: "from-pastel-sage to-pastel-mint",
    },
    {
      id: "pro",
      name: "Gói Pro",
      price: billingCycle === "monthly" ? 299000 : 2990000,
      period: billingCycle === "monthly" ? "/tháng" : "/năm",
      description: "Sử dụng không giới hạn tất cả tính năng Kelly AI",
      features: [
        "🤖 Tư vấn dinh dưỡng chuyên nghiệp (KHÔNG GIỚI HẠN)",
        "📋 Lập thực đơn cá nhân hóa 7 ngày (KHÔNG GIỚI HẠN)",
        "🧮 Tính toán macro và calories chính xác (KHÔNG GIỚI HẠN)",
        "🍎 Tư vấn chế độ ăn theo mục tiêu (KHÔNG GIỚI HẠN)",
        "📊 Phân tích thể trạng thông minh (KHÔNG GIỚI HẠN)",
        "💡 Tư vấn lối sống lành mạnh (KHÔNG GIỚI HẠN)",
        "🎯 6 cá tính AI đa dạng (TẤT CẢ 6 CÁ TÍNH)",
        "📱 Tính năng tiện ích (export KHÔNG GIỚI HẠN)",
        "⚡ Ưu tiên phản hồi nhanh",
        "🔧 Truy cập sớm tính năng mới",
      ],
      popular: true,
      color: "from-pastel-lavender to-pastel-sky",
    },
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handlePayment = () => {
    // Implement Stripe payment logic here
    console.log("Processing payment for plan:", selectedPlan);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-cream via-white to-pastel-mint/20 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-800 mb-4"
          >
            Chọn gói Kelly AI phù hợp với bạn
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 mb-8"
          >
            Cùng tính năng, khác biệt ở giới hạn sử dụng. Nâng cấp Pro để trải
            nghiệm không giới hạn!
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center bg-white rounded-xl p-1 shadow-sm border border-gray-200"
          >
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-pastel-lavender text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Hàng tháng
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-lg font-medium transition-all relative ${
                billingCycle === "yearly"
                  ? "bg-pastel-lavender text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Hàng năm
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                -17%
              </span>
            </button>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all cursor-pointer ${
                selectedPlan === plan.id
                  ? "border-pastel-lavender shadow-xl scale-105"
                  : "border-gray-100 hover:border-gray-200 hover:shadow-xl"
              } ${
                plan.popular
                  ? "ring-2 ring-pastel-lavender ring-opacity-50"
                  : ""
              }`}
              onClick={() => handleSelectPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-pastel-lavender to-pastel-sky px-4 py-1 rounded-full">
                    <span className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                      <StarIcon className="w-4 h-4" />
                      Phổ biến nhất
                    </span>
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                  >
                    {plan.id === "free" && (
                      <ShieldCheckIcon className="w-8 h-8 text-gray-700" />
                    )}
                    {plan.id === "pro" && (
                      <BoltIcon className="w-8 h-8 text-gray-700" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-800">
                      {plan.price.toLocaleString("vi-VN")}
                    </span>
                    <span className="text-gray-600">₫</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <CheckIconSolid className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <button
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    selectedPlan === plan.id
                      ? "bg-gradient-to-r from-pastel-lavender to-pastel-sky text-gray-800 shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {selectedPlan === plan.id ? "Đã chọn" : "Chọn gói này"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Payment Section */}
        {selectedPlan !== "free" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Thanh toán an toàn
            </h3>

            <div className="space-y-6">
              {/* Payment Methods */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Phương thức thanh toán
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-3 p-4 border-2 border-pastel-lavender rounded-xl bg-pastel-lavender/10">
                    <CreditCardIcon className="w-6 h-6 text-gray-700" />
                    <span className="font-medium">Thẻ tín dụng</span>
                  </button>
                  <button className="flex items-center justify-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-all">
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">MB</span>
                    </div>
                    <span className="font-medium">MBBank</span>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-pastel-cream/30 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Gói được chọn:</span>
                  <span className="font-semibold text-gray-800">
                    {plans.find((p) => p.id === selectedPlan)?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Giá:</span>
                  <span className="font-semibold text-gray-800">
                    {plans
                      .find((p) => p.id === selectedPlan)
                      ?.price.toLocaleString("vi-VN")}
                    ₫{plans.find((p) => p.id === selectedPlan)?.period}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">
                      Tổng cộng:
                    </span>
                    <span className="text-xl font-bold text-gray-800">
                      {plans
                        .find((p) => p.id === selectedPlan)
                        ?.price.toLocaleString("vi-VN")}
                      ₫
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePayment}
                className="w-full bg-gradient-to-r from-pastel-lavender via-pastel-sky to-pastel-mint text-gray-800 font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Thanh toán ngay
              </motion.button>

              {/* Security Note */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>Thanh toán được bảo mật bởi Stripe</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-white rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Tại sao chọn Kelly Fitness - AI Agent?
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pastel-mint rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BoltIcon className="w-8 h-8 text-gray-700" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                AI Thông minh
              </h4>
              <p className="text-gray-600">
                Công nghệ AI tiên tiến hiểu rõ nhu cầu và mục tiêu fitness của
                bạn
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pastel-lavender rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="w-8 h-8 text-gray-700" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                Cá nhân hóa
              </h4>
              <p className="text-gray-600">
                Kế hoạch tập luyện và dinh dưỡng được thiết kế riêng cho bạn
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pastel-rose rounded-2xl flex items-center justify-center mx-auto mb-4">
                <StarIcon className="w-8 h-8 text-gray-700" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                24/7 Hỗ trợ
              </h4>
              <p className="text-gray-600">
                Luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi trong hành trình
                fitness
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
