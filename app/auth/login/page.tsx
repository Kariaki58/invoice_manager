import { Suspense } from 'react';
import LoginForm from './LoginHelper';

interface PageProps {
  searchParams?: {
    redirect?: string;
  };
}

export default function LoginPage({ searchParams }: PageProps) {
  const redirect = searchParams?.redirect ?? '/';

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm redirect={redirect} />
    </Suspense>
  );
}
