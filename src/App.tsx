import React from 'react';
import './App.css';
import CoinFlip from './components/coinFlip';



function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Coin Flip Game</h1>
        <CoinFlip />
      </header>
    </div>
  );
}

export default App;
