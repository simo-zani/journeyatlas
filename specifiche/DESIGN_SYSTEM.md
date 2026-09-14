# Travel App - Design System & CSS Configuration

## Tailwind Config (`tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode via class
  theme: {
    extend: {
      colors: {
        // Premium Blue & Gold Palette
        'deep-blue': '#003366',
        'light-blue': '#4A90E2',
        'gold': '#D4AF37',
        'cream': '#F5F3F0',
        'dark-navy': '#0F172A',
        
        // Semantic colors (inherit defaults, but add custom names)
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#3B82F6',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      spacing: {
        '4': '4px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
        '48': '48px',
      },
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'base': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'base': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-in-out',
        'slide-in': 'slideIn 300ms ease-in-out',
        'spin-gold': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

---

## Global Styles (`src/index.css`)

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Base Styles */
html {
  scroll-behavior: smooth;
}

body {
  @apply bg-cream dark:bg-dark-navy text-slate-900 dark:text-slate-100 font-inter;
  transition: background-color 300ms, color 300ms;
}

h1, h2, h3, h4, h5, h6 {
  @apply font-poppins font-bold;
}

h1 {
  @apply text-5xl text-deep-blue dark:text-slate-50;
}

h2 {
  @apply text-4xl text-deep-blue dark:text-slate-100;
}

h3 {
  @apply text-2xl text-deep-blue dark:text-slate-200;
}

/* Component Classes */
.btn-primary {
  @apply bg-deep-blue hover:bg-blue-950 text-white font-semibold py-3 px-6 rounded-lg
    border-2 border-gold hover:border-yellow-400 transition-all duration-200
    touch-none min-h-[44px] min-w-[44px] flex items-center justify-center gap-2;
}

.btn-primary:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.btn-secondary {
  @apply bg-transparent hover:bg-gold/10 text-gold font-semibold py-3 px-6 rounded-lg
    border-2 border-gold hover:border-yellow-400 transition-all duration-200
    touch-none min-h-[44px] min-w-[44px] flex items-center justify-center gap-2;
}

.btn-secondary:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.btn-tertiary {
  @apply bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600
    text-slate-900 dark:text-slate-100 py-3 px-6 rounded-lg
    transition-all duration-200 min-h-[44px] min-w-[44px]
    flex items-center justify-center gap-2;
}

.btn-sm {
  @apply py-2 px-4 text-sm min-h-[40px];
}

.btn-lg {
  @apply py-4 px-8 text-lg min-h-[48px];
}

/* Card Styling */
.card {
  @apply bg-white dark:bg-slate-800 rounded-lg shadow-lg 
    border-l-4 border-gold p-6 transition-shadow hover:shadow-xl;
}

.card-compact {
  @apply p-4 gap-2;
}

.card:hover {
  @apply shadow-xl;
}

/* Input Fields */
.input-field {
  @apply w-full px-4 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-600
    focus:border-gold dark:focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20
    bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
    placeholder-slate-500 dark:placeholder-slate-400
    transition-all duration-200;
}

.input-field:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.input-field::placeholder {
  @apply text-slate-500 dark:text-slate-400;
}

/* Labels */
.label {
  @apply block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2;
}

.label-required::after {
  content: ' *';
  @apply text-error;
}

/* Badge */
.badge {
  @apply inline-block px-3 py-1 rounded-full text-xs font-semibold;
}

.badge-gold {
  @apply bg-gold text-deep-blue;
}

.badge-success {
  @apply bg-success text-white;
}

.badge-warning {
  @apply bg-warning text-white;
}

.badge-error {
  @apply bg-error text-white;
}

.badge-info {
  @apply bg-info text-white;
}

/* Alert / Toast */
.alert {
  @apply p-4 rounded-lg border-l-4 flex gap-3 items-start;
}

.alert-success {
  @apply bg-success/10 border-success text-success;
}

.alert-error {
  @apply bg-error/10 border-error text-error;
}

.alert-warning {
  @apply bg-warning/10 border-warning text-warning;
}

.alert-info {
  @apply bg-info/10 border-info text-info;
}

/* Loading Spinner */
.spinner {
  @apply inline-block animate-spin;
  border: 3px solid rgba(212, 175, 55, 0.3);
  border-top-color: #D4AF37;
  border-radius: 50%;
  width: 24px;
  height: 24px;
}

.spinner-lg {
  width: 40px;
  height: 40px;
  border-width: 4px;
}

/* Empty State */
.empty-state {
  @apply flex flex-col items-center justify-center py-12 px-4 text-center;
}

.empty-state-icon {
  @apply text-gold text-6xl mb-4 opacity-50;
}

.empty-state-title {
  @apply text-xl font-bold text-deep-blue dark:text-slate-100 mb-2;
}

.empty-state-message {
  @apply text-slate-600 dark:text-slate-400 max-w-md;
}

/* Divider */
.divider {
  @apply border-t border-slate-200 dark:border-slate-700 my-4;
}

/* Link Styling */
a {
  @apply text-light-blue hover:text-deep-blue dark:text-light-blue dark:hover:text-gold
    underline transition-colors;
}

a:not([class]) {
  @apply no-underline;
}

/* Responsive Helpers */
@media (max-width: 640px) {
  h1 {
    @apply text-3xl;
  }
  
  h2 {
    @apply text-2xl;
  }
  
  .container {
    @apply px-4;
  }
}

/* Dark Mode Smooth Transition */
html.dark {
  color-scheme: dark;
}

html:not(.dark) {
  color-scheme: light;
}
```

---

## Component Examples

### Button Component (`src/components/Button.tsx`)

```typescript
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] touch-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-deep-blue hover:bg-blue-950 text-white border-2 border-gold hover:border-yellow-400',
        secondary: 'bg-transparent text-gold border-2 border-gold hover:bg-gold/10 hover:border-yellow-400',
        tertiary: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100',
      },
      size: {
        sm: 'py-2 px-4 text-sm',
        md: 'py-3 px-6 text-base',
        lg: 'py-4 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  )
);
Button.displayName = 'Button';
```

### Card Component (`src/components/Card.tsx`)

```typescript
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', compact = false, onClick }) => {
  return (
    <div
      className={`
        bg-white dark:bg-slate-800 rounded-lg shadow-lg
        border-l-4 border-gold p-6 transition-all hover:shadow-xl
        ${compact ? 'p-4' : ''}
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
```

### Input Component (`src/components/Input.tsx`)

```typescript
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className={`label ${error ? 'label-required' : ''}`}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`input-field ${error ? 'border-error focus:border-error focus:ring-error/20' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-error mt-1">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
```

### Badge Component (`src/components/Badge.tsx`)

```typescript
import React from 'react';

type BadgeVariant = 'gold' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'gold', children, className = '' }) => {
  const variants: Record<BadgeVariant, string> = {
    gold: 'bg-gold text-deep-blue',
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    error: 'bg-error text-white',
    info: 'bg-info text-white',
  };

  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
```

### Alert Component (`src/components/Alert.tsx`)

```typescript
import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type?: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', title, message, onClose }) => {
  const icons: Record<AlertType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  return (
    <div className={`alert alert-${type} animate-slide-in`}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 ml-2">
          ×
        </button>
      )}
    </div>
  );
};
```

---

## Usage Example (Dashboard Header)

```typescript
import { Button } from '@/components/Button';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Globe } from 'lucide-react';

