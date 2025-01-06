import asyncio
import logging
from typing import Dict, Optional
from datetime import datetime
import socketio
from aiohttp import web
from .storage import GameStorage, GameStorageError

logger = logging.getLogger('ctorgame.socketio')

class GameNamespace(socketio.AsyncNamespace):
    def __init__(self, namespace=None):
        super().__init__(namespace)
        self.storage: Optional[GameStorage] = None
        
    async def initialize(self):
        """Initialize storage and other components"""
        self.storage = GameStorage()
        await self.storage.initialize()

    async def on_connect(self, sid, environ):
        """Handle client connection"""
        logger.info(f"Client connected: {sid}")
        await self.emit('connected', {'status': 'ok'}, room=sid)

    async def on_disconnect(self, sid):
        """Handle client disconnect"""
        logger.info(f"Client disconnected: {sid}")
        # Notify other players in shared rooms
        for room in self.rooms(sid):
            if room != sid:  # Skip personal room
                await self.emit('playerDisconnected', {
                    'gameId': room,
                    'connectionId': sid
                }, room=room)
                # Leave all game rooms
                self.leave_room(sid, room)

    async def on_error(self, sid, error):
        """Handle errors"""
        logger.error(f"Error for client {sid}: {error}")
        await self.emit('error', {'message': str(error)}, room=sid)

    async def on_createGame(self, sid, data):
        """Handle game creation request"""
        try:
            game = await self.storage.create_game(sid)
            # Join room with game ID
            self.enter_room(sid, game['gameId'])
            
            await self.emit('gameCreated', {
                'gameId': game['gameId'],
                'code': game['code'],
                'status': game['status'],
                'playerNumber': 1
            }, room=sid)
            
        except GameStorageError as e:
            await self.emit('error', {
                'code': 'CREATION_FAILED',
                'message': str(e)
            }, room=sid)

    async def on_joinGame(self, sid, data):
        """Handle game join request"""
        try:
            code = data.get('code')
            if not code:
                raise GameStorageError("Game code is required")
                
            game = await self.storage.join_game(code, sid)
            # Join room with game ID
            self.enter_room(sid, game['gameId'])
            
            # Notify all players in the room
            await self.emit('gameStarted', {
                'gameId': game['gameId'],
                'status': game['status'],
                'state': {
                    'board': [[0] * game['boardSize']['width'] 
                             for _ in range(game['boardSize']['height'])],
                    'currentPlayer': 1,
                    'opsRemaining': 2
                }
            }, room=game['gameId'])
            
            # Send specific response to joining player
            await self.emit('gameJoined', {
                'gameId': game['gameId'],
                'status': game['status'],
                'playerNumber': 2
            }, room=sid)
            
        except GameStorageError as e:
            await self.emit('error', {
                'code': 'JOIN_FAILED',
                'message': str(e)
            }, room=sid)

    async def on_makeMove(self, sid, data):
        """Handle game move"""
        try:
            game_id = data.get('gameId')
            x = data.get('x')
            y = data.get('y')
            player_number = data.get('playerNumber')
            
            if None in (game_id, x, y, player_number):
                raise GameStorageError("Invalid move data")
                
            move = {
                'player': player_number,
                'x': x,
                'y': y,
                'timestamp': datetime.now().timestamp()
            }
            
            # Validate player is in the game room
            if game_id not in self.rooms(sid):
                raise GameStorageError("Player not in this game")
            
            # Record move with captures in storage
            updated_game = await self.storage.record_move(game_id, {
                **move,
                'captures': data.get('captures', []),
                'nextPlayer': 1 if player_number == 2 else 2,
                'timestamp': datetime.now().timestamp()
            })
            
            # Check if game is over
            total_cells = 100  # 10x10 board
            total_pieces = updated_game['score']['first'] + updated_game['score']['second']
            is_game_over = total_pieces >= total_cells
            
            if is_game_over:
                # Determine winner
                score_first = updated_game['score']['first']
                score_second = updated_game['score']['second']
                
                winner = None
                is_draw = False
                if score_first > score_second:
                    winner = 1
                elif score_second > score_first:
                    winner = 2
                else:
                    is_draw = True
                    
                # Record game completion
                await self.storage.finish_game(
                    game_id,
                    winner,
                    {'first': score_first, 'second': score_second},
                    is_draw
                )
                
                # Notify players of game end
                await self.emit('gameOver', {
                    'gameId': game_id,
                    'winner': winner,
                    'isDraw': is_draw,
                    'finalScore': {
                        'first': score_first,
                        'second': score_second
                    }
                }, room=game_id)
            
            # Broadcast move and state update to all players
            await self.emit('gameUpdated', {
                'gameId': game_id,
                'move': move,
                'nextPlayer': updated_game['currentPlayer'],
                'opsRemaining': updated_game['opsRemaining'],
                'score': updated_game['score'],
                'captures': data.get('captures', [])
            }, room=game_id)
            
        except GameStorageError as e:
            await self.emit('error', {
                'code': 'MOVE_FAILED',
                'message': str(e)
            }, room=sid)

    async def on_leaveGame(self, sid, data):
        """Handle player leaving game"""
        try:
            game_id = data.get('gameId')
            if not game_id:
                raise GameStorageError("Game ID is required")
            
            # Validate player is in the game room
            if game_id not in self.rooms(sid):
                raise GameStorageError("Player not in this game")
            
            # Leave the game room
            self.leave_room(sid, game_id)
            
            # Notify other players
            await self.emit('playerLeft', {
                'gameId': game_id,
                'connectionId': sid
            }, room=game_id)
            
            # Confirm to the leaving player
            await self.emit('gameLeft', {
                'gameId': game_id
            }, room=sid)
            
        except GameStorageError as e:
            await self.emit('error', {
                'code': 'LEAVE_FAILED',
                'message': str(e)
            }, room=sid)

    async def on_reconnect(self, sid, data):
        """Handle client reconnection"""
        try:
            game_id = data.get('gameId')
            if game_id:
                # Rejoin the game room
                self.enter_room(sid, game_id)
                
                # Get current game state
                game = await self.storage.get_game(game_id)
                
                # Send current state to reconnected player
                await self.emit('gameReconnected', {
                    'gameId': game_id,
                    'state': game['state']
                }, room=sid)
                
                # Notify other players
                await self.emit('playerReconnected', {
                    'gameId': game_id,
                    'connectionId': sid
                }, room=game_id, skip_sid=sid)
                
        except GameStorageError as e:
            await self.emit('error', {
                'code': 'RECONNECT_FAILED',
                'message': str(e)
            }, room=sid)

async def init_socketio_app():
    """Initialize and return aiohttp application with Socket.IO"""
    # Create Socket.IO server
    sio = socketio.AsyncServer(
        async_mode='aiohttp',
        cors_allowed_origins='*'
    )
    
    # Create aiohttp application
    app = web.Application()
    sio.attach(app)
    
    # Initialize game namespace
    game_nsp = GameNamespace('/')
    sio.register_namespace(game_nsp)
    await game_nsp.initialize()
    
    return app

def main():
    """Run the Socket.IO server"""
    app = asyncio.get_event_loop().run_until_complete(init_socketio_app())
    web.run_app(app, host='0.0.0.0', port=8080)

if __name__ == '__main__':
    main()