// Types for the home feature
export type QuickAmount = {
  value: string;
  label: string;
};

export type CurrencyConfig = {
  label: string;
  code: string;
  symbol: string;
  decimalSeparator: string;
  thousandSeparator: string;
  quickAmounts: QuickAmount[];
};

// Currency configuration by currency code
export const currencies: Record<string, CurrencyConfig> = {
  IDR: {
    label: 'IDR - Indonesian Rupiah (IDR)',
    code: 'IDR',
    symbol: 'Rp',
    decimalSeparator: ',',
    thousandSeparator: '.',
    quickAmounts: [
      { value: '10000', label: '10K' },
      { value: '20000', label: '20K' },
      { value: '50000', label: '50K' },
      { value: '100000', label: '100K' },
    ],
  },
  MYR: {
    label: 'MYR - Malaysian Ringgit (RM)',
    code: 'MYR',
    symbol: 'RM',
    decimalSeparator: '.',
    thousandSeparator: ',',
    quickAmounts: [
      { value: '5', label: 'RM5' },
      { value: '10', label: 'RM10' },
      { value: '20', label: 'RM20' },
      { value: '50', label: 'RM50' },
    ],
  },
  SGD: {
    label: 'SGD - Singapore Dollar (S$)',
    code: 'SGD',
    symbol: 'S$',
    decimalSeparator: '.',
    thousandSeparator: ',',
    quickAmounts: [
      { value: '5', label: 'S$5' },
      { value: '10', label: 'S$10' },
      { value: '20', label: 'S$20' },
      { value: '50', label: 'S$50' },
    ],
  },
  USD: {
    label: 'USD - United State Dollar ($)',
    code: 'USD',
    symbol: '$',
    decimalSeparator: '.',
    thousandSeparator: ',',
    quickAmounts: [
      { value: '1', label: '$1' },
      { value: '5', label: '$5' },
      { value: '10', label: '$10' },
      { value: '20', label: '$20' },
    ],
  },
};

export const defaultCurrency = currencies.USD;
