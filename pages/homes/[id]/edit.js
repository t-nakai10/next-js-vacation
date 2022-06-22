import Layout from '@/components/Layout';
import ListingForm from '@/components/ListingForm';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  // セッションによってリダイレクト.
  const session = await getSession(context);
  const redirect = {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
  if (!session) {
    return redirect;
  }

  // ユーザーテーブルから1つのレコードを取得.
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    // リレーションは true に設定する必要がある.
    select: { listedHomes: true },
  });

  // この home の作成者かどうか.
  const id = context.params.id;
  const home = user?.listedHomes.find(home => home.id === id);
  if (!home) {
    return redirect;
  }

  return {
    // parse には json オブジェクトを引数にわたす必要がある.
    props: JSON.parse(JSON.stringify(home)),
  }
}

const Edit = (home = null) => {
  const handleOnSubmit = data =>
    axios.patch(`/api/homes/${home.id}`, data);

  return (
    <Layout>
      <div className="max-w-screen-sm mx-auto">
        <h1 className="text-xl font-medium text-gray-800">Edit your home</h1>
        <p className="text-gray-500">
          Fill out the form below to update your home.
        </p>
        <div className="mt-8">
          {home ? (
            <ListingForm
              initialValues={home}
              buttonText="Update home"
              redirectPath={`/homes/${home.id}`}
              onSubmit={handleOnSubmit}
            />
          ) : null}
        </div>
      </div>
    </Layout>
  )
}

export default Edit;