import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface QuizCreatorProps {
  quizData: any;
  onQuizCreated: (randomUID: string) => void;
}

export function QuizCreator({ quizData, onQuizCreated }: QuizCreatorProps) {
  const [examStartTime, setExamStartTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleCreateQuiz = async () => {
    if (!examStartTime) {
      setError('Please set an exam start time');
      return;
    }

    if (!user?.walletAddress) {
      setError('Wallet not connected');
      return;
    }

    try {
      setIsCreating(true);
      setError('');

      const response = await api.post('/api/quiz/create', {
        questions: quizData.questions,
        title: quizData.topic || 'Generated Quiz',
        examStartTime: new Date(examStartTime).toISOString(),
        duration: duration
      });

      if (response.data.success) {
        onQuizCreated(response.data.randomUID);
      } else {
        setError(response.data.message || 'Failed to create quiz');
      }
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      setError(error.response?.data?.message || 'Failed to create quiz');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold">Create Encrypted Quiz</h3>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="examStartTime">Exam Start Time</Label>
          <Input
            id="examStartTime"
            type="datetime-local"
            value={examStartTime}
            onChange={(e) => setExamStartTime(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            min="1"
            max="480"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <Button 
          onClick={handleCreateQuiz} 
          disabled={isCreating || !examStartTime}
          className="w-full"
        >
          {isCreating ? 'Creating Quiz...' : 'Create Encrypted Quiz'}
        </Button>
      </div>

      <div className="text-xs text-gray-600">
        <p>• Quiz will be encrypted and stored on blockchain</p>
        <p>• Questions will be available only after exam start time</p>
        <p>• 10 question sets (A-J) will be generated randomly</p>
      </div>
    </div>
  );
}
