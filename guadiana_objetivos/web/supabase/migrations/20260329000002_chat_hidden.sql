-- Privacidad en chat: columna chat_hidden en profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS chat_hidden BOOLEAN NOT NULL DEFAULT false;

INSERT INTO public.platform_modules (key, module, label, is_active)
VALUES ('chat.hidden', 'Chat', 'Privacidad en chat (ocultarse del directorio)', true)
ON CONFLICT (key) DO NOTHING;
