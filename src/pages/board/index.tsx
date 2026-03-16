import { useEffect } from 'react';
import { useRouter } from 'next/router';
export default function BoardIndex() {
  const router = useRouter();
  useEffect(() => { router.replace('/board/info'); }, [router]);
  return null;
}
