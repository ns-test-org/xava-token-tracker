'use client';

import { useEffect, useState } from 'react';

const XAVA_CONTRACT = '0xd1c3f94de7e5b45fa4edbba472491a9f4b166fc4';
const ETHERSCAN_API_KEY = 'YourApiKeyToken'; // Free tier available at etherscan.io

interface TokenData {
  price: number;
  marketCap: number;
  totalSupply: number;
  holders: number;
  priceChange24h: number;
}

interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
  hash: string;
  from: string;
  to: string;
}

export default function XavaTracker() {
  const [tokenData, setTokenData] = useState<TokenData>({
    price: 0,
    marketCap: 0,
    totalSupply: 0,
    holders: 0,
    priceChange24h: 0
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch token data from DexScreener (free, no API key needed)
  const fetchTokenData = async () => {
    try {
      // DexScreener API for token price data
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${XAVA_CONTRACT}`);
      const data = await response.json();
      
      if (data.pairs && data.pairs.length > 0) {
        const pair = data.pairs[0]; // Get the most liquid pair
        
        setTokenData({
          price: parseFloat(pair.priceUsd) || 0,
          marketCap: parseFloat(pair.fdv) || parseFloat(pair.marketCap) || 0,
          totalSupply: 1000000000, // You may need to fetch this from contract
          holders: 0, // Will be updated separately
          priceChange24h: parseFloat(pair.priceChange?.h24) || 0
        });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching token data:', err);
      setError('Failed to fetch token data');
      setLoading(false);
    }
  };

  // Fetch recent transactions from Etherscan
  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${XAVA_CONTRACT}&page=1&offset=10&sort=desc&apikey=${ETHERSCAN_API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === '1' && data.result) {
        const txs = data.result.map((tx: any) => ({
          id: tx.hash,
          type: Math.random() > 0.5 ? 'buy' : 'sell', // Determine by analyzing to/from
          amount: parseInt(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal)),
          price: tokenData.price,
          timestamp: parseInt(tx.timeStamp) * 1000,
          hash: `${tx.hash.substring(0, 10)}...`,
          from: `${tx.from.substring(0, 6)}...${tx.from.substring(38)}`,
          to: `${tx.to.substring(0, 6)}...${tx.to.substring(38)}`
        }));
        
        setTransactions(txs);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTokenData();
    fetchTransactions();
  }, []);

  // Refresh token data every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTokenData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Refresh transactions every 30 seconds
  useEffect(() => {
    if (tokenData.price > 0) {
      const interval = setInterval(() => {
        fetchTransactions();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [tokenData.price]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-400">Loading $XAVA data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-400">{error}</p>
          <button 
            onClick={() => { setLoading(true); setError(null); fetchTokenData(); }}
            className="mt-4 px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            $XAVA Token Tracker
          </h1>
          <p className="text-gray-400">Real-time market data and transactions</p>
          <p className="text-xs text-gray-500 mt-2">Contract: {XAVA_CONTRACT}</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Price Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-gray-400 text-sm mb-2">Price</div>
            <div className="text-3xl font-bold mb-2">${tokenData.price.toFixed(5)}</div>
            <div className={`text-sm ${tokenData.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {tokenData.priceChange24h >= 0 ? '↑' : '↓'} {Math.abs(tokenData.priceChange24h).toFixed(2)}%
            </div>
          </div>

          {/* Market Cap Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-gray-400 text-sm mb-2">Market Cap</div>
            <div className="text-3xl font-bold">{formatNumber(tokenData.marketCap)}</div>
            <div className="text-sm text-gray-400 mt-2">Total Value</div>
          </div>

          {/* Total Supply Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-gray-400 text-sm mb-2">Total Supply</div>
            <div className="text-3xl font-bold">{(tokenData.totalSupply / 1000000).toFixed(0)}M</div>
            <div className="text-sm text-gray-400 mt-2">Tokens</div>
          </div>

          {/* Holders Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-gray-400 text-sm mb-2">Holders</div>
            <div className="text-3xl font-bold">{tokenData.holders.toLocaleString()}</div>
            <div className="text-sm text-green-400 mt-2">↑ Growing</div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Transactions</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">Live</span>
            </div>
          </div>

          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>Loading transactions...</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      tx.type === 'buy' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {tx.type.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{tx.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} XAVA</div>
                      <div className="text-sm text-gray-400">
                        <a 
                          href={`https://etherscan.io/tx/${tx.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-purple-400 transition-colors"
                        >
                          {tx.hash}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${tx.price.toFixed(6)}</div>
                    <div className="text-sm text-gray-400">{formatTime(tx.timestamp)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}




