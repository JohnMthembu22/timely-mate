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

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrency] = useState('ZAR'); // Default fallback
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

  // Detect currency based on geolocation
  useEffect(() => {
    const detectCurrency = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if geolocation is supported or if running in Electron
        if (!navigator.geolocation || window.electronAPI) {
          console.info('Skipping geolocation detection. Using default currency.');
          setCurrency('ZAR'); // Default to ZAR
          setIsLoading(false);
          return;
        }

        // Get user's location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 5000, // Reduced timeout for better UX
            maximumAge: 300000, // 5 minutes
          });
        });

        const { latitude, longitude } = position.coords;

        // Use reverse geocoding to get country code
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }

        const data = await response.json();
        const countryCode = data.countryCode;

        // Map country code to currency
        const detectedCurrency = countryToCurrency[countryCode] || 'ZAR';
        
        console.log(`Detected location: ${data.countryName} (${countryCode}), using currency: ${detectedCurrency}`);
        
        setCurrency(detectedCurrency);
        localStorage.setItem('detectedCurrency', detectedCurrency);
        setDetectedCountry(data.countryName);
        localStorage.setItem('detectedCountry', data.countryName);

      } catch (err) {
        // Handle different types of geolocation errors gracefully
        if (err instanceof GeolocationPositionError) {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              console.info('Location permission denied. Using default currency.');
              break;
            case err.POSITION_UNAVAILABLE:
              console.info('Location unavailable. Using default currency.');
              break;
            case err.TIMEOUT:
              console.info('Location request timed out. Using default currency.');
              break;
            default:
              console.info('Location detection failed. Using default currency.');
          }
        } else {
          console.info('Currency detection failed. Using default currency.');
        }
        
        setError('Could not detect your location. Using default currency.');
        
        // Try to use previously detected currency
        const savedCurrency = localStorage.getItem('detectedCurrency');
        if (savedCurrency) {
          setCurrency(savedCurrency);
        } else {
          setCurrency('ZAR'); // Default fallback
        }
      } finally {
        setIsLoading(false);
      }
    };

    detectCurrency();
  }, []);

  // Allow manual currency override (for testing or user preference)
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