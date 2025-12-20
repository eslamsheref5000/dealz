import Image from 'next/image';

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden">
            {/* Cyber Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none cyber-lines opacity-20"></div>

            {/* Glitch Container */}
            <div className="relative w-32 h-32 md:w-48 md:h-48 mb-12">
                {/* Main Logo */}
                <div className="relative z-10 w-full h-full animate-pulse">
                    <Image
                        src="/logo.png"
                        alt="Loading..."
                        fill
                        className="object-contain drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                        priority
                    />
                </div>

                {/* Red Ghost (Glitch Effect) */}
                <div className="absolute inset-0 z-0 w-full h-full opacity-50 animate-glitch translate-x-1">
                    <Image
                        src="/logo.png"
                        alt=""
                        fill
                        className="object-contain hue-rotate-0 mix-blend-screen"
                    />
                </div>

                {/* Cyan/Blue Ghost (Glitch Effect - Offset) */}
                <div className="absolute inset-0 z-0 w-full h-full opacity-50 animate-glitch translate-x-[-2px] animation-delay-500">
                    <Image
                        src="/logo.png"
                        alt=""
                        fill
                        className="object-contain hue-rotate-180 mix-blend-screen"
                    />
                </div>
            </div>

            {/* Loading Text */}
            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="text-red-500 font-mono text-xl tracking-[0.5em] animate-pulse">
                    SYSTEM_INIT
                </div>

                {/* Cyber Progress Bar */}
                <div className="w-64 h-2 bg-gray-900 border border-red-900 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-red-600 animate-[shimmer_1s_infinite] w-[50%] translate-x-[-100%] animate-[slideRight_1.5s_infinite_linear]"></div>
                    {/* Glitchy fills */}
                    <div className="absolute inset-y-0 left-0 bg-red-600 w-full animate-[progress_3s_ease-out_forwards]"></div>
                </div>

                <div className="flex gap-4 text-[10px] text-red-900/60 font-mono mt-2">
                    <span>MEM: OK</span>
                    <span>NET: SECURE</span>
                    <span>V.10.2</span>
                </div>
            </div>

            {/* Custom Keyframes for this file specifically if not in globals */}
            <style>{`
        @keyframes slideRight {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
        }
        @keyframes progress {
            0% { width: 0%; }
            20% { width: 10%; }
            40% { width: 45%; }
            60% { width: 60%; }
            70% { width: 55%; } /* Glitch back */
            100% { width: 100%; }
        }
      `}</style>
        </div>
    );
}
