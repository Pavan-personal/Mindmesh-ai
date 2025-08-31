import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  CheckCircle, 
  Lock, 
  Unlock, 
  FileText, 
  Calendar,
  Hash,
  Wallet,
  Users,
  Eye,
  RefreshCw
} from 'lucide-react';
import { ethers, getBytes } from 'ethers';
import { Randomness } from 'randomness-js';
import { useWriteContract, useAccount, useConfig } from 'wagmi';
import { waitForTransactionReceipt } from '@wagmi/core';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/lib/vrfConfig';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import Sidebar from '@/components/Sidebar';
import QuizAttempt from '@/components/QuizAttempt';

interface Quiz {
  randomUID: string;
  title: string;
  startTime: string;
  walletAddress: string;
  createdAt: string;
  targetBlock?: string;
}

export default function QuizDashboard() {
  const { user } = useAuth();
  const { isConnected, address } = useAccount();
  const { writeContract } = useWriteContract();
  const config = useConfig();
  const { toast } = useToast();
  
  const [userQuizzes, setUserQuizzes] = useState<Quiz[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decrypting, setDecrypting] = useState<string | null>(null);
  const [blockStatus, setBlockStatus] = useState<{ [key: string]: { ready: boolean; currentBlock: string; targetBlock: string; blocksRemaining: number } }>({});
  const [attemptingQuiz, setAttemptingQuiz] = useState<{ quiz: any; questions: any[]; selectedSet: string } | null>(null);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState<any[]>([]);

  useEffect(() => {
    if (user?.walletAddress) {
      console.log('🔄 User wallet changed, fetching data for:', user.walletAddress);
      setLoading(true);
      fetchUserQuizzes();
      fetchAllQuizzes();
      fetchAttemptedQuizzes();
    }
  }, [user?.walletAddress]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('📊 Current state:', {
      userWallet: user?.walletAddress,
      attemptedQuizzesCount: attemptedQuizzes.length,
      attemptedQuizzes: attemptedQuizzes
    });
  }, [user?.walletAddress, attemptedQuizzes]);

  const fetchUserQuizzes = async () => {
    try {
      const response = await api.get(`/api/quiz/user-quizzes?walletAddress=${user?.walletAddress}`);
      
      if (response.data.success) {
        setUserQuizzes(response.data.quizzes);
        // Check block status for each quiz
        response.data.quizzes.forEach((quiz: Quiz) => {
          if (quiz.targetBlock) {
            checkBlockStatus(quiz.randomUID, quiz.targetBlock);
          }
        });
      } else {
        setError('Failed to fetch user quizzes');
      }
    } catch (error: any) {
      console.error('Error fetching user quizzes:', error);
      setError('Failed to fetch user quizzes');
    }
  };

  const fetchAllQuizzes = async () => {
    try {
      const response = await api.get('/api/quiz/all-quizzes');
      
      if (response.data.success) {
        setAllQuizzes(response.data.quizzes);
      } else {
        console.error('Failed to fetch all quizzes');
      }
    } catch (error: any) {
      console.error('Error fetching all quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttemptedQuizzes = async () => {
    if (!user?.walletAddress) return;
    
    try {
      console.log('Fetching attempted quizzes for wallet:', user.walletAddress);
      const response = await api.get(`/api/quiz/attempts/${user.walletAddress}`);
      console.log('Attempted quizzes response:', response.data);
      if (response.data.success) {
        setAttemptedQuizzes(response.data.attempts);
        console.log('Set attempted quizzes:', response.data.attempts);
      }
    } catch (error: any) {
      console.error('Error fetching attempted quizzes:', error);
    }
  };

  // Check if the target block has been reached before implementing VRF
  const checkBlockStatus = async (quizId: string, targetBlock: string) => {
    try {
      const provider = new ethers.JsonRpcProvider(`https://base-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`);
      const currentBlock = await provider.getBlockNumber();
      const targetBlockNum = parseInt(targetBlock);
      const isReady = currentBlock >= targetBlockNum;
      const blocksRemaining = Math.max(0, targetBlockNum - currentBlock);
      
      console.log(`🔍 Block status for quiz ${quizId}:`, {
        currentBlock: currentBlock.toString(),
        targetBlock: targetBlock,
        targetBlockNum,
        isReady,
        blocksRemaining
      });
      
      setBlockStatus(prev => ({
        ...prev,
        [quizId]: {
          ready: isReady,
          currentBlock: currentBlock.toString(),
          targetBlock: targetBlock,
          blocksRemaining
        }
      }));
    } catch (error) {
      console.error('Error checking block status:', error);
      // Set as ready if we can't check (fallback)
      setBlockStatus(prev => ({
        ...prev,
        [quizId]: {
          ready: true,
          currentBlock: "unknown",
          targetBlock: targetBlock,
          blocksRemaining: 0
        }
      }));
    }
  };

  // Synchronous block status check to avoid race conditions
  const checkBlockStatusSync = async (quizId: string, targetBlock: string) => {
    try {
      const provider = new ethers.JsonRpcProvider(`https://base-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`);
      const currentBlock = await provider.getBlockNumber();
      const targetBlockNum = parseInt(targetBlock);
      const isReady = currentBlock >= targetBlockNum;
      const blocksRemaining = Math.max(0, targetBlockNum - currentBlock);
      
      const blockInfo = {
        ready: isReady,
        currentBlock: currentBlock.toString(),
        targetBlock: targetBlock,
        blocksRemaining
      };
      
      console.log(`🔍 Block status for quiz ${quizId}:`, {
        currentBlock: currentBlock.toString(),
        targetBlock: targetBlock,
        targetBlockNum,
        isReady,
        blocksRemaining
      });
      
      // Update state for UI display
      setBlockStatus(prev => ({
        ...prev,
        [quizId]: blockInfo
      }));
      
      return blockInfo;
    } catch (error) {
      console.error('Error checking block status:', error);
      // Return ready if we can't check (fallback)
      const fallbackInfo = {
        ready: true,
        currentBlock: "unknown",
        targetBlock: targetBlock,
        blocksRemaining: 0
      };
      
      setBlockStatus(prev => ({
        ...prev,
        [quizId]: fallbackInfo
      }));
      
      return fallbackInfo;
    }
  };

  // Generate REAL VRF using the exact pattern from dice game
  const generateRealVRF = async (quiz: Quiz): Promise<string> => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      throw new Error('Wallet not connected');
    }

    // Step 1: Check if block is ready (to avoid wasting VRF fees)
    if (quiz.targetBlock) {
      // Check block status synchronously to avoid race conditions
      const blockInfo = await checkBlockStatusSync(quiz.randomUID, quiz.targetBlock);
      console.log('🔍 Block info for VRF:', blockInfo);
      
      if (!blockInfo.ready) {
        const message = `Block not ready yet! Current block: ${blockInfo.currentBlock}, Target block: ${quiz.targetBlock}, Blocks remaining: ${blockInfo.blocksRemaining}`;
        toast({
          title: "Block Not Ready",
          description: message,
          variant: "destructive",
        });
        throw new Error('Block not ready yet');
      }
    }

    try {
      console.log('🎲 Starting REAL VRF generation with blockchain contract...');
      
      const callbackGasLimit = 700_000;
      const provider = new ethers.JsonRpcProvider(`https://base-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`);
      const randomness = Randomness.createBaseSepolia(provider);
      const [requestCallBackPrice] = await randomness.calculateRequestPriceNative(BigInt(callbackGasLimit));

      const timeoutId = setTimeout(() => {
        const fallbackSet = ['A', 'B', 'C', 'D', 'E', 'F', 'G'][Math.floor(Math.random() * 7)];
        console.log('⏰ VRF timeout - using fallback set:', fallbackSet);
        throw new Error('VRF timeout');
      }, 30000);

      return new Promise((resolve, reject) => {
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'generateWithDirectFunding',
          args: [callbackGasLimit],
          value: requestCallBackPrice,
          chain: config.chains[0],
          account: address,
        }, {
          onSuccess: (txHash: string) => {
            clearTimeout(timeoutId);
            handleVrfTransactionSubmitted(txHash, resolve, reject);
          },
          onError: (error: Error) => {
            console.log(error);
            clearTimeout(timeoutId);
            reject(new Error("VRF request failed. Please try again."));
          }
        });
      });
      
    } catch (error) {
      console.error('❌ VRF generation failed:', error);
      throw error;
    }
  };

  const handleVrfTransactionSubmitted = async (txHash: string, resolve: (value: string) => void, reject: (reason: any) => void) => {
    try {
      console.log('✅ VRF transaction submitted:', txHash);

      const transactionReceipt = await waitForTransactionReceipt(config, {
        hash: txHash as `0x${string}`,
      });

      if (transactionReceipt.status === "success") {
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkRandomness = async () => {
          attempts++;

          try {
            const provider = new ethers.JsonRpcProvider(`https://base-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
            const updatedRandomness = await contract.randomness();

            if (updatedRandomness && updatedRandomness.toString() !== "0") {
              const bytes = getBytes(updatedRandomness.toString());

              if (bytes.length > 0) {
                // Generate random set (A-G) from VRF result
                const sets = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
                const randomIndex = bytes[0] % sets.length;
                const result = sets[randomIndex];

                console.log('✅ REAL VRF generated successfully:', result);
                console.log('🔑 Transaction hash:', txHash);

                resolve(result);
                return;
              }
            }

            if (attempts < maxAttempts) {
              setTimeout(checkRandomness, 2000);
            } else {
              reject(new Error("VRF callback failed. Please try again."));
            }

          } catch {
            if (attempts < maxAttempts) {
              setTimeout(checkRandomness, 2000);
            } else {
              reject(new Error("Failed to read random set. Please try again."));
            }
          }
        };

        setTimeout(checkRandomness, 2000);

      } else {
        reject(new Error("VRF transaction failed. Please try again."));
      }
    } catch {
      reject(new Error("VRF transaction failed. Please try again."));
    }
  };

  const handleAttemptQuiz = async (quiz: Quiz) => {
    if (!user?.walletAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setDecrypting(quiz.randomUID);
    
    try {
      let randomSet: string;
      
      // Try to use REAL VRF if wallet is connected and block is ready
      if (isConnected && quiz.targetBlock) {
        try {
          console.log('🎲 Attempting REAL VRF generation...');
          randomSet = await generateRealVRF(quiz);
          console.log(`📋 Random set selected via REAL VRF: ${randomSet}`);
        } catch (vrfError: any) {
          console.warn('VRF failed, falling back to Math.random:', vrfError);
          // Fallback to Math.random if VRF fails
          const sets = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
          randomSet = sets[Math.floor(Math.random() * sets.length)];
          console.log(`📋 Random set selected via fallback: ${randomSet}`);
        }
      } else {
        // Use Math.random if no wallet or no target block
        const sets = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        randomSet = sets[Math.floor(Math.random() * sets.length)];
        console.log(`📋 Random set selected via Math.random: ${randomSet}`);
      }
      
      console.log(`🎯 Attempting quiz: ${quiz.title}`);
      console.log(`🔑 Quiz UID: ${quiz.randomUID}`);
      console.log(`👤 User wallet: ${user.walletAddress}`);

      // Call decryption API
      const response = await api.post('/api/quiz/decrypt', {
        randomUID: quiz.randomUID,
        userWalletAddress: user.walletAddress,
        selectedSet: randomSet
      });

      if (response.data.success) {
        console.log('✅ Quiz decrypted successfully!');
        console.log('📝 Questions:', response.data.questions);
        console.log('🎯 Selected set:', randomSet);
        console.log('🔐 Decryption details:', response.data.decryptionDetails);
        
        // Enhanced logging for fallback system
        if (response.data.decryptionDetails?.fallbackUsed) {
          console.log('🔄 FALLBACK SYSTEM ACTIVATED:');
          console.log('   • Blocklock decryption failed');
          console.log('   • Using database questions as fallback');
          console.log('   • Fallback set:', response.data.decryptionDetails.selectedSet);
          console.log('   • Questions retrieved:', response.data.decryptionDetails.questionsRetrieved);
          console.log('   • Total questions available:', response.data.decryptionDetails.totalQuestionsAvailable);
        } else {
          console.log('🔓 REAL DECRYPTION: Blocklock + AES decryption successful!');
          console.log('   • Original set requested:', randomSet);
          console.log('   • Questions retrieved:', response.data.decryptionDetails?.questionsRetrieved);
          console.log('   • Decryption method:', response.data.decryptionDetails?.method);
        }
        
        // Transform questions to ensure correct structure
        const transformedQuestions = response.data.questions.map((q: any) => {
          // Handle different question structures
          if (typeof q === 'object' && q.text) {
            // If question has {text: "..."} structure
            return {
              question: q.text,
              options: Array.isArray(q.options) ? q.options.map((opt: any) => 
                typeof opt === 'object' && opt.text ? opt.text : opt
              ) : q.options || [],
              correctAnswer: q.correctAnswer || 0
            };
          } else if (typeof q === 'object' && q.question) {
            // If question has {question: "...", options: [...]} structure
            return {
              question: q.question,
              options: Array.isArray(q.options) ? q.options.map((opt: any) => 
                typeof opt === 'object' && opt.text ? opt.text : opt
              ) : q.options || [],
              correctAnswer: q.correctAnswer || 0
            };
          } else {
            // Fallback - assume it's already in correct format
            return q;
          }
        });

        console.log('Transformed questions:', transformedQuestions);
        
        // Start quiz attempt
        setAttemptingQuiz({
          quiz: quiz,
          questions: transformedQuestions,
          selectedSet: randomSet
        });
        
        toast({
          title: "Quiz Ready!",
          description: `Starting quiz with ${response.data.questions.length} questions.`,
          variant: "default",
        });
      } else {
        console.error('❌ Decryption failed:', response.data.message);
        toast({
          title: "Decryption Failed",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ Error attempting quiz:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setDecrypting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilStart = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start.getTime() - now.getTime();
    
    if (diff <= 0) return 'Started';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getQuizStatus = (quiz: Quiz) => {
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    
    if (startTime > now) {
      return { text: 'Upcoming', color: 'bg-blue-100 text-blue-800', icon: Clock };
    } else {
      return { text: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }
  };

  // Check if wallet is connected
  if (!user?.walletAddress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Wallet Not Connected</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to access the Quiz Dashboard</p>
          <p className="text-sm text-gray-500 mb-4">The dashboard requires a connected wallet to:</p>
          <ul className="text-sm text-gray-500 mb-6 space-y-1">
            <li>• View your created quizzes</li>
            <li>• Access the public quiz pool</li>
            <li>• Attempt and decrypt quizzes</li>
          </ul>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Use the wallet connection button in the sidebar to connect your MetaMask wallet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchUserQuizzes} variant="outline">Retry</Button>
        </div>
      </div>
    );
  }

  // Filter quizzes based on status
  const upcomingActiveQuizzes = allQuizzes.filter(quiz => {
    const startTime = new Date(quiz.startTime);
    const now = new Date();
    const endTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000)); // 24 hours after start
    return startTime <= now && now <= endTime; // Active or not ended yet
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Sidebar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Quiz Dashboard</h1>
          <p className="text-lg text-gray-600">Manage your quizzes and discover new ones</p>
        </motion.div>

        <Tabs defaultValue="created" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="created" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Created ({userQuizzes.length})
            </TabsTrigger>
            <TabsTrigger value="quizpool" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              QuizPool ({upcomingActiveQuizzes.length})
            </TabsTrigger>
            <TabsTrigger value="attempted" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Attempted ({attemptedQuizzes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="created" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Created Quizzes</h2>
              {userQuizzes.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No quizzes created yet</p>
                    <p className="text-sm text-gray-500">Create your first quiz to get started</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {userQuizzes.map((quiz, index) => {
                    const status = getQuizStatus(quiz);
                    const StatusIcon = status.icon;
                    
                    return (
                      <motion.div
                        key={quiz.randomUID}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                      >
                        <Card className="h-full hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
                              <StatusIcon className="w-5 h-5 text-gray-500" />
                            </div>
                            <CardDescription className="flex items-center gap-2 text-sm">
                              <Hash className="w-4 h-4" />
                              {quiz.randomUID.slice(0, 8)}...{quiz.randomUID.slice(-8)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {formatDate(quiz.startTime)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Wallet className="w-4 h-4" />
                              {quiz.walletAddress.slice(0, 6)}...{quiz.walletAddress.slice(-4)}
                            </div>
                            <Badge className={status.color}>
                              {status.text}
                            </Badge>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="attempted" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Your Attempted Quizzes</h2>
                <Button 
                  onClick={fetchAttemptedQuizzes} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>
              {/* Debug Info */}
              {/* <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm">
                <p><strong>Debug Info:</strong></p>
                <p>Wallet: {user?.walletAddress || 'Not connected'}</p>
                <p>Attempted Quizzes Count: {attemptedQuizzes.length}</p>
                <p>Attempted Quizzes Data: {JSON.stringify(attemptedQuizzes, null, 2)}</p>
              </div> */}

              {attemptedQuizzes.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No quizzes attempted yet</p>
                    <p className="text-sm text-gray-500">Attempt quizzes from the QuizPool to see your results here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {attemptedQuizzes.map((attempt, index) => (
                    <motion.div
                      key={attempt.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg line-clamp-2">{attempt.quiz.title}</CardTitle>
                            <Badge className={attempt.score >= 70 ? "bg-green-100 text-green-800" : attempt.score >= 50 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                              {attempt.score}%
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Hash className="w-4 h-4" />
                            Set {attempt.selectedSet}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {formatDate(attempt.submittedAt)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="w-4 h-4" />
                            {attempt.totalQuestions} questions
                          </div>
                          <a target="_blank" href={`https://maroon-geographical-pheasant-611.mypinata.cloud/ipfs/${attempt.ipfsHash}`} className="flex hover:underline items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4" />
                            IPFS: {attempt.ipfsHash.slice(0, 8)}...{attempt.ipfsHash.slice(-6)}
                          </a>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="quizpool" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">QuizPool - Public Quizzes</h2>
              <p className="text-gray-600 mb-6">Discover and attempt quizzes created by the community</p>
              
              {upcomingActiveQuizzes.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No public quizzes available</p>
                    <p className="text-sm text-gray-500">Quizzes will appear here when they become active</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingActiveQuizzes.map((quiz, index) => {
                    const status = getQuizStatus(quiz);
                    const StatusIcon = status.icon;
                    const isOwnQuiz = quiz.walletAddress === user?.walletAddress;
                    
                    return (
                      <motion.div
                        key={quiz.randomUID}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                      >
                        <Card className="h-full hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
                              <StatusIcon className="w-5 h-5 text-gray-500" />
                            </div>
                            <CardDescription className="flex items-center gap-2 text-sm">
                              <Hash className="w-4 h-4" />
                              {quiz.randomUID.slice(0, 8)}...{quiz.randomUID.slice(-8)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {formatDate(quiz.startTime)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Wallet className="w-4 h-4" />
                              {quiz.walletAddress.slice(0, 6)}...{quiz.walletAddress.slice(-4)}
                              {isOwnQuiz && (
                                <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              {getTimeUntilStart(quiz.startTime)}
                            </div>
                            {(() => {
                              const isAttempted = attemptedQuizzes.some(attempt => {
                                const match = attempt.quiz?.randomUID === quiz.randomUID;
                                console.log('🔍 Quiz attempt check:', {
                                  quizRandomUID: quiz.randomUID,
                                  attemptQuizRandomUID: attempt.quiz?.randomUID,
                                  match,
                                  attemptData: attempt
                                });
                                return match;
                              });
                              console.log(`🎯 Quiz ${quiz.randomUID} attempted: ${isAttempted}`);
                              return isAttempted;
                            })() ? (
                              <div>
                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                  Already Attempted
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">View in Attempted tab</p>
                              </div>
                            ) : (
                              <Button 
                                className="w-full" 
                                variant="outline"
                                onClick={() => handleAttemptQuiz(quiz)}
                                disabled={decrypting === quiz.randomUID}
                              >
                                {decrypting === quiz.randomUID ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                                    Decrypting...
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Attempt Quiz
                                  </>
                                )}
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Quiz Attempt Modal */}
      {attemptingQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4">
              <h2 className="text-xl font-semibold text-white">Quiz: {attemptingQuiz.quiz.title}</h2>
            </div>
            <QuizAttempt
              quiz={{
                randomUID: attemptingQuiz.quiz.randomUID,
                title: attemptingQuiz.quiz.title,
                questions: attemptingQuiz.questions,
                selectedSet: attemptingQuiz.selectedSet
              }}
              userWalletAddress={user?.walletAddress || ''}
              onComplete={(result) => {
                console.log('Quiz completed:', result);
                setAttemptingQuiz(null);
                // Refresh attempted quizzes
                fetchAttemptedQuizzes();
                // Navigate to attempted tab
                // You can add navigation logic here if needed
              }}
              onClose={() => setAttemptingQuiz(null)}
            />
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}
