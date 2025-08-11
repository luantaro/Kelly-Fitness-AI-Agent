# AI Coach Web Application Framework

_Khung phát triển ứng dụng web AI Coach đầy đủ và chi tiết_

## 📋 Tổng Quan Framework

### Mục Tiêu

- Xây dựng ứng dụng web AI Coach chuyên nghiệp
- UI/UX hiện đại, responsive, thân thiện người dùng
- Tích hợp AI mạnh mẽ với khả năng chat thông minh
- Hệ thống authentication & authorization bảo mật
- Tích hợp thanh toán và quản lý subscription
- Deployment tự động và scalable

### Tech Stack Tiêu Chuẩn

```
Frontend: Next.js 15+ + TypeScript + Tailwind CSS
Backend: Firebase (Auth, Firestore, Functions)
AI Integration: OpenAI GPT-4o API
Payment: Stripe
Deployment: Vercel/Firebase Hosting
Testing: Playwright + Jest
```

---

## 🎨 Frontend Setup Framework

### 1. Project Initialization

```bash
# Tạo dự án Next.js với TypeScript
npx create-next-app@latest my-ai-coach --typescript --tailwind --eslint --app

cd my-ai-coach

# Cài đặt dependencies cơ bản
npm install firebase @stripe/stripe-js lucide-react
npm install -D @types/node @playwright/test

# Setup linting và formatting
npm install -D prettier eslint-config-prettier
```

### 2. Cấu Trúc Thư Mục Chuẩn

```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── (auth)/            # Auth group layout
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/       # Protected routes
│   │   ├── chat/
│   │   ├── profile/
│   │   └── settings/
│   ├── admin/             # Admin panel
│   ├── api/               # API routes
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── users/
│   │   └── payments/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   ├── Calendar.tsx
│   │   └── index.ts
│   ├── auth/             # Auth-specific components
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── AuthGuard.tsx
│   ├── chat/             # Chat interface
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── ChatInput.tsx
│   │   └── ChatSidebar.tsx
│   ├── dashboard/        # Dashboard components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── StatsCard.tsx
│   ├── nutrition/        # Nutrition & Meal Planning
│   │   ├── MealPlanGenerator.tsx
│   │   ├── FoodSearchModal.tsx
│   │   ├── NutritionCard.tsx
│   │   ├── CalorieTracker.tsx
│   │   ├── RecipeCard.tsx
│   │   └── WeeklyMealPlan.tsx
│   ├── fitness/          # Fitness & Workout
│   │   ├── WorkoutPlanGenerator.tsx
│   │   ├── ExerciseLibrary.tsx
│   │   ├── ProgressTracker.tsx
│   │   └── WorkoutTimer.tsx
│   └── payment/          # Payment components
│       ├── PricingCard.tsx
│       ├── PaymentForm.tsx
│       └── SubscriptionStatus.tsx
├── hooks/                # Custom React hooks
│   ├── useAuth.ts
│   ├── useChat.ts
│   ├── useSubscription.ts
│   ├── useTrialStatus.ts
│   ├── useUserProfile.ts
│   ├── useMealPlan.ts        # Meal plan generation
│   ├── useNutrition.ts       # Nutrition tracking
│   └── useFoodDatabase.ts    # Food search & data
├── lib/                  # Utility libraries
│   ├── firebase.ts       # Firebase config
│   ├── stripe.ts         # Stripe config
│   ├── openai.ts         # OpenAI config
│   ├── auth.ts           # Auth utilities
│   └── utils.ts          # General utilities
├── stores/               # State management (Zustand)
│   ├── authStore.ts
│   ├── chatStore.ts
│   ├── userDataStore.ts
│   └── subscriptionStore.ts
├── types/                # TypeScript type definitions
│   ├── auth.ts
│   ├── chat.ts
│   ├── user.ts
│   ├── subscription.ts
│   ├── nutrition.ts      # Meal plan & food types
│   ├── fitness.ts        # Workout & exercise types
│   └── analytics.ts      # Progress tracking types
└── constants/            # App constants
    ├── config.ts
    ├── routes.ts
    └── messages.ts
```

