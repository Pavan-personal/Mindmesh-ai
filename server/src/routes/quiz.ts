import express, { Request, Response } from 'express';
import { QuizService } from '../services/quizService';
import { BlocklockService } from '../services/blocklockService';
import { verifyToken } from '../middlewares/verifyToken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Request to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    walletAddress: string;
    [key: string]: any;
  };
}

const router = express.Router();

// Initialize services without private key - users pay their own gas fees
const blocklockService = new BlocklockService(process.env.RPC_URL || "https://sepolia.base.org");

const quizService = new QuizService(blocklockService);

// Create encrypted quiz
router.post('/create', verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { questions, title, examStartTime, duration } = req.body;
    const walletAddress = req.user?.walletAddress;

    if (!walletAddress) {
      res.status(400).json({
        success: false,
        message: 'User wallet address not found'
      });
      return;
    }

    if (!questions || !title || !examStartTime || !duration) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: questions, title, examStartTime, duration'
      });
      return;
    }

    const result = await quizService.createQuiz(
      questions,
      walletAddress,
      title,
      new Date(examStartTime),
      duration
    );

    if (result.success) {
      res.json({
        success: true,
        randomUID: result.randomUID,
        message: result.message,
        encryptedData: result.encryptedData,
        targetBlock: result.targetBlock
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }

  } catch (error) {
    console.error('Error in quiz creation route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during quiz creation'
    });
  }
});

// Get user quizzes
router.get('/user-quizzes', verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { walletAddress } = req.query;
    
    if (!walletAddress || typeof walletAddress !== 'string') {
      res.status(400).json({ success: false, message: 'Wallet address is required' });
      return;
    }

    const quizzes = await quizService.getUserQuizzes(walletAddress);
    res.json({ success: true, quizzes: quizzes });
  } catch (error: any) {
    console.error('Error in user quizzes route:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user quizzes' });
  }
});

// Get all public quizzes (for QuizPool)
router.get('/all-quizzes', verifyToken, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const quizzes = await quizService.getAllQuizzes();
    res.json({ success: true, quizzes: quizzes });
  } catch (error: any) {
    console.error('Error in all quizzes route:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch all quizzes' });
  }
});

// Update quiz with blocklock encryption data
router.post('/encrypt', verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { randomUID, requestId, ciphertext, targetBlock } = req.body;

    if (!randomUID || !requestId || !ciphertext || !targetBlock) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: randomUID, requestId, ciphertext, targetBlock'
      });
      return;
    }

    const result = await quizService.updateQuizWithBlocklock(randomUID, requestId, ciphertext, targetBlock);

    if (result.success) {
      res.json({
        success: true,
        message: 'Quiz updated with blocklock encryption data'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }

  } catch (error: any) {
    console.error('Error in encrypt route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during encryption update'
    });
  }
});

// Decrypt quiz data (Blocklock + AES)
router.post('/decrypt', verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { randomUID, userWalletAddress, selectedSet } = req.body;

    if (!randomUID || !userWalletAddress || !selectedSet) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: randomUID, userWalletAddress, selectedSet'
      });
      return;
    }

    // Validate selected set (A-G)
    const validSets = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    if (!validSets.includes(selectedSet)) {
      res.status(400).json({
        success: false,
        message: 'Invalid selectedSet. Must be one of: A, B, C, D, E, F, G'
      });
      return;
    }

    const result = await quizService.decryptQuiz(randomUID, userWalletAddress, selectedSet);

    if (result.success) {
      res.json({
        success: true,
        questions: result.questions,
        selectedSet: selectedSet,
        decryptionDetails: result.decryptionDetails,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }

  } catch (error: any) {
    console.error('Error in decrypt route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during decryption'
    });
  }
});

// Get quiz questions based on selected set
router.post('/get-questions', verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { randomUID, selectedSet } = req.body;

    if (!randomUID || !selectedSet) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: randomUID, selectedSet'
      });
      return;
    }

    // Validate selected set (A-J)
    const validSets = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    if (!validSets.includes(selectedSet)) {
      res.status(400).json({
        success: false,
        message: 'Invalid selectedSet. Must be one of: A, B, C, D, E, F, G, H, I, J'
      });
      return;
    }

    const result = await quizService.getQuizQuestions(randomUID, selectedSet);

    if (result.success) {
      res.json({
        success: true,
        questions: result.questions,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }

  } catch (error) {
    console.error('Error in get questions route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving questions'
    });
  }
});

// Store quiz attempt
router.post('/attempt', async (req: Request, res: Response): Promise<void> => {
  try {
    const { quizUID, selectedSet, answers, score, totalQuestions, ipfsHash, attemptData } = req.body;

    if (!quizUID || !selectedSet || !answers || score === undefined || !totalQuestions || !ipfsHash || !attemptData) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
      return;
    }

    // Find the quiz
    const quiz = await prisma.quiz.findUnique({
      where: { randomUID: quizUID }
    });

    if (!quiz) {
      res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
      return;
    }

    // Create the attempt record
    const attempt = await prisma.attemptedQuiz.create({
      data: {
        quizId: quiz.id,
        userWalletAddress: req.body.userWalletAddress || 'unknown',
        selectedSet,
        answers,
        score,
        totalQuestions,
        ipfsHash,
        attemptData
      },
      include: {
        quiz: {
          select: {
            title: true,
            randomUID: true
          }
        }
      }
    });

    console.log('Quiz attempt stored successfully:', {
      quizUID,
      score,
      ipfsHash: ipfsHash.slice(0, 10) + '...',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Quiz attempt stored successfully',
      attempt
    });

  } catch (error: any) {
    console.error('Error storing quiz attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store quiz attempt',
      error: error.message
    });
  }
});

// Get user's attempted quizzes
router.get('/attempts/:walletAddress', async (req: Request, res: Response): Promise<void> => {
  try {
    const { walletAddress } = req.params;

    const attempts = await prisma.attemptedQuiz.findMany({
      where: { userWalletAddress: walletAddress },
      include: {
        quiz: {
          select: {
            title: true,
            randomUID: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.json({
      success: true,
      attempts
    });

  } catch (error: any) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz attempts',
      error: error.message
    });
  }
});

// Get transaction price for blocklock encryption
router.get('/transaction-price', verifyToken, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const price = await blocklockService.calculateTransactionPrice();
    
    res.json({
      success: true,
      price: price,
      currency: 'ETH'
    });
  } catch (error) {
    console.error('Error getting transaction price:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction price'
    });
  }
});

export default router;
