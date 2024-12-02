const GameOverDialog = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-80">
          <h3 className="text-lg font-semibold mb-2">Game Over</h3>
          <p className="text-gray-600 mb-4">{message}</p>
          <button 
            onClick={onClose}
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            New Game
          </button>
        </div>
      </div>
    );
  };
  
  export default GameOverDialog;