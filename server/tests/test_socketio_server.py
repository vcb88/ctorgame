import pytest
import asyncio
from unittest.mock import MagicMock, AsyncMock
from ..socketio_server import GameNamespace
from ..storage import GameStorage, GameStorageError

@pytest.fixture
def mock_storage():
    storage = AsyncMock(spec=GameStorage)
    return storage

@pytest.fixture
def game_namespace(mock_storage):
    namespace = GameNamespace('/')
    namespace.storage = mock_storage
    return namespace

@pytest.mark.asyncio
async def test_on_connect(game_namespace):
    sid = 'test_sid'
    environ = {}
    
    # Mock emit method
    game_namespace.emit = AsyncMock()
    
    await game_namespace.on_connect(sid, environ)
    
    game_namespace.emit.assert_awaited_once_with(
        'connected',
        {'status': 'ok'},
        room=sid
    )

@pytest.mark.asyncio
async def test_create_game_success(game_namespace):
    sid = 'test_sid'
    mock_game = {
        'gameId': 'game123',
        'code': '1234',
        'status': 'waiting',
    }
    
    # Setup mock storage
    game_namespace.storage.create_game.return_value = mock_game
    
    # Mock emit and enter_room methods
    game_namespace.emit = AsyncMock()
    game_namespace.enter_room = MagicMock()
    
    await game_namespace.on_createGame(sid, {})
    
    # Verify storage call
    game_namespace.storage.create_game.assert_awaited_once_with(sid)
    
    # Verify room joined
    game_namespace.enter_room.assert_called_once_with(sid, 'game123')
    
    # Verify response emitted
    game_namespace.emit.assert_awaited_once_with(
        'gameCreated',
        {
            'gameId': 'game123',
            'code': '1234',
            'status': 'waiting',
            'playerNumber': 1
        },
        room=sid
    )

@pytest.mark.asyncio
async def test_join_game_success(game_namespace):
    sid = 'test_sid'
    mock_game = {
        'gameId': 'game123',
        'code': '1234',
        'status': 'playing',
        'boardSize': {'width': 10, 'height': 10}
    }
    
    # Setup mock storage
    game_namespace.storage.join_game.return_value = mock_game
    
    # Mock methods
    game_namespace.emit = AsyncMock()
    game_namespace.enter_room = MagicMock()
    
    await game_namespace.on_joinGame(sid, {'code': '1234'})
    
    # Verify storage call
    game_namespace.storage.join_game.assert_awaited_once_with('1234', sid)
    
    # Verify room joined
    game_namespace.enter_room.assert_called_once_with(sid, 'game123')
    
    # Verify game started broadcast
    assert game_namespace.emit.await_args_list[0][0][0] == 'gameStarted'
    assert game_namespace.emit.await_args_list[1][0][0] == 'gameJoined'

@pytest.mark.asyncio
async def test_join_game_failure(game_namespace):
    sid = 'test_sid'
    
    # Setup mock storage to raise error
    game_namespace.storage.join_game.side_effect = GameStorageError("Room not found")
    
    # Mock emit method
    game_namespace.emit = AsyncMock()
    
    await game_namespace.on_joinGame(sid, {'code': '1234'})
    
    # Verify error response
    game_namespace.emit.assert_awaited_once_with(
        'error',
        {
            'code': 'JOIN_FAILED',
            'message': 'Room not found'
        },
        room=sid
    )

@pytest.mark.asyncio
async def test_disconnect_cleanup(game_namespace):
    sid = 'test_sid'
    game_id = 'game123'
    
    # Setup rooms for the client
    game_namespace.rooms = MagicMock(return_value={sid, game_id})
    game_namespace.emit = AsyncMock()
    
    await game_namespace.on_disconnect(sid)
    
    # Verify notification sent to remaining players
    game_namespace.emit.assert_awaited_once_with(
        'playerDisconnected',
        {
            'gameId': game_id,
            'connectionId': sid
        },
        room=game_id
    )