import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";

export const googleAuthentication = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email, name, googleId, image } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ message: "Email and Google ID required" });
    }

    let user = await prisma.user.upsert({
      where: { googleId },
      update: { email, name, image },
      create: { googleId, email, name, image },
    });

    const token = jwt.sign(
      { 
        id: user.id, 
        email, 
        name, 
        image,
        walletAddress: user.walletAddress || null
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "24h",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({ success: true, token });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ success: true });
};

export const updateWallet = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { walletAddress, userId } = req.body;

    if (!walletAddress || !userId) {
      return res.status(400).json({ message: "Wallet address and user ID required" });
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ message: "Invalid wallet address format" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { walletAddress },
    });

    // Refresh JWT token to include wallet address
    const newToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        image: user.image,
        walletAddress: user.walletAddress 
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "24h",
      }
    );

    // Update the cookie with new token
    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({ success: true, user, token: newToken });
  } catch (error) {
    console.error("Wallet update error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
