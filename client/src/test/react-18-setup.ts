import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

import { Root } from 'react-dom/client';

const originalRender = document.createElement;
let container: HTMLElement | null = null;
let root: Root | null = null;

// Переопределяем createElement для создания нового контейнера при каждом рендере
document.createElement = function (tagName: string) {
    if (tagName.toLowerCase() === 'div') {
        container = originalRender.call(document, tagName);
        root = createRoot(container);
        return container;
    }
    return originalRender.call(document, tagName);
};

// Обновляем render для использования createRoot
const render = async (element: React.ReactElement) => {
    if (!root) {
        throw new Error('Root is not initialized');
    }
    await act(async () => {
        root!.render(element);
    });
    return container;
};

// Очистка после тестов
afterEach(() => {
    // Force non-null assertion here because we know root exists in tests
    act(() => {
        if (root) root.unmount();
    });
    container = null;
    root = null;
});