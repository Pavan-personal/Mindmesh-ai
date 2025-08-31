"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.topicBasedGeneration = exports.pdfBasedGeneration = exports.getKeywords = void 0;
const getKeywords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const keyword = req.query.keyword;
        if (!keyword) {
            return res.status(400).json({
                error: 'Query parameter "keyword" is required.',
            });
        }
        const API_KEY = process.env.GEMINI_API_KEY;
        // console.log("API_KEY", API_KEY);
        if (!API_KEY) {
            return res.status(500).json({
                error: "API key is missing. Please configure GEMINI_API_KEY in your environment variables.",
            });
        }
        const prompt = `Extract the most important topics related to "${keyword}" for exam preparation. Return the topics as a JSON array of strings. make sure to keep topic names short and most understandable in the same way even though they are short. but try to cover all the important topics related to the keyword and try to keep the topic short but it is fine if the topic is important and long.`;
        const contents = [{ parts: [{ text: prompt }] }];
        const response = yield fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents }),
        });
        if (!response.ok) {
            const errorData = yield response.json();
            return res.status(response.status).json({
                error: "Error from Gemini API",
                details: errorData,
            });
        }
        const data = yield response.json();
        const rawText = (_e = (_d = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text;
        let relatedKeywords;
        try {
            relatedKeywords = JSON.parse(rawText === null || rawText === void 0 ? void 0 : rawText.replace(/```json|```/g, "").trim());
        }
        catch (error) {
            return res.status(500).json({
                error: "Failed to parse Gemini response content.",
                details: error.message,
            });
        }
        return res.json({ keywords: relatedKeywords });
    }
    catch (error) {
        console.error("Error handling request:", error);
        return res.status(500).json({
            error: "An unexpected error occurred.",
            details: error.message,
        });
    }
});
exports.getKeywords = getKeywords;
const pdfBasedGeneration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const { command, description } = req.body;
        if (!command || !description) {
            return res.status(400).json({
                error: 'Invalid request body: "command" and "description" are required.',
            });
        }
        const contents = [
            {
                parts: [
                    {
                        text: `Generate exactly 20 MCQ questions with the following format requirements:

              MCQ Format:
              {
                type: 'mcq',
                question: { 
                  text: 'only question text (don\\'t include code snippet here)',
                  code?: 'code block with proper indentation; the first line specifies the language (e.g., python, SQL, rust, etc.)'
                },
                options: [
                  { text?: 'option text', code?: 'formatted code if needed' },
                ],
                answer: number
              }

              Please analyze the content and provide a title for the quiz along with the questions in this format:
              {
                "title": "The title based on content",
                "questions": [ ... questions following MCQ format ... ]
              }

              For mathematical expressions:
              - Use Unicode symbols (×, ÷, ≤, ≥, ≠, π, ∑, ∫, √)
              - Use Unicode superscripts (²,³) and subscripts (₁,₂) where possible

              For code snippets:
              - Always include proper indentation
              - Use consistent formatting
              - Include language-specific syntax highlighting hints

              *** if you have any code snippets defnitely include them as code attribute in the question object and also include the code in the options if needed. ***

            ${command} Description: ${description}.`,
                    },
                ],
            },
        ];
        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) {
            return res.status(500).json({
                error: "API key is missing. Please configure GEMINI_API_KEY in your .env file.",
            });
        }
        const geminiRes = yield fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents }),
        });
        if (!geminiRes.ok) {
            const errorData = yield geminiRes.json();
            return res.status(geminiRes.status).json({
                error: "Error from Gemini API",
                details: errorData,
            });
        }
        const data = yield geminiRes.json();
        const rawText = (_e = (_d = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text;
        const cleanedText = rawText === null || rawText === void 0 ? void 0 : rawText.replace(/```json|```/g, "").trim();
        let formattedJson;
        try {
            formattedJson = JSON.parse(cleanedText);
        }
        catch (error) {
            return res.status(500).json({
                error: "Failed to parse Gemini response content.",
                details: error.message,
            });
        }
        // Return all 20 questions generated
        const allQuestions = formattedJson.questions || formattedJson;
        return res.json({
            data: Object.assign(Object.assign({}, formattedJson), { questions: allQuestions }),
            totalGenerated: allQuestions.length,
            message: "When a user attempts this exam, 10 questions will be randomly selected from these 20 questions."
        });
    }
    catch (error) {
        console.error("Error handling request:", error);
        return res.status(500).json({
            error: "An unexpected error occurred.",
            details: error.message,
        });
    }
});
exports.pdfBasedGeneration = pdfBasedGeneration;
const topicBasedGeneration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const { keyword, topics, difficulty, numQuestions, prompt, } = req.body;
        if (!keyword || !topics || !Array.isArray(topics)) {
            return res.status(400).json({
                error: 'Invalid request body: "keyword" and "topics" (array) are required.',
            });
        }
        const topicsText = topics.join(", ");
        const questionTypeText = ` in MCQ format only. Only single correct MCQs.`;
        const customCommand = `Generate exactly 20 questions${questionTypeText} for the topics ${topicsText} with a difficulty level of ${difficulty === "mixed"
            ? "cover all kind of difficulty types including miscellaneous"
            : difficulty}. 
    
    Format requirements for different question types:

    1. MCQ Format:
    {
      type: 'mcq',
      question: { 
        text: 'only question text (don’t include code snippet here)',
        code?: 'code block with proper indentation; the first line specifies the language (e.g., python, SQL, rust, etc.)'
      },
      options: [
        { text?: 'option text', code?: 'formatted code if needed' },
        // ... more options
      ],
      answer: number // index of correct option
    }

    2. Fill in the blanks Format:
    {
      type: 'fill-in-blank',
      question: {
        text: 'question text with ___ for blanks',
        code?: 'formatted code if needed'
      },
      options: [
        { text?: 'option text'},
        // ... more options
      ],
      answer: number // index of correct option
    }

    3. Assertion Reason Format:
    {
      type: 'assertion-reason',
      question: {
        assertion: 'assertion statement',
        reason: 'reason statement',
        code?: 'formatted code if needed'
      },
      options: [
        'Both assertion and reason are true and reason is the correct explanation of assertion',
        'Both assertion and reason are true but reason is not the correct explanation of assertion',
        'Assertion is true but reason is false',
        'Assertion is false but reason is true'
      ],
      answer: number // index of correct option
    }

    4. True/False Format:
    {
      type: 't/f',
      question: {
        text: 'question statement',
        code?: 'formatted code if needed'
      },
      options: ['True', 'False'],
      answer: number // index of correct option
    }

    For mathematical expressions:
    - Use Unicode symbols (×, ÷, ≤, ≥, ≠, π, ∑, ∫, √) and also as many as possible.
    - Use Unicode superscripts (²,³) and subscripts (₁,₂) kind of notations where possible

    For code snippets:
    - Always include proper indentation
    - Use consistent formatting
    - Include language-specific syntax highlighting hints

    *** if you have any code snippets defnitely include them as code attribute in the question object and also include the code in the options if needed. ***

    ${prompt ? "Additional instructions: " + prompt : ""}`;
        const contents = [{ parts: [{ text: customCommand }] }];
        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) {
            return res.status(500).json({
                error: "API key is missing. Please configure GEMINI_API_KEY in your environment variables.",
            });
        }
        const response = yield fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents }),
        });
        if (!response.ok) {
            const errorData = yield response.json();
            return res.status(response.status).json({
                error: "Error from Gemini API",
                details: errorData,
            });
        }
        const data = yield response.json();
        const rawText = (_e = (_d = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text;
        let questions;
        try {
            questions = JSON.parse(rawText === null || rawText === void 0 ? void 0 : rawText.replace(/```json|```/g, "").trim());
        }
        catch (err) {
            return res.status(500).json({
                error: "Failed to parse Gemini response content.",
                details: err.message,
            });
        }
        // Return all 20 questions generated
        const allQuestions = questions.questions || questions;
        return res.json({
            questions: allQuestions,
            topic: `${keyword} questions`,
            totalGenerated: allQuestions.length,
            message: "When a user attempts this exam, 10 questions will be randomly selected from these 20 questions."
        });
    }
    catch (error) {
        console.error("Error handling request:", error);
        return res.status(500).json({
            error: "An unexpected error occurred.",
            details: error.message,
        });
    }
});
exports.topicBasedGeneration = topicBasedGeneration;
