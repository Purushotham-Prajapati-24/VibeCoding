import React, { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const NewtonAI = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const checkAvailability = () => {
            if (window.botpressWebChat) {
                setIsLoaded(true);
                // Ensure hidden on load if desired, or let it stay default
            }
        };

        // Poll for availability if not immediately present
        const interval = setInterval(checkAvailability, 500);

        // 1. Inject the Core Script
        if (!document.getElementById('botpress-inject')) {
            const script1 = document.createElement('script');
            script1.src = "https://cdn.botpress.cloud/webchat/v2.2/inject.js"; // Use v2.2 stability for sendEvent
            script1.id = 'botpress-inject';
            script1.async = true;
            document.body.appendChild(script1);

            const script2 = document.createElement('script');
            script2.src = "https://files.bpcontent.cloud/2026/02/12/00/20260212003430-CKFX9E70.js";
            script2.defer = true;
            document.body.appendChild(script2);
        }

        return () => clearInterval(interval);
    }, []);

    const toggleChat = () => {
        if (!window.botpressWebChat) {
            console.warn("Botpress not loaded");
            return;
        }

        if (isOpen) {
            window.botpressWebChat.sendEvent({ type: 'hide' });
        } else {
            window.botpressWebChat.sendEvent({ type: 'show' });
        }
        setIsOpen(!isOpen);
    };

    return (
        <React.Fragment>
            {/* Custom Toggle Button */}
            <button
                id="bp-toggle-chat"
                onClick={toggleChat}
                className={`fixed bottom-6 right-6 z-9999 flex items-center gap-2 px-5 py-3 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-full shadow-2xl shadow-blue-900/40 transition-all hover:scale-105 font-bold border border-white/10 group ${!isLoaded ? 'opacity-50 cursor-wait' : ''}`}
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
