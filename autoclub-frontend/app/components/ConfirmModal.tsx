'use client';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  type?: 'danger' | 'info'; // 'danger' para borrar (rojo), 'info' para otras cosas (negro/azul)
}

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = '¿Estás seguro?', 
  message = 'Esta acción no se puede deshacer.',
  type = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    // Backdrop con desenfoque (Blur)
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Tarjeta del Modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-6 space-y-5">
        
        {/* Icono y Textos */}
        <div className="text-center space-y-3">
          <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
            <i className={`bi ${type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'} text-2xl`}></i>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 leading-tight">{title}</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Botones */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-3 rounded-xl text-white font-bold transition-transform active:scale-95 text-sm shadow-lg ${
              type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-black hover:bg-zinc-800 shadow-zinc-900/20'
            }`}
          >
            Confirmar
          </button>
        </div>

      </div>
    </div>
  );
}