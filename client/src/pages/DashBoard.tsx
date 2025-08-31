import React from "react";
import { Button } from "@mui/material";
import { getImageUrl } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import { Book, Bot, FileText, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import TopicQuizGenerator from "@/components/TopicQuizGenerator";
import PDFQuizGenerator from "@/components/PdfQuizGenerator";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [mode, setMode] = React.useState("topic");

  return (
    <div className="flex text-black flex-col min-h-screen items-center bg-slate-100 p-8 mx-auto">
      <Sidebar />
      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-3xl mx-auto p-8 space-y-12"
        >
          <motion.div
            className="flex items-center justify-center space-x-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* <Bot className="w-8 h-8 text-black" /> */}
            <h1 className="text-4xl font-bold text-black tracking-tight">
              MindMesh AI
            </h1>
            {/* <Sparkles className="w-6 h-6 text-black" /> */}
          </motion.div>

          <div className="flex justify-center space-x-6">
            {["topic", "pdf"].map((buttonMode) => (
              <motion.button
                key={buttonMode}
                onClick={() => setMode(buttonMode)}
                className={`relative px-6 py-3 rounded-xl border ${
                  mode === buttonMode
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-gray-200 hover:border-black"
                } transition-colors duration-200 text-sm`}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-2">
                  {buttonMode === "pdf" ? (
                    <FileText className="w-5 h-5" />
                  ) : (
                    <Book className="w-5 h-5" />
                  )}
                  <span className="capitalize">{buttonMode}Based</span>
                </div>
              </motion.button>
            ))}
          </div>

          <motion.div className="bg-white rounded-2xl shadow-lg p-8" layout>
            <div className="space-y-8">
              <AnimatePresence mode="wait">
                {mode === "topic" ? (
                  <TopicQuizGenerator key="topic" />
                ) : (
                  <PDFQuizGenerator key="pdf" />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
