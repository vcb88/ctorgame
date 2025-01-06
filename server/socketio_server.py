import asyncio
import logging
from typing import Dict, Optional
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