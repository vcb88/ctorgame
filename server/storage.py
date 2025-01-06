import os
from datetime import datetime, timedelta
from pathlib import Path
import numpy as np
import json
from typing import Dict, List, Optional, Union, Any
from motor.motor_asyncio import AsyncIOMotorClient
import logging
import asyncio
from uuid import uuid4
import random

class GameStorageError(Exception):
    """Base class for game storage exceptions"""
    pass

class GameStorage:
    def __init__(self, 
                 mongodb_url: str = None,
                 storage_path: Union[str, Path] = None):
        if mongodb_url is None:
            mongodb_url = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
            
        self.client = AsyncIOMotorClient(mongodb_url,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
        self.db = self.client.ctorgame
        self.games = self.db.games
        self.metrics = self.db.metrics
        
        if storage_path is None:
            storage_path = os.getenv('STORAGE_PATH', 'storage/games')
        self.storage_path = Path(storage_path)
        self._initialize_storage()
        
        self.logger = logging.getLogger('ctorgame.storage')
        
    def _initialize_storage(self):
        try:
            self.storage_path.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            raise GameStorageError(f"Failed to initialize storage: {e}")
            
    def _get_game_path(self, game_id: str) -> Path:
        date = datetime.now()
        path = self.storage_path / str(date.year) / f"{date.month:02d}" / f"{date.day:02d}"
        path.mkdir(parents=True, exist_ok=True)
        return path / f"{game_id}.npz"

    async def create_game(self, player_id: str) -> Dict[str, Any]:
        active_count = await self.games.count_documents({
            'status': {'$in': ['waiting', 'playing']}
        })
        if active_count >= 50:
            raise GameStorageError("Maximum number of concurrent games reached")
            
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
            'score': {
                'first': 0,
                'second': 0
            },
            'totalTurns': 0,
            'lastMove': None,
            'opsRemaining': 2,
            'currentPlayer': 1
        }
        
        await self.games.insert_one(game)
        return game
        
    async def join_game(self, code: str, player_id: str) -> Dict[str, Any]:
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

    async def record_move(self, game_id: str, move: Dict[str, Any]) -> Dict[str, Any]:
        """Record a game move with captures

        Args:
            game_id: Game identifier
            move: Move data including player, coordinates, captures and timestamp

        Returns:
            Updated game state
        """
        game_path = self._get_game_path(game_id)
        
        # Load existing moves
        moves = []
        if game_path.exists():
            with np.load(game_path, allow_pickle=True) as data:
                if 'moves' in data:
                    moves = data['moves'].tolist()
                    
        moves.append(move)
        
        # Calculate new scores based on captures
        capture_count = len(move.get('captures', []))
        score_update = {}
        if capture_count > 0:
            current_player = str(move['player'])
            score_update = {
                f'score.{current_player}': capture_count
            }
        
        # Update file storage
        np.savez_compressed(
            game_path,
            moves=np.array(moves, dtype=object),
            metadata=json.dumps({
                'lastUpdate': datetime.now().isoformat(),
                'captures': move.get('captures', [])
            })
        )
        
        # Update game state in database
        now = datetime.now()
        ops_remaining = move.get('opsRemaining', 1)
        next_player = move.get('nextPlayer', 3 - move['player'])  # Switch between 1 and 2
        
        update = {
            '$set': {
                'lastActivityAt': now.isoformat(),
                'expiresAt': (now + timedelta(minutes=30)).isoformat(),
                'lastMove': {
                    'x': move['x'],
                    'y': move['y'],
                    'player': move['player'],
                    'timestamp': move['timestamp']
                },
                'opsRemaining': ops_remaining,
                'currentPlayer': next_player
            },
            '$inc': {
                'totalTurns': 1,
                **score_update
            }
        }
        
        updated_game = await self.games.find_one_and_update(
            {'gameId': game_id},
            update,
            return_document=True
        )
        
        if not updated_game:
            raise GameStorageError("Game not found")
            
        return updated_game

    async def finish_game(self, 
                         game_id: str, 
                         winner: Optional[int], 
                         final_score: Dict[str, int],
                         is_draw: bool = False) -> None:
        """Mark game as finished with final scores

        Args:
            game_id: Game identifier
            winner: Winner player number (1 or 2), None if draw
            final_score: Final score for both players
            is_draw: Whether the game ended in a draw
        """
        now = datetime.now()
        game = await self.games.find_one_and_update(
            {'gameId': game_id},
            {
                '$set': {
                    'status': 'finished',
                    'endTime': now.isoformat(),
                    'winner': winner,
                    'isDraw': is_draw,
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
        
        # Record metrics
        await self.metrics.insert_one({
            'gameId': game_id,
            'timestamp': now.isoformat(),
            'type': 'game_finished',
            'data': {
                'winner': winner,
                'isDraw': is_draw,
                'duration': duration,
                'totalTurns': game['totalTurns'],
                'finalScore': final_score
            }
        })

    async def get_game_state(self, game_id: str) -> Dict[str, Any]:
        """Get current game state

        Args:
            game_id: Game identifier

        Returns:
            Current game state including scores and last move
        """
        game = await self.games.find_one({'gameId': game_id})
        if not game:
            raise GameStorageError("Game not found")
            
        return {
            'status': game['status'],
            'currentPlayer': game['currentPlayer'],
            'opsRemaining': game['opsRemaining'],
            'score': game['score'],
            'lastMove': game['lastMove']
        }

    async def cleanup_expired_games(self) -> int:
        now = datetime.now()
        result = await self.games.delete_many({
            'status': {'$in': ['waiting', 'playing']},
            'expiresAt': {'$lte': now.isoformat()}
        })
        return result.deleted_count
        
    async def get_game_history(self, game_id: str) -> Dict[str, Any]:
        game = await self.games.find_one({'gameId': game_id})
        if not game:
            raise GameStorageError("Game not found")
            
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