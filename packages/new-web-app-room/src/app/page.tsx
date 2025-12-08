'use client';

import { useEffect, useState } from 'react';

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
}

export default function XavaTracker() {
  const [tokenData, setTokenData] = useState<TokenData>({
    price: 0.00234,
    marketCap: 2340000,
    totalSupply: 1000000000,
    holders: 1247,
    priceChange24h: 12.5
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'buy', amount: 50000, price: 0.00234, timestamp: Date.now() - 30000, hash: '0x1a2b3c...' },
    { id: '2', type: 'sell', amount: 25000, price: 0.00233, timestamp: Date.now() - 60000, hash: '0x4d5e6f...' },
    { id: '3', type: 'buy', amount: 100000, price: 0.00235, timestamp: Date.now() - 120000, hash: '0x7g8h9i...' },
    { id: '4', type: 'buy', amount: 75000, price: 0.00234, timestamp: Date.now() - 180000, hash: '0xjk1l2m...' },
    { id: '5', type: 'sell', amount: 30000, price: 0.00232, timestamp: Date.now() - 240000, hash: '0xn3o4p5...' },
  ]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTokenData(prev => {
        const change = (Math.random() - 0.5) * 0.00001;
        const newPrice = Math.max(0.001, prev.price + change);
        return {
          ...prev,
          price: newPrice,
          marketCap: newPrice * prev.totalSupply,
          priceChange24h: prev.priceChange24h + (Math.random() - 0.5) * 0.5
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Simulate new transactions
  useEffect(() => {
    const interval = setInterval(() => {
      const newTx: Transaction = {
        id: Date.now().toString(),
        type: Math.random() > 0.5 ? 'buy' : 'sell',
        amount: Math.floor(Math.random() * 100000) + 10000,
        price: tokenData.price,
        timestamp: Date.now(),
        hash: `0x${Math.random().toString(36).substring(7)}...`
      };
      
      setTransactions(prev => [newTx, ...prev.slice(0, 9)]);
    }, 8000);

    return () => clearInterval(interval);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            $XAVA Token Tracker
          </h1>
          <p className="text-gray-400">Real-time market data and transactions</p>
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
            {transactions.map((tx) => (
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
                    <div className="font-medium">{tx.amount.toLocaleString()} XAVA</div>
                    <div className="text-sm text-gray-400">{tx.hash}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${tx.price.toFixed(5)}</div>
                  <div className="text-sm text-gray-400">{formatTime(tx.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

