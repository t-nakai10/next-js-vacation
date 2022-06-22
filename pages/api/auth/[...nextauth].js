// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import nodemailer from 'nodemailer';

// プリズマアダプターをインポート.
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

import GoogleProvider from "next-auth/providers/google";

// プリズマクライアント初期化.
const prisma = new PrismaClient();

export default NextAuth({
  // 認証ページの定義.
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
    verifyRequest: '/',
  },
  // vercel に認証追加するのに必要.
  secret: process.env.NEXT_PUBLIC_SECRET,
  // プロバイダーはグーグル.
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  // プリズマとの連携.
  adapter: PrismaAdapter(prisma),
})