export type { AuthReason, AuthSession, ProfileInput, SignUpInput, User } from './types';
export { AUTH_REASON_MESSAGE, SPECIALTIES } from './constants';
export {
  ACCOUNT_QUERY_KEY,
  useAuth,
  useAuthGate,
  useLogin,
  useLogout,
  useSignUp,
  useUpdateProfile,
} from './hooks/useAuth';
export { safeReturnTo, initials } from './utils/return-to';
export { LoginForm } from './components/LoginForm';
export { SignUpWizard } from './components/signup/SignUpWizard';
export { EMPTY_SIGN_UP, SIGN_UP_STEPS, type SignUpForm } from './components/signup/form';
export { RequireAuth } from './components/RequireAuth';
export { UserMenu } from './components/UserMenu';
export { UserAvatar } from './components/UserAvatar';
export { SpecialtyTags } from './components/SpecialtyTags';
export { ProfileForm, type ProfileDraft } from './components/ProfileForm';
export {
  profileCompleteness,
  profileSectionId,
  type ProfileCheck,
  type ProfileSection,
} from './utils/completeness';
export { ProfileCardPreview } from './components/ProfileCardPreview';
