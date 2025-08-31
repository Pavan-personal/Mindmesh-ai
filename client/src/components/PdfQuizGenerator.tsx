import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FilePond } from "react-filepond";
import { Loader2, Send, Layers, CheckCircle, InfoIcon } from "lucide-react";
import CustomizationPanelPdfBased from "./CustomisationPanelPDF";
import QuizReview from "./QuizReview";
import "filepond/dist/filepond.min.css";
import { api } from "@/lib/api";
import { WalletCheck } from "./WalletCheck";

type Settings = {
  difficulty: string;
  numQuestions: number;
  questionType: string;
};

const PDFQuizGenerator = () => {
  const [serverResponse, setServerResponse] = useState("");
  const [loading, setLoading] = useState(false);
  // const [openPromptModal, setOpenPromptModal] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loadingText, setLoadingText] = useState("");
  const [Questions, setQuestions] = useState({
    is_loaded: false,
    questions: [],
    title: "",
    totalGenerated: 0,
    message: ""
  });
  const [selectedSetIndex, setSelectedSetIndex] = useState(0); // 0 for first set, 1 for second set

  const handleGenerateQuiz = async () => {
    setLoading(true);
    try {
      // const response = await fetch("/api/pdf-based-generation", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     command: `Generate ${
      //       settings?.numQuestions
      //     } mcq questions with a difficulty level of ${
      //       settings?.difficulty === "mixed"
      //         ? "mix of hard, medium and easy"
      //         : settings?.difficulty
      //     } from the following text & the questions types can be ${
      //       settings?.questionType === "mcq"
      //         ? "mcq"
      //         : "mcqs should be 55-65% of the total questions and others should be random. order should be random also options also should be random and tough to guess"
      //     }. additional instructions: ${prompt || "none"}.`,
      //     description: serverResponse?.replace(/\n/g, " "),
      //   }),
      // });

      const response = await api.post(
        `/api/pdf-based-generation`,
        {
          command: `Generate 20 mcq questions with a difficulty level of ${settings?.difficulty === "mixed"
              ? "mix of hard, medium and easy"
              : settings?.difficulty
            } from the following text. Only MCQ questions. additional instructions: ${prompt || "none"}.`,
          description: serverResponse?.replace(/\n/g, " "),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;
      setQuestions({
        is_loaded: true,
        questions: data?.data?.questions,
        title: data?.data?.title,
        totalGenerated: data?.totalGenerated,
        message: data?.message
      });
      setSelectedSetIndex(0);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (loading) {
      const texts = [
        "Analyzing topics...",
        "Generating questions...",
        "Applying AI magic...",
      ];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingText(texts[i % texts.length]);
        i++;
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  // Always enforce 10 MCQ questions
  useEffect(() => {
    setSettings({
      difficulty: "medium",
      numQuestions: 10,
      questionType: "mcq",
    });
  }, []);

  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    difficulty: "medium",
    numQuestions: 10,
    questionType: "mcq",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full space-y-6 text-black"
    >
      <CustomizationPanelPdfBased
        settings={settings}
        setSettings={setSettings}
        isOpen={isCustomizationOpen}
        setIsOpen={setIsCustomizationOpen}
        isDisabled={Questions.is_loaded}
      />

      <FilePond
        name="filepond"
        disabled={Questions.is_loaded}
        server={{
          process: {
            url: `${import.meta.env.VITE_API_URL}/api/upload-pdf`,
            method: "POST",
            withCredentials: true,
            onload: (response) => {
              return response;
            },
          },
          fetch: null,
          revert: null,
        }}
        onprocessfile={(error, file) => {
          if (!Questions.is_loaded && !error && file.serverId) {
            try {
              const parsed = JSON.parse(file.serverId);
              setServerResponse(parsed.textChunk);
            } catch (e) {
              console.error("Invalid JSON from server:", e);
            }
          }
        }}
        className={Questions.is_loaded ? "opacity-60 pointer-events-none" : ""}
      />

      {serverResponse && (
        <div className="p-2 space-y-4">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-medium text-gray-700">
                Additional Instructions
              </label>
            </div>

            <textarea
              className={`w-full p-4 border rounded-xl ${Questions.is_loaded
                  ? "border-gray-200 text-gray-500 bg-gray-50"
                  : "border-gray-300 text-black bg-white"
                }`}
              value={prompt}
              placeholder={"Want to add any additional prompts?"}
              onChange={(e) => !Questions.is_loaded && setPrompt(e.target.value)}
              disabled={Questions.is_loaded}
            />
          </div>
        </div>
      )}

      {serverResponse &&
        (Questions.is_loaded ? (
          <div className="space-y-6">
            {Questions.totalGenerated > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-800">
                  <InfoIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    AI will generate around 20 questions. {Questions.message}
                  </span>
                </div>
              </div>
            )}
            <QuizReview
              title={
                Questions?.title !== ""
                  ? Questions.title
                  : `Generated Quiz - Set ${selectedSetIndex + 1}`
              }
              questions={Questions.questions}
              numQuestions={settings.numQuestions}
            />
          </div>
        ) : (
          <WalletCheck onProceed={handleGenerateQuiz}>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => {
                handleGenerateQuiz();
              }}
              className="w-full py-4 flex items-center justify-center space-x-2 rounded-xl bg-black text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{loadingText}</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Generate Quiz</span>
                </>
              )}
            </motion.button>
          </WalletCheck>
        ))}
    </motion.div>
  );
};

export default PDFQuizGenerator;
