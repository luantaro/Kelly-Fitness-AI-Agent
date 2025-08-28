import OpenAI from "openai";

// Simple OpenAI client setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-development",
});

// Basic types
interface UserProfile {
  name?: string;
  age: number;
  gender: "male" | "female" | "";
  height: number;
  weight: number;
  activityLevel: string;
  goal: string;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Main chat function
export async function getFitnessAdvice(
  message: string,
  userProfile?: UserProfile | null,
  conversationHistory?: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
): Promise<string> {
  try {
    // Build user context if profile exists
    let userContext = "";
    if (
      userProfile &&
      userProfile.name &&
      userProfile.age &&
      userProfile.weight &&
      userProfile.height
    ) {
      userContext = `THONG TIN USER: ${userProfile.name}, ${
        userProfile.age
      } tuoi, ${userProfile.gender === "male" ? "Nam" : "Nu"}, ${
        userProfile.height
      }cm, ${userProfile.weight}kg, Muc tieu: ${userProfile.goal}. `;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Ban la OneFitness AI - AI coach dinh duong chuyen nghiep. Tra loi bang tieng Viet. QUAN TRONG: Neu user da co thong tin ca nhan day du (ten, tuoi, can nang, chieu cao, gioi tinh, muc tieu) - KHONG chao hoi lai, tu dong ap dung ngay thong tin do de tu van. Chi tap trung vao noi dung tu van, khong lap lai thong tin da biet.",
        },
        { role: "user", content: userContext + message },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    return (
      response.choices[0]?.message?.content || "Xin loi, toi khong the tra loi."
    );
  } catch (error) {
    console.error("OpenAI Error:", error);
    return "Xin loi, co loi xay ra. Vui long thu lai sau.";
  }
}

// Quick action handler
export async function handleQuickAction(
  actionType: string,
  userProfile?: UserProfile | null,
  conversationHistory?: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
): Promise<string> {
  const messages: Record<string, string> = {
    "weight-loss-menu": "Tao thuc don giam can 1 tuan",
    "lets-roll": "Chia se meo dinh duong thu vi",
    "lifestyle-advice": "Tu van loi song khoe manh",
    "body-analysis": "Phan tich co the va toi uu dinh duong",
  };

  const message = messages[actionType] || "Tu van dinh duong tong quat";
  return await getFitnessAdvice(message, userProfile, conversationHistory);
}

// Other required functions
export async function getWorkoutPlan(
  message: string,
  experience?: string,
  timeAvailable?: string,
  userProfile?: UserProfile | null,
  conversationHistory?: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
): Promise<string> {
  return await getFitnessAdvice(
    `Tap luyen: ${message}`,
    userProfile,
    conversationHistory
  );
}

export async function getNutritionPlan(
  message: string,
  dietaryRestrictions?: string,
  userProfile?: UserProfile | null,
  conversationHistory?: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
): Promise<string> {
  return await getFitnessAdvice(
    `Dinh duong: ${message}`,
    userProfile,
    conversationHistory
  );
}

export async function getLifestyleAdvice(
  message: string,
  userProfile?: UserProfile | null,
  conversationHistory?: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
): Promise<string> {
  return await getFitnessAdvice(
    `Loi song: ${message}`,
    userProfile,
    conversationHistory
  );
}

export async function getBodyAnalysis(
  message: string,
  userProfile?: UserProfile | null,
  conversationHistory?: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
): Promise<string> {
  return await getFitnessAdvice(
    `Phan tich co the: ${message}`,
    userProfile,
    conversationHistory
  );
}

export async function getRandomNutritionTopic(
  userProfile?: UserProfile | null,
  conversationHistory?: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
): Promise<string> {
  const topics = [
    "Protein va co bap",
    "Vitamin va suc khoe",
    "Hydration quan trong",
    "Chong viem tu nhien",
  ];

  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  return await getFitnessAdvice(
    `Chia se ve: ${randomTopic}`,
    userProfile,
    conversationHistory
  );
}