### 3. Core Configuration Files

#### next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  },
};

export default nextConfig;
```

#### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          900: "#111827",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

### 4. Environment Variables Template

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_api_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## 🔧 Backend Setup Framework

### 1. Firebase Configuration

#### firebase.ts

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export default app;
```

### 2. Database Schema (Firestore)

#### Collections Structure

```
users/
├── {userId}/
│   ├── email: string
│   ├── displayName: string
│   ├── photoURL: string
│   ├── role: 'user' | 'admin' | 'coach'
│   ├── subscription: {
│   │   ├── status: 'trial' | 'active' | 'cancelled' | 'expired'
│   │   ├── plan: 'free' | 'premium' | 'enterprise'
│   │   ├── startDate: timestamp
│   │   ├── endDate: timestamp
│   │   └── stripeCustomerId: string
│   │   }
│   ├── profile: {
│   │   ├── age: number
│   │   ├── gender: string
│   │   ├── goals: string[]
│   │   ├── fitnessLevel: string
│   │   └── preferences: object
│   │   }
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp

chats/
├── {chatId}/
│   ├── userId: string
│   ├── title: string
│   ├── messages: {
│   │   ├── {messageId}: {
│   │   │   ├── role: 'user' | 'assistant'
│   │   │   ├── content: string
│   │   │   ├── timestamp: timestamp
│   │   │   └── metadata: object
│   │   │   }
│   │   }
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp

subscriptions/
├── {subscriptionId}/
│   ├── userId: string
│   ├── stripeSubscriptionId: string
│   ├── status: string
│   ├── currentPeriodStart: timestamp
│   ├── currentPeriodEnd: timestamp
│   └── metadata: object

foods/
├── {foodId}/
│   ├── name: string
│   ├── brand: string
│   ├── category: 'protein' | 'carbs' | 'fat' | 'vegetable' | 'fruit'
│   ├── nutrition: {
│   │   ├── calories: number (per 100g)
│   │   ├── protein: number
│   │   ├── carbs: number
│   │   ├── fat: number
│   │   ├── fiber: number
│   │   └── sugar: number
│   │   }
│   ├── allergens: string[]
│   └── tags: string[]

mealPlans/
├── {mealPlanId}/
│   ├── userId: string
│   ├── name: string
│   ├── type: 'weekly' | 'daily' | 'custom'
│   ├── startDate: timestamp
│   ├── endDate: timestamp
│   ├── targetCalories: number
│   ├── targetMacros: {
│   │   ├── protein: number
│   │   ├── carbs: number
│   │   └── fat: number
│   │   }
│   ├── meals: {
│   │   ├── {dayIndex}: {
│   │   │   ├── breakfast: Recipe[]
│   │   │   ├── lunch: Recipe[]
│   │   │   ├── dinner: Recipe[]
│   │   │   └── snacks: Recipe[]
│   │   │   }
│   │   }
│   ├── preferences: string[]
│   ├── restrictions: string[]
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp

recipes/
├── {recipeId}/
│   ├── name: string
│   ├── category: 'breakfast' | 'lunch' | 'dinner' | 'snack'
│   ├── ingredients: {
│   │   ├── {ingredientId}: {
│   │   │   ├── foodId: string
│   │   │   ├── quantity: number
│   │   │   └── unit: string
│   │   │   }
│   │   }
│   ├── instructions: string[]
│   ├── prepTime: number (minutes)
│   ├── cookTime: number (minutes)
│   ├── servings: number
│   ├── nutrition: {
│   │   ├── totalCalories: number
│   │   ├── protein: number
│   │   ├── carbs: number
│   │   └── fat: number
│   │   }
│   ├── difficulty: 'easy' | 'medium' | 'hard'
│   ├── tags: string[]
│   └── imageUrl: string

workoutPlans/
├── {workoutPlanId}/
│   ├── userId: string
│   ├── name: string
│   ├── type: 'strength' | 'cardio' | 'hybrid' | 'yoga'
│   ├── level: 'beginner' | 'intermediate' | 'advanced'
│   ├── duration: number (weeks)
│   ├── daysPerWeek: number
│   ├── workouts: {
│   │   ├── {dayIndex}: {
│   │   │   ├── name: string
│   │   │   ├── exercises: Exercise[]
│   │   │   ├── estimatedTime: number
│   │   │   └── equipment: string[]
│   │   │   }
│   │   }
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp

progressTracking/
├── {trackingId}/
│   ├── userId: string
│   ├── date: timestamp
│   ├── weight: number
│   ├── bodyFat: number
│   ├── measurements: {
│   │   ├── chest: number
│   │   ├── waist: number
│   │   ├── hips: number
│   │   └── arms: number
│   │   }
│   ├── photos: string[]
│   ├── mood: number (1-10)
│   ├── energy: number (1-10)
│   └── notes: string
```

