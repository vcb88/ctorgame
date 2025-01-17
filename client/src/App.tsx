import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout.js';
import { PageTransition } from './components/PageTransition.js';
import { Navbar } from './components/Navbar.js';
import { LandingPage } from './pages/LandingPage.js';
import { CreateGame } from './pages/CreateGame.js';
import { JoinGame } from './pages/JoinGame.js';
import { WaitingRoomNew as WaitingRoom } from './pages/WaitingRoomNew.js';
import { GameBoard } from './pages/GameBoard.js';
import { GameHistory } from './pages/GameHistory.js';
import { GameRules } from './pages/GameRules.js';
import { Settings } from './pages/Settings.js';
import './index.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Navbar />
        <PageTransition>
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

            {/* Настройки */}
            <Route path="/settings" element={<Settings />} />
            
            {/* Редирект на главную для неизвестных путей */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageTransition>
      </Layout>
    </BrowserRouter>
  );
};

export default App;