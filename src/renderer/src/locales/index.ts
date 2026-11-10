import { createI18n } from 'vue-i18n';
import zh_CN from './lang/zh_CN';
import en_US from './lang/en_US';

export type Language = 'zh_CN' | 'en_US';

export const languageOptions: { value: Language; label: string }[] = [
    { value: 'zh_CN', label: '简体中文' },
    { value: 'en_US', label: 'English' }
];

const cachedLanguage = localStorage.getItem('language');

export default createI18n({
    legacy: false,
    locale: cachedLanguage === 'en_US' ? 'en_US' : 'zh_CN',
    fallbackLocale: 'en_US',
    messages: { zh_CN, en_US },
    globalInjection: true
});
