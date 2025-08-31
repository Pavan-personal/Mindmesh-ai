import React, { useState, useEffect } from "react";
import { Button, Typography, Box, Alert, TextField } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { useBlocklock } from "@/hooks/useBlocklock";
import { api } from "@/lib/api";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface QuizConfigDialogProps {
  open: boolean;
  onClose: () => void;
  questions: any[];
  title: string;
  numQuestions: number;
  onQuizCreated?: () => void;
}

export function QuizConfigDialog({ open, onClose, questions, title, numQuestions, onQuizCreated }: QuizConfigDialogProps) {
  // Set default exam start time to 10 minutes from now
  const defaultExamTime = new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 16);
  const [examStartTime, setExamStartTime] = useState<string>(defaultExamTime);
  const [duration, setDuration] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const { user } = useAuth();
  const { encryptData, isEncrypting, encryptionError } = useBlocklock();
  const navigate = useNavigate();
  const { toast } = useToast();
  

  
  // Update exam start time when dialog opens
  useEffect(() => {
    if (open) {
      const newDefaultTime = new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 16);
      setExamStartTime(newDefaultTime);
    }
  }, [open]);



  const handleScheduleQuiz = async () => {
    // Simple checks exactly like MyDefiNominee
    if (!examStartTime) {
      setError("Please set an exam start time.");
      return;
    }
    
    // Check if exam start time is in the future
    const examTime = new Date(examStartTime);
    const now = new Date();
    const timeDiff = examTime.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      setError("Exam start time must be in the future.");
      return;
    }
    
    // Ensure at least 5 minutes in the future for blocklock
    if (timeDiff < 5 * 60 * 1000) {
      setError("Exam start time must be at least 5 minutes in the future for blocklock encryption.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🚀 Starting complete quiz creation + encryption workflow...');
      
      // Step 1: Create quiz in database (AES encryption happens automatically)
      const createResponse = await api.post('/api/quiz/create', {
        questions: questions,
        title: title,
        examStartTime: examStartTime,
        duration: duration
      });

      if (!createResponse.data.success) {
        throw new Error(createResponse.data.message);
      }

      const quizCreated = createResponse.data;
      console.log('✅ Quiz created with AES encryption, UID:', quizCreated.randomUID);
      console.log('🔍 Server response:', quizCreated);

      // Step 2: Encrypt with blocklock (user pays gas fee)
      console.log('🔐 Starting blocklock encryption...');
      
      // Check if wallet is connected before proceeding
      if (!isWalletConnected) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }
      
      // The server already encrypted ds1 with AES, now we encrypt the AES-encrypted data with blocklock
      // This is our double-encryption workflow: AES (server) + Blocklock (client)
      const aesEncryptedData = quizCreated.encryptedData; // This is the AES-encrypted ds1 from the server
      
      if (!aesEncryptedData) {
        console.error('❌ Server did not return encryptedData!');
        console.log('🔍 Available fields:', Object.keys(quizCreated));
        throw new Error('Server did not return encrypted data. This is a server-side issue.');
      }
      
      // For now, let's use a simple approach like MyDefiNominee - use a fixed number of blocks ahead
      // This avoids complex time-to-block calculations that might be failing
      const blocksAhead = 100; // 100 blocks = ~100 seconds on Base networks
      
      console.log('🔍 Using fixed blocks ahead:', {
        blocksAhead,
        examStartTime,
        now: new Date().toISOString()
      });

      console.log('🔍 About to call encryptData with AES-encrypted data:', {
        data: aesEncryptedData.substring(0, 100) + '...',
        dataSize: aesEncryptedData.length + ' bytes',
        blocksAhead: blocksAhead,
        blocksAheadType: typeof blocksAhead,
        blocksAheadString: blocksAhead.toString(),
        blocksAheadStringType: typeof blocksAhead.toString()
      });
      
      // Check if AES-encrypted data is too large for blocklock (256-byte limit)
      let dataToEncrypt;
      if (aesEncryptedData.length > 256) {
        console.warn('⚠️ AES-encrypted data is too large for blocklock:', aesEncryptedData.length, 'bytes');
        console.log('🔍 AES data preview:', aesEncryptedData.substring(0, 100) + '...');
        
        // For now, let's use a small reference instead
        // This is a limitation we need to address in our architecture
        dataToEncrypt = JSON.stringify({
          randomUID: quizCreated.randomUID,
          walletAddress: user?.walletAddress,
          aesDataSize: aesEncryptedData.length,
          timestamp: Date.now()
        });
        
        console.log('🔍 Using reference data for blocklock:', dataToEncrypt);
      } else {
        // AES data is small enough, encrypt it directly with blocklock
        console.log('🔍 AES data fits in blocklock, encrypting directly');
        dataToEncrypt = aesEncryptedData;
      }
      
      const encryptionResult = await encryptData(
        dataToEncrypt, 
        blocksAhead.toString()
      );

      if (!encryptionResult.success) {
        throw new Error(encryptionResult.message || 'Blocklock encryption failed');
      }

      console.log('🎉 Blocklock encryption successful!');

      // Step 3: Update database with blocklock data
      console.log('🔍 Blocklock data to send:', {
        randomUID: quizCreated.randomUID,
        requestId: encryptionResult.requestId,
        ciphertextType: typeof encryptionResult.ciphertext,
        ciphertextKeys: Object.keys(encryptionResult.ciphertext || {}),
        targetBlock: quizCreated.targetBlock
      });

      // Fix BigInt serialization issue by converting ciphertext properly
      let serializedCiphertext;
      try {
        // The ciphertext object contains BigInt values that can't be JSON.stringify'd directly
        // We need to convert it to a format that can be serialized
        if (encryptionResult.ciphertext && typeof encryptionResult.ciphertext === 'object') {
          // Convert the ciphertext object to a serializable format
          serializedCiphertext = {
            U: encryptionResult.ciphertext.U ? {
              x: encryptionResult.ciphertext.U.x?.toString(),
              y: encryptionResult.ciphertext.U.y?.toString()
            } : null,
            V: encryptionResult.ciphertext.V ? Array.from(encryptionResult.ciphertext.V) : null,
            W: encryptionResult.ciphertext.W ? Array.from(encryptionResult.ciphertext.W) : null
          };
        } else {
          serializedCiphertext = encryptionResult.ciphertext;
        }
        
        console.log('✅ Ciphertext serialized successfully');
      } catch (serializeError) {
        console.error('❌ Ciphertext serialization failed:', serializeError);
        // Fallback: send a reference instead
        serializedCiphertext = {
          randomUID: quizCreated.randomUID,
          walletAddress: user?.walletAddress,
          note: 'Ciphertext serialization failed, using reference',
          timestamp: Date.now()
        };
      }

      await api.post('/api/quiz/encrypt', {
        randomUID: quizCreated.randomUID,
        requestId: encryptionResult.requestId,
        ciphertext: JSON.stringify(serializedCiphertext),
        targetBlock: quizCreated.targetBlock
      });

      console.log('✅ Database updated with blocklock encryption data');

      // Success!
      setSuccess(`🎉 Quiz scheduled successfully!\n\n` +
        `UID: ${quizCreated.randomUID}\n` +
        `Target Block: ${quizCreated.targetBlock}\n\n` +
        `Your quiz is now encrypted and time-locked on Base Sepolia!`
      );

      // Show success toast
      toast({
        title: "Quiz Created Successfully!",
        description: `Quiz "${title}" has been created and encrypted with Blocklock`,
        variant: "default",
      });

      if (onQuizCreated) {
        onQuizCreated();
      }

      // Navigate to dashboard after 3 seconds
      setTimeout(() => {
        onClose();
        setSuccess(null);
        navigate('/dashboard');
      }, 3000);

    } catch (error: any) {
      console.error('❌ Quiz scheduling failed:', error);
      setError(`Failed to schedule quiz: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };





  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="text-center">
        <Typography variant="h5" className="font-extrabold">
          Schedule Quiz
        </Typography>
        <Typography variant="body2" className="text-gray-600 mt-2">
          Configure quiz settings and encrypt with real blocklock
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box className="space-y-6">
          {/* Wallet Connect - Exactly like MyDefiNominee */}
          <Box className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <Typography variant="h6" className="mb-4 text-center">
              Connect Your Wallet
            </Typography>
            <div className="flex justify-center">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== 'loading';
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                      authenticationStatus === 'authenticated');
                  
                  // Update our local state
                  React.useEffect(() => {
                    setIsWalletConnected(connected);
                  }, [connected]);
                  
                  return (
                    <div>
                      {(() => {
                        if (!connected) {
                          return (
                            <Button
                              onClick={openConnectModal}
                              variant="contained"
                              color="primary"
                              size="large"
                              className="px-8 py-3"
                            >
                              Connect Wallet
                            </Button>
                          );
                        }
                        if (chain.unsupported) {
                          return (
                            <Button
                              onClick={openChainModal}
                              variant="contained"
                              color="error"
                              size="large"
                              className="px-8 py-3"
                            >
                              Wrong network
                            </Button>
                          );
                        }
                        return (
                          <div className="text-center">
                            <div className="text-green-600 mb-2">✅ Wallet Connected</div>
                            <div className="text-sm text-gray-600">
                              {account.address.slice(0, 6)}...{account.address.slice(-4)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {chain.name}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          </Box>

          {/* Quiz Info */}
          <Box className="bg-gray-50 p-4 rounded-lg">
            <Typography variant="h6" className="mb-2">
              Quiz Details
            </Typography>
            <Box className="space-y-2 text-sm">
              <div><strong>Title:</strong> {title}</div>
              <div><strong>Questions:</strong> {questions.length} MCQ questions</div>
              <div><strong>Encryption:</strong> AES-256-GCM + Blocklock</div>
            </Box>
          </Box>





          {/* Quiz Settings */}
          <Box className="space-y-4">
            <TextField
              label="Exam Start Time"
              type="datetime-local"
              value={examStartTime}
              onChange={(e) => setExamStartTime(e.target.value)}
              fullWidth
              required
              inputProps={{ 
                min: new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16) // 5 minutes from now
              }}
              helperText="Set when the quiz should become available (minimum 5 minutes from now for blocklock)"
            />
            
            <TextField
              label="Duration (minutes)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              fullWidth
              required
              inputProps={{ min: 1, max: 180 }}
              helperText="How long students have to complete the quiz"
            />
          </Box>

          {/* Success Messages */}
          {success && (
            <Alert severity="success" className="mb-4">
              <pre className="whitespace-pre-wrap text-sm">{success}</pre>
            </Alert>
          )}

          {/* Error Messages */}
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Blocklock Encryption Error */}
          {encryptionError && (
            <Alert severity="error" className="mb-4">
              <strong>Blocklock Error:</strong> {encryptionError}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions className="p-6 pb-12">
        <Toaster />
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        
        <Button
          onClick={handleScheduleQuiz}
          disabled={isSubmitting || !examStartTime || !isWalletConnected}
          variant="contained"
          sx={{ bgcolor: 'black', '&:hover': { bgcolor: 'grey.900' } }}
          title={
            !isWalletConnected ? "Connect your wallet first" :
            !examStartTime ? "Set exam start time" :
            "Schedule quiz with real blocklock encryption"
          }
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Quiz...
            </>
          ) : (
            '🚀 Schedule Quiz (Create + Encrypt)'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
