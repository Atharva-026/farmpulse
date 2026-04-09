import { useTranslation } from 'react-i18next';

const LANG_TO_VOICE = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  kn: 'kn-IN',
};

export default function useLangCode() {
  const { i18n } = useTranslation();
  return LANG_TO_VOICE[i18n.language] || 'en-IN';
}