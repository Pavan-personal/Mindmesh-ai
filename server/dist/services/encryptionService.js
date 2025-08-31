"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionService = void 0;
const crypto_1 = __importDefault(require("crypto"));
class EncryptionService {
    // Generate random UID for quiz identification
    static generateRandomUID() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    // Encrypt DS1 with AES-256-GCM using UID as key
    static encryptAES256(data, key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Generate random IV (Initialization Vector)
                const iv = crypto_1.default.randomBytes(16);
                // Create cipher with AES-256-GCM
                const cipher = crypto_1.default.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
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
            }
            catch (error) {
                console.error('AES encryption error:', error);
                throw new Error(`AES encryption failed: ${error}`);
            }
        });
    }
    // Decrypt AES-256-GCM encrypted data using UID as key
    static decryptAES256(encryptedData, key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Parse encrypted data
                const { encrypted, iv, tag, algorithm } = JSON.parse(encryptedData);
                if (algorithm !== 'aes-256-gcm') {
                    throw new Error('Unsupported encryption algorithm');
                }
                // Create decipher
                const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
                // Set authentication tag
                decipher.setAuthTag(Buffer.from(tag, 'hex'));
                // Decrypt the data
                let decrypted = decipher.update(encrypted, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                return decrypted;
            }
            catch (error) {
                console.error('AES decryption error:', error);
                throw new Error(`AES decryption failed: ${error}`);
            }
        });
    }
    // Generate question sets (A, B, C... G) with random indices
    static generateQuestionSets(questionCount) {
        const sets = {};
        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G']; // 7 sets instead of 10
        for (let i = 0; i < letters.length; i++) {
            const setIndices = [];
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
    static generateRandomSet() {
        const sets = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        return sets[Math.floor(Math.random() * sets.length)];
    }
}
exports.EncryptionService = EncryptionService;