### 3. API Routes Structure

#### src/app/api/auth/route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    // Verify Firebase ID token
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get or create user in Firestore
    const userDoc = await getFirestore().collection("users").doc(uid).get();

    if (!userDoc.exists) {
      // Create new user
      await getFirestore()
        .collection("users")
        .doc(uid)
        .set({
          email: decodedToken.email,
          displayName: decodedToken.name || "",
          photoURL: decodedToken.picture || "",
          role: "user",
          subscription: {
            status: "trial",
            plan: "free",
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
    }

    return NextResponse.json({ success: true, uid });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}
```

#### src/app/api/meal-plan/generate/route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { preferences, restrictions, targetCalories, days, idToken } =
      await request.json();

    // Verify user authentication
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Check subscription status
    const userDoc = await getFirestore().collection("users").doc(userId).get();

    const userData = userDoc.data();
    if (!userData || userData.subscription.status === "expired") {
      return NextResponse.json(
        { error: "Subscription required" },
        { status: 403 }
      );
    }

    // Generate meal plan with AI
    const prompt = `Create a ${days}-day meal plan for:
    - Target calories: ${targetCalories}/day
    - Preferences: ${preferences.join(", ")}
    - Restrictions: ${restrictions.join(", ")}
    
    Return JSON format with detailed recipes, ingredients, and nutrition info.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a professional nutritionist. Create detailed, balanced meal plans with exact recipes, ingredients, and nutritional information.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 3000,
      temperature: 0.7,
    });

    const mealPlanData = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    // Save meal plan to Firestore
    const mealPlanRef = getFirestore().collection("mealPlans").doc();
    await mealPlanRef.set({
      userId,
      name: `AI Generated Plan - ${new Date().toLocaleDateString()}`,
      type: "custom",
      startDate: new Date(),
      endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      targetCalories,
      preferences,
      restrictions,
      meals: mealPlanData.meals,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      mealPlanId: mealPlanRef.id,
      mealPlan: mealPlanData,
    });
  } catch (error) {
    console.error("Meal plan generation error:", error);
    return NextResponse.json(
      { error: "Meal plan generation failed" },
      { status: 500 }
    );
  }
}
```

#### src/app/api/food/search/route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const category = searchParams.get("category");

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    let foodsQuery = getFirestore()
      .collection("foods")
      .where("name", ">=", query)
      .where("name", "<=", query + "\uf8ff")
      .limit(20);

    if (category) {
      foodsQuery = foodsQuery.where("category", "==", category);
    }

    const foodsSnapshot = await foodsQuery.get();
    const foods = foodsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ foods });
  } catch (error) {
    console.error("Food search error:", error);
    return NextResponse.json({ error: "Food search failed" }, { status: 500 });
  }
}
```

