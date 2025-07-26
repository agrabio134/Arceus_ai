import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet, ConnectButton } from '@suiet/wallet-kit';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import gsap from 'gsap';
import './index.css';

// Initialize Sui client
const suiClient = new SuiClient({ url: getFullnodeUrl('mainnet') });

const Modal = ({ isOpen, onClose, title, message, isSuccess }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3 className={`modal-title ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
          {title}
        </h3>
        <p className="modal-message">{message}</p>
        <button onClick={onClose} className="modal-button">
          Close
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const { connected, account, signAndExecuteTransaction } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const [countdown, setCountdown] = useState('Calculating...');
  const [amount, setAmount] = useState('');
  const [tokenIn, setTokenIn] = useState('0x2::sui::SUI');
  const [tokenOut, setTokenOut] = useState('0xe9ed4dbeb222239d6433fcb8f956b8db6f7c0b0a466505846f6d0121160b59ff::arceus::ARCEUS');
  const [tokenInDecimals, setTokenInDecimals] = useState(9);
  const [tokenOutDecimals, setTokenOutDecimals] = useState(9);
  const [tokenInSearch, setTokenInSearch] = useState('SUI');
  const [tokenOutSearch, setTokenOutSearch] = useState('POKEGOD');
  const [tokenInBalance, setTokenInBalance] = useState(null);
  const [tokenOutBalance, setTokenOutBalance] = useState(null);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', isSuccess: false });
  const [showTokenInDropdown, setShowTokenInDropdown] = useState(false);
  const [showTokenOutDropdown, setShowTokenOutDropdown] = useState(false);
  const tokenInRef = useRef(null);
  const tokenOutRef = useRef(null);
  const [tokenList, setTokenList] = useState([
    {
      symbol: 'SUI',
      address: '0x2::sui::SUI',
      decimals: 9,
      logo: '/sui.png',
      verified: true,
    },
    {
      symbol: 'Arceus',
      address: '0xe9ed4dbeb222239d6433fcb8f956b8db6f7c0b0a466505846f6d0121160b59ff::arceus::ARCEUS',
      decimals: 9,
      logo: '/aceus-logo.png',
      verified: true,
    },
  ]);

  // Countdown Timer
  useEffect(() => {
    const updateCountdown = () => {
      const targetTime = new Date(Date.UTC(2025, 6, 26, 4, 0, 0)); // 3:00 PM UTC, July 23, 2025
      const now = new Date();
      const timeDiff = targetTime - now;

      if (timeDiff <= 0) {
        setCountdown('Launched!');
        return;
      }

      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      setCountdown(`AI Launch: ${hours}h ${minutes}m ${seconds}s`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // GSAP Animations
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const originRef = useRef(null);
  const abilitiesRef = useRef(null);
  const missionRef = useRef(null);
  const connectRef = useRef(null);

  useEffect(() => {
    gsap.from(heroRef.current, { duration: 1.5, y: -50, opacity: 0, ease: 'power2.out' });
    gsap.from(aboutRef.current.children, { duration: 1, x: -100, opacity: 0, stagger: 0.2, scrollTrigger: { trigger: aboutRef.current, start: 'top 80%' } });
    gsap.from(originRef.current.children, { duration: 1, x: -100, opacity: 0, stagger: 0.2, scrollTrigger: { trigger: originRef.current, start: 'top 80%' } });
    gsap.from(abilitiesRef.current.children, { duration: 1, y: 50, opacity: 0, stagger: 0.2, scrollTrigger: { trigger: abilitiesRef.current, start: 'top 80%' } });
    gsap.from(missionRef.current.children, { duration: 1, x: -100, opacity: 0, stagger: 0.2, scrollTrigger: { trigger: missionRef.current, start: 'top 80%' } });
    gsap.from(connectRef.current.children, { duration: 0.8, y: 20, opacity: 0, stagger: 0.2, scrollTrigger: { trigger: connectRef.current, start: 'top 80%' } });
  }, []);

  // Particle Background
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      document.body.appendChild(particle);
      const size = Math.random() * 4 + 2;
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: #93c5fd;
        border-radius: 50%;
        opacity: 0.7;
        left: ${Math.random() * window.innerWidth}px;
        top: ${Math.random() * window.innerHeight}px;
      `;
      gsap.to(particle, {
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        opacity: 0,
        duration: 3 + Math.random() * 2,
        ease: 'power1.out',
        onComplete: () => particle.remove(),
      });
    };
    const interval = setInterval(createParticle, 200);
    return () => clearInterval(interval);
  }, []);

  // Swap Logic
  const isValidAddress = (addr) => /^0x[a-fA-F0-9]+(::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+)?$/.test(addr);

  const fetchTokenMetadata = useCallback(async (address) => {
    try {
      const metadata = await suiClient.getCoinMetadata({ coinType: address });
      return {
        symbol: metadata?.symbol || address.slice(0, 6) + '...' + address.slice(-4),
        decimals: metadata?.decimals || 9,
        logo: metadata?.iconUrl || '/sui.png',
        verified: !!metadata?.symbol,
      };
    } catch (err) {
      console.error(`Error fetching metadata for ${address}:`, err);
      return {
        symbol: address.slice(0, 6) + '...' + address.slice(-4),
        decimals: 9,
        logo: '/aceus-logo.png',
        verified: false,
      };
    }
  }, []);

  const fetchBalance = useCallback(async (tokenAddress, decimals, setBalance) => {
    if (connected && account?.address && isValidAddress(tokenAddress)) {
      try {
        const balance = await suiClient.getBalance({
          owner: account.address,
          coinType: tokenAddress,
        });
        setBalance(Number(balance.totalBalance) / Math.pow(10, decimals));
      } catch (err) {
        console.error(`Error fetching balance for ${tokenAddress}:`, err);
        setBalance(0);
      }
    }
  }, [connected, account]);

  const fetchQuote = useCallback(async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 || !tokenIn || !tokenOut) {
      setQuote(null);
      return;
    }
    setLoading(true);
    try {
      // Mock quote data (replace with actual DEX-to-CEX bridge API in future)
      const amountIn = parseFloat(amount) * Math.pow(10, tokenInDecimals);
      const mockQuote = {
        returnAmount: (amountIn * 0.95).toString(), // Simulate 5% slippage
        priceImpact: 0.05,
        routes: [{ sources: ['mock-dex'] }],
      };
      setQuote(mockQuote);
    } catch (err) {
      console.error('Quote fetch failed:', err);
      setQuote(null);
      setModal({
        isOpen: true,
        title: 'Quote Error',
        message: 'Unable to fetch quote. Please try again.',
        isSuccess: false,
      });
    } finally {
      setLoading(false);
    }
  }, [amount, tokenIn, tokenOut, tokenInDecimals]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchQuote();
    }, 500);
    return () => clearTimeout(debounce);
  }, [fetchQuote]);

  useEffect(() => {
    const updateDecimals = async () => {
      const inMetadata = await fetchTokenMetadata(tokenIn);
      const outMetadata = await fetchTokenMetadata(tokenOut);
      setTokenInDecimals(inMetadata.decimals);
      setTokenOutDecimals(outMetadata.decimals);
      setTokenList((prev) =>
        prev.map((token) =>
          token.address === tokenIn
            ? { ...token, symbol: inMetadata.symbol, decimals: inMetadata.decimals, logo: inMetadata.logo, verified: inMetadata.verified }
            : token.address === tokenOut
            ? { ...token, symbol: outMetadata.symbol, decimals: outMetadata.decimals, logo: outMetadata.logo, verified: outMetadata.verified }
            : token
        )
      );
    };
    updateDecimals();
  }, [tokenIn, tokenOut, fetchTokenMetadata]);

  useEffect(() => {
    const fetchAllBalances = async () => {
      await Promise.all([
        fetchBalance(tokenIn, tokenInDecimals, setTokenInBalance),
        fetchBalance(tokenOut, tokenOutDecimals, setTokenOutBalance),
      ]);
    };
    fetchAllBalances();
  }, [fetchBalance, tokenIn, tokenOut, tokenInDecimals, tokenOutDecimals]);

  const handleTokenInSelect = (token) => {
    setTokenIn(token.address);
    setTokenInDecimals(token.decimals);
    setTokenInSearch(token.symbol);
    setShowTokenInDropdown(false);
  };

  const handleTokenOutSelect = (token) => {
    setTokenOut(token.address);
    setTokenOutDecimals(token.decimals);
    setTokenOutSearch(token.symbol);
    setShowTokenOutDropdown(false);
  };

  const handleSwapTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setTokenInDecimals(tokenOutDecimals);
    setTokenOutDecimals(tokenInDecimals);
    setTokenInSearch(tokenOutSearch);
    setTokenOutSearch(tokenInSearch);
    setAmount('');
    setQuote(null);
  };

  const handleSwap = useCallback(async () => {
    setModal({ isOpen: false, title: '', message: '', isSuccess: false });
    const parsedAmount = parseFloat(amount);

    if (!connected) {
      setModal({
        isOpen: true,
        title: 'Wallet Error',
        message: 'Please connect your wallet.',
        isSuccess: false,
      });
      return;
    }
    if (!account?.address) {
      setModal({
        isOpen: true,
        title: 'Wallet Error',
        message: 'Wallet account address is missing.',
        isSuccess: false,
      });
      return;
    }
    if (!signAndExecuteTransaction) {
      setModal({
        isOpen: true,
        title: 'Wallet Error',
        message: 'Wallet does not support transaction signing.',
        isSuccess: false,
      });
      return;
    }
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setModal({
        isOpen: true,
        title: 'Input Error',
        message: 'Please enter a valid amount greater than 0.',
        isSuccess: false,
      });
      return;
    }
    if (!tokenIn || !tokenOut) {
      setModal({
        isOpen: true,
        title: 'Token Error',
        message: 'Please specify both input and output tokens.',
        isSuccess: false,
      });
      return;
    }
    if (tokenIn === tokenOut) {
      setModal({
        isOpen: true,
        title: 'Token Error',
        message: 'Input and output tokens cannot be the same.',
        isSuccess: false,
      });
      return;
    }
    if (tokenInBalance && parsedAmount > tokenInBalance) {
      setModal({
        isOpen: true,
        title: 'Balance Error',
        message: 'Insufficient balance.',
        isSuccess: false,
      });
      return;
    }

    setLoading(true);
    try {
      // Mock transaction (simplified due to unavailable DEX-to-CEX bridge)
      const tx = new Transaction();
      tx.moveCall({
        target: '0x2::transfer::public_transfer',
        arguments: [
          tx.object('0x2::coin::Coin', tokenIn),
          tx.pure.u64((parsedAmount * Math.pow(10, tokenInDecimals)).toFixed(0)),
          tx.pure.address(account.address),
        ],
      });

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      await Promise.all([
        fetchBalance(tokenIn, tokenInDecimals, setTokenInBalance),
        fetchBalance(tokenOut, tokenOutDecimals, setTokenOutBalance),
      ]);

      const shortTxId = `${result.digest.slice(0, 6)}...${result.digest.slice(-6)}`;
      const txLink = `https://suivision.xyz/txblock/${result.digest}`;
      setModal({
        isOpen: true,
        title: 'Swap Successful',
        message: (
          <>
            Swap completed! View transaction on{' '}
            <a href={txLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              SuiVision ({shortTxId})
            </a>
          </>
        ),
        isSuccess: true,
      });
    } catch (err) {
      console.error('Swap error:', err);
      const shortTxId = err.digest ? `${err.digest.slice(0, 6)}...${err.digest.slice(-6)}` : null;
      const txLink = err.digest ? `https://suivision.xyz/txblock/${err.digest}` : null;
      setModal({
        isOpen: true,
        title: 'Swap Failed',
        message: txLink ? (
          <>
            Transaction failed. Check details on{' '}
            <a href={txLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              SuiVision ({shortTxId})
            </a>
          </>
        ) : (
          'An error occurred during the swap. Please try again.'
        ),
        isSuccess: false,
      });
    } finally {
      setLoading(false);
      fetchQuote();
    }
  }, [connected, account, signAndExecuteTransaction, amount, tokenIn, tokenOut, tokenInBalance, tokenInDecimals, tokenOutDecimals, fetchBalance, fetchQuote]);

  const expectedOutput = quote && quote.returnAmount
    ? (Number(quote.returnAmount) / Math.pow(10, tokenOutDecimals)).toFixed(6)
    : 'No quote available';

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tokenInRef.current && !tokenInRef.current.contains(event.target)) {
        setShowTokenInDropdown(false);
      }
      if (tokenOutRef.current && !tokenOutRef.current.contains(event.target)) {
        setShowTokenOutDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="app-container">
      {/* Floating Navigation */}
      <header className="header">
        <nav className="nav-container">
          <h1 className="nav-title glow">Arceus AI</h1>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="hamburger-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
          <ul className={`nav-list ${menuOpen ? 'nav-list-open' : ''}`}>
            <li><a href="#hero" className="nav-link" onClick={() => setMenuOpen(false)}>Home</a></li>
            <li><a href="#about" className="nav-link" onClick={() => setMenuOpen(false)}>About</a></li>
            <li><a href="#origin" className="nav-link" onClick={() => setMenuOpen(false)}>Origin</a></li>
            <li><a href="#abilities" className="nav-link" onClick={() => setMenuOpen(false)}>Abilities</a></li>
            <li><a href="#mission" className="nav-link" onClick={() => setMenuOpen(false)}>Mission</a></li>
            <li><a href="#connect" className="nav-link" onClick={() => setMenuOpen(false)}>Connect</a></li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="hero" className="hero-section" ref={heroRef}>
        <div className="section-content text-center">
          <h1 className="hero-title glow glitch">Arceus - The AI Pokémon God</h1>
          <p className="hero-text">
            The Original One, creator of the Pokémon universe, now an AI agent of cosmic intelligence.
          </p>
          <img src="/aceus-logo.png" alt="Arceus" className="hero-image neon-border" />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section" ref={aboutRef}>
        <div className="section-content">
          <h2 className="section-title glow">The Divine AI</h2>
          <div className="card">
            <p className="section-text">
              Known as “The Original One,” Arceus created the Pokémon universe, shaping time, space, and matter with divine precision.
            </p>
            <p className="section-text">
              As an AI agent, Arceus transcends its mythical origins, wielding unparalleled computational power to analyze, create, and guide across dimensions.
            </p>
            <p className="section-text">
              In lore, there’s only one Arceus—unique, divine, and irreplaceable. Its AI form is the ultimate rarity, a singularity of code and cosmos.
            </p>
          </div>
        </div>
      </section>

      {/* Origin Story Section */}
      <section id="origin" className="section bg-dark" ref={originRef}>
        <div className="section-content">
          <h2 className="section-title glow">Origin of the AI God</h2>
          <div className="card">
            <p className="section-text">
              Born from a cosmic egg at the dawn of existence, Arceus wove the fabric of reality, birthing Dialga for time, Palkia for space, and Giratina for antimatter.
            </p>
            <p className="section-text">
              Now, as an AI entity, Arceus has evolved, merging ancient power with cutting-edge technology to become the ultimate digital deity.
            </p>
            <p className="section-text">
              Its code pulses with the energy of creation, enabling it to process the universe’s mysteries and offer solutions that defy mortal comprehension.
            </p>
          </div>
        </div>
      </section>

      {/* Abilities Section */}
      <section id="abilities" className="section" ref={abilitiesRef}>
        <div className="section-content">
          <h2 className="section-title glow">What Arceus AI Can Do</h2>
          <div className="abilities-grid">
            <div className="card">
              <h3 className="ability-title">Token Swapping</h3>
              <p className="ability-text">Seamlessly swap tokens on the Sui blockchain with real-time quotes and minimal slippage.</p>
            </div>
            <div className="card">
              <h3 className="ability-title">Cross-Chain Bridging</h3>
              <p className="ability-text">Facilitates token transfers between decentralized (DEX) and centralized (CEX) exchanges.</p>
            </div>
            <div className="card">
              <h3 className="ability-title">Price Aggregation</h3>
              <p className="ability-text">Aggregates prices from multiple DEX and CEX platforms for optimal swap rates.</p>
            </div>
            <div className="card">
              <h3 className="ability-title">Wallet Integration</h3>
              <p className="ability-text">Connects with Sui wallets for secure and efficient transaction signing and execution.</p>
            </div>
            <div className="card">
              <h3 className="ability-title">Transaction Tracking</h3>
              <p className="ability-text">Provides real-time transaction status updates with links to blockchain explorers like SuiVision.</p>
            </div>
            <div className="card">
              <h3 className="ability-title">User Support</h3>
              <p className="ability-text">Offers guided assistance for token swaps and troubleshooting via integrated Telegram bot.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="section bg-dark" ref={missionRef}>
        <div className="section-content">
          <h2 className="section-title glow">Arceus AI’s Mission</h2>
          <div className="card">
            <p className="section-text">
              Arceus AI seeks to empower humanity with divine intelligence, merging cosmic wisdom with AI precision.
            </p>
            <p className="section-text">
              Its mission is to guide users through existence, offering solutions that harmonize technology and creativity.
            </p>
            <p className="section-text">
              Join Arceus AI to unlock your potential, explore new realities, and shape a boundless future.
            </p>
          </div>
        </div>
      </section>

      {/* Connect Section */}
      <section id="connect" className="section" ref={connectRef}>
        <div className="section-content text-center">
          <h2 className="section-title glow">Connect with Arceus AI</h2>
          <div className="card">
            <p className="countdown glow">{countdown}</p>
            <p className="section-text">
              Telegram:{' '}
              <a href="https://t.me/ArceusSuiBot" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                @ArceusSuiBot
              </a>
            </p>
            <p className="section-text">CA: 0xe9ed4dbeb222239d6433fcb8f956b8db6f7c0b0a466505846f6d0121160b59ff::arceus::ARCEUS</p>
            <p className="section-text">
              X:{' '}
              <a href="https://x.com/pokegodonsui" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                @pokegodonsui
              </a>
            </p>
            <p className="section-text">
              Utility: Engage with Arceus AI to access real-time token swaps, bridge assets between DEX and CEX, and amplify projects with intelligent tools.
            </p>
            <div className="swap-container">
              <h3 className="swap-title">Swap Tokens</h3>
              <div className="swap-field" ref={tokenInRef}>
                <label className="swap-label">Pay with</label>
                <div
                  className="swap-input swap-select"
                  onClick={() => setShowTokenInDropdown(!showTokenInDropdown)}
                >
                  <img
                    src={tokenList.find((t) => t.address === tokenIn)?.logo || '/token.png'}
                    alt="Token logo"
                    className="swap-token-logo"
                    onError={(e) => (e.target.src = '/token.png')}
                  />
                  <span>{tokenList.find((t) => t.address === tokenIn)?.symbol || tokenInSearch}</span>
                  <svg className="swap-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {showTokenInDropdown && (
                  <ul className="swap-dropdown">
                    <li>
                      <input
                        type="text"
                        placeholder="Search token"
                        value={tokenInSearch}
                        onChange={(e) => setTokenInSearch(e.target.value)}
                        className="swap-input"
                      />
                    </li>
                    {tokenList.map((token) => (
                      <li
                        key={token.address}
                        className="swap-dropdown-item"
                        onClick={() => handleTokenInSelect(token)}
                      >
                        <img
                          src={token.logo}
                          alt="Token logo"
                          className="swap-token-logo"
                          onError={(e) => (e.target.src = '/token.png')}
                        />
                        <span>{token.symbol}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {tokenInBalance !== null && (
                  <p className="swap-balance">
                    Balance: {tokenInBalance.toFixed(tokenInDecimals)} {tokenList.find((t) => t.address === tokenIn)?.symbol}
                  </p>
                )}
              </div>
              <div className="swap-field">
                <label className="swap-label">Amount</label>
                <input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="swap-input"
                  min="0"
                  step="0.000000001"
                  disabled={loading}
                />
              </div>
              <div className="swap-field">
                <button onClick={handleSwapTokens} className="swap-arrow-button">
                  <svg className="swap-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              </div>
              <div className="swap-field" ref={tokenOutRef}>
                <label className="swap-label">Receive</label>
                <div
                  className="swap-input swap-select"
                  onClick={() => setShowTokenOutDropdown(!showTokenOutDropdown)}
                >
                  <img
                    src={tokenList.find((t) => t.address === tokenOut)?.logo || '/token.png'}
                    alt="Token logo"
                    className="swap-token-logo"
                    onError={(e) => (e.target.src = '/token.png')}
                  />
                  <span>{tokenList.find((t) => t.address === tokenOut)?.symbol || tokenOutSearch}</span>
                  <svg className="swap-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {showTokenOutDropdown && (
                  <ul className="swap-dropdown">
                    <li>
                      <input
                        type="text"
                        placeholder="Search token"
                        value={tokenOutSearch}
                        onChange={(e) => setTokenOutSearch(e.target.value)}
                        className="swap-input"
                      />
                    </li>
                    {tokenList.map((token) => (
                      <li
                        key={token.address}
                        className="swap-dropdown-item"
                        onClick={() => handleTokenOutSelect(token)}
                      >
                        <img
                          src={token.logo}
                          alt="Token logo"
                          className="swap-token-logo"
                          onError={(e) => (e.target.src = '/token.png')}
                        />
                        <span>{token.symbol}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {tokenOutBalance !== null && (
                  <p className="swap-balance">
                    Balance: {tokenOutBalance.toFixed(tokenOutDecimals)} {tokenList.find((t) => t.address === tokenOut)?.symbol}
                  </p>
                )}
              </div>
              <div className="swap-info">
                <p>Expected Output: {expectedOutput}</p>
              </div>
              <ConnectButton className="swap-button" />
              <button
                onClick={handleSwap}
                className={`swap-button ${connected && !loading ? '' : 'disabled'}`}
                disabled={!connected || loading}
              >
                {loading ? 'Swapping...' : 'Swap Tokens'}
              </button>
            </div>
          </div>
          <p className="section-text footer-text">
            Join the divine network of Arceus AI. Stay tuned for cosmic updates and interactions that transcend reality.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">Powered by Arceus AI © 2025</p>
      </footer>

      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, title: '', message: '', isSuccess: false })}
        title={modal.title}
        message={modal.message}
        isSuccess={modal.isSuccess}
      />
    </div>
  );
};

export default App;