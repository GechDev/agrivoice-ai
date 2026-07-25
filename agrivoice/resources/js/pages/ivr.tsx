import { Head, setLayoutProps } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    index as ivrIndex,
    speak as ivrSpeak,
} from '@/actions/App/Http/Controllers/IvrController';
import { IvrKeypad } from '@/components/ivr-keypad';
import type { IvrMenuOption } from '@/components/ivr-keypad';
import { useTranslations } from '@/hooks/use-translations';
import type { Crop } from '@/types';

type IvrPageProps = {
    menuOptions: IvrMenuOption[];
    cropScripts: Record<string, string>;
    startupQueue: string[];
    addisConfigured: boolean;
};

function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

export default function Ivr({
    menuOptions,
    cropScripts,
    startupQueue,
    addisConfigured,
}: IvrPageProps) {
    const t = useTranslations();
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const queueTokenRef = useRef(0);
    const startupPlayed = useRef(false);

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('IVR demo'),
                href: ivrIndex(),
            },
        ],
    });

    const stopAudio = useCallback(() => {
        queueTokenRef.current += 1;

        if (audioRef.current) {
            audioRef.current.onended = null;
            audioRef.current.onerror = null;
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
        }

        setPlaying(false);
    }, []);

    const playUrls = useCallback(async (urls: string[]) => {
        const token = ++queueTokenRef.current;
        setPlaying(true);

        for (const url of urls) {
            if (!url || token !== queueTokenRef.current) {
                return;
            }

            const audio = new Audio(url);
            audioRef.current = audio;

            try {
                await new Promise<void>((resolve, reject) => {
                    audio.onended = () => resolve();
                    audio.onerror = () =>
                        reject(new Error('Audio playback failed'));
                    void audio.play().catch(reject);
                });
            } catch {
                break;
            }
        }

        if (token === queueTokenRef.current) {
            audioRef.current = null;
            setPlaying(false);
            setActiveKey(null);
        }
    }, []);

    const speakText = useCallback(
        async (text: string) => {
            if (!addisConfigured) {
                return;
            }

            const response = await fetch(ivrSpeak.url(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': xsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ text }),
            });

            const payload = (await response.json()) as {
                audioUrl?: string | null;
                audioBase64?: string | null;
            };

            const source =
                payload.audioUrl ||
                (payload.audioBase64
                    ? `data:audio/mpeg;base64,${payload.audioBase64}`
                    : null);

            if (response.ok && source) {
                await playUrls([source]);
            }
        },
        [addisConfigured, playUrls],
    );

    const handleSelect = useCallback(
        (key: string) => {
            const option = menuOptions.find((item) => item.key === key);

            if (!option) {
                return;
            }

            stopAudio();
            setActiveKey(key);

            if (key === '5') {
                void playUrls(startupQueue);

                return;
            }

            const crop = option.crop as Crop | null;
            const script = crop ? cropScripts[crop] : null;

            if (script) {
                void speakText(script);
            }
        },
        [cropScripts, menuOptions, playUrls, speakText, startupQueue, stopAudio],
    );

    useEffect(() => {
        if (startupPlayed.current) {
            return;
        }

        startupPlayed.current = true;

        if (startupQueue.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- start the IVR greeting once after mount
            void playUrls(startupQueue);
        }
    }, [playUrls, startupQueue]);

    useEffect(() => stopAudio, [stopAudio]);

    return (
        <>
            <Head title={t('IVR demo')} />
            <div className="flex min-h-[calc(100vh-8rem)] flex-1 items-center justify-center p-4">
                <IvrKeypad
                    options={menuOptions}
                    activeKey={activeKey}
                    disabled={playing}
                    onSelect={handleSelect}
                />
            </div>
        </>
    );
}
