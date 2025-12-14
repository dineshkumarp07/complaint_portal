import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<Language>(this.getDefaultLanguage());
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  private languages: Language[] = [
    { code: 'en-US', name: 'English', flag: '🇺🇸', direction: 'ltr' },
    { code: 'es', name: 'Español', flag: '🇪🇸', direction: 'ltr' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', direction: 'ltr' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', direction: 'ltr' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', direction: 'ltr' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', direction: 'rtl' }
  ];

  constructor() {
    this.initializeLanguage();
  }

  private getDefaultLanguage(): Language {
    return this.languages[0]; // English as default
  }

  private initializeLanguage(): void {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    const urlLanguage = this.getCurrentLanguageFromUrl();
    
    let targetLanguage: Language | undefined;
    
    if (urlLanguage) {
      targetLanguage = this.languages.find(lang => lang.code === urlLanguage);
    } else if (savedLanguage) {
      targetLanguage = this.languages.find(lang => lang.code === savedLanguage);
    }
    
    if (targetLanguage) {
      this.setLanguage(targetLanguage);
    }
  }

  private getCurrentLanguageFromUrl(): string | null {
    const path = window.location.pathname;
    const langMatch = path.match(/^\/([a-z]{2}(-[A-Z]{2})?)\//);
    return langMatch ? langMatch[1] : null;
  }

  getLanguages(): Language[] {
    return this.languages;
  }

  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  setLanguage(language: Language): void {
    this.currentLanguageSubject.next(language);
    localStorage.setItem('selectedLanguage', language.code);
    this.updateDocumentProperties(language);
  }

  private updateDocumentProperties(language: Language): void {
    document.documentElement.dir = language.direction;
    document.documentElement.lang = language.code;
    
    // Add RTL class for styling
    if (language.direction === 'rtl') {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
  }

  isRTL(): boolean {
    return this.getCurrentLanguage().direction === 'rtl';
  }

  getLanguageByCode(code: string): Language | undefined {
    return this.languages.find(lang => lang.code === code);
  }

  // Translation helper methods
  getTranslationKey(key: string): string {
    // This can be extended to work with actual translation libraries
    return key;
  }

  // Format date according to current language
  formatDate(date: Date): string {
    const language = this.getCurrentLanguage();
    return new Intl.DateTimeFormat(language.code).format(date);
  }

  // Format number according to current language
  formatNumber(number: number): string {
    const language = this.getCurrentLanguage();
    return new Intl.NumberFormat(language.code).format(number);
  }

  // Format currency according to current language
  formatCurrency(amount: number, currency: string = 'USD'): string {
    const language = this.getCurrentLanguage();
    return new Intl.NumberFormat(language.code, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
}
