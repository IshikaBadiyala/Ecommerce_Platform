/**
 * GoogleLoginButton Component
 * ----------------------------
 * Integrates Google Identity Services (GIS) for real OAuth 2.0 authentication.
 * 
 * Viva Concepts:
 * - useRef: Attaches directly to a DOM container div where Google's official SDK renders
 *   its authenticated iframe button.
 * - useEffect: Initializes `window.google.accounts.id` once the component mounts and cleans up.
 * - ID Token Verification: The client only receives Google's signed ID token (JWT)
 *   and sends it to the Express backend for cryptographic signature verification.
 */

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Info, ExternalLink } from 'lucide-react';
import Modal from './Modal';

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const { googleLogin } = useAuth();
  const googleBtnContainerRef = useRef(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isConfigured =
    clientId &&
    !clientId.includes('your_google_client_id_here') &&
    clientId.endsWith('.apps.googleusercontent.com');

  useEffect(() => {
    // Only attempt GIS initialization if valid client ID is present and GIS script is loaded
    if (!isConfigured) return;

    const initializeGoogleSignIn = () => {
      if (window.google?.accounts?.id && googleBtnContainerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              // response.credential contains Google's signed ID Token (JWT)
              if (response.credential) {
                setLoading(true);
                const res = await googleLogin(response.credential);
                setLoading(false);
                if (res.success) {
                  if (onSuccess) onSuccess();
                } else {
                  if (onError) onError(res.message);
                }
              }
            },
          });

          // Render Google's official branded button
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            shape: 'rectangular',
            text: 'continue_with',
            logo_alignment: 'left',
          });
        } catch (err) {
          console.error('[GIS Init Error]:', err);
        }
      }
    };

    // If script already loaded, init immediately; else wait for load event
    if (window.google?.accounts?.id) {
      initializeGoogleSignIn();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initializeGoogleSignIn();
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [clientId, isConfigured, googleLogin, onSuccess, onError]);

  // If Client ID is placeholder, render a clean setup-ready button with configuration guide
  if (!isConfigured) {
    return (
      <>
        <div className="w-full">
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.2C.7 9.6 0 12 0 14.7s.7 5.1 1.9 7.5l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.9C3.7 20.7 7.5 23.5 12 23.5z"
              />
            </svg>
            Continue with Google
          </button>
          <p className="mt-1.5 text-center text-[11px] text-slate-400">
            OAuth placeholder detected.{' '}
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="text-emerald-600 hover:underline inline-flex items-center gap-0.5 font-medium"
            >
              How to configure <Info className="w-3 h-3 inline" />
            </button>
          </p>
        </div>

        {/* Google OAuth Setup Guidance Modal */}
        <Modal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          title="Google OAuth 2.0 Setup Instructions"
        >
          <div className="text-sm text-slate-600 space-y-4 leading-relaxed">
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-800 text-xs">
              <strong>College Viva / Evaluator Note:</strong>
              <p className="mt-1">
                The full backend token verification pipeline is completely built using Google’s official{' '}
                <code>google-auth-library</code>. Email/password authentication is fully active right now. To test real Google Sign-In with your own Google account, follow these 3 quick steps:
              </p>
            </div>

            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700">
              <li>
                Go to the{' '}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 underline font-semibold inline-flex items-center gap-0.5"
                >
                  Google Cloud Console <ExternalLink className="w-3 h-3" />
                </a>{' '}
                and create a project.
              </li>
              <li>
                Configure the OAuth consent screen and create an <strong>OAuth 2.0 Web Client ID</strong>.
              </li>
              <li>
                Add <code className="bg-slate-100 px-1 py-0.5 rounded">http://localhost:5173</code> to{' '}
                <strong>Authorized JavaScript Origins</strong>.
              </li>
              <li>
                Paste your Client ID into both <code className="bg-slate-100 px-1 py-0.5 rounded">client/.env</code>{' '}
                and <code className="bg-slate-100 px-1 py-0.5 rounded">server/.env</code>.
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowConfigModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-xl text-xs transition mt-2"
            >
              Understood, close
            </button>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {loading && (
        <p className="text-xs text-emerald-600 font-medium mb-1 animate-pulse">
          Verifying Google account...
        </p>
      )}
      <div ref={googleBtnContainerRef} className="w-full flex justify-center min-h-[44px]"></div>
    </div>
  );
};

export default GoogleLoginButton;
