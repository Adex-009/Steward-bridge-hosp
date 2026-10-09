import { isGoogleAuthEnabled } from '@/lib/auth';
import { AuthForm } from '@/components/auth/auth-form';
export default function SignInPage(){ return <AuthForm googleEnabled={isGoogleAuthEnabled} defaultMode="signin" />; }
