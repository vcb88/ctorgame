import asyncio
import logging
from typing import Dict, Set, Optional
import json
from datetime import datetime
from aiohttp import web, WSMsgType
from .storage import GameStorage, GameStorageError

logger = logging.getLogger('ctorgame.websocket')

class GameServer:
    def __init__(self):
        self.storage = GameStorage()
        self.connections: Dict[str, web.WebSocketResponse] = {}
        self.game_subscriptions: Dict[str, Set[str]] = {}  # game_id -> set of connection_ids
        
    async def initialize(self):
        """Initialize storage and other components"""
        await self.storage.initialize()
        
    async def handle_websocket(self, request: web.Request) -> web.WebSocketResponse:
        """Handle WebSocket connections"""
        ws = web.WebSocketResponse()
        await ws.prepare(request)
        
        connection_id = str(id(ws))
        self.connections[connection_id] = ws
        
        try:
            async for msg in ws:
                if msg.type == WSMsgType.TEXT:
                    try:
                        data = json.loads(msg.data)
                        response = await self.handle_message(connection_id, data)
                        if response:
                            await ws.send_json(response)
                    except json.JSONDecodeError:
                        await ws.send_json({
                            'type': 'error',
                            'code': 'INVALID_JSON',
                            'message': 'Invalid JSON format'
                        })
                    except Exception as e:
                        logger.error(f"Error handling message: {e}", exc_info=True)
                        await ws.send_json({
                            'type': 'error',
                            'code': 'INTERNAL_ERROR',
                            'message': str(e)
                        })
                elif msg.type == WSMsgType.ERROR:
                    logger.error(f'WebSocket connection closed with exception {ws.exception()}')
        finally:
            await self.handle_disconnect(connection_id)
            
        return ws
        
    async def handle_message(self, connection_id: str, message: Dict) -> Optional[Dict]:
        """Handle incoming WebSocket messages"""
        message_type = message.get('type')
        
        handlers = {
            'createGame': self.handle_create_game,
            'joinGame': self.handle_join_game,
            'makeMove': self.handle_make_move,
            'leaveGame': self.handle_leave_game
        }
        
        handler = handlers.get(message_type)
        if not handler:
            return {
                'type': 'error',
                'code': 'UNKNOWN_MESSAGE_TYPE',
                'message': f'Unknown message type: {message_type}'
            }
            
        return await handler(connection_id, message)
        
    async def handle_create_game(self, connection_id: str, message: Dict) -> Dict:
        """Handle game creation request"""
        try:
            game = await self.storage.create_game(connection_id)
            
            # Subscribe creator to game updates
            self.game_subscriptions.setdefault(game['gameId'], set()).add(connection_id)
            
            return {
                'type': 'gameCreated',
                'gameId': game['gameId'],
                'code': game['code'],
                'status': game['status'],
                'playerNumber': 1
            }
        except GameStorageError as e:
            return {
                'type': 'error',
                'code': 'CREATION_FAILED',
                'message': str(e)
            }
            
    async def handle_join_game(self, connection_id: str, message: Dict) -> Dict:
        """Handle game join request"""
        try:
            code = message.get('code')
            if not code:
                raise GameStorageError("Game code is required")
                
            game = await self.storage.join_game(code, connection_id)
            
            # Subscribe joiner to game updates
            self.game_subscriptions.setdefault(game['gameId'], set()).add(connection_id)
            
            # Notify first player
            await self.notify_game_started(game['gameId'], game)
            
            return {
                'type': 'gameJoined',
                'gameId': game['gameId'],
                'status': game['status'],
                'playerNumber': 2,
                'state': {
                    'board': [[0] * game['boardSize']['width'] for _ in range(game['boardSize']['height'])],
                    'currentPlayer': 1,
                    'opsRemaining': 2
                }
            }
        except GameStorageError as e:
            return {
                'type': 'error',
                'code': 'JOIN_FAILED',
                'message': str(e)
            }
            
    async def handle_make_move(self, connection_id: str, message: Dict) -> Optional[Dict]:
        """Handle game move"""
        try:
            game_id = message.get('gameId')
            x = message.get('x')
            y = message.get('y')
            player_number = message.get('playerNumber')
            
            if None in (game_id, x, y, player_number):
                raise GameStorageError("Invalid move data")
                
            move = {
                'player': player_number,
                'x': x,
                'y': y,
                'timestamp': datetime.now().timestamp()
            }
            
            await self.storage.record_move(game_id, move)
            
            # Broadcast move to all game subscribers
            await self.broadcast_game_update(game_id, {
                'type': 'gameUpdated',
                'gameId': game_id,
                'move': move,
                'nextPlayer': 1 if player_number == 2 else 2
            })
            
            return None  # Response sent via broadcast
            
        except GameStorageError as e:
            return {
                'type': 'error',
                'code': 'MOVE_FAILED',
                'message': str(e)
            }
            
    async def handle_leave_game(self, connection_id: str, message: Dict) -> Dict:
        """Handle player leaving game"""
        game_id = message.get('gameId')
        if game_id:
            # Remove from subscriptions
            if game_id in self.game_subscriptions:
                self.game_subscriptions[game_id].discard(connection_id)
                if not self.game_subscriptions[game_id]:
                    del self.game_subscriptions[game_id]
                    
            # Notify other players
            await self.broadcast_game_update(game_id, {
                'type': 'playerLeft',
                'gameId': game_id,
                'connectionId': connection_id
            })
            
        return {
            'type': 'gameLeft',
            'gameId': game_id
        }
        
    async def handle_disconnect(self, connection_id: str):
        """Handle client disconnect"""
        # Remove connection
        self.connections.pop(connection_id, None)
        
        # Remove from all game subscriptions and notify others
        for game_id, subscribers in list(self.game_subscriptions.items()):
            if connection_id in subscribers:
                subscribers.discard(connection_id)
                if not subscribers:
                    del self.game_subscriptions[game_id]
                else:
                    # Notify remaining players
                    await self.broadcast_game_update(game_id, {
                        'type': 'playerDisconnected',
                        'gameId': game_id,
                        'connectionId': connection_id
                    })
                    
    async def notify_game_started(self, game_id: str, game: Dict):
        """Notify players that game has started"""
        message = {
            'type': 'gameStarted',
            'gameId': game_id,
            'state': {
                'board': [[0] * game['boardSize']['width'] for _ in range(game['boardSize']['height'])],
                'currentPlayer': 1,
                'opsRemaining': 2
            }
        }
        await self.broadcast_game_update(game_id, message)
        
    async def broadcast_game_update(self, game_id: str, message: Dict):
        """Broadcast message to all game subscribers"""
        if game_id in self.game_subscriptions:
            for connection_id in self.game_subscriptions[game_id]:
                if connection_id in self.connections:
                    try:
                        await self.connections[connection_id].send_json(message)
                    except Exception as e:
                        logger.error(f"Failed to send to {connection_id}: {e}")

async def init_game_server():
    """Initialize and return game server instance"""
    server = GameServer()
    await server.initialize()
    return server

def create_app():
    """Create aiohttp application with WebSocket handler"""
    app = web.Application()
    game_server = None
    
    async def on_startup(app):
        nonlocal game_server
        game_server = await init_game_server()
        app['game_server'] = game_server
        
    async def on_cleanup(app):
        # Cleanup code here
        pass
        
    app.on_startup.append(on_startup)
    app.on_cleanup.append(on_cleanup)
    
    async def websocket_handler(request):
        game_server = request.app['game_server']
        return await game_server.handle_websocket(request)
        
    app.router.add_get('/ws', websocket_handler)
    return app

def main():
    """Run the WebSocket server"""
    app = create_app()
    web.run_app(app, host='0.0.0.0', port=8080)

if __name__ == '__main__':
    main()