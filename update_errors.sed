# Game not found errors
s/socket.emit(WebSocketEvents.Error, { message: 'Game not found' });/socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.INVALID_GAME_ID, message: 'Game not found' });/g
s/socket.emit(WebSocketEvents.Error, { message: 'Game state not found' });/socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.INVALID_STATE, message: 'Game state not found' });/g
s/socket.emit(WebSocketEvents.Error, { message: 'Game is full' });/socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.SERVER_ERROR, message: 'Game is full' });/g
s/socket.emit(WebSocketEvents.Error, { message: 'Failed to join game' });/socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.SERVER_ERROR, message: 'Failed to join game' });/g
s/socket.emit(WebSocketEvents.Error, { message: 'Player not found in game' });/socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.SERVER_ERROR, message: 'Player not found in game' });/g
s/socket.emit(WebSocketEvents.Error, { message: 'Invalid player session' });/socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.SERVER_ERROR, message: 'Invalid player session' });/g
s/socket.emit(WebSocketEvents.Error, { message: 'Not your turn' });/socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.NOT_YOUR_TURN, message: 'Not your turn' });/g
s/socket.emit(WebSocketEvents.Error, { message: 'Game is over' });/socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.GAME_ENDED, message: 'Game is over' });/g
s/socket.emit(WebSocketEvents.Error, { message: 'Failed to make move' });/socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.SERVER_ERROR, message: 'Failed to make move' });/g
s/socket.emit(WebSocketEvents.Error, { message: 'Failed to end turn' });/socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.SERVER_ERROR, message: 'Failed to end turn' });/g

# Catch clauses
s/} catch (error) {/} catch (err) {\n          const error = err as Error;/g
