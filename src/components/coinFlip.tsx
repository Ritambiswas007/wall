import React, { useState, useEffect } from 'react';
import { ethers, BigNumber, formatEther } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import './CoinFlip.css'; // Add your CSS styling here
import { PublicKey, Transaction, SystemProgram, Connection } from '@solana/web3.js';



const CoinFlip = () => {
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [selectedToken, setSelectedToken] = useState<'ETH' | 'SOL' | 'BTC' | null>(null);
    const [selectedAmount, setSelectedAmount] = useState<number>(0);
    const [selectedSide, setSelectedSide] = useState<'Heads' | 'Tails' | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [balance, setBalance] = useState<number>(0);
    const [flipping, setFlipping] = useState<boolean>(false);
    const [resultAmount, setResultAmount] = useState<number | null>(null); // State for result amount

    // Connecting to wallet
    const connectWallet = async () => {
        try {
            const ethProvider = await detectEthereumProvider();

            if (ethProvider) {
                const web3Provider = new ethers.BrowserProvider(ethProvider as ethers.ExternalProvider);
                setProvider(web3Provider);

                // Request account access
                const accounts = await web3Provider.send("eth_requestAccounts", []);
                setAccount(accounts[0]);

                // Get initial balance for ETH by default
                if (selectedToken === 'ETH') {
                    await getBalance(accounts[0], web3Provider);
                }
            } else {
                alert("Please install MetaMask!");
            }
        } catch (error) {
            console.error("Error connecting to wallet:", error);
        }
    };

    // Fetch balance of selected token
    const getBalance = async (account: string, web3Provider: ethers.BrowserProvider) => {
        try {
            let balance: BigNumber;

            if (selectedToken === 'ETH') {
                // Fetch ETH balance
                balance = await web3Provider.getBalance(account);
                setBalance(parseFloat(formatEther(balance)));
            } else {
                // Placeholder for other tokens (SOL, BTC, ERC-20, etc.)
                console.warn("Fetching balance for tokens other than ETH is not implemented.");
                setBalance(0);
            }
        } catch (error) {
            console.error("Error fetching balance:", error);
        }
    };

    // Update balance whenever the selected token or account changes
    useEffect(() => {
        if (account && provider && selectedToken) {
            getBalance(account, provider);
        }
    }, [account, provider, selectedToken]);

    // Flip the coin
    const flipCoin = async () => {
        if (!selectedToken || selectedAmount <= 0 || !selectedSide) {
            alert("Please select a token, amount, and side.");
            return;
        }
    
        if (!provider || !account) {
            alert("Provider or account is not available.");
            return;
        }
    
        // Fetch the current balance before proceeding
        await getBalance(account, provider);
    
        if (selectedAmount > balance) {
            alert(`Insufficient balance! You have only ${balance} ${selectedToken}.`);
            return;
        }
    
        setLoading(true);
        setFlipping(true);
    
        try {
            // Simulate coin flip
            const outcome = Math.random() > 0.5 ? "Heads" : "Tails";
            setResult(outcome);
    
            const signer = await provider.getSigner(); // Ensure the signer is awaited

            let tx;
            if (outcome === selectedSide) {
                // User wins
                const winAmount = selectedAmount * 2; // Double the bet amount

                
                setResultAmount(winAmount); 
                setBalance(balance+winAmount)// Set the win amount

                if (selectedToken === 'ETH') {
                    // Transfer ETH to the user's account (simulate a win)
                    tx = {
                        to: account,
                        value: ethers.parseEther(winAmount.toString())
                    };

                    const txResponse = await signer.sendTransaction(tx);
                    await txResponse.wait(); // Wait for transaction confirmation

                    // Update balance after winning
                    await getBalance(account, provider);
                }
            } else {
                // User loses
                setResultAmount(-selectedAmount)
                setBalance(balance-selectedAmount); // Set the loss amount

                if (selectedToken === 'ETH') {
                    // Transfer ETH to the contract address or another address (simulate a loss)
                    const contractAddress = '0xYourContractAddress'; // Replace with actual address

                    tx = {
                        to: contractAddress,
                        value: ethers.parseEther(selectedAmount.toString())
                    };

                    const txResponse = await signer.sendTransaction(tx);
                    await txResponse.wait(); // Wait for transaction confirmation

                    // Update balance after losing
                    await getBalance(account, provider);
                }
            } if (selectedToken === 'SOL') {
                // Handle SOL transactions
                const winAmount = outcome === selectedSide ? selectedAmount * 2 : -selectedAmount;
                setResultAmount(winAmount);

                const payerPublicKey = new PublicKey(account);
                const recipientPublicKey = new PublicKey(account);
                const transaction = new Transaction().add(
                    SystemProgram.transfer({
                        fromPubkey: payerPublicKey,
                        toPubkey: recipientPublicKey,
                        lamports: winAmount * 1e9 // Convert SOL to lamports (1 SOL = 1e9 lamports)
                    })
                );

                // Sign and send transaction
                // Solana uses a separate method to sign and send transactions
                console.log('Send SOL transaction here');
                // You would need to handle SOL signing with Solana wallet

            } else if (selectedToken === 'BTC') {
                // Handle BTC transactions
                const winAmount = outcome === selectedSide ? selectedAmount * 2 : -selectedAmount;
                setResultAmount(winAmount);

                // This part requires backend support for sending BTC
                console.log('Send BTC transaction here');
                // Use a backend service to send BTC and handle Bitcoin transaction

            }
        } catch (error) {
            console.error("Error during transaction:", error);
        }
    
        setLoading(false);
        setFlipping(false);
    };

    return (
        <div className="coin-flip-container">
            {!account ? (
                <button className="connect-wallet-btn" onClick={connectWallet}>Connect Wallet</button>
            ) : (
                <div className="game-container">
                    <div className="account-info">
                        <div>Connected as: {account}</div>
                        <div>Balance: {balance} {selectedToken}</div>
                    </div>

                    <div className="selection-container">
                        <label>
                            Select Token:
                            <select
                                value={selectedToken || ''}
                                onChange={(e) => setSelectedToken(e.target.value as 'ETH' | 'SOL' | 'BTC')}
                            >
                                <option value="">Select Token</option>
                                <option value="ETH">ETH</option>
                                <option value="SOL">SOL</option>
                                <option value="BTC">BTC</option>
                            </select>
                        </label>

                        <label>
                            Amount:
                            <input
                                type="number"
                                value={selectedAmount}
                                onChange={(e) => setSelectedAmount(Number(e.target.value))}
                                min="0"
                                step="0.01"
                            />
                        </label>

                        <label>
                            Choose Side:
                            <select value={selectedSide || ''} onChange={(e) => setSelectedSide(e.target.value as 'Heads' | 'Tails')}>
                                <option value="">Select Side</option>
                                <option value="Heads">Heads</option>
                                <option value="Tails">Tails</option>
                            </select>
                        </label>
                    </div>

                    <button className="flip-coin-btn" onClick={flipCoin} disabled={loading}>
                        {loading ? "Flipping..." : "Flip Coin"}
                    </button>

                    <div className={`coin ${flipping ? 'flipping' : ''}`}>
                        <div className={`coin-side ${result === 'Heads' ? 'heads' : 'tails'}`}>
                            {result}
                        </div>
                    </div>

                    {result && !flipping && (
                        <div className="result-container">
                            <div>The result is: {result}</div>
                            {resultAmount !== null && (
                                <div className={result === selectedSide ? 'win' : 'lose'}>
                                    {result === selectedSide
                                        ? `Congratulations! You won ${resultAmount} ${selectedToken}.`
                                        : `Sorry, you lost ${-resultAmount} ${selectedToken}.`}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CoinFlip;
