import { useMemo, useRef, useState } from 'react'
import { PageHeader, SectionHeader } from '../components/layout/PageHeader'
import { Glass } from '../components/ui/Glass'
import { Icon } from '../components/ui/Icon'
import { API_BASE_URL } from '../api/client'
import { bancosVisiveis, detectBankForFile, loadBancosAtivos } from '../config/banks'

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

interface ApiError {
  detail?: string | { code?: string; message?: string }
}

const STORAGE_KEY = 'app-financeiro-import-history'

function loadHistory(): ImportItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ImportItem[]) : []
  } catch {
    return []
  }
}

function saveHistory(items: ImportItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch { /* quota exceeded — silently skip */ }
}

export function Importar() {
  const [drag, setDrag] = useState(false)
  const [importados, setImportados] = useState<ImportItem[]>(loadHistory)
  const [novo, setNovo] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Estado do modal de senha para PDFs protegidos
  const [pendingPdfFiles, setPendingPdfFiles] = useState<File[] | null>(null)
  const [pdfPassword, setPdfPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const totalNovas = useMemo(() => importados.reduce((sum: number, item: ImportItem) => sum + item.novas, 0), [importados])
  const totalDup = useMemo(() => importados.reduce((sum: number, item: ImportItem) => sum + item.dup, 0), [importados])
  const bancosAtivos = useMemo(loadBancosAtivos, [])
  const bancosSelecionados = useMemo(() => bancosVisiveis(bancosAtivos), [bancosAtivos])

  async function handleFiles(files: FileList | File[], password?: string) {
    const fileList = Array.from(files)
    if (fileList.length === 0) return

    if (bancosSelecionados.length === 0) {
      setError('Nenhum banco ativo. Ative pelo menos um banco em Configurações > Bancos antes de importar.')
      return
    }

    const blockedFile = fileList.find(file => {
      const banco = detectBankForFile(file.name)
      return banco && !bancosAtivos.includes(banco.id)
    })
    if (blockedFile) {
      const banco = detectBankForFile(blockedFile.name)
      setError(`${banco?.label ?? 'Banco'} não está ativo em Configurações > Bancos para importar ${blockedFile.name}.`)
      return
    }

    setUploading(true)
    setError(null)
    try {
      const newItems: ImportItem[] = []
      for (const file of fileList) {
        const form = new FormData()
        form.append('file', file)
        if (password) form.append('password', password)

        const res = await fetch(`${API_BASE_URL}/imports/upload`, { method: 'POST', body: form })

        if (!res.ok) {
          let detail = `Erro ${res.status}`
          try {
            const body = await res.json() as ApiError
            if (body.detail && typeof body.detail === 'object' && 'code' in body.detail && body.detail.code === 'PDF_ENCRYPTED') {
              setPendingPdfFiles(fileList)
              setPdfPassword('')
              setPasswordError(null)
              setUploading(false)
              return
            }
            detail = typeof body.detail === 'string' ? body.detail : (body.detail as any)?.message || detail
          } catch {
            detail = `Importação falhou (${res.status}) para ${file.name}`
          }
          throw new Error(detail)
        }

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
      setImportados(prev => {
        const updated = [...newItems, ...prev]
        saveHistory(updated)
        return updated
      })
      setNovo(newItems[0]?.id ?? null)
      window.setTimeout(() => setNovo(null), 1800)
    } catch (e) {
      setError(importErrorMessage(e))
    } finally {
      setUploading(false)
    }
  }

  async function handlePasswordSubmit() {
    if (!pendingPdfFiles || !pdfPassword.trim()) return
    setPasswordError(null)
    setUploading(true)

    // Tenta re-enviar com a senha; detecta senha incorreta na resposta
    const file = pendingPdfFiles[0]
    const form = new FormData()
    form.append('file', file)
    form.append('password', pdfPassword.trim())

    try {
      const res = await fetch(`${API_BASE_URL}/imports/upload`, { method: 'POST', body: form })
      if (!res.ok) {
        const body = await res.json() as ApiError
        const detail = body.detail
        if (detail && typeof detail === 'object' && detail.code === 'PDF_ENCRYPTED') {
          setPasswordError('Senha incorreta. Tente novamente.')
          setUploading(false)
          return
        }
        throw new Error(typeof detail === 'string' ? detail : `Erro ${res.status}`)
      }

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
      setPendingPdfFiles(null)
      setPdfPassword('')
      setImportados(prev => {
        const updated = [item, ...prev]
        saveHistory(updated)
        return updated
      })
      setNovo(item.id)
      window.setTimeout(() => setNovo(null), 1800)
    } catch (e) {
      setError(importErrorMessage(e))
      setPendingPdfFiles(null)
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
        accept=".ofx,.xls,.xlsx,.pdf,.csv"
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
          <div className="dropzone-sub">
            {bancosSelecionados.length > 0
              ? 'A importação está limitada aos bancos ativos em Configurações.'
              : 'Nenhum banco ativo para importação.'}
          </div>
          {bancosSelecionados.length > 0 ? (
            <div className="import-bancos-ativos">
              {bancosSelecionados.map(banco => (
                <span key={banco.id} className="cfg-banco-chip">
                  <img src={banco.icon} alt="" aria-hidden="true" />
                  {banco.label}
                </span>
              ))}
            </div>
          ) : (
            <a className="import-config-link" href="/config">Configure em Configurações &gt; Bancos</a>
          )}
          <div className="dropzone-tags">
            <span className="tag"><Icon name="description" size={14} />OFX</span>
            <span className="tag"><Icon name="grid_on" size={14} />XLSX</span>
            <span className="tag"><Icon name="picture_as_pdf" size={14} />PDF</span>
            <span className="tag"><Icon name="table_chart" size={14} />CSV</span>
          </div>
          {error && <div className="t-sm" style={{ color: '#F87171' }}>{error}</div>}
        </div>
      </Glass>

      {/* Modal de senha para PDF protegido */}
      {pendingPdfFiles && (
        <div className="modal-overlay" onClick={() => setPendingPdfFiles(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">PDF protegido por senha</span>
              <button className="btn-icon" onClick={() => setPendingPdfFiles(null)}>
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="t-sm t-muted">
                O arquivo <strong>{pendingPdfFiles[0].name}</strong> está protegido. Informe a senha para continuar.
              </div>
              <input
                type="password"
                className="input"
                placeholder="Senha do PDF"
                value={pdfPassword}
                onChange={e => setPdfPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
                autoFocus
              />
              {passwordError && <div className="t-sm" style={{ color: '#F87171' }}>{passwordError}</div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setPendingPdfFiles(null)}>Cancelar</button>
              <button
                className="btn btn-primary"
                onClick={handlePasswordSubmit}
                disabled={!pdfPassword.trim() || uploading}
              >
                {uploading ? 'Processando...' : 'Importar'}
              </button>
            </div>
          </div>
        </div>
      )}

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
        {importados.length === 0 ? (
          <div className="empty-state-mini">
            <Icon name="upload_file" size={32} className="t-muted" />
            <div className="t-sm">Nenhum arquivo importado ainda</div>
            <div className="t-xs t-muted">Arraste ou selecione um arquivo acima para começar</div>
          </div>
        ) : (
          <div className="imp-list">
            {importados.map((item: ImportItem) => (
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
        )}
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

function importErrorMessage(error: unknown) {
  if (error instanceof TypeError) {
    console.error('Network/CORS error:', error)
    return `Não consegui conectar ao backend em ${API_BASE_URL}. Verifique se o rodar.bat está aberto e se não há bloqueio de Firewall/Antivírus.`
  }
  return error instanceof Error ? error.message : 'Erro desconhecido ao importar arquivo'
}

function detectType(filename: string, fallback?: string) {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.ofx')) return 'OFX'
  if (lower.endsWith('.pdf')) return 'PDF'
  if (lower.endsWith('.xls') || lower.endsWith('.xlsx')) return 'Excel'
  if (lower.endsWith('.csv')) return 'CSV'
  return fallback ?? 'Arquivo'
}

function fileIcon(type: string) {
  if (type === 'OFX') return 'description'
  if (type === 'PDF') return 'picture_as_pdf'
  if (type === 'CSV') return 'table_chart'
  return 'grid_on'
}

function fileIconStyle(type: string): React.CSSProperties {
  const color = type === 'OFX' ? '#06B6D4' : type === 'PDF' ? '#EC4899' : type === 'CSV' ? '#A855F7' : '#22C55E'
  return { background: `${color}20`, color }
}
