import { useState } from 'react';
import api from '../api/client';
import type { ImportResult } from '../types';

export default function ImportPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...dropped]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    setLoading(true);
    const newResults: ImportResult[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      const ext = file.name.toLowerCase();
      const endpoint = ext.endsWith('.ofx')
        ? '/imports/bank-statement-ofx'
        : '/imports/credit-card-pdf';

      try {
        const res = await api.post(endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        newResults.push(res.data);
      } catch (err: any) {
        newResults.push({
          filename: file.name,
          total_read: 0,
          total_imported: 0,
          duplicates_skipped: 0,
          pending_review: 0,
          auto_categorized: 0,
        });
      }
    }

    setResults(newResults);
    setFiles([]);
    setLoading(false);
  };




  return (
    <div className="space-y-6">
      <h2 className="page-title">Importar Dados</h2>
      <p className="page-subtitle">Arraste seus arquivos PDF ou OFX para importar</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drop zone */}
        <div className="lg:col-span-2 space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`card border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-primary-container bg-primary-50' : 'border-gray-300'
            }`}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <span className="material-symbols-outlined text-5xl text-primary-container mb-3 block">
              cloud_upload
            </span>
            <p className="text-body-lg font-medium">Arraste arquivos aqui</p>
            <p className="text-label-md text-outline mt-1">ou clique para selecionar</p>
            <p className="text-label-sm text-outline mt-2">Aceita: PDF (Itaú) e OFX (Extrato)</p>
            <input
              id="file-input"
              type="file"
              multiple
              accept=".pdf,.ofx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="card">
              <h3 className="text-body-lg font-semibold mb-3">Arquivos Selecionados</h3>
              <div className="space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined ${
                        f.name.endsWith('.pdf') ? 'text-error' : 'text-success'
                      }`}>
                        {f.name.endsWith('.pdf') ? 'picture_as_pdf' : 'description'}
                      </span>
                      <span className="text-body-md">{f.name}</span>
                    </div>
                    <button onClick={() => removeFile(i)} className="text-outline hover:text-error">
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={processFiles}
                disabled={loading}
                className="btn-primary mt-4 w-full justify-center"
              >
                {loading ? (
                  <span className="animate-spin material-symbols-outlined">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined">play_arrow</span>
                )}
                {loading ? 'Processando...' : 'Processar Importação'}
              </button>
            </div>
          )}
        </div>

        {/* Results panel */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-body-lg font-semibold mb-3">Resumo da Importação</h3>
            {results.length === 0 ? (
              <p className="text-label-md text-outline">Nenhum arquivo processado ainda.</p>
            ) : (
              <div className="space-y-4">
                {results.map((r, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-1">
                    <p className="text-label-md font-semibold">{r.filename}</p>
                    <div className="grid grid-cols-2 gap-1 text-label-sm text-outline">
                      <span>Lidas:</span><span className="font-medium text-on-surface">{r.total_read}</span>
                      <span>Importadas:</span><span className="font-medium text-success">{r.total_imported}</span>
                      <span>Categorizadas:</span><span className="font-medium text-primary-container">{r.auto_categorized}</span>
                      <span>Pendentes:</span><span className="font-medium text-warning">{r.pending_review}</span>
                      <span>Duplicatas:</span><span className="font-medium text-outline">{r.duplicates_skipped}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
