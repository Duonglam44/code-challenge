import { useMemo } from 'react'
import { ChevronDown } from 'lucide-react';

import type { Currency } from '../types';
import { getTokenImage } from '../utils';

type CurrencySelector = {
  value: string;
  error?: string;
  isOpen: boolean;
  placeholder: string;
  currencies: Currency[];
  setIsOpen: (open: boolean) => void;
  onChange: (value: string) => void;
}

const CurrencySelector = (props: CurrencySelector) => {
  const { value, onChange, placeholder, isOpen, setIsOpen, error, currencies } = props
  const selectedCurrency = useMemo(() => currencies.find(c => c.currency === value), [value, currencies]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border !border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent !bg-white flex items-center justify-between text-left text-black focus:!outline-none"
      >
        {selectedCurrency ? (
          <div className="flex items-center space-x-2">
            <img
              src={getTokenImage(selectedCurrency.currency)}
              alt={selectedCurrency.currency}
              className="w-6 h-6 rounded-full"
              onError={(e) => {
                e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="currentColor" font-size="8">${selectedCurrency.currency.charAt(0)}</text></svg>`;
              }}
            />
            <span className="font-medium">{selectedCurrency.currency}</span>
          </div>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {currencies.map((currency) => (
            <button
              key={currency.currency}
              type="button"
              onClick={() => {
                onChange(currency.currency);
                setIsOpen(false);
              }}
              className="!bg-white w-full p-3 text-left hover:bg-gray-50 flex items-center space-x-2 border-b border-gray-100 last:border-b-0 text-black focus:ring-0 focus:border-b-0 focus:!outline-none"
            >
              <img
                src={getTokenImage(currency.currency)}
                alt={currency.currency}
                className="w-6 h-6 rounded-full"
                onError={(e) => {
                  e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="currentColor" font-size="8">${currency.currency.charAt(0)}</text></svg>`;
                }}
              />
              <div className="flex-1">
                <div className="font-medium">{currency.currency}</div>
                <div className="text-xs text-gray-500">${currency.price.toFixed(6)}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  )
}

export default CurrencySelector