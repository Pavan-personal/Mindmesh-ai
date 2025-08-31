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
exports.updateWallet = exports.logout = exports.googleAuthentication = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const googleAuthentication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, name, googleId, image } = req.body;
        if (!email || !googleId) {
            return res.status(400).json({ message: "Email and Google ID required" });
        }
        let user = yield prisma.user.upsert({
            where: { googleId },
            update: { email, name, image },
            create: { googleId, email, name, image },
        });
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email,
            name,
            image,
            walletAddress: user.walletAddress || null
        }, process.env.JWT_SECRET, {
            expiresIn: "24h",
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });
        res.json({ success: true, token });
    }
    catch (error) {
        console.error("Auth error:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.googleAuthentication = googleAuthentication;
const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.json({ success: true });
};
exports.logout = logout;
const updateWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletAddress, userId } = req.body;
        if (!walletAddress || !userId) {
            return res.status(400).json({ message: "Wallet address and user ID required" });
        }
        // Validate wallet address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
            return res.status(400).json({ message: "Invalid wallet address format" });
        }
        const user = yield prisma.user.update({
            where: { id: userId },
            data: { walletAddress },
        });
        // Refresh JWT token to include wallet address
        const newToken = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            walletAddress: user.walletAddress
        }, process.env.JWT_SECRET, {
            expiresIn: "24h",
        });
        // Update the cookie with new token
        res.cookie("token", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });
        res.json({ success: true, user, token: newToken });
    }
    catch (error) {
        console.error("Wallet update error:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.updateWallet = updateWallet;
