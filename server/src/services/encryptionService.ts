import crypto from 'crypto';

export class EncryptionService {
  // Generate random UID for quiz identification
  static generateRandomUID(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Encrypt DS1 with AES-256-GCM using UID as key
  static async encryptAES256(data: string, key: string): Promise<string> {
    try {
      // Generate random IV (Initialization Vector)
      const iv = crypto.randomBytes(16);
      
      // Create cipher with AES-256-GCM
      const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
      
      // Encrypt the data
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get authentication tag
      const tag = cipher.getAuthTag();
      
      // Return encrypted data with IV and tag
      return JSON.stringify({
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        algorithm: 'aes-256-gcm'
      });
    } catch (error) {
      console.error('AES encryption error:', error);
      throw new Error(`AES encryption failed: ${error}`);
    }
  }

  // Decrypt AES-256-GCM encrypted data using UID as key
  static async decryptAES256(encryptedData: string, key: string): Promise<string> {
    try {
      // Parse encrypted data
      const { encrypted, iv, tag, algorithm } = JSON.parse(encryptedData);
      
      if (algorithm !== 'aes-256-gcm') {
        throw new Error('Unsupported encryption algorithm');
      }
      
      // Create decipher
      const decipher = crypto.createDecipheriv(
        'aes-256-gcm', 
        Buffer.from(key, 'hex'), 
        Buffer.from(iv, 'hex')
      );
      
      // Set authentication tag
      decipher.setAuthTag(Buffer.from(tag, 'hex'));
      
      // Decrypt the data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('AES decryption error:', error);
      throw new Error(`AES decryption failed: ${error}`);
    }
  }

  // Generate question sets (A, B, C... G) with random indices
  static generateQuestionSets(questionCount: number): Record<string, number[]> {
    const sets: Record<string, number[]> = {};
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G']; // 7 sets instead of 10
    
    for (let i = 0; i < letters.length; i++) {
      const setIndices: number[] = [];
      const questionsPerSet = 10;
      
      // Randomly select 10 questions for this set
      while (setIndices.length < questionsPerSet) {
        const randomIndex = Math.floor(Math.random() * questionCount);
        if (!setIndices.includes(randomIndex)) {
          setIndices.push(randomIndex);
        }
      }
      
      sets[letters[i]] = setIndices.sort((a, b) => a - b);
    }
    
    return sets;
  }

  // Generate random set selection (A, B, C... G)
  static generateRandomSet(): string {
    const sets = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    return sets[Math.floor(Math.random() * sets.length)];
  }
}
