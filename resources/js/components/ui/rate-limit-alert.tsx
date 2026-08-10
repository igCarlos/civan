import {
    AlertTriangle,
    Clock3,
    X,
} from 'lucide-react';

import {
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';

import {
    Button,
} from '@/components/ui/button';

interface RateLimitEventDetail {
    id: string;
    retryAfter: number;
    title: string;
    message: string;
}

interface RateLimitState {
    id: string;
    retryAfter: number;
    title: string;
    message: string;
}

export default function RateLimitAlert() {
    const [
        alert,
        setAlert,
    ] = useState<RateLimitState | null>(
        null,
    );

    const timeoutRef =
        useRef<number | null>(
            null,
        );

    useEffect(() => {
        const handleRateLimit =
            (
                nativeEvent:
                    Event,
            ) => {
                const event =
                    nativeEvent as
                        CustomEvent<RateLimitEventDetail>;

                if (
                    timeoutRef.current !==
                    null
                ) {
                    window.clearTimeout(
                        timeoutRef.current,
                    );
                }

                setAlert({
                    id:
                        event.detail.id,

                    retryAfter:
                        event.detail
                            .retryAfter,

                    title:
                        event.detail
                            .title,

                    message:
                        event.detail
                            .message,
                });

                timeoutRef.current =
                    window.setTimeout(
                        () => {
                            setAlert(
                                null,
                            );

                            timeoutRef.current =
                                null;
                        },
                        10_000,
                    );
            };

        window.addEventListener(
            'civan:rate-limit',
            handleRateLimit,
        );

        return () => {
            window.removeEventListener(
                'civan:rate-limit',
                handleRateLimit,
            );

            if (
                timeoutRef.current !==
                null
            ) {
                window.clearTimeout(
                    timeoutRef.current,
                );
            }
        };
    }, []);

    if (!alert) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed inset-x-3 top-3 z-[2147483647] flex justify-end sm:inset-x-auto sm:right-4 sm:top-4 sm:w-full sm:max-w-md">
            <Alert
                key={
                    alert.id
                }
                variant="destructive"
                className="pointer-events-auto relative w-full overflow-hidden rounded-2xl border-destructive/25 bg-background/95 pr-12 shadow-2xl ring-1 ring-destructive/10 backdrop-blur-xl"
            >
                <AlertTriangle className="size-4" />

                <AlertTitle className="font-semibold">
                    {
                        alert.title
                    }
                </AlertTitle>

                <AlertDescription className="mt-1.5">
                    <div className="flex items-start gap-2">
                        <Clock3 className="mt-0.5 size-3.5 shrink-0" />

                        <span className="leading-5">
                            {
                                alert.message
                            }
                        </span>
                    </div>
                </AlertDescription>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        if (
                            timeoutRef.current !==
                            null
                        ) {
                            window.clearTimeout(
                                timeoutRef.current,
                            );

                            timeoutRef.current =
                                null;
                        }

                        setAlert(
                            null,
                        );
                    }}
                    className="absolute right-2 top-2 size-8 rounded-lg text-muted-foreground hover:text-foreground"
                    aria-label="Cerrar alerta"
                >
                    <X className="size-4" />
                </Button>

                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-destructive/15">
                    <div className="h-full w-full bg-destructive/70" />
                </div>
            </Alert>
        </div>
    );
}
