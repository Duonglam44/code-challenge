import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowUpDown, Loader2, TrendingUp, Wallet, RefreshCw } from 'lucide-react';

import CurrencySelector from './CurrencySelector';
import type { Currency, SwapFormData } from '../types';
import { mockWalletBalances } from '../mocks/dummy-balances';

const CurrencySwapForm = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
  const [toDropdownOpen, setToDropdownOpen] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<SwapFormData>({
    defaultValues: {
      fromCurrency: '',
      toCurrency: '',
      fromAmount: '',
      toAmount: ''
    }
  });

  const watchedValues = watch();
  const { fromCurrency, toCurrency, fromAmount } = watchedValues;

  const fetchCurrencies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://interview.switcheo.com/prices.json');
      if (!response.ok) {
        throw new Error('Failed to fetch currency data');
      }
      const data: Currency[] = await response.json();
      
      // Remove duplicates and sort by currency name
      const uniqueCurrencies = data.reduce((acc: Currency[], current) => {
        const existing = acc.find(item => item.currency === current.currency);
        if (!existing || new Date(current.date) > new Date(existing.date)) {
          return acc.filter(item => item.currency !== current.currency).concat(current);
        }
        return acc;
      }, []);
      
      setCurrencies(uniqueCurrencies.sort((a, b) => a.currency.localeCompare(b.currency)));
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch currencies');
    } finally {
      setLoading(false);
    }
  }, [])

  useEffect(() => {
    fetchCurrencies();

  // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (fromCurrency && toCurrency && fromAmount && currencies.length > 0) {
      const fromCurrencyData = currencies.find(c => c.currency === fromCurrency);
      const toCurrencyData = currencies.find(c => c.currency === toCurrency);
      
      if (fromCurrencyData && toCurrencyData && !isNaN(parseFloat(fromAmount))) {
        const exchangeRate = fromCurrencyData.price / toCurrencyData.price;
        const toAmount = (parseFloat(fromAmount) * exchangeRate).toFixed(6);
        setValue('toAmount', toAmount);
      }
    }
  }, [fromCurrency, toCurrency, fromAmount, currencies, setValue]);

  const handleSwapCurrencies = () => {
    const tempCurrency = fromCurrency;
    setValue('fromCurrency', toCurrency);
    setValue('toCurrency', tempCurrency);
    setValue('fromAmount', '');
    setValue('toAmount', '');
  };

  const onSubmit = useCallback(async (data: SwapFormData) => {
    if (!data.fromAmount || parseFloat(data.fromAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const balance = mockWalletBalances[data.fromCurrency as keyof typeof mockWalletBalances] || 0;
    if (parseFloat(data.fromAmount) > balance) {
      setError(`Insufficient balance. Available: ${balance} ${data.fromCurrency}`);
      return;
    }

    setSwapping(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Successfully swapped ${data.fromAmount} ${data.fromCurrency} for ${data.toAmount} ${data.toCurrency}!`);

      reset();
    } catch {
      setError('Swap failed. Please try again.');
    } finally {
      setSwapping(false);
    }
  }, [reset])

  const getExchangeRate = () => {
    if (fromCurrency && toCurrency && currencies.length > 0) {
      const fromCurrencyData = currencies.find(c => c.currency === fromCurrency);
      const toCurrencyData = currencies.find(c => c.currency === toCurrency);
      
      if (fromCurrencyData && toCurrencyData) {
        const rate = fromCurrencyData.price / toCurrencyData.price;
        return `1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}`;
      }
    }
    return null;
  };

  const getBalance = (currency: string) => {
    return mockWalletBalances[currency as keyof typeof mockWalletBalances] || 0;
  };

  if (loading && currencies.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-700">Loading currencies...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <ArrowUpDown className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Currency Swap</h1>
          <p className="text-gray-600">Exchange your digital assets instantly</p>
          {lastUpdated && (
            <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              Last updated: {lastUpdated.toLocaleTimeString()}
              <button
                onClick={fetchCurrencies}
                className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors !bg-white focus:!bg-gradient-to-r focus:!from-blue-600 focus:!to-purple-600 focus:!border-color-[transparent] focus:!text-white focus:!outline-none transition-all"
                disabled={loading}
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Wallet className="h-4 w-4 mr-1" />
                From
              </label>
              <div className="grid grid-cols-2 gap-3">
                <CurrencySelector
                  value={fromCurrency}
                  onChange={(value) => setValue('fromCurrency', value)}
                  placeholder="Select currency"
                  isOpen={fromDropdownOpen}
                  setIsOpen={setFromDropdownOpen}
                  error={errors.fromCurrency?.message}
                  currencies={currencies}
                />
                <div>
                  <input
                    type="number"
                    step="any"
                    inputMode="numeric"
                    placeholder="0.00"
                    {...register('fromAmount', { 
                      required: 'Amount is required',
                      min: { value: 0.000001, message: 'Amount must be greater than 0' }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none bg-white/80 text-black appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  {errors.fromAmount && (
                    <p className="text-red-500 text-xs mt-1">{errors.fromAmount.message}</p>
                  )}
                </div>
              </div>
              {fromCurrency && (
                <p className="text-xs text-gray-500 flex items-center">
                  <Wallet className="h-3 w-3 mr-1" />
                  Balance: {getBalance(fromCurrency).toLocaleString()} {fromCurrency}
                </p>
              )}
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleSwapCurrencies}
                className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                disabled={!fromCurrency || !toCurrency}
              >
                <ArrowUpDown className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                To
              </label>
              <div className="grid grid-cols-2 gap-3">
                <CurrencySelector
                  value={toCurrency}
                  onChange={(value) => setValue('toCurrency', value)}
                  placeholder="Select currency"
                  isOpen={toDropdownOpen}
                  setIsOpen={setToDropdownOpen}
                  error={errors.toCurrency?.message}
                  currencies={currencies}
                />
                <div>
                  <input
                    type="text"
                    placeholder="0.00"
                    {...register('toAmount')}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none bg-white/80 text-black appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
              {toCurrency && (
                <p className="text-xs text-gray-500 flex items-center">
                  <Wallet className="h-3 w-3 mr-1" />
                  Balance: {getBalance(toCurrency).toLocaleString()} {toCurrency}
                </p>
              )}
            </div>

            {getExchangeRate() && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800 text-center font-medium">
                  {getExchangeRate()}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={swapping || !fromCurrency || !toCurrency || !fromAmount}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {swapping ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Processing Swap...
                </div>
              ) : (
                'Swap Now'
              )}
            </button>
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Secure • Fast • Reliable</p>
        </div>
      </div>
    </div>
  );
};

export default CurrencySwapForm;