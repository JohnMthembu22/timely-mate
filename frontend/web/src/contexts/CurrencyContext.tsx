import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { formatCurrency, formatZAR, getCurrencySymbol } from '../utils/currency';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  formatAmount: (amount: number) => string;
  getSymbol: () => string;
  isLoading: boolean;
  error: string | null;
  detectedCountry: string | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

// Currency mapping based on country codes
const countryToCurrency: { [key: string]: string } = {
  'ZA': 'ZAR', // South Africa
  'US': 'USD', // United States
  'GB': 'GBP', // United Kingdom
  'EU': 'EUR', // European Union
  'AU': 'AUD', // Australia
  'CA': 'CAD', // Canada
  'JP': 'JPY', // Japan
  'CN': 'CNY', // China
  'IN': 'INR', // India
  'NG': 'NGN', // Nigeria
  'KE': 'KES', // Kenya
  'GH': 'GHS', // Ghana
  'EG': 'EGP', // Egypt
  'MA': 'MAD', // Morocco
  'TZ': 'TZS', // Tanzania
  'UG': 'UGX', // Uganda
  'ET': 'ETB', // Ethiopia
  'DZ': 'DZD', // Algeria
  'TN': 'TND', // Tunisia
  'LY': 'LYD', // Libya
  'SD': 'SDG', // Sudan
  'SS': 'SSP', // South Sudan
  'CF': 'XAF', // Central African Republic
  'TD': 'XAF', // Chad
  'CM': 'XAF', // Cameroon
  'CG': 'XAF', // Republic of the Congo
  'CD': 'CDF', // Democratic Republic of the Congo
  'GA': 'XAF', // Gabon
  'GQ': 'XAF', // Equatorial Guinea
  'ST': 'STD', // São Tomé and Príncipe
  'AO': 'AOA', // Angola
  'MZ': 'MZN', // Mozambique
  'ZW': 'ZWL', // Zimbabwe
  'BW': 'BWP', // Botswana
  'NA': 'NAD', // Namibia
  'LS': 'LSL', // Lesotho
  'SZ': 'SZL', // Eswatini
  'MG': 'MGA', // Madagascar
  'MU': 'MUR', // Mauritius
  'SC': 'SCR', // Seychelles
  'KM': 'KMF', // Comoros
  'DJ': 'DJF', // Djibouti
  'SO': 'SOS', // Somalia
  'ER': 'ERN', // Eritrea
  'BI': 'BIF', // Burundi
  'RW': 'RWF', // Rwanda
  'MW': 'MWK', // Malawi
  'ZM': 'ZMW', // Zambia
  'SL': 'SLE', // Sierra Leone
  'LR': 'LRD', // Liberia
  'CI': 'XOF', // Ivory Coast
  'BF': 'XOF', // Burkina Faso
  'ML': 'XOF', // Mali
  'NE': 'XOF', // Niger
  'SN': 'XOF', // Senegal
  'GN': 'GNF', // Guinea
  'GW': 'XOF', // Guinea-Bissau
  'CV': 'CVE', // Cape Verde
  'GM': 'GMD', // Gambia
  'TG': 'XOF', // Togo
  'BJ': 'XOF', // Benin
  'MR': 'MRU', // Mauritania
};

const DEFAULT_CURRENCY = 'ZAR';

function readStoredCurrency(): { currency: string; country: string | null } {
  const preferred = localStorage.getItem('preferredCurrency');
  if (preferred) {
    return { currency: preferred, country: localStorage.getItem('detectedCountry') };
  }

  const detected = localStorage.getItem('detectedCurrency');
  if (detected) {
    return { currency: detected, country: localStorage.getItem('detectedCountry') };
  }

  return { currency: DEFAULT_CURRENCY, country: null };
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const stored = readStoredCurrency();
  const [currency, setCurrency] = useState(stored.currency);
  const [isLoading, setIsLoading] = useState(!localStorage.getItem('preferredCurrency') && !localStorage.getItem('detectedCurrency'));
  const [error, setError] = useState<string | null>(null);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(stored.country);

  // Detect currency based on geolocation (only when no saved preference exists)
  useEffect(() => {
    if (localStorage.getItem('preferredCurrency') || localStorage.getItem('detectedCurrency')) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const detectCurrency = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!navigator.geolocation || window.electronAPI) {
          if (import.meta.env.DEV) {
            console.info('Skipping geolocation detection. Using default currency.');
          }
          if (!cancelled) {
            setCurrency(stored.currency);
            setIsLoading(false);
          }
          return;
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 3600000, // 1 hour — avoid repeat slow prompts
          });
        });

        if (cancelled) return;

        const { latitude, longitude } = position.coords;

        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }

        const data = await response.json();
        const countryCode = data.countryCode;
        const detectedCurrency = countryToCurrency[countryCode] || DEFAULT_CURRENCY;

        if (import.meta.env.DEV) {
          console.info(`Detected location: ${data.countryName} (${countryCode}), using currency: ${detectedCurrency}`);
        }

        setCurrency(detectedCurrency);
        localStorage.setItem('detectedCurrency', detectedCurrency);
        setDetectedCountry(data.countryName);
        localStorage.setItem('detectedCountry', data.countryName);
      } catch (err) {
        if (cancelled) return;

        if (import.meta.env.DEV) {
          if (err instanceof GeolocationPositionError) {
            const reason =
              err.code === err.PERMISSION_DENIED
                ? 'Location permission denied'
                : err.code === err.POSITION_UNAVAILABLE
                  ? 'Location unavailable'
                  : err.code === err.TIMEOUT
                    ? 'Location request timed out'
                    : 'Location detection failed';
            console.info(`${reason}. Using default currency.`);
          } else {
            console.info('Currency detection failed. Using default currency.');
          }
        }

        setError('Could not detect your location. Using default currency.');

        const savedCurrency = localStorage.getItem('detectedCurrency');
        setCurrency(savedCurrency || DEFAULT_CURRENCY);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    detectCurrency();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSetCurrency = (newCurrency: string) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
  };

  const formatAmount = (amount: number): string => {
    return formatCurrency(amount, currency);
  };

  const getSymbol = (): string => {
    return getCurrencySymbol(currency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: handleSetCurrency,
        formatAmount,
        getSymbol,
        isLoading,
        error,
        detectedCountry,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
