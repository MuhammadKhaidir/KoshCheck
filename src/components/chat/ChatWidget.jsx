import { useEffect, useId, useRef, useState } from 'react'
import Icon from '../ui/Icon.jsx'
import { chat as copy } from '../../content/site.js'
import s from './ChatWidget.module.css'

/*
  Widget chat AI. Pesan dikirim ke /api/chat (api/chat.js), tempat API key disimpan.
  Teks widget ada di content/site.js (export `chat`).
*/
export default function ChatWidget() {
  const uid = useId()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const listRef = useRef(null)
  const inputRef = useRef(null)
  const launcherRef = useRef(null)
  const pernahBuka = useRef(false)

  useEffect(() => {
    if (open) {
      pernahBuka.current = true
      inputRef.current?.focus()
    } else if (pernahBuka.current) {
      launcherRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading, error, open])

  async function ask(history) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.reply) throw new Error(data.error || `HTTP ${res.status}`)
      setMessages([...history, { role: 'assistant', content: data.reply }])
    } catch (err) {
      console.error('[chat]', err)
      setError(copy.error)
    } finally {
      setLoading(false)
    }
  }

  function submit(text) {
    const content = text.trim()
    if (!content || loading) return
    const history = [...messages, { role: 'user', content }]
    setMessages(history)
    setInput('')
    ask(history)
  }

  if (!open) {
    return (
      <div className={s.root}>
        <button
          ref={launcherRef}
          type="button"
          className={s.launcher}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
        >
          <Icon name="chat" />
          {copy.launcher}
        </button>
      </div>
    )
  }

  return (
    <div className={s.root}>
      <section
        className={s.panel}
        role="dialog"
        aria-labelledby={`${uid}-title`}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      >
        <header className={s.head}>
          <div>
            <h2 id={`${uid}-title`} className={s.title}>
              {copy.title}
            </h2>
            <p className={s.sub}>{copy.subtitle}</p>
          </div>
          <button type="button" className={s.close} aria-label="Tutup chat" onClick={() => setOpen(false)}>
            <Icon name="close" />
          </button>
        </header>

        <div className={s.list} ref={listRef} role="log">
          <p className={`${s.msg} ${s.bot}`}>{copy.greeting}</p>
          {messages.map((m, i) => (
            <p key={i} className={`${s.msg} ${m.role === 'user' ? s.me : s.bot}`}>
              {m.content}
            </p>
          ))}
          {messages.length === 0 && (
            <ul className={s.chips}>
              {copy.suggestions.map((q) => (
                <li key={q}>
                  <button type="button" className={s.chip} onClick={() => submit(q)}>
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {loading && <p className={`${s.msg} ${s.bot} ${s.wait}`}>Mengetik…</p>}
          {error && (
            <div className={s.error} role="alert">
              <p>{error}</p>
              <button type="button" className={s.retry} onClick={() => ask(messages)}>
                {copy.retry}
              </button>
            </div>
          )}
        </div>

        <form
          className={s.form}
          onSubmit={(e) => {
            e.preventDefault()
            submit(input)
          }}
        >
          <label className="visually-hidden" htmlFor={`${uid}-input`}>
            Pesan untuk asisten
          </label>
          <input
            id={`${uid}-input`}
            ref={inputRef}
            className={s.input}
            type="text"
            maxLength={500}
            autoComplete="off"
            placeholder={copy.placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className={s.send} aria-label="Kirim" disabled={loading || !input.trim()}>
            <Icon name="send" />
          </button>
        </form>
        <p className={s.note}>{copy.note}</p>
      </section>
    </div>
  )
}
