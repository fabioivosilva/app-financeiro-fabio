import { useMemo, useRef, useState } from 'react'
import { PageHeader, SectionHeader } from '../components/layout/PageHeader'
import { Glass } from '../components/ui/Glass'
import { Icon } from '../components/ui/Icon'

interface ImportItem {
  id: string
  nome: string
  tipo: string
  fonte: string
  transacoes: number
  novas: number
  dup: number
  status: 'ok' | 'novo' | 'erro'
}

interface UploadResult {
  bank?: string
  format?: string
  account?: string | null
  total_found?: number
  imported?: number
  duplicates?: number
}

const sampleImports: ImportItem[] = [
  { id: 'f1', nome: 'extrato_itau_abr2026.ofx', tipo: 'OFX', fonte: 'Itaú · Conta Corrente', transacoes: 47, novas: 47, dup: 0, status: 'ok' },
  { id: 'f2', nome: 'fatura_itau_mai2026.pdf', tipo: 'PDF', fonte: 'Itaú · Cartão Visa', transacoes: 32, novas: 28, dup: 4, status: 'ok' },
  { id: 'f3', nome: 'extrato_corrente_mai_parcial.xls', tipo: 'Excel', fonte: 'Itaú · Conta Corrente', transacoes: 12, novas: 9, dup: 3, status: 'ok' },
]

export function Importar() {
  const [drag, setDrag] = useState(false)
  const [importados, setImportados] = useState<ImportItem[]>(sampleImports)
  const [novo, setNovo] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const totalNovas = useMemo(() => importados.reduce((sum, item) => sum + item.novas, 0), [importados])
  const totalDup = useMemo(() => importados.reduce((sum, item) => sum + item.dup, 0), [importados])

  async function handleFiles(files: FileList | File[]) {
    const fileList = Array.from(files)
    if (fileList.length === 0) return

    setUploading(true)
    setError(null)
    try {
      const newItems: ImportItem[] = []
      for (const file of fileList) {
        const form = new FormData()
        form.append('file', file)
        const host = window.location.hostname
        const res = await fetch(`http://${host}:8000/imports/upload`, { method: 'POST', body: form })
        if (!res.ok) throw new Error(`Importação falhou (${res.status}) para ${file.name}`)
        const result = await res.json() as UploadResult
        const item: ImportItem = {
          id: `${file.name}-${Date.now()}`,
          nome: file.name,
          tipo: detectType(file.name, result.format),
          fonte: `${result.bank ?? 'Arquivo'} · ${result.account ?? result.format ?? 'Importação'}`,
          transacoes: result.total_found ?? 0,
          novas: result.imported ?? 0,
          dup: result.duplicates ?? 0,
          status: 'novo',
        }
        newItems.push(item)
      }
      setImportados(prev => [...newItems, ...prev])
      setNovo(newItems[0]?.id ?? null)
      window.setTimeout(() => setNovo(null), 1800)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao importar arquivo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="page page-importar">
      <PageHeader
        title="Importar"
        subtitle="OFX, Excel ou PDF — o app detecta a origem e remove duplicatas automaticamente"
      />

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".ofx,.xls,.xlsx,.pdf"
        style={{ display: 'none' }}
        onChange={e => e.target.files && handleFiles(e.target.files)}
      />

      <Glass
        className={`dropzone ${drag ? 'dropzone-drag' : ''}`}
        padded={false}
        onClick={() => inputRef.current?.click()}
      >
        <div
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files) }}
          className="dropzone-inner"
        >
          <div className="dropzone-icon">
            <Icon name={uploading ? 'hourglass_empty' : 'upload_file'} size={36} />
          </div>
          <div className="dropzone-title">{uploading ? 'Processando arquivos...' : 'Arraste arquivos ou clique para selecionar'}</div>
          <div className="dropzone-sub">Suporta OFX (banco), Excel (Itaú) e PDF (fatura). Múltiplos arquivos.</div>
          <div className="dropzone-tags">
            <span className="tag"><Icon name="description" size={14} />OFX</span>
            <span className="tag"><Icon name="grid_on" size={14} />XLSX</span>
            <span className="tag"><Icon name="picture_as_pdf" size={14} />PDF</span>
          </div>
          {error && <div className="t-sm" style={{ color: '#F87171' }}>{error}</div>}
        </div>
      </Glass>

      <div className="grid-3">
        <Glass className="stat-card">
          <div className="stat-label">ARQUIVOS PROCESSADOS</div>
          <div className="stat-val">{importados.length}</div>
          <div className="t-xs t-muted">Neste ciclo</div>
        </Glass>
        <Glass className="stat-card">
          <div className="stat-label">NOVAS TRANSAÇÕES</div>
          <div className="stat-val" style={{ color: '#22C55E' }}>+{totalNovas}</div>
          <div className="t-xs t-muted">Adicionadas ao livro</div>
        </Glass>
        <Glass className="stat-card">
          <div className="stat-label">DUPLICATAS IGNORADAS</div>
          <div className="stat-val" style={{ color: '#94A3B8' }}>{totalDup}</div>
          <div className="t-xs t-muted">Detectadas por hash + valor + data</div>
        </Glass>
      </div>

      <Glass>
        <SectionHeader title="Histórico de importações" />
        <div className="imp-list">
          {importados.map(item => (
            <div key={item.id} className={`imp-row ${novo === item.id ? 'imp-row-new' : ''}`}>
              <div className="imp-icon" style={fileIconStyle(item.tipo)}>
                <Icon name={fileIcon(item.tipo)} size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t-sm">{item.nome}</div>
                <div className="t-xs t-muted">{item.fonte} · {item.transacoes} transações lidas</div>
              </div>
              <div className="imp-stats">
                <span className="imp-pill imp-pill-new">+{item.novas} novas</span>
                {item.dup > 0 && <span className="imp-pill imp-pill-dup">{item.dup} dup.</span>}
              </div>
              <button className="btn-icon"><Icon name="more_vert" size={18} /></button>
            </div>
          ))}
        </div>
      </Glass>

      <Glass className="hint-card">
        <Icon name="lightbulb" size={20} className="hint-icon" />
        <div>
          <div className="t-sm">Dica</div>
          <div className="t-xs t-muted">
            Importe extratos no início de cada ciclo (dia 27). O app reconhece o formato automaticamente
            e ignora arquivos já processados.
          </div>
        </div>
      </Glass>
    </div>
  )
}

function detectType(filename: string, fallback?: string) {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.ofx')) return 'OFX'
  if (lower.endsWith('.pdf')) return 'PDF'
  if (lower.endsWith('.xls') || lower.endsWith('.xlsx')) return 'Excel'
  return fallback ?? 'Arquivo'
}

function fileIcon(type: string) {
  if (type === 'OFX') return 'description'
  if (type === 'PDF') return 'picture_as_pdf'
  return 'grid_on'
}

function fileIconStyle(type: string): React.CSSProperties {
  const color = type === 'OFX' ? '#06B6D4' : type === 'PDF' ? '#EC4899' : '#22C55E'
  return { background: `${color}20`, color }
}
