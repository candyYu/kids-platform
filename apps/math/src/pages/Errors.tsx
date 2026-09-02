// 错题本：列出待重练的错题，一键重练（进练习页 retry 模式）
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/schema'
import { numToCn } from '@/data/topics'

export default function Errors() {
  const errs = useLiveQuery(
    () => db.errors.orderBy('lastWrongAt').reverse().toArray(),
    [],
  )

  return (
    <main className="min-h-screen p-6">
      <header className="text-center mb-6">
        <h1 className="text-child-xl font-bold text-pig-700">📕 错题本</h1>
        <p className="text-child text-ink-500 mt-1">练一练，把它们打败！</p>
      </header>

      {errs && errs.length > 0 && (
        <div className="text-center mb-6">
          <Link
            to="/practice/retry"
            className="btn-pig inline-block px-10 py-3 text-child-lg"
          >
            开始重练（{Math.min(errs.length, 10)} 题）
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
        {errs && errs.length === 0 && (
          <div className="paper-card p-8 text-center">
            <p className="text-4xl mb-2">🎊</p>
            <p className="text-child text-ink-700">错题本是空的，太棒了！</p>
          </div>
        )}
        {errs?.map(e => (
          <div key={e.key} className="paper-card p-4 flex items-center gap-3">
            <span className="text-3xl">❌</span>
            <div className="flex-1">
              <p className="text-child-lg font-bold text-ink-900">{e.expr.replace(' = ?', '')}</p>
              <p className="text-child text-ink-500">
                答案 {e.rem != null ? `${e.ans}……${e.rem}` : e.ans}
                {e.rem != null && `（${numToCn(e.b)} 除）`} · 错 {e.count} 次
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
