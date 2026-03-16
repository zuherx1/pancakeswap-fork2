// Auto-redirect /trade to /trade/swap
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function TradeIndex() {
  const router = useRouter();
  useEffect(() => { router.replace('/trade/swap'); }, [router]);
  return null;
}
