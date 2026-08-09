// 四线三格 SVG 组件
// 用于：描红题、听写输入、看图写拼音答案
// 三格从上到下：上格（顶部到第二线）、中格（第二线到第三线）、下格（第三线到第四线）
// 拼音字母：a o e i u ü m n 等在中格；b d f h k l t 等在上格
// 整体认读、单韵母、复韵母：在中格

import { ReactNode } from 'react'

interface Props {
  width?: number
  height?: number
  children?: ReactNode
  showLetters?: string       // 中间展示的字母（虚线样式）
  filled?: string[]          // 已经填的字母
  highlight?: boolean
  onClick?: () => void
  className?: string
}

export function FourLineGrid({
  width = 64,
  height = 80,
  children,
  showLetters,
  filled = [],
  highlight,
  onClick,
  className = '',
}: Props) {
  return (
    <div
      onClick={onClick}
      className={`inline-block relative ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width, height }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* 四条线：上边线、第一条线、第二条线、第三条线、下边线 */}
        {/* 中格区 = 第二线到第三线之间 */}
        <line x1={0} y1={0} x2={width} y2={0} stroke="#94A3B8" strokeWidth={1} />
        <line x1={0} y1={height * 0.25} x2={width} y2={height * 0.25} stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="4 2" />
        <line x1={0} y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="4 2" />
        <line x1={0} y1={height * 0.75} x2={width} y2={height * 0.75} stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="4 2" />
        <line x1={0} y1={height} x2={width} y2={height} stroke="#94A3B8" strokeWidth={1} />
        {highlight && (
          <rect x={0} y={0} width={width} height={height} fill="rgba(251,146,60,0.1)" stroke="#F97316" strokeWidth={2} />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pinyin-char text-2xl">
        {children}
      </div>
      {showLetters && !children && (
        <div className="absolute inset-0 flex items-center justify-center text-3xl text-slate-300 pinyin-char">
          {showLetters}
        </div>
      )}
    </div>
  )
}

// 多格横排
export function FourLineRow({
  cells,
  cellWidth = 56,
  cellHeight = 70,
}: {
  cells: { char?: string; showLetter?: string; highlight?: boolean }[]
  cellWidth?: number
  cellHeight?: number
}) {
  return (
    <div className="flex gap-1 justify-center">
      {cells.map((c, i) => (
        <FourLineGrid
          key={i}
          width={cellWidth}
          height={cellHeight}
          showLetters={c.showLetter}
        >
          {c.char && <span className="text-2xl">{c.char}</span>}
        </FourLineGrid>
      ))}
    </div>
  )
}
