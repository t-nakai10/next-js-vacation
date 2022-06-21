import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import { decode } from 'base64-arraybuffer';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // 本文から画像データ取得.
    let { image } = req.body;
    if (!image) {
      return res.status(500).json({ message: 'no image' });
    }
    try {
      // Base64でエンコードする画像があるか確認.
      const contentType = image.match(/data:(.*);base64/)?.[1];
      const base64FileData = image.split('base64,')?.[1];
      if (!contentType || !base64FileData) {
        return res.status(500).json({ message: 'image data not valid' });
      }
      // nanoid を使用してファイルを一意の名前にする.
      const fileName = nanoid();
      const ext = contentType.split('/')[1];
      const path = `${fileName}.${ext}`;

      // アップロードする.
      const { data, error: uploadError } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        // Base64データをデコードする必要がある.
        .upload(path, decode(base64FileData), {
          contentType,
          upsert: true,
        });
      if (uploadError) {
        throw new Error('Unable to upload image to storage');
      }
      const url = `${process.env.SUPABASE_URL.replace('.co', '.in')}/storage/v1/object/public/${data.Key}`;
      return res.status(200).json({ url });
    } catch (e) {
      res.status(500).json({ message: 'Something went wrong' });
    }

  }
  else {
    res.setHeader('Allow', ['POST']);
    res
      .status(405)
      .json({ message: `HTTP method ${req.method} is not supported.` });
  }
}