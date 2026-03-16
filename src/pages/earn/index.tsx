import { useEffect } from 'react';
import { useRouter } from 'next/router';
export default function EarnIndex() {
  const router = useRouter();
  useEffect(() => { router.replace('/earn/farms'); }, [router]);
  return null;
}
