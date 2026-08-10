import { Head, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Check,
    CheckCircle2,
    Clipboard,
    Download,
    Eye,
    EyeOff,
    KeyRound,
    Loader2,
    LockKeyhole,
    QrCode,
    RefreshCw,
    Shield,
    ShieldCheck,
    ShieldOff,
    Smartphone,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import SettingsLayout from '@/layouts/settings/layout';

interface AuthUser {
    id: number;
    name: string;
    email: string;
    two_factor_confirmed_at?: string | null;
}

interface PageProps {
    auth: {
        user: AuthUser;
    };
}

interface QrCodeResponse {
    svg?: string;
    url?: string;
}

interface SecretKeyResponse {
    secretKey?: string;
}

interface JsonValidationResponse {
    message?: string;
    errors?: Record<string, string[]>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuración',
        href: '/dashboard/settings',
    },
    {
        title: 'Seguridad',
        href: '/dashboard/settings/2fa',
    },
];

function getXsrfToken(): string | null {
    const cookie = document.cookie
        .split('; ')
        .find((item) => item.startsWith('XSRF-TOKEN='));

    if (!cookie) {
        return null;
    }

    return decodeURIComponent(cookie.split('=').slice(1).join('='));
}

async function fortifyRequest<T = unknown>(
    url: string,
    options: RequestInit = {},
): Promise<T> {
    const headers = new Headers(options.headers);

    headers.set('Accept', 'application/json');
    headers.set('X-Requested-With', 'XMLHttpRequest');

    const method = (options.method ?? 'GET').toUpperCase();

    if (!['GET', 'HEAD'].includes(method)) {
        const token = getXsrfToken();

        if (token) {
            headers.set('X-XSRF-TOKEN', token);
        }
    }

    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'same-origin',
    });

    if (!response.ok) {
        let payload: JsonValidationResponse | null = null;

        try {
            payload = (await response.json()) as JsonValidationResponse;
        } catch {
            payload = null;
        }

        const validationMessage =
            payload?.errors?.code?.[0] ??
            payload?.message ??
            `La solicitud no pudo completarse (${response.status}).`;

        throw new Error(validationMessage);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const contentType = response.headers.get('content-type') ?? '';

    if (!contentType.includes('application/json')) {
        return undefined as T;
    }

    return (await response.json()) as T;
}

