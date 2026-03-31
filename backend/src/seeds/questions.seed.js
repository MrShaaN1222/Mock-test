import { connectDb, disconnectDb } from "../config/db.js";
import Question from "../models/Question.js";

const sampleQuestions = [
  {
    questionText: "What is the value of 12 * 8?",
    category: "quantitative",
    difficulty: "easy",
    options: [
      { text: "84", isCorrect: false },
      { text: "96", isCorrect: true },
      { text: "104", isCorrect: false },
      { text: "112", isCorrect: false }
    ],
    explanation: "12 multiplied by 8 equals 96."
  },
  {
    questionText: "Find the average of 14, 18, 22, and 26.",
    category: "quantitative",
    difficulty: "medium",
    options: [
      { text: "18", isCorrect: false },
      { text: "19", isCorrect: false },
      { text: "20", isCorrect: true },
      { text: "21", isCorrect: false }
    ],
    explanation: "The sum is 80 and 80/4 = 20."
  },
  {
    questionText: "If 25% of a number is 45, what is the number?",
    category: "quantitative",
    difficulty: "medium",
    options: [
      { text: "160", isCorrect: false },
      { text: "170", isCorrect: false },
      { text: "180", isCorrect: true },
      { text: "200", isCorrect: false }
    ],
    explanation: "Number = 45 * 100 / 25 = 180."
  },
  {
    questionText: "Choose the correctly spelled word.",
    category: "english",
    difficulty: "easy",
    options: [
      { text: "Accomodation", isCorrect: false },
      { text: "Accommodation", isCorrect: true },
      { text: "Acommodation", isCorrect: false },
      { text: "Acomodation", isCorrect: false }
    ],
    explanation: "The correct spelling is Accommodation."
  },
  {
    questionText: "Identify the synonym of 'Rapid'.",
    category: "english",
    difficulty: "easy",
    options: [
      { text: "Slow", isCorrect: false },
      { text: "Swift", isCorrect: true },
      { text: "Lazy", isCorrect: false },
      { text: "Quiet", isCorrect: false }
    ],
    explanation: "Rapid means swift or fast."
  },
  {
    questionText: "Select the sentence with correct grammar.",
    category: "english",
    difficulty: "medium",
    options: [
      { text: "She do not like tea.", isCorrect: false },
      { text: "She does not likes tea.", isCorrect: false },
      { text: "She does not like tea.", isCorrect: true },
      { text: "She not like tea.", isCorrect: false }
    ],
    explanation: "With 'does', the base verb form is used: 'like'."
  },
  {
    questionText: "Who wrote the Indian National Anthem?",
    category: "general-awareness",
    difficulty: "easy",
    options: [
      { text: "Bankim Chandra Chatterjee", isCorrect: false },
      { text: "Rabindranath Tagore", isCorrect: true },
      { text: "Sarojini Naidu", isCorrect: false },
      { text: "Subramania Bharati", isCorrect: false }
    ],
    explanation: "Rabindranath Tagore composed Jana Gana Mana."
  },
  {
    questionText: "The Constitution of India came into effect on:",
    category: "general-awareness",
    difficulty: "easy",
    options: [
      { text: "15 August 1947", isCorrect: false },
      { text: "26 January 1950", isCorrect: true },
      { text: "2 October 1949", isCorrect: false },
      { text: "26 November 1949", isCorrect: false }
    ],
    explanation: "The Constitution came into force on 26 January 1950."
  },
  {
    questionText: "Which planet is known as the Red Planet?",
    category: "general-awareness",
    difficulty: "easy",
    options: [
      { text: "Venus", isCorrect: false },
      { text: "Mars", isCorrect: true },
      { text: "Jupiter", isCorrect: false },
      { text: "Mercury", isCorrect: false }
    ],
    explanation: "Mars appears reddish due to iron oxide on its surface."
  },
  {
    questionText: "What comes next in the series: 3, 6, 12, 24, ?",
    category: "reasoning",
    difficulty: "easy",
    options: [
      { text: "30", isCorrect: false },
      { text: "36", isCorrect: false },
      { text: "48", isCorrect: true },
      { text: "54", isCorrect: false }
    ],
    explanation: "Each term is multiplied by 2."
  },
  {
    questionText: "If SOUTH is coded as TPVUI, then NORTH is coded as:",
    category: "reasoning",
    difficulty: "medium",
    options: [
      { text: "OPSUI", isCorrect: true },
      { text: "OPSUJ", isCorrect: false },
      { text: "NQTSI", isCorrect: false },
      { text: "ORTUI", isCorrect: false }
    ],
    explanation: "Each letter is shifted by +1 in the alphabet."
  },
  {
    questionText: "Find the odd one out: Triangle, Square, Circle, Cube",
    category: "reasoning",
    difficulty: "easy",
    options: [
      { text: "Triangle", isCorrect: false },
      { text: "Square", isCorrect: false },
      { text: "Circle", isCorrect: false },
      { text: "Cube", isCorrect: true }
    ],
    explanation: "Cube is a 3D figure; others are 2D shapes."
  }
];

async function seedQuestions() {
  const shouldResetOnly = process.argv.includes("--reset");

  await connectDb();

  if (shouldResetOnly) {
    const deletion = await Question.deleteMany({});
    console.log(`Reset complete. Deleted ${deletion.deletedCount} questions.`);
    await disconnectDb();
    return;
  }

  await Question.deleteMany({});
  const insertedQuestions = await Question.insertMany(sampleQuestions);
  console.log(`Seed complete. Inserted ${insertedQuestions.length} questions.`);

  await disconnectDb();
}

seedQuestions()
  .then(() => {
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Question seed failed:", error);
    await disconnectDb();
    process.exit(1);
  });
