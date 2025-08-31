import { useEffect, useState } from "react";
import CustomizationPanelTopicBased from "./CustomisationPanelPDF";
import { TextField } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { InfoIcon, Loader2, Search, Send, X } from "lucide-react";
import QuizReview from "./QuizReview";
import { api } from "@/lib/api";
import { WalletCheck } from "./WalletCheck";

type Settings = {
  difficulty: string;
  numQuestions: number;
  questionType: string;
};

const TopicQuizGenerator = () => {
  const [keyword, setKeyword] = useState("");
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [prompt, setPrompt] = useState("");
  const [Questions, setQuestions] = useState({
    is_loaded: false,
    questions: [],
    topic: "",
    totalGenerated: 0,
    message: ""
  });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/generate-topics?keyword=${encodeURIComponent(keyword)}`
      );
      const data = response.data;
      setTopics(data.keywords || []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const generateQuestions = async () => {
    setLoading(true);
    try {
      const response = await api.post(
        `/api/topic-based-generation`,
        {
          keyword: keyword,
          topics: selectedTopics,
          ...settings,
          prompt,
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
        questions: data.questions,
        topic: data.topic,
        totalGenerated: data.totalGenerated,
        message: data.message
      });
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
      className="w-full space-y-6"
    >
      <CustomizationPanelTopicBased
        settings={settings}
        setSettings={setSettings}
        isOpen={isCustomizationOpen}
        setIsOpen={setIsCustomizationOpen}
        isDisabled={Questions.is_loaded}
      />
      <div className="space-y-4">
        <TextField
          fullWidth
          variant="outlined"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Enter a topic..."
          disabled={Questions.is_loaded}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: Questions.is_loaded ? "#f5f5f5" : "white",
              "&:hover fieldset": {
                borderColor: Questions.is_loaded ? "rgba(0, 0, 0, 0.15)" : "black",
              },
              "&.Mui-focused fieldset": {
                borderColor: Questions.is_loaded ? "rgba(0, 0, 0, 0.15)" : "black",
              },
            },
          }}
          InputProps={{
            endAdornment: (
              <motion.button
                onClick={handleSearch}
                disabled={loading || Questions.is_loaded}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  Questions.is_loaded 
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed" 
                    : "bg-black text-white hover:bg-gray-800"
                }`}
                whileHover={Questions.is_loaded ? {} : { scale: 1.05 }}
                whileTap={Questions.is_loaded ? {} : { scale: 0.95 }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </motion.button>
            ),
          }}
        />

        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {topics.map((topic, index) => (
                              <motion.button
                  key={topic}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() =>
                    !Questions.is_loaded &&
                    setSelectedTopics((prev) =>
                      prev.includes(topic)
                        ? prev.filter((t) => t !== topic)
                        : [...prev, topic]
                    )
                  }
                  disabled={Questions.is_loaded}
                  className={`px-4 py-2 rounded-full border transition-all duration-200 ${
                    Questions.is_loaded
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : selectedTopics.includes(topic)
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-gray-200 hover:border-black"
                  }`}
                >
                  {topic}
                  {selectedTopics.includes(topic) && !Questions.is_loaded && (
                    <X className="w-4 h-4 ml-2 inline" />
                  )}
                </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {selectedTopics.length > 0 && (
        <div className="p-2 space-y-4">
          <textarea
            className={`w-full p-4 border rounded-xl ${
              Questions.is_loaded 
                ? "border-gray-200 text-gray-500 bg-gray-50" 
                : "border-gray-300 text-black bg-white"
            }`}
            value={prompt}
            placeholder="Want to add any additional prompts"
            onChange={(e) => !Questions.is_loaded && setPrompt(e.target.value)}
            disabled={Questions.is_loaded}
          />
        </div>
      )}

      {selectedTopics.length > 0 &&
        (Questions.is_loaded ? (
          <>
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
              title={keyword}
              questions={Questions.questions}
              numQuestions={settings.numQuestions}
            />
          </>
        ) : (
          <WalletCheck onProceed={generateQuestions}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <motion.button
                onClick={generateQuestions}
                disabled={loading}
                className="w-full py-4 bg-black text-white rounded-xl flex items-center justify-center space-x-2"
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
            </motion.div>
          </WalletCheck>
        ))}

      {}
    </motion.div>
  );
};

export default TopicQuizGenerator;