export function Header() {
  const { t, i18n } = useTranslation();
  const [isDark, setIsDark] = React.useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b-2 border-gold shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-2xl font-poppins font-bold text-deep-blue dark:text-gold">
          ✈️ JourneyAtlas
        </h1>

        {/* Right Side Controls */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title={t('nav.theme')}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-gold" />
            ) : (
              <Moon className="w-5 h-5 text-deep-blue" />
            )}
          </button>

          {/* Language Switch */}
          <div className="flex gap-2">
            <Button
              variant={i18n.language === 'en' ? 'primary' : 'tertiary'}
              size="sm"
              onClick={() => i18n.changeLanguage('en')}
            >
              EN
            </Button>
            <Button
              variant={i18n.language === 'it' ? 'primary' : 'tertiary'}
              size="sm"
              onClick={() => i18n.changeLanguage('it')}
            >
              IT
            </Button>
          </div>

          {/* User Menu */}
          <Button variant="secondary" size="md">
            {t('nav.profile')}
          </Button>
        </div>
      </div>
    </header>
  );
}
```

---

## Font Configuration (Next Steps)

Add to `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

Import fonts in `index.html`:
```html
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
```

---

## Dark Mode Toggle Implementation

```typescript
// utils/theme.ts
export const getTheme = (): 'light' | 'dark' => {
  const stored = localStorage.getItem('theme');
  if (stored) return stored as 'light' | 'dark';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const setTheme = (theme: 'light' | 'dark') => {
  localStorage.setItem('theme', theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// App.tsx
import { useEffect } from 'react';
import { getTheme } from '@/utils/theme';

export default function App() {
  useEffect(() => {
    const theme = getTheme();
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-navy transition-colors">
      {/* App content */}
    </div>
  );
}
```

---

## PWA Manifest (`public/manifest.json`)

```json
{
  "name": "JourneyAtlas - Trip Planning & Expense Sharing",
  "short_name": "JourneyAtlas",
  "description": "Plan your trips, track expenses, and share with friends",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#003366",
  "background_color": "#F5F3F0",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/maskable-icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/screenshot-1.png",
      "sizes": "540x720",
      "form_factor": "narrow"
    }
  ],
  "categories": ["travel", "productivity"]
}
```

---

## Responsive Breakpoints Cheat Sheet

```css
/* Mobile: 0-640px */
/* Tablet: 640px-1024px */
/* Desktop: 1024px+ */

/* Tailwind responsive prefixes */
/* sm: 640px */
/* md: 768px */
/* lg: 1024px */
/* xl: 1280px */
/* 2xl: 1536px */

/* Usage */
/* w-full md:w-1/2 lg:w-1/3 = full width on mobile, 50% on tablet, 33% on desktop */
```
