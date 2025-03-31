import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div className="w-screen h-screen bg-gradient-to-br  flex flex-col items-center justify-start">
      <header className="w-full py-6 bg-white/80 text-center   animate-float transition-all duration-300 ">
        <h1 className="text-6xl font-bold text-[#3B3B3B] drop-shadow-lg tracking-wide">
          SafeChain
        </h1>
        <p className="text-lg mt-2 text-[#5A5A5A]">
          A secure and decentralized communication platform
        </p>
      </header>
      <App />
    </div>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
