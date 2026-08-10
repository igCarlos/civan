import { Head, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    KeyRound,
    Loader2,
    LockKeyhole,
    ShieldCheck,
    Smartphone,
} from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PageProps = {
    system?: {
        panel_name?: string;
    };
};

type ChallengeForm = {
    code: string;
    recovery_code: string;
};

export default function TwoFactorChallenge() {
    const { system } = usePage<PageProps>().props;

    const appName =
        system?.panel_name ||
        'CIVAN Panel';

    const [
        recoveryMode,
        setRecoveryMode,
    ] = useState(false);

    const codeInputRef =
        useRef<HTMLInputElement | null>(
            null,
        );

    const recoveryInputRef =
        useRef<HTMLInputElement | null>(
            null,
        );

    const {
        data,
        setData,
        post,
        processing,
        errors,
        clearErrors,
        reset,
    } = useForm<ChallengeForm>({
        code: '',
        recovery_code: '',
    });

    useEffect(() => {
        if (recoveryMode) {
            recoveryInputRef.current?.focus();
            return;
        }

        codeInputRef.current?.focus();
    }, [recoveryMode]);

    const submit = (
        event:
            FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        clearErrors();

        post(
            '/two-factor-challenge',
            {
                preserveScroll: true,

                onFinish: () => {
                    if (!recoveryMode) {
                        setData(
                            'code',
                            '',
                        );
                    }
                },
            },
        );
    };

    const toggleMode = () => {
        clearErrors();
        reset();

        setRecoveryMode(
            (current) =>
                !current,
        );
    };

    const fieldError =
        recoveryMode
            ? errors.recovery_code
            : errors.code;

    return (
        <>
            <Head title="Verificación en dos pasos" />

            <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-1/2 top-[-14rem] size-[34rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute bottom-[-18rem] right-[-10rem] size-[32rem] rounded-full bg-primary/5 blur-3xl" />
                </div>

                <div className="relative w-full max-w-md">
                    <div className="mb-6 flex flex-col items-center text-center">
                        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border bg-card shadow-sm">
                            <ShieldCheck className="size-7 text-primary" />
                        </div>

                        <p className="text-sm font-semibold tracking-wide text-primary">
                            {appName}
                        </p>
                    </div>

                    <Card className="overflow-hidden rounded-3xl border shadow-xl">
                        <CardHeader className="space-y-4 pb-5 text-center">
                            <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-primary/10">
                                {recoveryMode ? (
                                    <KeyRound className="size-5 text-primary" />
                                ) : (
                                    <Smartphone className="size-5 text-primary" />
                                )}
                            </div>

                            <div className="space-y-2">
                                <CardTitle className="text-2xl">
                                    {recoveryMode
                                        ? 'Código de recuperación'
                                        : 'Verificación en dos pasos'}
                                </CardTitle>

                                <CardDescription className="mx-auto max-w-sm leading-6">
                                    {recoveryMode
                                        ? 'Introduce uno de tus códigos de recuperación guardados para acceder a tu cuenta.'
                                        : 'Introduce el código de 6 dígitos generado por tu aplicación autenticadora.'}
                                </CardDescription>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {fieldError && (
                                <Alert
                                    variant="destructive"
                                    className="rounded-2xl"
                                >
                                    <LockKeyhole className="size-4" />

                                    <AlertTitle>
                                        No pudimos verificar el código
                                    </AlertTitle>

                                    <AlertDescription>
                                        {fieldError}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <form
                                onSubmit={submit}
                                className="space-y-5"
                            >
                                {recoveryMode ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="recovery_code">
                                            Código de recuperación
                                        </Label>

                                        <Input
                                            ref={recoveryInputRef}
                                            id="recovery_code"
                                            name="recovery_code"
                                            type="text"
                                            value={data.recovery_code}
                                            onChange={(event) =>
                                                setData(
                                                    'recovery_code',
                                                    event.target.value,
                                                )
                                            }
                                            autoComplete="one-time-code"
                                            placeholder="xxxx-xxxx-xxxx"
                                            disabled={processing}
                                            className="h-12 rounded-xl font-mono"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label htmlFor="code">
                                            Código de autenticación
                                        </Label>

                                        <Input
                                            ref={codeInputRef}
                                            id="code"
                                            name="code"
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            value={data.code}
                                            onChange={(event) =>
                                                setData(
                                                    'code',
                                                    event.target.value
                                                        .replace(/\D/g, '')
                                                        .slice(0, 6),
                                                )
                                            }
                                            placeholder="000000"
                                            disabled={processing}
                                            className="h-14 rounded-2xl text-center font-mono text-2xl tracking-[0.45em]"
                                        />

                                        <p className="text-center text-xs leading-5 text-muted-foreground">
                                            El código cambia automáticamente cada pocos segundos.
                                        </p>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        (
                                            recoveryMode
                                                ? data.recovery_code.trim().length === 0
                                                : data.code.length !== 6
                                        )
                                    }
                                    className="h-11 w-full rounded-xl"
                                >
                                    {processing ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <ShieldCheck className="mr-2 size-4" />
                                    )}

                                    {recoveryMode
                                        ? 'Usar código de recuperación'
                                        : 'Verificar y continuar'}
                                </Button>
                            </form>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>

                                <div className="relative flex justify-center">
                                    <span className="bg-card px-3 text-xs uppercase tracking-wide text-muted-foreground">
                                        Alternativa
                                    </span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                onClick={toggleMode}
                                disabled={processing}
                                className="w-full rounded-xl"
                            >
                                {recoveryMode ? (
                                    <>
                                        <ArrowLeft className="mr-2 size-4" />
                                        Usar código de la aplicación
                                    </>
                                ) : (
                                    <>
                                        <KeyRound className="mr-2 size-4" />
                                        Usar código de recuperación
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                        <LockKeyhole className="size-3.5" />
                        Acceso protegido por autenticación en dos pasos
                    </div>
                </div>
            </main>
        </>
    );
}
