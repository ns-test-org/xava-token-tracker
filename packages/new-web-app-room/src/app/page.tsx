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
    price: 0.00,
    marketCap: 0,
    totalSupply: 1000000000,
    holders: 0,
    priceChange24h: 0
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate real-time data updates
    const updateData = () => {
      const basePrice = 0.0045;
      const variance = (Math.random() - 0.5) * 0.0002;
      const newPrice = basePrice + variance;
      
      setTokenData({
        price: newPrice,
        marketCap: newPrice * 1000000000,
        totalSupply: 1000000000,
        holders: 15234 + Math.floor(Math.random() * 10),
        priceChange24h: -2.34 + (Math.random() * 5)
      });
      
      setLoading(false);
    };

    // Add new transaction periodically
    const addTransaction = () => {
      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: Math.random() > 0.5 ? 'buy' : 'sell',
        amount: Math.floor(Math.random() * 50000) + 1000,
        price: 0.0045 + (Math.random() - 0.5) * 0.0002,
        timestamp: Date.now(),
        hash: '0x' + Math.random().toString(36).substr(2, 9)
      };
      
      setTransactions(prev => [newTx, ...prev].slice(0, 10));
    };

    updateData();
    addTransaction();
    
    const dataInterval = setInterval(updateData, 3000);
    const txInterval = setInterval(addTransaction, 8000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(txInterval);
    };
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return `${num.toFixed(2)}`;
  };

  const formatTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
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

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="text-gray-400 text-sm mb-2">Price</div>
                <div className="text-3xl font-bold">${tokenData.price.toFixed(6)}</div>
                <div className={`text-sm mt-2 ${tokenData.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {tokenData.priceChange24h >= 0 ? '↑' : '↓'} {Math.abs(tokenData.priceChange24h).toFixed(2)}%
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="text-gray-400 text-sm mb-2">Market Cap</div>
                <div className="text-3xl font-bold">{formatNumber(tokenData.marketCap)}</div>
                <div className="text-sm text-gray-400 mt-2">Fully Diluted</div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="text-gray-400 text-sm mb-2">Total Supply</div>
                <div className="text-3xl font-bold">{(tokenData.totalSupply / 1000000000).toFixed(1)}B</div>
                <div className="text-sm text-gray-400 mt-2">XAVA Tokens</div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="text-gray-400 text-sm mb-2">Holders</div>
                <div className="text-3xl font-bold">{tokenData.holders.toLocaleString()}</div>
                <div className="text-sm text-green-400 mt-2">↑ Growing</div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
              
              {transactions.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  Waiting for transactions...
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div 
                      key={tx.id} 
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          tx.type === 'buy' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {tx.type.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold">{tx.amount.toLocaleString()} XAVA</div>
                          <div className="text-sm text-gray-400">{tx.hash.slice(0, 10)}...</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${tx.price.toFixed(6)}</div>
                        <div className="text-sm text-gray-400">{formatTime(tx.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

