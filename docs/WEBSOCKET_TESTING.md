# WebSocket Testing Guide

## Overview

This guide covers best practices and utilities for testing WebSocket functionality in the CTOR Game application.

## Socket Testing Utilities

### MockSocket

We provide a `createMockSocket` utility that creates a mock Socket.io instance with enhanced testing capabilities:

```typescript
import { createMockSocket, type MockSocket } from '@/test/socket-test-utils';

describe('Your Socket Test', () => {
  let mockSocket: MockSocket;

  beforeEach(() => {
    mockSocket = createMockSocket();
  });
});
```

### Key Features

- Event simulation
- Listener tracking
- Mock function capabilities
- Type safety

## Testing Patterns

### Event Handling

```typescript
it('should handle incoming events', async () => {
  // Setup your component/hook with mockSocket
  const { result } = renderHook(() => useYourHook({ socket: mockSocket }));

  // Simulate receiving an event
  await mockSocket.simulateEvent('EVENT_NAME', {
    data: 'example'
  });

  // Check the result
  expect(result.current.data).toBe('example');
});
```

### Event Emission

```typescript
it('should emit events', () => {
  // Trigger some action that should emit an event
  result.current.sendAction();

  // Verify the event was emitted with correct data
  expect(mockSocket.emit).toHaveBeenCalledWith(
    'ACTION_EVENT',
    expectedPayload
  );
});
```

### Cleanup Testing

```typescript
it('should cleanup listeners on unmount', () => {
  const { unmount } = renderHook(() => useYourHook({ socket: mockSocket }));

  unmount();

  // Verify all listeners were removed
  expect(mockSocket.listeners).toHaveLength(0);
  expect(mockSocket.off).toHaveBeenCalled();
});
```

## Best Practices

1. **Reset State Between Tests**
   ```typescript
   beforeEach(() => {
     mockSocket = createMockSocket();
   });
   ```

2. **Test Error Handling**
   ```typescript
   it('should handle errors', async () => {
     await mockSocket.simulateEvent('ERROR', {
       message: 'Connection failed'
     });
     expect(result.current.error).toBe('Connection failed');
   });
   ```

3. **Test Event Order**
   ```typescript
   it('should handle events in order', async () => {
     const events = [];
     // Setup event tracking
     mockSocket.on('EVENT1', () => events.push('EVENT1'));
     mockSocket.on('EVENT2', () => events.push('EVENT2'));

     // Trigger actions
     await mockSocket.simulateEvent('EVENT1', {});
     await mockSocket.simulateEvent('EVENT2', {});

     expect(events).toEqual(['EVENT1', 'EVENT2']);
   });
   ```

## Type Safety

Our mock socket implementation includes proper TypeScript types:

```typescript
interface MockSocket extends Socket {
  simulateEvent: (event: string, data: unknown) => Promise<void>;
  listeners: Array<{ event: string; callback: Function }>;
}
```

## Common Patterns

### Testing Connection State

```typescript
it('should handle connection state', async () => {
  const { result } = renderHook(() => useConnection({ socket: mockSocket }));

  await mockSocket.simulateEvent('connect', {});
  expect(result.current.isConnected).toBe(true);

  await mockSocket.simulateEvent('disconnect', {});
  expect(result.current.isConnected).toBe(false);
});
```

### Testing Reconnection

```typescript
it('should handle reconnection', async () => {
  const { result } = renderHook(() => useConnection({ socket: mockSocket }));

  await mockSocket.simulateEvent('disconnect', {});
  await mockSocket.simulateEvent('reconnect_attempt', {});
  await mockSocket.simulateEvent('connect', {});

  expect(result.current.isConnected).toBe(true);
  expect(result.current.reconnectAttempts).toBe(1);
});
```

## Debugging Tips

1. Use the `listeners` property to inspect current event listeners
2. Check mock call history with `.mock.calls`
3. Use async/await with `simulateEvent` to ensure proper event handling
4. Monitor event emission with `emit` mock history