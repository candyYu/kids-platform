// 阶段2 看视频：嵌入用户提供的 mp4
import type { Lesson } from '@/data/lessons'

interface Props {
  lesson: Lesson
  onComplete: () => void
}

export function DemoStage({ lesson, onComplete }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-center text-child text-sea-900">
        跟着老师看一遍：{lesson.theme}
      </p>
      <div className="bg-black rounded-bubble overflow-hidden aspect-video">
        <video
          src={lesson.videoFile}
          controls
          playsInline
          className="w-full h-full"
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={onComplete}
          className="flex-1 py-4 bg-white text-pig-700 border-2 border-pig-200 rounded-bubble text-child font-bold"
        >
          跳过
        </button>
        <button
          onClick={onComplete}
          className="flex-1 py-4 bg-pig-500 text-white rounded-bubble text-child font-bold"
        >
          看完了 →
        </button>
      </div>
    </div>
  )
}
