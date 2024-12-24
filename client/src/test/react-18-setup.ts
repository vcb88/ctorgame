import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

const originalRender = document.createElement;
let container = null;
let root = null;

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
    await act(async () => {
        root.render(element);
    });
    return container;
};

// Очистка после тестов
afterEach(() => {
    if (root) {
        act(() => {
            root.unmount();
        });
    }
    container = null;
    root = null;
});