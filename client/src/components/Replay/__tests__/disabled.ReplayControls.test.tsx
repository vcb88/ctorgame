import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ReplayControls } from '../*ReplayControls.js';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('ReplayControls', () => {
    const mockProps = {
        isPlaying: false,
        currentMove: 0,
        totalMoves: 10,
        playbackSpeed: 1,
        onStart: vi.fn(),
        onPause: vi.fn(),
        onResume: vi.fn(),
        onNext: vi.fn(),
        onPrevious: vi.fn(),
        onStop: vi.fn(),
        onSpeedChange: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render initial state correctly', () => {
        render(<ReplayControls {...mockProps} />);

        expect(screen.getByText('Move 0 of 10')).toBeInTheDocument();
        expect(screen.getByText('Start')).toBeInTheDocument();
        expect(screen.getByText('1x')).toBeInTheDocument();
    });

    it('should show correct buttons based on game state', () => {
        const { rerender } = render(<ReplayControls {...mockProps} />);

        // Начальное состояние
        expect(screen.getByText('Start')).toBeInTheDocument();
        expect(screen.queryByText('Stop')).not.toBeInTheDocument();

        // После начала воспроизведения
        rerender(
            <ReplayControls
                {...mockProps}
                currentMove={1}
                isPlaying={true}
            />
        );

        expect(screen.queryByText('Start')).not.toBeInTheDocument();
        expect(screen.getByText('Stop')).toBeInTheDocument();
    });

    it('should handle start/stop actions', () => {
        const { rerender } = render(<ReplayControls {...mockProps} />);

        // Нажатие Start
        fireEvent.click(screen.getByText('Start'));
        expect(mockProps.onStart).toHaveBeenCalled();

        // После начала показываем Stop
        rerender(
            <ReplayControls
                {...mockProps}
                currentMove={1}
            />
        );

        // Нажатие Stop
        fireEvent.click(screen.getByText('Stop'));
        expect(mockProps.onStop).toHaveBeenCalled();
    });

    it('should handle pause/resume', () => {
        const { rerender } = render(
            <ReplayControls
                {...mockProps}
                currentMove={1}
                isPlaying={true}
            />
        );

        // Нажатие Pause
        fireEvent.click(screen.getByLabelText('Pause'));
        expect(mockProps.onPause).toHaveBeenCalled();

        // Переключаем на паузу
        rerender(
            <ReplayControls
                {...mockProps}
                currentMove={1}
                isPlaying={false}
            />
        );

        // Нажатие Play для продолжения
        fireEvent.click(screen.getByLabelText('Play'));
        expect(mockProps.onResume).toHaveBeenCalled();
    });

    it('should handle navigation', () => {
        render(
            <ReplayControls
                {...mockProps}
                currentMove={5}
            />
        );

        // Предыдущий ход
        fireEvent.click(screen.getByLabelText('Previous move'));
        expect(mockProps.onPrevious).toHaveBeenCalled();

        // Следующий ход
        fireEvent.click(screen.getByLabelText('Next move'));
        expect(mockProps.onNext).toHaveBeenCalled();
    });

    it('should handle speed changes', () => {
        render(<ReplayControls {...mockProps} />);

        // Замедление (0.5x)
        fireEvent.click(screen.getByLabelText('Slow down'));
        expect(mockProps.onSpeedChange).toHaveBeenCalledWith(0.5);

        // Нормальная скорость (1x)
        fireEvent.click(screen.getByText('1x'));
        expect(mockProps.onSpeedChange).toHaveBeenCalledWith(1);

        // Ускорение (2x)
        fireEvent.click(screen.getByLabelText('Speed up'));
        expect(mockProps.onSpeedChange).toHaveBeenCalledWith(2);
    });

    it('should disable navigation buttons appropriately', () => {
        const { rerender } = render(
            <ReplayControls
                {...mockProps}
                currentMove={0}
            />
        );

        // На первом ходу кнопка "назад" должна быть неактивна
        const prevButton = screen.getByRole('button', { name: 'Previous move' });
        const nextButton = screen.getByRole('button', { name: 'Next move' });
        
        expect(prevButton).toBeDisabled();
        expect(nextButton).not.toBeDisabled();

        // На последнем ходу кнопка "вперед" должна быть неактивна
        rerender(
            <ReplayControls
                {...mockProps}
                currentMove={10}
            />
        );

        const prevButtonAfter = screen.getByRole('button', { name: 'Previous move' });
        const nextButtonAfter = screen.getByRole('button', { name: 'Next move' });
        
        expect(prevButtonAfter).not.toBeDisabled();
        expect(nextButtonAfter).toBeDisabled();
    });
});