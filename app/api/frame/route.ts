import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';
import usePersistentStore from '../../../store/usePersistentStore';

// Define a type for the store 
type UsePersistentStoreType = {
  waves: number;
  incrementWaves: () => void;
};

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

  if (!isValid) {
    return new NextResponse('Message not valid', { status: 500 });
  }

  (usePersistentStore as unknown as UsePersistentStoreType).incrementWaves();

  let state = {
    page: 0,
    waves: usePersistentStore((state) => state.waves)
  };
  try {
    state = {...state, ...JSON.parse(decodeURIComponent(message.state?.serialized))};
  } catch (e) {
    console.error(e);
  }

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: `Waves: ${state?.waves || 0}`,
        },
        {
          action: 'link',
          label: 'OnchainKit',
          target: 'https://onchainkit.xyz',
        }
      ],
      image: {
        src: `${NEXT_PUBLIC_URL}/mascot-1.png`,
      },
      postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
      state: {
        page: state?.page + 1,
        time: new Date().toISOString(),
      },
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
