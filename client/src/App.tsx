import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Game } from './components/Game';
import { GameHistory } from './pages/GameHistory';
import { Layout } from './components/layout/Layout';
import './index.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Главная страница - игра */}
          <Route path="/" element={<Game />} />
          
          {/* История игр */}
          <Route path="/history" element={<GameHistory />} />
          
          {/* Редирект на главную для неизвестных путей */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;