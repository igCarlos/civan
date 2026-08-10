import {
    Head,
    router,
    usePage,
} from '@inertiajs/react';

import {
    AlertCircle,
    CheckCircle2,
    Clock3,
    Laptop,
    Loader2,
    LogOut,
    MapPin,
    Monitor,
    RefreshCw,
    ShieldCheck,
    Smartphone,
    Tablet,
} from 'lucide-react';

import {
    useMemo,
    useState,
} from 'react';

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';

import {
    Badge,
} from '@/components/ui/badge';

import {
    Button,
} from '@/components/ui/button';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

import {
    type BreadcrumbItem,
} from '@/types';

interface SessionItem {
    id: string;
    ip_address: string | null;
    browser: string;
    platform: string;
    device:
        | 'desktop'
        | 'mobile'
        | 'tablet'
        | 'unknown';
    user_agent: string | null;
    last_activity: number;
    last_activity_iso: string;
    is_current: boolean;
}

interface PageProps {
    sessions: SessionItem[];
    sessionLifetimeMinutes: number;

    status?: string | null;

    errors?: {
        session?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuración',
        href: '/settings',
    },
    {
        title: 'Sesiones y dispositivos',
        href: '/settings/sessions',
    },
];

function relativeTime(
    timestamp:
        number,
): string {
    const now =
        Math.floor(
            Date.now() /
                1000,
        );

    const seconds =
        Math.max(
            0,
            now -
                timestamp,
        );

    if (
        seconds <
        60
    ) {
        return 'Ahora';
    }

    const minutes =
        Math.floor(
            seconds /
                60,
        );

    if (
        minutes <
        60
    ) {
        return `Hace ${minutes} ${
            minutes === 1
                ? 'minuto'
                : 'minutos'
        }`;
    }

    const hours =
        Math.floor(
            minutes /
                60,
        );

    if (
        hours <
        24
    ) {
        return `Hace ${hours} ${
            hours === 1
                ? 'hora'
                : 'horas'
        }`;
    }

    const days =
        Math.floor(
            hours /
                24,
        );

    return `Hace ${days} ${
        days === 1
            ? 'día'
            : 'días'
    }`;
}

function DeviceIcon({
    device,
}: {
    device:
        SessionItem['device'];
}) {
    if (
        device ===
        'mobile'
    ) {
        return (
            <Smartphone className="size-5" />
        );
    }

    if (
        device ===
        'tablet'
    ) {
        return (
            <Tablet className="size-5" />
        );
    }

    if (
        device ===
        'desktop'
    ) {
        return (
            <Monitor className="size-5" />
        );
    }

    return (
        <Laptop className="size-5" />
    );
}