export default function TwoFactorAuthentication() {
    const { auth } = usePage<PageProps>().props;

    const initiallyEnabled = Boolean(auth.user.two_factor_confirmed_at);

    const [enabled, setEnabled] = useState(initiallyEnabled);
    const [setupPending, setSetupPending] = useState(false);

    const [qrSvg, setQrSvg] = useState<string | null>(null);
    const [secretKey, setSecretKey] = useState<string | null>(null);
    const [code, setCode] = useState('');

    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);

    const [loadingInitial, setLoadingInitial] = useState(true);
    const [enabling, setEnabling] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [disabling, setDisabling] = useState(false);
    const [loadingRecoveryCodes, setLoadingRecoveryCodes] = useState(false);
    const [regeneratingCodes, setRegeneratingCodes] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [disableDialogOpen, setDisableDialogOpen] = useState(false);
    const [copiedSecret, setCopiedSecret] = useState(false);
    const [copiedCodes, setCopiedCodes] = useState(false);

    const statusLabel = useMemo(() => {
        if (enabled) {
            return 'Activado';
        }

        if (setupPending) {
            return 'Pendiente de confirmar';
        }

        return 'Desactivado';
    }, [enabled, setupPending]);

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    const loadSetupData = useCallback(async (): Promise<boolean> => {
        try {
            const [qr, secret] = await Promise.all([
                fortifyRequest<QrCodeResponse>('/user/two-factor-qr-code'),
                fortifyRequest<SecretKeyResponse>('/user/two-factor-secret-key'),
            ]);

            if (!qr.svg) {
                setQrSvg(null);
                setSecretKey(null);
                return false;
            }

            setQrSvg(qr.svg);
            setSecretKey(secret.secretKey ?? null);

            return true;
        } catch {
            setQrSvg(null);
            setSecretKey(null);
            return false;
        }
    }, []);

    const loadRecoveryCodes = useCallback(async () => {
        setLoadingRecoveryCodes(true);
        setError(null);

        try {
            const codes = await fortifyRequest<string[]>(
                '/user/two-factor-recovery-codes',
            );

            setRecoveryCodes(Array.isArray(codes) ? codes : []);
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'No se pudieron cargar los códigos de recuperación.',
            );
        } finally {
            setLoadingRecoveryCodes(false);
        }
    }, []);

    useEffect(() => {
        let active = true;

        const initialize = async () => {
            setLoadingInitial(true);

            const hasSetup = await loadSetupData();

            if (!active) {
                return;
            }

            if (!initiallyEnabled && hasSetup) {
                setSetupPending(true);
            }

            setLoadingInitial(false);
        };

        void initialize();

        return () => {
            active = false;
        };
    }, [initiallyEnabled, loadSetupData]);

    const enableTwoFactor = async () => {
        clearMessages();
        setEnabling(true);

        try {
            await fortifyRequest('/user/two-factor-authentication', {
                method: 'POST',
                body: JSON.stringify({}),
            });

            const hasSetup = await loadSetupData();

            if (!hasSetup) {
                throw new Error(
                    'Fortify activó la configuración, pero no fue posible obtener el código QR.',
                );
            }

            setSetupPending(true);
            setEnabled(false);
            setCode('');
            setSuccess(
                'Configuración iniciada. Escanea el código QR y escribe el código de 6 dígitos.',
            );
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'No se pudo iniciar la configuración de 2FA.',
            );
        } finally {
            setEnabling(false);
        }
    };

    const confirmTwoFactor = async () => {
        clearMessages();

        const normalizedCode = code.replace(/\s+/g, '');

        if (!/^\d{6}$/.test(normalizedCode)) {
            setError('Escribe el código de 6 dígitos generado por tu aplicación.');
            return;
        }

        setConfirming(true);

        try {
            await fortifyRequest('/user/confirmed-two-factor-authentication', {
                method: 'POST',
                body: JSON.stringify({
                    code: normalizedCode,
                }),
            });

            setEnabled(true);
            setSetupPending(false);
            setCode('');
            setSuccess('La autenticación en dos pasos se activó correctamente.');

            await loadRecoveryCodes();
            setShowRecoveryCodes(true);
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'El código proporcionado no es válido.',
            );
        } finally {
            setConfirming(false);
        }
    };

    const disableTwoFactor = async () => {
        clearMessages();
        setDisabling(true);

        try {
            await fortifyRequest('/user/two-factor-authentication', {
                method: 'DELETE',
            });

            setEnabled(false);
            setSetupPending(false);
            setQrSvg(null);
            setSecretKey(null);
            setRecoveryCodes([]);
            setShowRecoveryCodes(false);
            setCode('');
            setDisableDialogOpen(false);
            setSuccess('La autenticación en dos pasos fue desactivada.');
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'No se pudo desactivar la autenticación en dos pasos.',
            );
        } finally {
            setDisabling(false);
        }
    };

    const regenerateRecoveryCodes = async () => {
        clearMessages();
        setRegeneratingCodes(true);

        try {
            await fortifyRequest('/user/two-factor-recovery-codes', {
                method: 'POST',
                body: JSON.stringify({}),
            });

            await loadRecoveryCodes();
            setShowRecoveryCodes(true);
            setSuccess(
                'Se generó un nuevo conjunto de códigos de recuperación. Los anteriores dejaron de ser válidos.',
            );
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'No se pudieron regenerar los códigos de recuperación.',
            );
        } finally {
            setRegeneratingCodes(false);
        }
    };

    const copySecret = async () => {
        if (!secretKey) {
            return;
        }

        await navigator.clipboard.writeText(secretKey);
        setCopiedSecret(true);

        window.setTimeout(() => {
            setCopiedSecret(false);
        }, 1800);
    };

    const copyRecoveryCodes = async () => {
        if (!recoveryCodes.length) {
            return;
        }

        await navigator.clipboard.writeText(recoveryCodes.join('\n'));
        setCopiedCodes(true);

        window.setTimeout(() => {
            setCopiedCodes(false);
        }, 1800);
    };

    const downloadRecoveryCodes = () => {
        if (!recoveryCodes.length) {
            return;
        }

        const content = [
            'CIVAN - Códigos de recuperación 2FA',
            '',
            ...recoveryCodes,
            '',
            'Guárdalos en un lugar seguro. Cada código es de un solo uso.',
        ].join('\n');

        const blob = new Blob([content], {
            type: 'text/plain;charset=utf-8',
        });

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');

        anchor.href = url;
        anchor.download = 'civan-2fa-recovery-codes.txt';

        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();

        URL.revokeObjectURL(url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Autenticación en dos pasos" />

            <SettingsLayout>
                <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 md:p-6">
                <div className="relative overflow-hidden rounded-3xl border bg-card">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

                    <div className="relative flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
                        <div className="flex items-start gap-4">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border bg-background/80 shadow-sm">
                                <ShieldCheck className="size-6 text-primary" />
                            </div>

                            <div>
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                                        Autenticación en dos pasos
                                    </h1>

                                    <Badge
                                        variant={enabled ? 'default' : 'secondary'}
                                        className="rounded-full"
                                    >
                                        {enabled ? (
                                            <CheckCircle2 className="mr-1 size-3.5" />
                                        ) : setupPending ? (
                                            <QrCode className="mr-1 size-3.5" />
                                        ) : (
                                            <ShieldOff className="mr-1 size-3.5" />
                                        )}

                                        {statusLabel}
                                    </Badge>
                                </div>

                                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Protege tu cuenta de CIVAN con un código temporal
                                    generado por una aplicación autenticadora compatible con TOTP.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-2xl border bg-background/70 px-4 py-3 backdrop-blur">
                            <Shield className="size-5 text-primary" />

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Estado de seguridad
                                </p>

                                <p className="text-sm font-semibold">
                                    {enabled
                                        ? 'Protección adicional activa'
                                        : setupPending
                                          ? 'Configuración incompleta'
                                          : 'Protección adicional inactiva'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive" className="rounded-2xl">
                        <AlertCircle className="size-4" />
                        <AlertTitle>No se pudo completar la operación</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="rounded-2xl border-emerald-500/20 bg-emerald-500/5">
                        <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                        <AlertTitle>Operación completada</AlertTitle>
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                {loadingInitial ? (
                    <Card className="rounded-3xl">
                        <CardContent className="flex min-h-72 items-center justify-center">
                            <div className="flex flex-col items-center gap-3 text-center">
                                <Loader2 className="size-7 animate-spin text-primary" />
                                <div>
                                    <p className="font-medium">
                                        Comprobando configuración de seguridad
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Consultando el estado de la autenticación en dos pasos.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : !enabled && !setupPending ? (
                    <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
                        <Card className="rounded-3xl">
                            <CardHeader className="pb-4">
                                <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-primary/10">
                                    <LockKeyhole className="size-5 text-primary" />
                                </div>

                                <CardTitle>Activa una segunda capa de seguridad</CardTitle>
                                <CardDescription className="max-w-2xl leading-6">
                                    Además de tu contraseña, CIVAN solicitará un código temporal
                                    cuando inicies sesión.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-2xl border bg-muted/20 p-4">
                                        <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-background">
                                            <Smartphone className="size-4 text-primary" />
                                        </div>
                                        <p className="text-sm font-medium">1. Escanea</p>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            Usa Google Authenticator, Microsoft Authenticator,
                                            Authy u otra app TOTP.
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border bg-muted/20 p-4">
                                        <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-background">
                                            <KeyRound className="size-4 text-primary" />
                                        </div>
                                        <p className="text-sm font-medium">2. Verifica</p>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            Introduce el código de 6 dígitos generado por tu
                                            aplicación.
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border bg-muted/20 p-4">
                                        <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-background">
                                            <ShieldCheck className="size-4 text-primary" />
                                        </div>
                                        <p className="text-sm font-medium">3. Protegido</p>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            Guarda tus códigos de recuperación en un lugar seguro.
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    onClick={enableTwoFactor}
                                    disabled={enabling}
                                    className="rounded-xl"
                                >
                                    {enabling ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <ShieldCheck className="mr-2 size-4" />
                                    )}

                                    Activar autenticación en dos pasos
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    ¿Por qué activar 2FA?
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4 text-sm text-muted-foreground">
                                <div className="flex gap-3">
                                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                    <p>
                                        Reduce el riesgo de acceso incluso si tu contraseña
                                        llega a ser conocida por otra persona.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                    <p>
                                        Los códigos TOTP se renuevan automáticamente y tienen
                                        una duración limitada.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                    <p>
                                        Los códigos de recuperación permiten acceder si pierdes
                                        tu dispositivo autenticador.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : !enabled && setupPending ? (
                    <div className="grid gap-6 xl:grid-cols-[1fr_.9fr]">
                        <Card className="rounded-3xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10">
                                        <QrCode className="size-5 text-primary" />
                                    </div>

                                    <div>
                                        <CardTitle>Escanea el código QR</CardTitle>
                                        <CardDescription>
                                            Paso 1 de 2 · Vincula tu aplicación autenticadora.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <div className="flex justify-center">
                                    <div className="rounded-3xl border bg-white p-5 shadow-sm">
                                        {qrSvg ? (
                                            <div
                                                className="size-52 [&>svg]:size-full"
                                                dangerouslySetInnerHTML={{
                                                    __html: qrSvg,
                                                }}
                                            />
                                        ) : (
                                            <div className="flex size-52 items-center justify-center">
                                                <Loader2 className="size-7 animate-spin text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {secretKey && (
                                    <div className="space-y-2">
                                        <Label>Clave de configuración manual</Label>

                                        <div className="flex gap-2">
                                            <Input
                                                value={secretKey}
                                                readOnly
                                                className="h-11 rounded-xl font-mono text-xs"
                                            />

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={copySecret}
                                                className="size-11 shrink-0 rounded-xl"
                                            >
                                                {copiedSecret ? (
                                                    <Check className="size-4" />
                                                ) : (
                                                    <Clipboard className="size-4" />
                                                )}
                                            </Button>
                                        </div>

                                        <p className="text-xs leading-5 text-muted-foreground">
                                            Úsala solamente si no puedes escanear el código QR.
                                            No compartas esta clave.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10">
                                        <KeyRound className="size-5 text-primary" />
                                    </div>

                                    <div>
                                        <CardTitle>Confirma el código</CardTitle>
                                        <CardDescription>
                                            Paso 2 de 2 · Comprueba que la aplicación quedó
                                            vinculada correctamente.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="two-factor-code">
                                        Código de autenticación
                                    </Label>

                                    <Input
                                        id="two-factor-code"
                                        value={code}
                                        onChange={(event) =>
                                            setCode(
                                                event.target.value
                                                    .replace(/\D/g, '')
                                                    .slice(0, 6),
                                            )
                                        }
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                void confirmTwoFactor();
                                            }
                                        }}
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        placeholder="000000"
                                        className="h-14 rounded-2xl text-center font-mono text-2xl tracking-[0.45em]"
                                    />
                                </div>

                                <Button
                                    type="button"
                                    onClick={confirmTwoFactor}
                                    disabled={confirming || code.length !== 6}
                                    className="h-11 w-full rounded-xl"
                                >
                                    {confirming ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="mr-2 size-4" />
                                    )}

                                    Confirmar y activar
                                </Button>

                                <Separator />

                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setDisableDialogOpen(true)}
                                    className="w-full rounded-xl text-muted-foreground"
                                >
                                    <X className="mr-2 size-4" />
                                    Cancelar configuración
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="grid gap-6 xl:grid-cols-[1fr_.9fr]">
                        <Card className="rounded-3xl border-emerald-500/20">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10">
                                            <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>

                                        <div>
                                            <CardTitle>2FA está activo</CardTitle>
                                            <CardDescription>
                                                Tu cuenta cuenta con una capa adicional de
                                                protección.
                                            </CardDescription>
                                        </div>
                                    </div>

                                    <Badge className="rounded-full bg-emerald-600 hover:bg-emerald-600">
                                        <CheckCircle2 className="mr-1 size-3.5" />
                                        Protegido
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                <div className="rounded-2xl border bg-muted/20 p-4">
                                    <p className="text-sm font-medium">
                                        Al iniciar sesión
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                        Después de validar tus credenciales, CIVAN solicitará
                                        el código temporal de tu aplicación autenticadora.
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => setDisableDialogOpen(true)}
                                    className="rounded-xl"
                                >
                                    <ShieldOff className="mr-2 size-4" />
                                    Desactivar 2FA
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl">
                            <CardHeader>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <CardTitle>Códigos de recuperación</CardTitle>
                                        <CardDescription className="mt-1">
                                            Úsalos si pierdes acceso a tu aplicación
                                            autenticadora.
                                        </CardDescription>
                                    </div>

                                    <KeyRound className="size-5 text-primary" />
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                {!showRecoveryCodes ? (
                                    <div className="rounded-2xl border border-dashed p-6 text-center">
                                        <EyeOff className="mx-auto size-6 text-muted-foreground" />

                                        <p className="mt-3 text-sm font-medium">
                                            Los códigos están ocultos
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            Muéstralos únicamente cuando estés en un lugar
                                            privado.
                                        </p>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={async () => {
                                                await loadRecoveryCodes();
                                                setShowRecoveryCodes(true);
                                            }}
                                            disabled={loadingRecoveryCodes}
                                            className="mt-4 rounded-xl"
                                        >
                                            {loadingRecoveryCodes ? (
                                                <Loader2 className="mr-2 size-4 animate-spin" />
                                            ) : (
                                                <Eye className="mr-2 size-4" />
                                            )}

                                            Mostrar códigos
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                            {recoveryCodes.map((recoveryCode) => (
                                                <div
                                                    key={recoveryCode}
                                                    className="rounded-xl border bg-muted/30 px-3 py-2.5 font-mono text-xs"
                                                >
                                                    {recoveryCode}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={copyRecoveryCodes}
                                                disabled={!recoveryCodes.length}
                                                className="rounded-xl"
                                            >
                                                {copiedCodes ? (
                                                    <Check className="mr-2 size-4" />
                                                ) : (
                                                    <Clipboard className="mr-2 size-4" />
                                                )}

                                                {copiedCodes ? 'Copiados' : 'Copiar'}
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={downloadRecoveryCodes}
                                                disabled={!recoveryCodes.length}
                                                className="rounded-xl"
                                            >
                                                <Download className="mr-2 size-4" />
                                                Descargar
                                            </Button>
                                        </div>
                                    </>
                                )}

                                <Separator />

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={regenerateRecoveryCodes}
                                    disabled={regeneratingCodes}
                                    className="w-full rounded-xl"
                                >
                                    {regeneratingCodes ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="mr-2 size-4" />
                                    )}

                                    Regenerar códigos
                                </Button>

                                <p className="text-xs leading-5 text-muted-foreground">
                                    Al regenerarlos, los códigos de recuperación anteriores
                                    dejarán de ser válidos.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}
                </div>

                <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {enabled
                                    ? '¿Desactivar autenticación en dos pasos?'
                                    : '¿Cancelar configuración de 2FA?'}
                            </DialogTitle>

                            <DialogDescription>
                                {enabled
                                    ? 'Tu cuenta dejará de solicitar un código temporal al iniciar sesión.'
                                    : 'Se eliminará la configuración pendiente y podrás iniciar el proceso nuevamente.'}
                            </DialogDescription>
                        </DialogHeader>

                        <Alert variant="destructive">
                            <AlertCircle className="size-4" />
                            <AlertTitle>
                                {enabled ? 'Menor protección' : 'Configuración cancelada'}
                            </AlertTitle>
                            <AlertDescription>
                                {enabled
                                    ? 'Después de desactivarlo, tus códigos de recuperación actuales también dejarán de ser válidos.'
                                    : 'El código QR y la clave secreta actuales dejarán de ser válidos.'}
                            </AlertDescription>
                        </Alert>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDisableDialogOpen(false)}
                                disabled={disabling}
                            >
                                Volver
                            </Button>

                            <Button
                                type="button"
                                variant="destructive"
                                onClick={disableTwoFactor}
                                disabled={disabling}
                            >
                                {disabling ? (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                ) : (
                                    <ShieldOff className="mr-2 size-4" />
                                )}

                                {enabled ? 'Desactivar 2FA' : 'Cancelar configuración'}
                            </Button>
                        </DialogFooter>

                    </DialogContent>
                </Dialog>
            </SettingsLayout>

            

        </AppLayout>
    );
}
