import React, { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const NewtonAI = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Prevent duplicate injection
        if (document.getElementById('botpress-inject')) return;

        // 1. Inject the Core Script
        const script1 = document.createElement('script');
        script1.src = "https://cdn.botpress.cloud/webchat/v3.6/inject.js";
        script1.id = 'botpress-inject';
        script1.async = true;

        script1.onload = () => {
            setIsLoaded(true);
        };

        document.body.appendChild(script1);

        // 2. Inject the Configuration Script
        const script2 = document.createElement('script');
        script2.src = "https://files.bpcontent.cloud/2026/02/12/00/20260212003430-CKFX9E70.js";
        script2.defer = true;
        document.body.appendChild(script2);

        return () => {
            // Cleanup not typically needed for globals, but good practice if unmounting
        };
    }, []);

    const toggleChat = () => {
        if (window.botpressWebChat) {
            window.botpressWebChat.sendEvent({ type: isOpen ? 'hide' : 'show' });
            setIsOpen(!isOpen);
        } else {
            console.warn("Botpress WebChat not initialized yet");
        }
    };

    return (
        <React.Fragment>
            {/* Custom Toggle Button as requested */}
            <button
                id="bp-toggle-chat"
                onClick={toggleChat}
                className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-full shadow-2xl shadow-blue-900/40 transition-all hover:scale-105 font-bold border border-white/10 group"
            >
                {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
                <span>NewtonAI</span>

                {/* Status Indicator */}
                {!isLoaded && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
            </button>
        </React.Fragment>
    );
};

export default NewtonAI;