export default function Sessions() {
    const {
        sessions,
        sessionLifetimeMinutes,
        status,
        errors,
    } =
        usePage<PageProps>()
            .props;

    const [
        selectedSession,
        setSelectedSession,
    ] =
        useState<SessionItem | null>(
            null,
        );

    const [
        closeOthersOpen,
        setCloseOthersOpen,
    ] =
        useState(false);

    const [
        processingSessionId,
        setProcessingSessionId,
    ] =
        useState<string | null>(
            null,
        );

    const [
        processingOthers,
        setProcessingOthers,
    ] =
        useState(false);

    const currentSession =
        useMemo(
            () =>
                sessions.find(
                    (session) =>
                        session.is_current,
                ) ??
                null,
            [
                sessions,
            ],
        );

    const otherSessions =
        useMemo(
            () =>
                sessions.filter(
                    (session) =>
                        !session.is_current,
                ),
            [
                sessions,
            ],
        );

    const closeSession =
        () => {
            if (
                !selectedSession
            ) {
                return;
            }

            setProcessingSessionId(
                selectedSession.id,
            );

            router.delete(
                `/settings/sessions/${encodeURIComponent(
                    selectedSession.id,
                )}`,
                {
                    preserveScroll:
                        true,

                    onSuccess:
                        () => {
                            setSelectedSession(
                                null,
                            );
                        },

                    onFinish:
                        () => {
                            setProcessingSessionId(
                                null,
                            );
                        },
                },
            );
        };

    const closeOtherSessions =
        () => {
            setProcessingOthers(
                true,
            );

            router.delete(
                '/settings/sessions/others',
                {
                    preserveScroll:
                        true,

                    onSuccess:
                        () => {
                            setCloseOthersOpen(
                                false,
                            );
                        },

                    onFinish:
                        () => {
                            setProcessingOthers(
                                false,
                            );
                        },
                },
            );
        };

    return (
        <AppLayout
            breadcrumbs={
                breadcrumbs
            }
        >
            <Head title="Sesiones y dispositivos" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="relative overflow-hidden rounded-3xl border bg-card">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

                        <div className="relative flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border bg-background/80 shadow-sm">
                                    <ShieldCheck className="size-6 text-primary" />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        Sesiones y dispositivos
                                    </h1>

                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                        Revisa dónde está abierta tu cuenta y cierra cualquier sesión que no reconozcas.
                                    </p>
                                </div>
                            </div>

                            <Badge
                                variant="secondary"
                                className="w-fit rounded-full px-3 py-1.5"
                            >
                                {
                                    sessions.length
                                }{' '}
                                {sessions.length ===
                                1
                                    ? 'sesión activa'
                                    : 'sesiones activas'}
                            </Badge>
                        </div>
                    </div>

                    {status && (
                        <Alert className="rounded-2xl border-emerald-500/20 bg-emerald-500/5">
                            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />

                            <AlertTitle>
                                Operación completada
                            </AlertTitle>

                            <AlertDescription>
                                {status}
                            </AlertDescription>
                        </Alert>
                    )}

                    {errors?.session && (
                        <Alert
                            variant="destructive"
                            className="rounded-2xl"
                        >
                            <AlertCircle className="size-4" />

                            <AlertTitle>
                                No se pudo cerrar la sesión
                            </AlertTitle>

                            <AlertDescription>
                                {
                                    errors.session
                                }
                            </AlertDescription>
                        </Alert>
                    )}

                    {currentSession && (
                        <Card className="rounded-3xl border-primary/20">
                            <CardHeader>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <DeviceIcon
                                                device={
                                                    currentSession.device
                                                }
                                            />
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <CardTitle className="text-base">
                                                    {
                                                        currentSession.browser
                                                    }
                                                </CardTitle>

                                                <Badge className="rounded-full">
                                                    Esta sesión
                                                </Badge>
                                            </div>

                                            <CardDescription className="mt-1">
                                                {
                                                    currentSession.platform
                                                }
                                            </CardDescription>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock3 className="size-4" />
                                        {
                                            relativeTime(
                                                currentSession.last_activity,
                                            )
                                        }
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl border bg-muted/20 p-4">
                                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            <MapPin className="size-3.5" />
                                            Dirección IP
                                        </div>

                                        <p className="mt-2 font-mono text-sm">
                                            {currentSession.ip_address ??
                                                'No disponible'}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border bg-muted/20 p-4">
                                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            <RefreshCw className="size-3.5" />
                                            Última actividad
                                        </div>

                                        <p className="mt-2 text-sm font-medium">
                                            {
                                                relativeTime(
                                                    currentSession.last_activity,
                                                )
                                            }
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="rounded-3xl">
                        <CardHeader>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle>
                                        Otras sesiones
                                    </CardTitle>

                                    <CardDescription className="mt-1">
                                        Dispositivos donde tu cuenta continúa autenticada.
                                    </CardDescription>
                                </div>

                                {otherSessions.length >
                                    0 && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() =>
                                            setCloseOthersOpen(
                                                true,
                                            )
                                        }
                                        className="w-fit rounded-xl"
                                    >
                                        <LogOut className="mr-2 size-4" />
                                        Cerrar todas las demás
                                    </Button>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent>
                            {otherSessions.length ===
                            0 ? (
                                <div className="rounded-2xl border border-dashed px-6 py-10 text-center">
                                    <ShieldCheck className="mx-auto size-7 text-primary" />

                                    <p className="mt-3 font-medium">
                                        No hay otras sesiones activas
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Actualmente tu cuenta solo está abierta en este dispositivo.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {otherSessions.map(
                                        (
                                            session,
                                        ) => (
                                            <div
                                                key={
                                                    session.id
                                                }
                                                className="flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div className="flex min-w-0 items-start gap-3">
                                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                                        <DeviceIcon
                                                            device={
                                                                session.device
                                                            }
                                                        />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="font-medium">
                                                            {
                                                                session.browser
                                                            }
                                                        </p>

                                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                                            {
                                                                session.platform
                                                            }
                                                            {' · '}
                                                            {session.ip_address ??
                                                                'IP no disponible'}
                                                        </p>

                                                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <Clock3 className="size-3.5" />
                                                            {
                                                                relativeTime(
                                                                    session.last_activity,
                                                                )
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setSelectedSession(
                                                            session,
                                                        )
                                                    }
                                                    className="rounded-xl"
                                                >
                                                    <LogOut className="mr-2 size-4" />
                                                    Cerrar sesión
                                                </Button>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}

                            <p className="mt-5 text-xs leading-5 text-muted-foreground">
                                Se muestran únicamente sesiones que todavía están dentro del tiempo de vida configurado en Laravel ({sessionLifetimeMinutes} minutos).
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>

            <Dialog
                open={
                    selectedSession !==
                    null
                }
                onOpenChange={(
                    open,
                ) => {
                    if (
                        !open &&
                        !processingSessionId
                    ) {
                        setSelectedSession(
                            null,
                        );
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            ¿Cerrar esta sesión?
                        </DialogTitle>

                        <DialogDescription>
                            El dispositivo tendrá que iniciar sesión nuevamente para acceder a CIVAN.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSession && (
                        <div className="rounded-2xl border bg-muted/20 p-4">
                            <p className="font-medium">
                                {
                                    selectedSession.browser
                                }
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {
                                    selectedSession.platform
                                }
                                {' · '}
                                {selectedSession.ip_address ??
                                    'IP no disponible'}
                            </p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={
                                processingSessionId !==
                                null
                            }
                            onClick={() =>
                                setSelectedSession(
                                    null,
                                )
                            }
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="button"
                            variant="destructive"
                            disabled={
                                processingSessionId !==
                                null
                            }
                            onClick={
                                closeSession
                            }
                        >
                            {processingSessionId ? (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            ) : (
                                <LogOut className="mr-2 size-4" />
                            )}

                            Cerrar sesión
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={
                    closeOthersOpen
                }
                onOpenChange={(
                    open,
                ) => {
                    if (
                        !processingOthers
                    ) {
                        setCloseOthersOpen(
                            open,
                        );
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            ¿Cerrar todas las demás sesiones?
                        </DialogTitle>

                        <DialogDescription>
                            Se cerrarán todas las sesiones de tu cuenta excepto la que estás utilizando ahora.
                        </DialogDescription>
                    </DialogHeader>

                    <Alert
                        variant="destructive"
                        className="rounded-2xl"
                    >
                        <AlertCircle className="size-4" />

                        <AlertTitle>
                            {otherSessions.length}{' '}
                            {otherSessions.length ===
                            1
                                ? 'sesión será cerrada'
                                : 'sesiones serán cerradas'}
                        </AlertTitle>

                        <AlertDescription>
                            Los otros dispositivos tendrán que autenticarse nuevamente.
                        </AlertDescription>
                    </Alert>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={
                                processingOthers
                            }
                            onClick={() =>
                                setCloseOthersOpen(
                                    false,
                                )
                            }
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="button"
                            variant="destructive"
                            disabled={
                                processingOthers
                            }
                            onClick={
                                closeOtherSessions
                            }
                        >
                            {processingOthers ? (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            ) : (
                                <LogOut className="mr-2 size-4" />
                            )}

                            Cerrar las demás
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
