"use client"

export function ChatGridBackground() {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none min-h-screen">
      {/* Horizontal lines */}
      <div className="absolute top-[33vh] left-0 right-0 h-px bg-gray-800/10 dark:bg-white/10 overflow-hidden">
        <div className="spark-x spark-delay-2" />
        <div className="spark-x spark-delay-3" style={{ animationDuration: "9s" }} />
      </div>

      <div className="absolute top-[66vh] left-0 right-0 h-px bg-gray-800/10 dark:bg-white/10 overflow-hidden">
        <div className="spark-x spark-delay-1" style={{ animationDuration: "8s" }} />
        <div className="spark-x spark-delay-3" />
      </div>

      {/* Vertical lines */}
      <div className="absolute top-0 left-[33vw] w-px h-screen bg-gray-800/10 dark:bg-white/10 overflow-visible">
        <div className="spark-y spark-delay-2" />
        <div className="spark-y spark-delay-3" style={{ animationDuration: "9s" }} />
      </div>

      <div className="absolute top-0 left-[66vw] w-px h-screen bg-gray-800/10 dark:bg-white/10 overflow-visible">
        <div className="spark-y spark-delay-1" style={{ animationDuration: "8s" }} />
        <div className="spark-y spark-delay-3" />
      </div>
    </div>
  )
}
