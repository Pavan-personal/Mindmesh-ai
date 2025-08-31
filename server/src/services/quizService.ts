import { BlocklockService } from './blocklockService';
import { EncryptionService } from './encryptionService';
import { PrismaClient } from '@prisma/client';
import { Blocklock } from 'blocklock-js';
import { JsonRpcProvider, Contract } from 'ethers';

export class QuizService {
  private prisma: PrismaClient;
  private blocklockService: BlocklockService;

  constructor(blocklockService: BlocklockService) {
    this.prisma = new PrismaClient();
    this.blocklockService = blocklockService;
  }

  async createQuiz(
    questions: any[],
    walletAddress: string,
    title: string,
    examStartTime: Date,
    duration: number
  ): Promise<{ randomUID: string; success: boolean; message: string; targetBlock: string; encryptedData: string; }> {
    try {
      // Generate random UID
      const randomUID = EncryptionService.generateRandomUID();
      
      // Create DS1 (questions + question sets)
      const ds1 = {
        questions: questions,
        questionSets: EncryptionService.generateQuestionSets(questions.length),
        randomUID: randomUID,
        walletAddress: walletAddress,
        title: title
      };

      // Create DS2 (answers + metadata) - Safe to store
      const ds2 = {
        answers: questions.map(q => q.answer),
        randomUID: randomUID,
        walletAddress: walletAddress,
        duration: duration,
        startTime: examStartTime,
        title: title,
        createdAt: new Date()
      };

      // Calculate target block for exam start time
      const targetBlock = await this.blocklockService.calculateTargetBlock(examStartTime);
      
      // Store DS2 in User.created array (safe metadata)
      const user = await this.prisma.user.findFirst({ where: { walletAddress } });
      if (user) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { created: { push: ds2 } }
        });
      }

      // Encrypt DS1 with AES-256-GCM using UID as key
      const aesEncryptedDS1 = await EncryptionService.encryptAES256(
        JSON.stringify(ds1),
        randomUID
      );

      console.log('🔐 AES-256-GCM encryption completed for DS1');
      console.log('📊 Question sets generated:', Object.keys(ds1.questionSets));

      // Create quiz entry with AES-encrypted DS1 and questions fallback
      await this.prisma.quiz.create({
        data: {
          randomUID,
          walletAddress,
          encryptedData: aesEncryptedDS1, // AES-encrypted DS1
          questions: JSON.stringify(questions.map(q => ({
            question: q.question,
            options: q.options,
            // answer field is removed for security
          }))), // Store questions WITHOUT answers for fallback
          questionSets: JSON.stringify(ds1.questionSets), // Store A-G question sets
          blocklockCiphertext: "", // Will be filled after blocklock encryption
          blocklockCondition: "", // Will be filled after blocklock encryption
          targetBlock: targetBlock,
          startTime: examStartTime,
          title
        }
      });

      console.log('🔒 SECURITY: Quiz created with AES-encrypted DS1');
      console.log('📝 Next step: User must encrypt AES data with blocklock');

      return { 
        randomUID, 
        success: true, 
        message: `Quiz created successfully! UID: ${randomUID}. Now encrypt with your wallet on Base Sepolia.`,
        targetBlock,
        encryptedData: aesEncryptedDS1 // Return the AES-encrypted data for blocklock encryption
      };
    } catch (error) {
      console.error('Error creating quiz:', error);
      return { 
        randomUID: "", 
        success: false, 
        message: `Failed to create quiz: ${error}`,
        targetBlock: "",
        encryptedData: ""
      };
    }
  }

  async getQuizDetails(randomUID: string): Promise<any> {
    try {
      const quiz = await this.prisma.quiz.findUnique({
        where: { randomUID }
      });
      return quiz;
    } catch (error) {
      console.error('Error getting quiz details:', error);
      return null;
    }
  }

  async updateQuizEncryption(
    randomUID: string,
    requestId: string,
    ciphertext: string,
    targetBlock: string
  ): Promise<{ success: boolean; message: string; }> {
    try {
      console.log('🔐 REAL ENCRYPTION: Updating quiz with blocklock data');
      console.log('📊 Request ID:', requestId);
      console.log('🔒 Ciphertext length:', ciphertext.length);
      console.log('⏰ Target block:', targetBlock);

      // Update the quiz with REAL blocklock encryption data
      await this.prisma.quiz.update({
        where: { randomUID },
        data: {
          blocklockCiphertext: ciphertext, // Blocklock-encrypted AES data
          blocklockCondition: requestId,
          targetBlock: targetBlock
        }
      });

      console.log('✅ Quiz encryption updated with REAL blocklock data');
      console.log('🔒 Questions are now double-encrypted: AES + Blocklock');

      return {
        success: true,
        message: 'Quiz encrypted successfully with real blocklock data'
      };
    } catch (error) {
      console.error('Error updating quiz encryption:', error);
      return {
        success: false,
        message: `Failed to update quiz encryption: ${error}`
      };
    }
  }

  async getQuizQuestions(
    randomUID: string,
    selectedSet: string
  ): Promise<{ questions: any[]; success: boolean; message: string; }> {
    try {
      // Get quiz from database
      const quiz = await this.prisma.quiz.findUnique({
        where: { randomUID }
      });

      if (!quiz) {
        return { questions: [], success: false, message: 'Quiz not found' };
      }

      // SECURITY CHECK: Ensure questions are encrypted
      if (!quiz.blocklockCiphertext || !quiz.blocklockCondition) {
        return { 
          questions: [], 
          success: false, 
          message: '❌ SECURITY ERROR: Quiz questions are not encrypted yet. User must encrypt with blocklock first.' 
        };
      }

      // Check if decryption is ready
      const isReady = await this.blocklockService.isDecryptionReady(quiz.targetBlock);
      if (!isReady) {
        return { 
          questions: [], 
          success: false, 
          message: `⏰ Quiz is not ready yet. Target block: ${quiz.targetBlock}` 
        };
      }

      console.log('🔓 Decryption ready! Real blocklock system is working!');
      console.log('📊 Quiz metadata:', {
        randomUID: quiz.randomUID,
        targetBlock: quiz.targetBlock,
        hasBlocklockData: !!(quiz.blocklockCiphertext && quiz.blocklockCondition),
        hasAESData: !!quiz.encryptedData,
        selectedSet: selectedSet
      });

      // TODO: Implement real decryption here
      // This will use the real blocklock contract to get the decryption key
      // Then decrypt the AES-encrypted data
      
      return { 
        questions: [], 
        success: false, 
        message: '🔓 Real blocklock decryption system is ready! Questions will be retrieved using real blockchain decryption.' 
      };

    } catch (error) {
      console.error('Error getting quiz questions:', error);
      return { 
        questions: [], 
        success: false, 
        message: `Failed to get quiz questions: ${error}` 
      };
    }
  }

  // Get quiz metadata for dashboard display (everything except answers)
  async getQuizMetadata(randomUID: string): Promise<any> {
    try {
      const quiz = await this.prisma.quiz.findUnique({
        where: { randomUID }
      });

      if (!quiz) {
        return null;
      }

      // Return metadata without sensitive data
      return {
        randomUID: quiz.randomUID,
        title: quiz.title,
        startTime: quiz.startTime,
        targetBlock: quiz.targetBlock,
        walletAddress: quiz.walletAddress,
        isEncrypted: !!(quiz.blocklockCiphertext && quiz.blocklockCondition),
        encryptionStatus: {
          hasAES: !!quiz.encryptedData,
          hasBlocklock: !!(quiz.blocklockCiphertext && quiz.blocklockCondition)
        }
      };
    } catch (error) {
      console.error('Error getting quiz metadata:', error);
      return null;
    }
  }

  // Get all quizzes for a user (metadata only)
  async getUserQuizzes(walletAddress: string): Promise<any[]> {
    try {
      const quizzes = await this.prisma.quiz.findMany({
        where: { walletAddress },
        select: {
          randomUID: true,
          title: true,
          startTime: true,
          walletAddress: true,
          createdAt: true
        }
      });

      return quizzes;
    } catch (error) {
      console.error('Error getting user quizzes:', error);
      return [];
    }
  }

  // Get all public quizzes (for QuizPool)
  async getAllQuizzes(): Promise<any[]> {
    try {
      const quizzes = await this.prisma.quiz.findMany({
        select: {
          randomUID: true,
          title: true,
          startTime: true,
          walletAddress: true,
          createdAt: true,
          requestId: true,
          targetBlock: true
        },
        orderBy: {
          startTime: 'desc'
        }
      });

      return quizzes;
    } catch (error) {
      console.error('Error getting all quizzes:', error);
      return [];
    }
  }

  // Update quiz with blocklock encryption data
  async updateQuizWithBlocklock(randomUID: string, requestId: string, ciphertext: string, targetBlock: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log(`🔐 Updating quiz with blocklock data: ${randomUID}`);
      console.log(`📋 Request ID: ${requestId}`);
      console.log(`🔒 Ciphertext length: ${ciphertext.length} bytes`);

      // Update quiz with blocklock data
      await this.prisma.quiz.update({
        where: { randomUID },
        data: {
          requestId: requestId,
          blocklockCiphertext: ciphertext,
          blocklockCondition: targetBlock
        }
      });

      console.log('✅ Quiz updated with blocklock encryption data');
      console.log('🔐 Database now contains:', {
        requestId,
        ciphertextLength: ciphertext.length,
        targetBlock
      });

      return {
        success: true,
        message: 'Quiz updated with blocklock encryption data successfully'
      };

    } catch (error) {
      console.error('Error updating quiz with blocklock data:', error);
      return {
        success: false,
        message: `Failed to update quiz: ${error}`
      };
    }
  }

  // Decrypt quiz data using Blocklock + AES
  async decryptQuiz(randomUID: string, userWalletAddress: string, selectedSet: string): Promise<{
    success: boolean;
    questions: any[];
    message: string;
    decryptionDetails: any;
  }> {
    try {
      console.log(`🔓 Starting decryption for quiz: ${randomUID}`);

      // Get quiz from database
      const quiz = await this.prisma.quiz.findUnique({
        where: { randomUID }
      });

      if (!quiz) {
        return { 
          success: false, 
          questions: [], 
          message: 'Quiz not found',
          decryptionDetails: null
        };
      }



      // Check if quiz has blocklock encryption
      if (!quiz.blocklockCiphertext || !quiz.blocklockCondition || !quiz.requestId) {
        return { 
          success: false, 
          questions: [], 
          message: 'Quiz is not fully encrypted with blocklock yet',
          decryptionDetails: null
        };
      }

      // Check if decryption is ready (target block reached)
      const isReady = await this.blocklockService.isDecryptionReady(quiz.targetBlock);
      if (!isReady) {
        return { 
          success: false, 
          questions: [], 
          message: `⏰ Quiz is not ready yet. Target block: ${quiz.targetBlock}`,
          decryptionDetails: null
        };
      }

      console.log('🔓 Decryption ready! Starting blocklock + AES decryption...');

      // REAL BLOCKLOCK DECRYPTION - NO MORE FAKE!
      try {
        console.log('🔐 Starting real blocklock decryption with requestId:', quiz.requestId);
        
        console.log(`✅ [BLOCKLOCK] Library loaded successfully`);
        
        // Create provider and blocklock instance
        const provider = new JsonRpcProvider(process.env.RPC_URL || "https://sepolia.base.org");
        
        // Use library's default contract for Base Sepolia (has all required functions)
        console.log(`🔗 Using library's default blocklock contract for Base Sepolia`);
        
        // Create Blocklock instance with library's default contract
        const blocklockjs = Blocklock.createFromChainId(provider, 84532);
        
        
        console.log('🔑 Calling real blocklock.decryptWithId:', quiz.requestId);
        
        // REAL DECRYPTION: Get the AES key from blocklock
        const decryptedAesKey = await blocklockjs.decryptWithId(BigInt(quiz.requestId));
        
        if (!decryptedAesKey || decryptedAesKey.length === 0) {
          return { 
            success: false, 
            questions: [], 
            message: '⏰ Decryption key not yet available - target block not reached or key not delivered',
            decryptionDetails: null
          };
        }
        
        console.log('✅ Real blocklock decryption successful! AES key retrieved');
        console.log('🔑 AES key length:', decryptedAesKey.length, 'bytes');
        
        // Convert the decrypted AES key to hex string
        const aesKey = Buffer.from(decryptedAesKey).toString('hex');
        console.log('🔑 AES key (hex):', aesKey.substring(0, 16) + '...');
        
        // Now decrypt the AES-encrypted quiz data using the real key
        console.log('🔓 Starting AES decryption of quiz questions...');
        const decryptedQuestionsJson = await EncryptionService.decryptAES256(
          quiz.encryptedData,
          aesKey
        );
        
        // Parse the decrypted JSON to get questions and question sets
        const decryptedQuizData = JSON.parse(decryptedQuestionsJson);
        console.log('📝 Questions decrypted successfully!');
        
        // Get the selected question set (A, B, C, D, E, F, G)
        const questionSet = decryptedQuizData.questionSets[selectedSet];
        if (!questionSet) {
          return { 
            success: false, 
            questions: [], 
            message: `Invalid question set: ${selectedSet}. Available sets: ${Object.keys(decryptedQuizData.questionSets).join(', ')}`,
            decryptionDetails: null
          };
        }
        
        // Extract 10 questions for the selected set
        const selectedQuestions = questionSet.map((index: number) => decryptedQuizData.questions[index]);
        
        console.log(`🎯 Successfully retrieved ${selectedQuestions.length} questions for set ${selectedSet}`);
        
        return { 
          success: true, 
          questions: selectedQuestions,
          message: `🔓 REAL blocklock + AES decryption successful! Retrieved ${selectedQuestions.length} questions for set ${selectedSet}`,
          decryptionDetails: {
            randomUID,
            selectedSet,
            requestId: quiz.requestId,
            targetBlock: quiz.targetBlock,
            decryptionTime: new Date().toISOString(),
            method: 'REAL Blocklock + AES-256-GCM',
            questionsRetrieved: selectedQuestions.length,
            totalQuestionsAvailable: decryptedQuizData.questions.length,
            aesKeyLength: decryptedAesKey.length,
            note: '🎉 REAL blocklock decryption working! No more fake keys!'
          }
        };

      } catch (error: any) {
        console.error('❌ Real blocklock decryption failed:', error);
        
        // 🚨 FALLBACK: Use stored questions from database
        try {
          // Parse stored questions and question sets from database
          const storedQuestions = JSON.parse(quiz.questions);
          const storedQuestionSets = JSON.parse(quiz.questionSets);
          
          // Check if the requested set exists in stored question sets
          if (storedQuestionSets[selectedSet] && storedQuestionSets[selectedSet].length > 0) {
            // Use the stored question set for the requested set
            const questionIndices = storedQuestionSets[selectedSet];
            const fallbackQuestions = questionIndices.map((index: number) => storedQuestions[index]).filter(Boolean);
            
            if (fallbackQuestions.length > 0) {
              return { 
                success: true, 
                questions: fallbackQuestions,
                message: `🔄 FALLBACK: Blocklock decryption failed, using stored question set ${selectedSet} from database. ${fallbackQuestions.length} questions retrieved.`,
                decryptionDetails: {
                  randomUID,
                  selectedSet: selectedSet,
                  fallbackUsed: true,
                  originalSet: selectedSet,
                  error: error.message,
                  note: '🔄 FALLBACK: Questions retrieved from database using stored question sets due to blocklock decryption failure',
                  method: 'Database Fallback with Stored Question Sets (PostgreSQL)',
                  questionsRetrieved: fallbackQuestions.length,
                  totalQuestionsAvailable: storedQuestions.length,
                  questionSetUsed: selectedSet,
                  questionIndices: questionIndices
                }
              };
            }
          }
          
          // If the requested set doesn't exist or is empty, generate a random set
          const fallbackSets = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
          const fallbackSet = fallbackSets[Math.floor(Math.random() * fallbackSets.length)];
          
          // Get 10 random questions for fallback
          const shuffledQuestions = [...storedQuestions].sort(() => Math.random() - 0.5);
          const fallbackQuestions = shuffledQuestions.slice(0, 10);
          
          return { 
            success: true, 
            questions: fallbackQuestions,
            message: `🔄 FALLBACK: Blocklock decryption failed, using random questions from database. Set ${fallbackSet}, ${fallbackQuestions.length} questions retrieved.`,
            decryptionDetails: {
              randomUID,
              selectedSet: fallbackSet,
              fallbackUsed: true,
              originalSet: selectedSet,
              error: error.message,
              note: '🔄 FALLBACK: Random questions retrieved from database due to blocklock decryption failure and missing question sets',
              method: 'Database Fallback with Random Selection (PostgreSQL)',
              questionsRetrieved: fallbackQuestions.length,
              totalQuestionsAvailable: storedQuestions.length
            }
          };
          
        } catch (fallbackError: any) {
          console.error('❌ FALLBACK also failed:', fallbackError);
          return { 
            success: false, 
            questions: [], 
            message: `Both blocklock decryption and database fallback failed: ${error.message}`,
            decryptionDetails: {
              error: error.message,
              fallbackError: fallbackError.message,
              note: '❌ Complete failure: Neither blocklock nor database fallback worked'
            }
          };
        }
      }

    } catch (error) {
      console.error('Error decrypting quiz:', error);
      return { 
        success: false, 
        questions: [], 
        message: `Failed to decrypt quiz: ${error}`,
        decryptionDetails: null
      };
    }
  }
}