#### src/app/api/nutrition/calculate/route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const { ingredients } = await request.json();

    let totalNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
    };

    // Calculate nutrition for each ingredient
    for (const ingredient of ingredients) {
      const foodDoc = await getFirestore()
        .collection("foods")
        .doc(ingredient.foodId)
        .get();

      if (foodDoc.exists) {
        const foodData = foodDoc.data();
        const multiplier = ingredient.quantity / 100; // per 100g

        totalNutrition.calories += foodData.nutrition.calories * multiplier;
        totalNutrition.protein += foodData.nutrition.protein * multiplier;
        totalNutrition.carbs += foodData.nutrition.carbs * multiplier;
        totalNutrition.fat += foodData.nutrition.fat * multiplier;
        totalNutrition.fiber += foodData.nutrition.fiber * multiplier;
        totalNutrition.sugar += foodData.nutrition.sugar * multiplier;
      }
    }

    return NextResponse.json({ nutrition: totalNutrition });
  } catch (error) {
    console.error("Nutrition calculation error:", error);
    return NextResponse.json({ error: "Calculation failed" }, { status: 500 });
  }
}
```

```typescript
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, chatId, idToken } = await request.json();

    // Verify user authentication
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Check user subscription status
    const userDoc = await getFirestore().collection("users").doc(userId).get();

    const userData = userDoc.data();
    if (!userData || userData.subscription.status === "expired") {
      return NextResponse.json(
        { error: "Subscription expired" },
        { status: 403 }
      );
    }

    // Create or get chat
    const chatRef = getFirestore().collection("chats").doc(chatId);
    const chatDoc = await chatRef.get();

    if (!chatDoc.exists) {
      await chatRef.set({
        userId,
        title: message.substring(0, 50) + "...",
        messages: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Add user message
    const userMessageId = `msg_${Date.now()}_user`;
    await chatRef.update({
      [`messages.${userMessageId}`]: {
        role: "user",
        content: message,
        timestamp: new Date(),
      },
      updatedAt: new Date(),
    });

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a professional AI fitness coach. Provide helpful, accurate, and personalized fitness advice.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    // Add AI message
    const aiMessageId = `msg_${Date.now()}_assistant`;
    await chatRef.update({
      [`messages.${aiMessageId}`]: {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      },
      updatedAt: new Date(),
    });

    return NextResponse.json({
      response: aiResponse,
      messageId: aiMessageId,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
```

#### src/app/api/meal-plan/generate/route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { preferences, restrictions, targetCalories, days, idToken } =
      await request.json();

    // Verify user authentication
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Check subscription status
    const userDoc = await getFirestore().collection("users").doc(userId).get();

    const userData = userDoc.data();
    if (!userData || userData.subscription.status === "expired") {
      return NextResponse.json(
        { error: "Subscription required" },
        { status: 403 }
      );
    }

    // Generate meal plan with AI
    const prompt = `Create a ${days}-day meal plan for:
    - Target calories: ${targetCalories}/day
    - Preferences: ${preferences.join(", ")}
    - Restrictions: ${restrictions.join(", ")}
    
    Return JSON format with detailed recipes, ingredients, and nutrition info.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a professional nutritionist. Create detailed, balanced meal plans with exact recipes, ingredients, and nutritional information.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 3000,
      temperature: 0.7,
    });

    const mealPlanData = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    // Save meal plan to Firestore
    const mealPlanRef = getFirestore().collection("mealPlans").doc();
    await mealPlanRef.set({
      userId,
      name: `AI Generated Plan - ${new Date().toLocaleDateString()}`,
      type: "custom",
      startDate: new Date(),
      endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      targetCalories,
      preferences,
      restrictions,
      meals: mealPlanData.meals,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      mealPlanId: mealPlanRef.id,
      mealPlan: mealPlanData,
    });
  } catch (error) {
    console.error("Meal plan generation error:", error);
    return NextResponse.json(
      { error: "Meal plan generation failed" },
      { status: 500 }
    );
  }
}
```

#### src/app/api/food/search/route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const category = searchParams.get("category");

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    let foodsQuery = getFirestore()
      .collection("foods")
      .where("name", ">=", query)
      .where("name", "<=", query + "\uf8ff")
      .limit(20);

    if (category) {
      foodsQuery = foodsQuery.where("category", "==", category);
    }

    const foodsSnapshot = await foodsQuery.get();
    const foods = foodsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ foods });
  } catch (error) {
    console.error("Food search error:", error);
    return NextResponse.json({ error: "Food search failed" }, { status: 500 });
  }
}
```

## 🍽️ **Advanced Meal Planning System**

### Meal Plan Generation Hook

#### src/hooks/useMealPlan.ts

```typescript
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

interface MealPlanOptions {
  targetCalories: number;
  preferences: string[];
  restrictions: string[];
  days: number;
}

interface MealPlan {
  id: string;
  name: string;
  meals: any;
  nutrition: any;
  createdAt: Date;
}

export const useMealPlan = () => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, getIdToken } = useAuth();

  const generateMealPlan = async (options: MealPlanOptions) => {
    if (!user) return;

    setIsGenerating(true);
    setError(null);

    try {
      const idToken = await getIdToken();
      const response = await fetch("/api/meal-plan/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...options,
          idToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate meal plan");
      }

      const data = await response.json();

      // Add to local state
      setMealPlans((prev) => [data.mealPlan, ...prev]);

      return data.mealPlan;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const saveMealPlan = async (mealPlan: Partial<MealPlan>) => {
    // Implementation for saving custom meal plans
  };

  const deleteMealPlan = async (planId: string) => {
    // Implementation for deleting meal plans
  };

  return {
    mealPlans,
    isGenerating,
    error,
    generateMealPlan,
    saveMealPlan,
    deleteMealPlan,
  };
};
```

### Food Search Hook

#### src/hooks/useFoodSearch.ts

```typescript
import { useState, useCallback, useMemo } from "react";
import { debounce } from "lodash";

interface Food {
  id: string;
  name: string;
  brand: string;
  category: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const useFoodSearch = () => {
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchFoods = useCallback(
    async (searchQuery: string, category?: string) => {
      if (!searchQuery.trim()) {
        setFoods([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: searchQuery,
          ...(category && { category }),
        });

        const response = await fetch(`/api/food/search?${params}`);

        if (!response.ok) {
          throw new Error("Failed to search foods");
        }

        const data = await response.json();
        setFoods(data.foods);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setFoods([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const debouncedSearch = useMemo(
    () => debounce(searchFoods, 300),
    [searchFoods]
  );

  const handleSearch = (newQuery: string, category?: string) => {
    setQuery(newQuery);
    debouncedSearch(newQuery, category);
  };

  return {
    query,
    foods,
    isLoading,
    error,
    searchFoods: handleSearch,
  };
};
```

### Nutrition Calculator Hook

#### src/hooks/useNutritionCalculator.ts

```typescript
import { useState, useCallback } from "react";

interface Ingredient {
  foodId: string;
  quantity: number;
  unit: string;
}

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

export const useNutritionCalculator = () => {
  const [nutrition, setNutrition] = useState<NutritionData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateNutrition = useCallback(async (ingredients: Ingredient[]) => {
    setIsCalculating(true);
    setError(null);

    try {
      const response = await fetch("/api/nutrition/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate nutrition");
      }

      const data = await response.json();
      setNutrition(data.nutrition);
      return data.nutrition;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation failed");
      throw err;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const resetNutrition = () => {
    setNutrition(null);
    setError(null);
  };

  return {
    nutrition,
    isCalculating,
    error,
    calculateNutrition,
    resetNutrition,
  };
};
```

#### functions/src/index.ts

```typescript
import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";

initializeApp();

// Stripe webhook handler
export const handleStripeWebhook = onRequest(async (req, res) => {
  // Handle Stripe events
  // Update subscription status in Firestore
});

// Auto-create user profile on new user registration
export const createUserProfile = onDocumentCreated(
  "users/{userId}",
  async (event) => {
    const userData = event.data?.data();
    if (userData) {
      // Initialize default user settings
      // Send welcome email
      // Setup trial period
    }
  }
);

// Daily subscription status checker
export const checkSubscriptionStatus = onRequest(async (req, res) => {
  // Check expired subscriptions
  // Update user access
  // Send renewal reminders
});
```

---

## 🧪 Testing Framework & Checklist

### 1. Testing Setup

#### playwright.config.ts

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### 2. Test Categories & Examples

#### Unit Tests (Jest)

```typescript
// tests/unit/hooks/useAuth.test.ts
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "@/hooks/useAuth";

describe("useAuth Hook", () => {
  test("should initialize with null user", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  test("should handle login correctly", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login("test@example.com", "password");
    });

    expect(result.current.user).toBeTruthy();
    expect(result.current.error).toBeNull();
  });
});
```

#### Integration Tests (Playwright)

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should complete signup process", async ({ page }) => {
    await page.goto("/signup");

    // Fill signup form
    await page.fill('[data-testid="email-input"]', "test@example.com");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.fill('[data-testid="confirm-password-input"]', "password123");
    await page.click('[data-testid="signup-button"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test("should handle login flow", async ({ page }) => {
    await page.goto("/login");

    await page.fill('[data-testid="email-input"]', "test@example.com");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL("/dashboard");
  });
});
```

#### Meal Planning Tests

```typescript
// tests/e2e/meal-planning.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Meal Planning System", () => {
  test.beforeEach(async ({ page }) => {
    // Login setup
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test@example.com");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.click('[data-testid="login-button"]');
    await page.waitForURL("/dashboard");
  });

  test("should generate meal plan", async ({ page }) => {
    await page.goto("/meal-plan");

    // Fill meal plan form
    await page.fill('[data-testid="target-calories"]', "2000");
    await page.selectOption('[data-testid="diet-preference"]', "vegetarian");
    await page.fill('[data-testid="restrictions"]', "nuts, dairy");
    await page.selectOption('[data-testid="plan-duration"]', "7");

    await page.click('[data-testid="generate-plan-button"]');

    // Wait for generation
    await expect(
      page.locator('[data-testid="generating-indicator"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="meal-plan-result"]')).toBeVisible({
      timeout: 15000,
    });

    // Verify meal plan structure
    await expect(page.locator('[data-testid="day-1-breakfast"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="nutrition-summary"]')
    ).toBeVisible();
  });

  test("should search and add foods", async ({ page }) => {
    await page.goto("/food-tracker");

    await page.fill('[data-testid="food-search"]', "chicken breast");
    await page.waitForSelector('[data-testid="food-search-results"]');

    // Select first food item
    await page.click('[data-testid="food-item-0"]');
    await page.fill('[data-testid="food-quantity"]', "150");
    await page.click('[data-testid="add-food-button"]');

    // Verify food added to tracker
    await expect(page.locator('[data-testid="tracked-foods"]')).toContainText(
      "chicken breast"
    );
    await expect(page.locator('[data-testid="total-calories"]')).toBeVisible();
  });
});
```

#### Nutrition API Tests

```typescript
// tests/unit/api/nutrition.test.ts
import { POST } from "@/app/api/nutrition/calculate/route";
import { NextRequest } from "next/server";

