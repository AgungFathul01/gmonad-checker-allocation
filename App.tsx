
import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Copy, Check } from 'lucide-react';
import { RAW_CSV_DATA } from './constants';
import { AllocationData, SearchStatus } from './types';

function App() {
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [result, setResult] = useState<AllocationData | null>(null);
  const [allocations, setAllocations] = useState<Map<string, number>>(new Map());
  const [isDataReady, setIsDataReady] = useState(false);
  const [copied, setCopied] = useState(false);

  // Parse CSV data on mount
  useEffect(() => {
    const parseData = () => {
      const lines = RAW_CSV_DATA.trim().split('\n');
      const map = new Map<string, number>();
      
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const [addr, amount] = lines[i].split(',');
        if (addr && amount) {
          map.set(addr.toLowerCase().trim(), Number(amount));
        }
      }
      
      setAllocations(map);
      setIsDataReady(true);
    };

    // Small delay to not block main thread immediately on mount
    setTimeout(parseData, 100);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setStatus('searching');
    
    // Simulate a brief network delay for better UX feeling
    setTimeout(() => {
      const normalizedAddress = address.toLowerCase().trim();
      const amount = allocations.get(normalizedAddress);

      if (amount !== undefined) {
        setResult({ address: normalizedAddress, amount });
        setStatus('found');
      } else {
        setResult(null);
        setStatus('not-found');
      }
    }, 600);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(`I'm eligible for ${formatNumber(result.amount)} $GMONAD! Check yours at gmonad.xyz`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setAddress('');
    setStatus('idle');
    setResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gmonad-purple/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gmonad-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
      </div>

      <main className="w-full max-w-xl relative z-10">
        
        {/* Header / Logo Section */}
        <div className="text-center mb-10 animate-float">
           <div className="w-32 h-32 mx-auto mb-6 relative">
             <div className="absolute inset-0 bg-gradient-to-br from-gmonad-purple to-gmonad-accent rounded-full blur-lg opacity-50"></div>
             <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/10 shadow-2xl bg-black">
                {/* Logo based on the prompt description */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <rect width="100" height="100" fill="#a855f7"/>
                  <circle cx="50" cy="50" r="40" fill="#8b5cf6" opacity="0.5"/>
                  <text x="50" y="55" fontSize="40" textAnchor="middle" fill="white">👾</text>
                </svg>
             </div>
           </div>
           <h1 className="font-display text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white">
             GMONAD CHECKER
           </h1>
           <p className="text-gray-400 font-sans text-sm tracking-widest uppercase">
             Phase 1 Allocation
           </p>
        </div>

        {/* Search Card */}
        <div className="glass rounded-2xl p-1 p-px bg-gradient-to-b from-white/10 to-transparent">
          <div className="bg-gmonad-card/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/5">
            
            {status === 'idle' || status === 'searching' ? (
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium text-gray-300 ml-1">
                    Enter EVM Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-gmonad-purple/50 focus:ring-1 focus:ring-gmonad-purple/50 transition-all font-mono"
                      disabled={!isDataReady || status === 'searching'}
                    />
                    {status === 'searching' && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-gmonad-purple border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!address || !isDataReady || status === 'searching'}
                  className={`w-full py-4 rounded-xl font-display font-bold text-lg transition-all duration-200 
                    ${address && isDataReady && status !== 'searching'
                      ? 'bg-gradient-to-r from-gmonad-purple to-purple-600 hover:opacity-90 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transform hover:-translate-y-0.5' 
                      : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}
                >
                  {status === 'searching' ? 'Checking Chain...' : 'Check Eligibility'}
                </button>
              </form>
            ) : null}

            {/* Result: Success */}
            {status === 'found' && result && (
              <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center ring-1 ring-green-500/50">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-display font-bold text-white mb-1">Congratulations!</h3>
                  <p className="text-gray-400 text-sm font-mono break-all px-4">
                    {result.address}
                  </p>
                </div>

                <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-xl p-6">
                  <p className="text-sm text-gray-400 mb-1 uppercase tracking-wider">Total Allocation</p>
                  <p className="text-4xl sm:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-gmonad-accent to-gmonad-purple">
                    {formatNumber(result.amount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">$GMONAD</p>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={copyToClipboard}
                    className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-sm font-medium transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Share Result'}
                  </button>
                  <button 
                    onClick={handleReset}
                    className="px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-sm font-medium transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* Result: Not Found */}
            {status === 'not-found' && (
              <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center ring-1 ring-red-500/50">
                    <XCircle className="w-8 h-8 text-red-400" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">Not Eligible</h3>
                  <p className="text-gray-400">
                    This address was not found in the snapshot.
                  </p>
                </div>

                <button 
                  onClick={handleReset}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-sm font-medium transition-colors"
                >
                  Check Another Address
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-xs text-gray-400">
            <AlertCircle className="w-3 h-3" />
            <span>Created by @callmera</span>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
