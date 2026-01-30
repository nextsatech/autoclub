'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx'; // 👈 Importamos la librería
import { API_URL } from '@/app/config/api';

export default function AllowedStudentsPage() {
  // Configuración de Columnas
  const [colDocument, setColDocument] = useState('CEDULA'); // Valor por defecto
  const [colLicense, setColLicense] = useState('LICENCIA'); // Valor por defecto
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // 1. LEER EXCEL Y MOSTRAR PREVISUALIZACIÓN
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0]; // Leemos la primera hoja
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws); // Convertimos a JSON

      setPreview(data); // Guardamos la data cruda para procesar después
    };
    reader.readAsBinaryString(selectedFile);
  };

  // 2. PROCESAR Y ENVIAR AL BACKEND
  const handleUpload = async () => {
    if (!preview.length) return;
    setLoading(true);
    setLogs([]);

    // Filtramos y mapeamos la data según los nombres de columna que puso el usuario
    const formattedData = preview.map((row: any) => ({
      document_number: row[colDocument], // Usamos la variable dinámica
      license_name: row[colLicense]      // Usamos la variable dinámica
    })).filter(item => item.document_number); // Quitamos filas vacías

    if (formattedData.length === 0) {
      alert(`No se encontraron datos. Verifica que las columnas en el Excel se llamen exactamente "${colDocument}" y "${colLicense}".`);
      setLoading(false);
      return;
    }

    try {
      // Enviamos todo el bloque al backend (Endpoint Batch)
      const res = await fetch(`${API_URL}/allowed-students/batch`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ data: formattedData })
      });

      const result = await res.json();
      
      if (res.ok) {
        setLogs([`✅ Proceso finalizado.`, `Insertados/Actualizados: ${result.success}`, ...result.errors]);
        setFile(null);
        setPreview([]);
      } else {
        setLogs([`❌ Error en el servidor: ${result.message}`]);
      }

    } catch (error) {
      setLogs(['❌ Error de conexión con el servidor.']);
    }

    setLoading(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">Carga Masiva de Admitidos</h1>
        <p className="text-zinc-500">Sube un archivo Excel (.xlsx) con los estudiantes autorizados y sus licencias.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA 1: CONFIGURACIÓN Y CARGA */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Paso 1: Configurar Columnas */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
            <h3 className="font-bold text-zinc-800 mb-4 flex items-center gap-2">
              <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Mapeo de Columnas
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Nombre Columna Cédula</label>
                <input 
                  type="text" 
                  value={colDocument} 
                  onChange={(e) => setColDocument(e.target.value)}
                  className="w-full p-2 border border-zinc-300 rounded-lg text-sm font-mono"
                  placeholder="Ej: DOCUMENTO"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Nombre Columna Licencia</label>
                <input 
                  type="text" 
                  value={colLicense} 
                  onChange={(e) => setColLicense(e.target.value)}
                  className="w-full p-2 border border-zinc-300 rounded-lg text-sm font-mono"
                  placeholder="Ej: CATEGORIA"
                />
              </div>
            </div>
            <p className="text-[10px] text-zinc-400 mt-3 leading-tight">
              * Escribe EXACTAMENTE el nombre que tiene la cabecera en tu Excel (respeta mayúsculas/minúsculas).
            </p>
          </div>

          {/* Paso 2: Subir Archivo */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
             <h3 className="font-bold text-zinc-800 mb-4 flex items-center gap-2">
              <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
              Seleccionar Archivo
            </h3>
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 transition-all"
            />
          </div>

          {/* Botón Acción */}
          <button
            onClick={handleUpload}
            disabled={!file || loading || preview.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2
              ${!file ? 'bg-zinc-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
            `}
          >
            {loading ? 'Procesando...' : 'Subir y Procesar'}
          </button>
        </div>

        {/* COLUMNA 2 Y 3: PREVISUALIZACIÓN Y LOGS */}
        <div className="lg:col-span-2 bg-zinc-50 rounded-2xl border border-zinc-200 p-6 flex flex-col h-[600px]">
          
          {/* Toggle entre Vista Previa y Logs */}
          <div className="flex gap-4 mb-4 border-b border-zinc-200 pb-2">
             <h3 className="font-bold text-zinc-700">Vista Previa ({preview.length} filas)</h3>
          </div>

          <div className="flex-1 overflow-auto bg-white rounded-xl border border-zinc-200 shadow-inner custom-scrollbar relative">
             
             {/* Si hay logs (después de subir), mostramos logs */}
             {logs.length > 0 ? (
               <div className="p-4 space-y-2 font-mono text-xs">
                 {logs.map((log, i) => (
                   <div key={i} className={log.includes('❌') ? 'text-red-600' : 'text-green-600'}>{log}</div>
                 ))}
               </div>
             ) : (
               // Si no hay logs, mostramos la tabla de previsualización
               <table className="w-full text-sm text-left">
                 <thead className="bg-zinc-100 text-zinc-600 font-bold sticky top-0">
                   <tr>
                     <th className="p-3 border-b">#</th>
                     <th className="p-3 border-b">{colDocument} (Detectado)</th>
                     <th className="p-3 border-b">{colLicense} (Detectado)</th>
                   </tr>
                 </thead>
                 <tbody>
                   {preview.length === 0 ? (
                     <tr>
                       <td colSpan={3} className="p-10 text-center text-zinc-400 italic">
                         Sube un archivo para ver la vista previa aquí...
                       </td>
                     </tr>
                   ) : (
                     preview.slice(0, 50).map((row, i) => (
                       <tr key={i} className="border-b last:border-0 hover:bg-zinc-50">
                         <td className="p-3 text-zinc-400 text-xs">{i + 1}</td>
                         <td className={`p-3 font-mono ${!row[colDocument] ? 'text-red-400' : 'text-zinc-800'}`}>
                           {row[colDocument] || '(Vacío)'}
                         </td>
                         <td className="p-3 text-zinc-600">
                           {row[colLicense] || '-'}
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             )}
          </div>
          {preview.length > 50 && logs.length === 0 && (
             <p className="text-xs text-zinc-400 text-center mt-2">Mostrando primeras 50 filas...</p>
          )}
        </div>
      </div>
    </div>
  );
}