import React, { useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { ArrowRight } from "lucide-react";
import { QuizConfigDialog } from "./QuizConfigDialog";

const CodeBlock = ({ code }: { code: string }) => {
  const firstLine = code.split("\n")[0];
  const codeSnippet = code.split("\n").slice(1).join("\n");
  return (
    <Box className="w-full my-4 rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
      <Box className="px-4 py-2 bg-gray-100 border-b border-gray-200">
        <Typography className="text-sm text-gray-600">{firstLine}</Typography>
      </Box>
      <Box className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono whitespace-pre-wrap">
          {codeSnippet}
        </pre>
      </Box>
    </Box>
  );
};

const QuestionCard = ({
  question,
  index,
}: {
  question: {
    question: any;
    options: any;
    answer: number;
    type: string;
  };
  index: number;
}) => {
  const renderContent = (
    content:
      | string
      | { text: string; code?: string; assertion?: string; reason?: string }
  ) => {
    if (typeof content === "string") return content;
    return (
      <>
        {content.text && (
          <Typography className="mb-4">{content.text}</Typography>
        )}
        {content.code && <CodeBlock code={content.code} />}
        {content.assertion && (
          <Box className="space-y- mb-4">
            <Typography className="font-normal">
              Statement: {content.assertion}
            </Typography>
            <Typography className="font-normal mt-4">
              Reason: {content.reason}
            </Typography>
          </Box>
        )}
      </>
    );
  };

  const renderOptions = (
    options: string | { text: string; code?: string }[],
    type: string
  ) => {
    return Array.isArray(options) ? (
      options.map((option, i) => (
        <Box
          key={i}
          className={`p-4 border border-gray-200 rounded-lg mb-2 ${
            i === question.answer ? "bg-gray-100 border-gray-300" : ""
          }`}
        >
          <Typography className="flex items-start">
            <span className="font-medium mr-2">
              {String.fromCharCode(65 + i)}.
            </span>
            {typeof option === "string" ? (
              option
            ) : typeof option === "boolean" ? (
              JSON.stringify(option).replace('"', "")
            ) : (
              <>
                {option.text && !option?.code && <span>{option.text}</span>}
                {option.code && <CodeBlock code={option.code} />}
              </>
            )}
          </Typography>
        </Box>
      ))
    ) : (
      <Typography>{options}</Typography>
    );
  };

  return (
    <Paper className="p-6 mb-6 rounded-xl border border-gray-200">
      <Typography className="text-lg font-medium mb-2">
        Question {index + 1} ({question.type.toUpperCase()})
      </Typography>
      <Box className="mb-6">{renderContent(question.question)}</Box>
      <Box className="space-y-2">
        {renderOptions(question.options, question.type)}
      </Box>
    </Paper>
  );
};

const QuizReview = ({
  questions,
  title,
  numQuestions,
}: {
  questions: { question: any; options: any; answer: number; type: string }[];
  title: string;
  numQuestions: number;
}) => {
  const [configOpen, setConfigOpen] = useState(false);
  const [quizMode, setQuizMode] = useState("online");

  const handleProceed = () => {
    setConfigOpen(true);
  };

  const handleConfigSubmit = () => {
    if (quizMode === "offline") {
      // Handle PDF generation
      console.log("Generating PDF...");
    } else {
      // Handle quiz scheduling
      console.log("Scheduling quiz...");
    }
    setConfigOpen(false);
  };

  return (
    <Box className="max-w-4xl mx-auto py-8">
      <Box className="flex justify-between items-center mb-8">
        <Typography className="text-2xl text-slate-600 font-semibold">
          Review your questions
        </Typography>
        <button
          onClick={handleProceed}
          className="bg-black text-white hover:bg-gray-900 flex items-center px-4 py-2 rounded-lg"
        >
          Proceed <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </Box>

      <Box className="space-y-6">
        {questions?.map((question, index) => (
          <QuestionCard key={index} question={question} index={index} />
        ))}
      </Box>
      <QuizConfigDialog
        title={title ? title : "Quiz Exam"}
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        questions={questions}
        numQuestions={numQuestions}
      />
    </Box>
  );
};

export default QuizReview;