describe("/api/nutrition/calculate", () => {
  test("should calculate nutrition correctly", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/nutrition/calculate",
      {
        method: "POST",
        body: JSON.stringify({
          ingredients: [
            {
              foodId: "chicken-breast-123",
              quantity: 150, // grams
              unit: "g",
            },
          ],
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.nutrition).toHaveProperty("calories");
    expect(data.nutrition).toHaveProperty("protein");
    expect(data.nutrition.calories).toBeGreaterThan(0);
  });
});
```

```typescript
// tests/e2e/chat.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Chat Interface", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test@example.com");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.click('[data-testid="login-button"]');
    await page.waitForURL("/dashboard");
  });

  test("should send and receive messages", async ({ page }) => {
    await page.goto("/chat");

    const messageText = "What is a good workout routine?";
    await page.fill('[data-testid="chat-input"]', messageText);
    await page.click('[data-testid="send-button"]');

    // Check user message appears
    await expect(page.locator(`text=${messageText}`)).toBeVisible();

    // Wait for AI response
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible({
      timeout: 10000,
    });
  });

  test("should create new chat", async ({ page }) => {
    await page.goto("/chat");

    await page.click('[data-testid="new-chat-button"]');

    // Should clear chat and show input
    await expect(page.locator('[data-testid="chat-input"]')).toBeEmpty();
    await expect(page.locator('[data-testid="message-list"]')).toBeEmpty();
  });
});
```

### 3. Comprehensive Testing Checklist

#### ✅ Authentication Testing

- [ ] **Signup Flow**
  - [ ] Valid email/password signup
  - [ ] Email validation
  - [ ] Password strength validation
  - [ ] Duplicate email handling
  - [ ] Email verification process
- [ ] **Login Flow**
  - [ ] Valid credentials login
  - [ ] Invalid credentials handling
  - [ ] Remember me functionality
  - [ ] Password reset flow
  - [ ] Social login (Google, Facebook)
- [ ] **Session Management**
  - [ ] Auto-logout on token expiry
  - [ ] Refresh token handling
  - [ ] Multiple device sessions
  - [ ] Logout functionality

#### ✅ User Interface Testing

- [ ] **Responsive Design**
  - [ ] Mobile (320px - 768px)
  - [ ] Tablet (768px - 1024px)
  - [ ] Desktop (1024px+)
  - [ ] Touch interaction on mobile
  - [ ] Keyboard navigation
- [ ] **Accessibility (WCAG 2.1)**
  - [ ] Keyboard navigation
  - [ ] Screen reader compatibility
  - [ ] Color contrast ratios
  - [ ] Focus indicators
  - [ ] Alt text for images
  - [ ] ARIA labels and roles
- [ ] **Cross-browser Compatibility**
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Edge (latest)

#### ✅ Chat Functionality Testing

- [ ] **Message Handling**
  - [ ] Send text messages
  - [ ] Receive AI responses
  - [ ] Message persistence
  - [ ] Message formatting
  - [ ] Long message handling
  - [ ] Special characters
- [ ] **Chat Management**
  - [ ] Create new chat
  - [ ] Delete chat
  - [ ] Chat history
  - [ ] Search messages
  - [ ] Export chat
- [ ] **AI Response Quality**
  - [ ] Relevant responses
  - [ ] Response time < 5 seconds
  - [ ] Handle unclear questions
  - [ ] Maintain conversation context
  - [ ] Safety filters working

#### ✅ Subscription & Payment Testing

- [ ] **Trial Period**
  - [ ] 7-day trial activation
  - [ ] Trial expiry handling
  - [ ] Trial to paid conversion
  - [ ] Trial limitations
- [ ] **Payment Processing**
  - [ ] Stripe integration
  - [ ] Valid card processing
  - [ ] Invalid card handling
  - [ ] Payment failure scenarios
  - [ ] Receipt generation
- [ ] **Subscription Management**
  - [ ] Plan upgrades
  - [ ] Plan downgrades
  - [ ] Cancellation flow
  - [ ] Refund processing
  - [ ] Billing cycle accuracy

#### ✅ Security Testing

- [ ] **Data Protection**
  - [ ] Input sanitization
  - [ ] XSS prevention
  - [ ] CSRF protection
  - [ ] SQL injection prevention
  - [ ] Rate limiting
- [ ] **Authentication Security**
  - [ ] Password hashing
  - [ ] JWT token security
  - [ ] Session hijacking prevention
  - [ ] Brute force protection
- [ ] **API Security**
  - [ ] HTTPS only
  - [ ] API rate limiting
  - [ ] Input validation
  - [ ] Error message security
  - [ ] CORS configuration

#### ✅ Performance Testing

- [ ] **Load Times**
  - [ ] Page load < 3 seconds
  - [ ] First contentful paint < 1.5s
  - [ ] Time to interactive < 3.5s
  - [ ] API response < 500ms
- [ ] **Scalability**
  - [ ] 100 concurrent users
  - [ ] 1000 concurrent users
  - [ ] Database query optimization
  - [ ] CDN integration
  - [ ] Caching strategies

### 4. Testing Scripts

#### package.json testing scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

---

## 🚀 Deployment Framework

### 1. Development Workflow

#### Git Workflow

```bash
# Feature development
git checkout -b feature/chat-interface
git add .
git commit -m "feat: implement chat interface with AI integration"
git push origin feature/chat-interface

