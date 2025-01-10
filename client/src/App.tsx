import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { CreateGame } from './pages/CreateGame';
import { JoinGame } from './pages/JoinGame';
import { WaitingRoom } from './pages/WaitingRoom';
import { GameBoard } from './pages/GameBoard';
import { GameHistory } from './pages/GameHistory';
import { GameRules } from './pages/GameRules';
import './index.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Главная страница */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Создание и подключение к игре */}
          <Route path="/create" element={<CreateGame />} />
          <Route path="/join" element={<JoinGame />} />
          <Route path="/waiting/:gameId" element={<WaitingRoom />} />
          
          {/* Игровой процесс */}
          <Route path="/game/:gameId" element={<GameBoard />} />
          
          {/* История игр */}
          <Route path="/history" element={<GameHistory />} />
          
          {/* Правила игры */}
          <Route path="/rules" element={<GameRules />} />
          
          {/* Редирект на главную для неизвестных путей */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;