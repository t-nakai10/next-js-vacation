import { getSession } from 'next-auth/react'
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // ユーザーが認証されているかどうかを判別.
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // prisma を介して認証されたユーザーデータを取得.
  // findUnique は単一のデータベースレコードを取得.
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { listedHomes: true },
  });

  // この home の認証ユーザーかどうか判定.
  const { id } = req.query;
  if (!user?.listedHomes?.find(home => home.id === id)) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  // DB内のレコードを更新するための処理.
  if (req.method === 'PATCH') {
    try {
      const home = prisma.home.update({
        where: { id },
        data: req.body,
      })
      res.status(200).json(home);
    } catch (e) {
      res.status(500).json({ message: 'なにかエラーです.' });
    }
  }
  else if (req.method === 'DELETE') {
    try {
      const home = await prisma.home.delete({
        where: { id },
      });
      if (home.image) {
        const path = home.image.split(`${process.env.SUPABASE_BUCKET}/`)?.[1];
        await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([path]);
      }
      res.status(200).json(home);
    } catch (e) {
      res.status(500).json({ message: 'something went wrong' });
    }
  }
  else {
    res.setHeader('Allow', ['PATCH']);
    res
      .status(405)
      .json({ message: `HTTP method ${req.method} is not supported.` });
  }
}