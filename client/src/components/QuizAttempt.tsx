import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, XCircle, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadTextToIPFS, getIPFSDisplayURL } from '@/lib/ipfs';
import { api } from '@/lib/api';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizAttemptProps {
  quiz: {
    randomUID: string;
    title: string;
    questions: Question[];
    selectedSet: string;
  };
  userWalletAddress: string;
  onComplete: (result: any) => void;
  onClose: () => void;
}

export default function QuizAttempt({ quiz, userWalletAddress, onComplete, onClose }: QuizAttemptProps) {
  // Error boundary state
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Error boundary effect
  useEffect(() => {
    const handleError = (error: Error) => {
      console.error('QuizAttempt error:', error);
      setHasError(true);
      setErrorMessage(error.message);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // If there's an error, show error UI
  if (hasError) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Quiz Error</h2>
        <p className="text-gray-600 mb-4">Something went wrong while loading the quiz.</p>
        <p className="text-sm text-gray-500 mb-4">{errorMessage}</p>
        <Button onClick={onClose} variant="outline">
          Close Quiz
        </Button>
      </div>
    );
  }
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [ipfsHash, setIpfsHash] = useState<string>('');
  const { toast } = useToast();

  // Validate quiz data structure
  useEffect(() => {
    if (!quiz || !quiz.questions || !Array.isArray(quiz.questions)) {
      console.error('Invalid quiz data:', quiz);
      toast({
        title: "Invalid Quiz Data",
        description: "Quiz data is corrupted. Please try again.",
        variant: "destructive",
      });
      onClose();
      return;
    }

    // Log the first question to debug structure
    console.log('Quiz validation - First question:', quiz.questions[0]);
    console.log('Quiz validation - Questions array length:', quiz.questions.length);
  }, [quiz, onClose, toast]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !showResults) {
      handleSubmit();
    }
  }, [timeLeft, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const calculateScore = (): number => {
    let correct = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const handleSubmit = async () => {
    if (answers.filter(a => a !== undefined).length < quiz.questions.length) {
      toast({
        title: "Incomplete Quiz",
        description: "Please answer all questions before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare attempt data for IPFS
      const attemptData = {
        quizUID: quiz.randomUID,
        quizTitle: quiz.title,
        selectedSet: quiz.selectedSet,
        userWalletAddress: userWalletAddress || 'unknown',
        submittedAt: new Date().toISOString(),
        questions: quiz.questions.map((q, index) => ({
          question: q.question,
          options: q.options,
          userAnswer: answers[index],
          correctAnswer: q.correctAnswer,
          isCorrect: answers[index] === q.correctAnswer
        })),
        answers: answers,
        metadata: {
          totalQuestions: quiz.questions.length,
          answeredQuestions: answers.filter(a => a !== undefined).length,
          timeSpent: 30 * 60 - timeLeft, // seconds
          timestamp: Date.now()
        }
      };

      // Upload to IPFS
      const filename = `quiz-attempt-${quiz.randomUID}-${Date.now()}.json`;
      const ipfsHash = await uploadTextToIPFS(JSON.stringify(attemptData, null, 2), filename);
      setIpfsHash(ipfsHash);

      // Calculate score
      const finalScore = calculateScore();
      setScore(finalScore);

      // Store attempt in database
      const response = await api.post('/api/quiz/attempt', {
        quizUID: quiz.randomUID,
        selectedSet: quiz.selectedSet,
        userWalletAddress: userWalletAddress,
        answers: JSON.stringify(answers),
        score: finalScore,
        totalQuestions: quiz.questions.length,
        ipfsHash: ipfsHash,
        attemptData: JSON.stringify(attemptData)
      });

      if (response.data.success) {
        toast({
          title: "Quiz Submitted Successfully!",
          description: `Score: ${finalScore}% | Stored on IPFS`,
          variant: "default",
        });

        setShowResults(true);
        
        // Call onComplete with results
        onComplete({
          score: finalScore,
          ipfsHash,
          attemptData: response.data.attempt
        });
      } else {
        throw new Error(response.data.message);
      }

    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredCount = answers.filter(a => a !== undefined).length;

  // Debug logging to help identify data structure issues
  console.log('Current question data:', currentQuestion);
  console.log('Question type:', typeof currentQuestion?.question);
  console.log('Options type:', typeof currentQuestion?.options);
  console.log('First option:', currentQuestion?.options?.[0]);

  // Safety check for currentQuestion
  if (!currentQuestion || !currentQuestion.question || !currentQuestion.options) {
    console.error('Invalid current question:', currentQuestion);
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Quiz Data Error</h2>
        <p className="text-gray-600 mb-4">The quiz data is corrupted or incomplete.</p>
        <Button onClick={onClose} variant="outline">
          Close Quiz
        </Button>
      </div>
    );
  }

  if (showResults) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto p-6"
      >
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-4">
              Quiz Completed! 🎉
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-600">{score}%</div>
                <div className="text-lg text-gray-600">Score</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">{answeredCount}</div>
                <div className="text-lg text-gray-600">Questions Answered</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">IPFS Storage Details</h3>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>Stored on IPFS:</span>
                <a 
                  href={getIPFSDisplayURL(ipfsHash)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-mono"
                >
                  {ipfsHash.slice(0, 10)}...{ipfsHash.slice(-8)}
                </a>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button onClick={() => onComplete({ score, ipfsHash })} variant="default">
                View Dashboard
              </Button>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">{quiz.title}</h1>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-gray-700 text-white border-gray-600">
              Set {quiz.selectedSet}
            </Badge>
            <Badge variant="secondary" className="bg-blue-600 text-white">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(timeLeft)}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span>{answeredCount}/{quiz.questions.length} answered</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-6 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">
            Question {currentQuestionIndex + 1}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white text-lg">
            {typeof currentQuestion.question === 'object' && currentQuestion.question?.text 
              ? currentQuestion.question.text 
              : currentQuestion.question}
          </p>

          <RadioGroup
            value={answers[currentQuestionIndex]?.toString() || ''}
            onValueChange={(value) => handleAnswerSelect(parseInt(value))}
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} className="text-blue-500" />
                <Label 
                  htmlFor={`option-${index}`}
                  className="text-base cursor-pointer text-white hover:text-blue-400 transition-colors"
                >
                  {typeof option === 'object' && option?.text ? option.text : option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          variant="outline"
          className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
        >
          Previous
        </Button>

        <div className="flex space-x-2">
          {quiz.questions.map((_, index) => (
            <Button
              key={index}
              onClick={() => goToQuestion(index)}
              variant={answers[index] !== undefined ? "default" : "outline"}
              size="sm"
              className={`w-10 h-10 p-0 ${
                answers[index] !== undefined 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
              }`}
            >
              {index + 1}
            </Button>
          ))}
        </div>

        {currentQuestionIndex < quiz.questions.length - 1 ? (
          <Button onClick={nextQuestion} variant="default" className="bg-blue-600 hover:bg-blue-700">
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || answeredCount < quiz.questions.length}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Quiz
              </>
            )}
          </Button>
        )}
      </div>

      {/* Time Warning */}
      {timeLeft < 300 && timeLeft > 0 && (
        <div className="mt-4 p-3 bg-yellow-900 border border-yellow-600 rounded-lg">
          <div className="flex items-center space-x-2 text-yellow-200">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Time is running out! Only {formatTime(timeLeft)} remaining.</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
