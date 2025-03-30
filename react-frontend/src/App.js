import logo from './logo.svg';
import './App.css';
import TextWindow from './components/TextWindow.js';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <TextWindow />
    </div>
  );
}

export default App;
