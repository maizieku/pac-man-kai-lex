import React from 'react';
import { PacmanGame } from './components/PacmanGame';

const App: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-neutral-950">
      <PacmanGame />
    </div>
  );
};

export default App;
