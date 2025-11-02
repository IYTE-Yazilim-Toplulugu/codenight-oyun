import React, { useEffect, useState } from 'react';

const Loader: React.FC = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) return 100;
                return prev + Math.random() * 15;
            });
        }, 200);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-linear-to-br from-indigo-900 via-purple-900 to-pink-900">
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute h-2 w-2 rounded-full bg-white opacity-20 animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${2 + Math.random() * 3}s`,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 flex flex-col items-center space-y-8 px-4">
                {/* Game controller icon with animation */}
                <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-purple-500 opacity-20"></div>
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-500 shadow-2xl">
                        <svg
                            className="h-12 w-12 text-white animate-pulse"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Loading text with glitch effect */}
                <div className="text-center">
                    <h2 className="mb-2 text-4xl font-bold text-white">
                        LOADING
                    </h2>
                    <p className="text-lg text-purple-200">Preparing your adventure...</p>
                </div>

                {/* Progress bar */}
                <div className="w-80 max-w-full">
                    <div className="relative h-4 overflow-hidden rounded-full bg-gray-800/50 backdrop-blur-sm">
                        <div
                            className="h-full bg-linear-to-r from-purple-500 via-pink-500 to-purple-500 transition-all duration-300 ease-out"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        >
                            <div className="h-full w-full animate-pulse bg-white/20"></div>
                        </div>
                    </div>
                    <div className="mt-2 text-center text-sm font-semibold text-purple-200">
                        {Math.floor(Math.min(progress, 100))}%
                    </div>
                </div>

                {/* Loading tips */}
                <div className="mt-4 rounded-lg bg-black/30 px-6 py-3 backdrop-blur-sm">
                    <p className="text-sm text-purple-100">
                        💡 <span className="font-semibold">Pro Tip:</span> Stay focused and have fun!
                    </p>
                </div>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-4 left-4 h-16 w-16 border-l-4 border-t-4 border-purple-400 opacity-50"></div>
            <div className="absolute top-4 right-4 h-16 w-16 border-r-4 border-t-4 border-pink-400 opacity-50"></div>
            <div className="absolute bottom-4 left-4 h-16 w-16 border-l-4 border-b-4 border-pink-400 opacity-50"></div>
            <div className="absolute bottom-4 right-4 h-16 w-16 border-r-4 border-b-4 border-purple-400 opacity-50"></div>
        </div>
    );
};

export default Loader;