# Pull request process
# Code review
# Merge to main
# Automatic deployment
```

#### Development Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:e2e": "playwright test",
    "deploy:staging": "firebase deploy --project staging",
    "deploy:production": "firebase deploy --project production"
  }
}
```

### 2. Firebase Deployment

#### firebase.json

```json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

#### Deployment Checklist

- [ ] **Pre-deployment**
  - [ ] All tests passing
  - [ ] Code review completed
  - [ ] Environment variables set
  - [ ] Database migrations ready
  - [ ] Build optimization
- [ ] **Deployment Process**
  - [ ] Staging deployment
  - [ ] Staging testing
  - [ ] Production deployment
  - [ ] Smoke tests
  - [ ] Monitoring setup
- [ ] **Post-deployment**
  - [ ] Performance monitoring
  - [ ] Error tracking
  - [ ] User feedback
  - [ ] Analytics setup

### 3. Monitoring & Analytics

#### Setup Monitoring

```typescript
// lib/monitoring.ts
import { analytics } from "firebase/analytics";
import { performance } from "firebase/performance";

export const trackEvent = (eventName: string, parameters: any) => {
  if (typeof window !== "undefined") {
    analytics().logEvent(eventName, parameters);
  }
};

export const trackPerformance = (metricName: string, value: number) => {
  if (typeof window !== "undefined") {
    performance().trace(metricName).record(value);
  }
};
```

---

## 📋 Production Checklist

### ✅ Pre-Launch Checklist

- [ ] **Technical**
  - [ ] All tests passing (unit, integration, e2e)
  - [ ] Performance optimization complete
  - [ ] Security audit passed
  - [ ] Accessibility compliance verified
  - [ ] Cross-browser testing completed
  - [ ] Mobile responsiveness verified
- [ ] **Content & Legal**
  - [ ] Privacy policy updated
  - [ ] Terms of service ready
  - [ ] GDPR compliance
  - [ ] Cookie policy
  - [ ] Contact information
- [ ] **Business**
  - [ ] Payment integration tested
  - [ ] Subscription plans configured
  - [ ] Customer support setup
  - [ ] Analytics tracking
  - [ ] Backup strategy

### ✅ Launch Day Checklist

- [ ] **Monitoring**
  - [ ] Error tracking active
  - [ ] Performance monitoring
  - [ ] Uptime monitoring
  - [ ] User analytics
- [ ] **Support**
  - [ ] Support team ready
  - [ ] Documentation complete
  - [ ] FAQ prepared
  - [ ] Bug reporting system

### ✅ Post-Launch Checklist

- [ ] **Week 1**
  - [ ] Daily performance reviews
  - [ ] User feedback collection
  - [ ] Bug fix priorities
  - [ ] Usage analytics analysis
- [ ] **Month 1**
  - [ ] Feature usage analysis
  - [ ] Performance optimization
  - [ ] User retention metrics
  - [ ] Revenue tracking

---

## 🔧 Maintenance Framework

### 1. Regular Maintenance Tasks

#### Daily

- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Review user feedback
- [ ] Check payment processing

#### Weekly

- [ ] Security updates
- [ ] Dependency updates
- [ ] Performance optimization
- [ ] Backup verification

#### Monthly

- [ ] Comprehensive testing
- [ ] User analytics review
- [ ] Feature planning
- [ ] Cost optimization

### 2. Emergency Response Plan

#### Critical Issues (< 1 hour response)

- [ ] Site down
- [ ] Payment processing failure
- [ ] Security breach
- [ ] Data loss

#### High Priority (< 4 hours response)

- [ ] Major feature broken
- [ ] Authentication issues
- [ ] Performance degradation
- [ ] User complaints

#### Medium Priority (< 24 hours response)

- [ ] Minor bugs
- [ ] UI issues
- [ ] Feature requests
- [ ] Content updates

---

## 📚 Resources & References

### Documentation Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

### Code Quality Tools

- ESLint + Prettier
- Husky (Git hooks)
- TypeScript strict mode
- Jest + Testing Library
- Playwright E2E testing

### Best Practices

- Semantic versioning
- Conventional commits
- Code review process
- Continuous integration
- Progressive enhancement

---

_Framework được tạo dựa trên kinh nghiệm thực tế từ dự án Kelly Fitness AI và các best practices trong ngành_

**Tác giả**: Kelly Fitness AI Development Team  
**Cập nhật**: August 2025  
**Phiên bản**: 1.0
