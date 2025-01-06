import os
from datetime import datetime, timedelta
from pathlib import Path
import numpy as np
import json
from typing import Dict, List, Optional, Union
from motor.motor_asyncio import AsyncIOMotorClient
import logging
import asyncio
from uuid import uuid4

class GameStorageError(Exception):
    """Base class for game storage exceptions"""
    pass

class GameStorage:
    def __init__(self, 
                 mongodb_url: str = None,
                 storage_path: Union[str, Path] = None):
        """Initialize game storage
        
        Args:
            mongodb_url: MongoDB connection URL
            storage_path: Path for file storage
        """
        # MongoDB setup
        if mongodb_url is None:
            mongodb_url = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
            
        self.client = AsyncIOMotorClient(mongodb_url,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
        self.db = self.client.ctorgame
        self.games = self.db.games
        self.metrics = self.db.metrics
        
        # File storage setup
        if storage_path is None:
            storage_path = os.getenv('STORAGE_PATH', 'storage/games')
        self.storage_path = Path(storage_path)
        self._initialize_storage()
        
        # Logging
        self.logger = logging.getLogger('ctorgame.storage')
        
    def _initialize_storage(self):
        """Initialize storage directory structure"""
        try:
            self.storage_path.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            raise GameStorageError(f"Failed to initialize storage: {e}")
            
    def _get_game_path(self, game_id: str) -> Path:
        """Get path for game file storage"""
        date = datetime.now()
        path = self.storage_path / str(date.year) / f"{date.month:02d}" / f"{date.day:02d}"
        path.mkdir(parents=True, exist_ok=True)
        return path / f"{game_id}.npz"
        
    async def create_game(self, player_id: str) -> Dict:
        """Create a new game
        
        Args:
            player_id: ID of the first player
            
        Returns:
            Game metadata
        """
        # Check active games limit
        active_count = await self.games.count_documents({
            'status': {'$in': ['waiting', 'playing']}
        })
        if active_count >= 50:
            raise GameStorageError("Maximum number of concurrent games reached")
            
        # Generate unique game ID and connection code
        while True:
            game_id = str(uuid4())
            code = f"{random.randint(0, 9999):04d}"
            exists = await self.games.find_one({
                '$or': [
                    {'gameId': game_id},
                    {'code': code}
                ]
            })
            if not exists:
                break
                
        # Create game document
        now = datetime.now()
        game = {
            'gameId': game_id,
            'code': code,
            'status': 'waiting',
            'startTime': now.isoformat(),
            'lastActivityAt': now.isoformat(),
            'expiresAt': (now + timedelta(minutes=30)).isoformat(),
            'players': {
                'first': player_id,
                'second': None
            },
            'boardSize': {
                'width': 10,
                'height': 10
            },
            'totalTurns': 0
        }
        
        await self.games.insert_one(game)
        return game
        
    async def join_game(self, code: str, player_id: str) -> Dict:
        """Join an existing game
        
        Args:
            code: Game connection code
            player_id: ID of the joining player
            
        Returns:
            Updated game metadata
        """
        # Find and update game atomically
        now = datetime.now()
        result = await self.games.find_one_and_update(
            {
                'code': code,
                'status': 'waiting',
                'expiresAt': {'$gt': now.isoformat()},
                'players.second': None
            },
            {
                '$set': {
                    'players.second': player_id,
                    'status': 'playing',
                    'lastActivityAt': now.isoformat(),
                    'expiresAt': (now + timedelta(minutes=30)).isoformat()
                }
            },
            return_document=True
        )
        
        if not result:
            # Check if game exists to provide better error message
            game = await self.games.find_one({'code': code})
            if not game:
                raise GameStorageError("Game not found")
            elif game['status'] != 'waiting':
                raise GameStorageError("Game already started")
            elif game['expiresAt'] <= now.isoformat():
                raise GameStorageError("Game expired")
            else:
                raise GameStorageError("Game is full")
                
        return result
        
    async def record_move(self, game_id: str, move: Dict) -> None:
        """Record a game move
        
        Args:
            game_id: Game identifier
            move: Move data including player, coordinates and timestamp
        """
        game_path = self._get_game_path(game_id)
        
        # Load existing moves if any
        moves = []
        if game_path.exists():
            with np.load(game_path, allow_pickle=True) as data:
                if 'moves' in data:
                    moves = data['moves'].tolist()
                    
        moves.append(move)
        
        # Update file
        np.savez_compressed(
            game_path,
            moves=np.array(moves, dtype=object),
            metadata=json.dumps({
                'lastUpdate': datetime.now().isoformat()
            })
        )
        
        # Update game metadata
        now = datetime.now()
        await self.games.update_one(
            {'gameId': game_id},
            {
                '$set': {
                    'lastActivityAt': now.isoformat(),
                    'expiresAt': (now + timedelta(minutes=30)).isoformat()
                },
                '$inc': {'totalTurns': 1}
            }
        )
        
    async def finish_game(self, game_id: str, winner: int, final_score: Dict) -> None:
        """Mark game as finished
        
        Args:
            game_id: Game identifier
            winner: Winner player number (1 or 2)
            final_score: Final score for both players
        """
        now = datetime.now()
        game = await self.games.find_one_and_update(
            {'gameId': game_id},
            {
                '$set': {
                    'status': 'finished',
                    'endTime': now.isoformat(),
                    'winner': winner,
                    'finalScore': final_score,
                    'lastActivityAt': now.isoformat()
                }
            },
            return_document=True
        )
        
        if not game:
            raise GameStorageError("Game not found")
            
        # Calculate duration
        start_time = datetime.fromisoformat(game['startTime'])
        duration = (now - start_time).total_seconds()
        
        await self.games.update_one(
            {'gameId': game_id},
            {'$set': {'duration': duration}}
        )
        
    async def cleanup_expired_games(self) -> int:
        """Remove expired games
        
        Returns:
            Number of games cleaned up
        """
        now = datetime.now()
        result = await self.games.delete_many({
            'status': {'$in': ['waiting', 'playing']},
            'expiresAt': {'$lte': now.isoformat()}
        })
        return result.deleted_count
        
    async def get_game_history(self, game_id: str) -> Dict:
        """Get complete game history
        
        Args:
            game_id: Game identifier
            
        Returns:
            Complete game data including moves and board states
        """
        # Get metadata from MongoDB
        game = await self.games.find_one({'gameId': game_id})
        if not game:
            raise GameStorageError("Game not found")
            
        # Get detailed data from file
        game_path = self._get_game_path(game_id)
        if not game_path.exists():
            raise GameStorageError("Game history not found")
            
        try:
            with np.load(game_path, allow_pickle=True) as data:
                moves = data['moves'].tolist() if 'moves' in data else []
                metadata = json.loads(data['metadata']) if 'metadata' in data else {}
                
            return {
                'metadata': game,
                'moves': moves,
                'details': metadata
            }
        except Exception as e:
            raise GameStorageError(f"Failed to load game history: {e}")