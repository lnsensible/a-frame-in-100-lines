import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';
import usePersistentStore from '../../../store/usePersistentStore';

async function getResponse(req) {
  const body = await req.json();
  const { isValid, message } = 
    process.env.NODE_ENV === 'development' 
      ? { isValid: true, message: {} }
      : await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

  if (!isValid) {
    return new NextResponse('Message not valid', { status: 500 });
  }

  usePersistentStore.getState().incrementWaves();

  let state = {
    page: 0,
    waves: usePersistentStore.getState().waves
  };
  try {
    state = {
      ...state, 
      ...JSON.parse(decodeURIComponent(message.state?.serialized ?? '{}'))};
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

export async function POST(req) {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
