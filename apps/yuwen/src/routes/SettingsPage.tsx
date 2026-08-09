// 设置
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/schema'
import { Icon } from '@/components/icons/Icon'
import { testSpeak } from '@/audio/tts'

export default function SettingsPage() {
  const settings = useLiveQuery(() => db.settings.get('singleton'), [])
  const [pin, setPin] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings) setPin(settings.pin)
  }, [settings])

  if (!settings) return <main className="p-6"><p>加载中...</p></main>

  const update = async (patch: Partial<typeof settings>) => {
    await db.settings.update('singleton', patch)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white p-4 border-b sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Link to="/parent" className="text-gray-600 text-2xl">←</Link>
          <h1 className="text-child font-bold text-gray-700">家长设置</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {saved && <div className="bg-sun-50 text-sun-700 p-3 rounded-soft text-center">已保存</div>}

        <section className="bg-white rounded-bubble p-5 shadow-card">
          <h2 className="font-bold text-gray-700 mb-3">⏱ 学习时长</h2>
          <SettingRow label="每日时长上限（分钟）">
            <input
              type="number"
              value={settings.dailyLimitMin}
              onChange={e => update({ dailyLimitMin: Number(e.target.value) })}
              className="w-20 p-2 border rounded-soft text-right"
            />
          </SettingRow>
          <SettingRow label="休息提醒间隔（分钟）">
            <input
              type="number"
              value={settings.restIntervalMin}
              onChange={e => update({ restIntervalMin: Number(e.target.value) })}
              className="w-20 p-2 border rounded-soft text-right"
            />
          </SettingRow>
        </section>

        <section className="bg-white rounded-bubble p-5 shadow-card">
          <h2 className="font-bold text-ink-900 mb-3 flex items-center gap-2">
            <Icon name="volume" size={20} />
            声音
          </h2>
          <SettingRow label="发音速度">
            <select
              value={settings.speechRate}
              onChange={e => update({ speechRate: Number(e.target.value) })}
              className="p-2 border rounded-soft"
            >
              <option value="0.5">慢（0.5x）</option>
              <option value="0.7">稍慢（0.7x）</option>
              <option value="0.9">正常（0.9x）</option>
              <option value="1.2">快（1.2x）</option>
            </select>
          </SettingRow>
          <SettingRow label="">
            <button
              onClick={() => {
                const r = testSpeak()
                if (!r.ok) alert('听不到声音？' + (r.reason || '请检查系统语音包设置'))
              }}
              className="px-4 py-2 bg-pig-500 text-white rounded-pill text-sm font-bold shadow-bubble active:scale-95"
            >
              🔔 测试发音
            </button>
          </SettingRow>
        </section>

        <section className="bg-white rounded-bubble p-5 shadow-card">
          <h2 className="font-bold text-gray-700 mb-3">🔤 字号</h2>
          <SettingRow label="字号">
            <select
              value={settings.fontSize}
              onChange={e => update({ fontSize: e.target.value as any })}
              className="p-2 border rounded-soft"
            >
              <option value="m">中</option>
              <option value="l">大</option>
              <option value="xl">特大</option>
            </select>
          </SettingRow>
        </section>

        <section className="bg-white rounded-bubble p-5 shadow-card">
          <h2 className="font-bold text-gray-700 mb-3">🔑 PIN 码</h2>
          <SettingRow label="家长端 PIN（4位）">
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={e => setPin(e.target.value)}
              onBlur={() => update({ pin })}
              className="w-24 p-2 border rounded-soft text-center tracking-widest"
            />
          </SettingRow>
        </section>

        <section className="bg-white rounded-bubble p-5 shadow-card">
          <h2 className="font-bold text-red-600 mb-3">⚠️ 危险操作</h2>
          <button
            onClick={async () => {
              if (!confirm('确定要清空所有学习进度吗？此操作不可恢复。')) return
              await db.lessons.clear()
              await db.stages.clear()
              await db.errorItems.clear()
              await db.badges.clear()
              await db.sessions.clear()
              await db.streak.clear()
              await db.settings.clear()
              alert('已清空')
              location.href = '/'
            }}
            className="w-full py-3 bg-red-100 text-red-700 rounded-soft font-bold"
          >
            清空所有进度
          </button>
        </section>
      </div>
    </main>
  )
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-gray-700">{label}</span>
      {children}
    </div>
  )
}
