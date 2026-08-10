import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

type IconProps = {
    className?: string;
};

function ArrowRightIcon({ className = 'h-4 w-4' }: IconProps) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function UsersIcon({ className = 'h-5 w-5' }: IconProps) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-4A4.5 4.5 0 0 0 3 18.5V20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="9.5" cy="7" r="4" stroke="currentColor" strokeWidth="1.7" />
            <path d="M16.5 4.3a4 4 0 0 1 0 7.4M18 14.3a4.5 4.5 0 0 1 3 4.2V20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
    );
}

function ModulesIcon({ className = 'h-5 w-5' }: IconProps) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.7" />
            <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.7" />
            <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.7" />
            <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.7" />
        </svg>
    );
}

function ShieldIcon({ className = 'h-5 w-5' }: IconProps) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3 20 6v5.8c0 4.7-3.15 7.75-8 9.2-4.85-1.45-8-4.5-8-9.2V6l8-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="m8.6 12 2.15 2.15 4.65-4.65" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function SettingsIcon({ className = 'h-5 w-5' }: IconProps) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.86 2.86-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.55v-.1A1.7 1.7 0 0 0 8.4 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.86-2.86.06-.06A1.7 1.7 0 0 0 4 15a1.7 1.7 0 0 0-1.5-1H2.4V10h.1A1.7 1.7 0 0 0 4 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06L6.46 4.2l.06.06A1.7 1.7 0 0 0 8.4 4a1.7 1.7 0 0 0 1-1.5v-.1h4v.1A1.7 1.7 0 0 0 15 4a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.86 2.86-.06.06A1.7 1.7 0 0 0 19.4 8.4a1.7 1.7 0 0 0 1.5 1h.1v4h-.1a1.7 1.7 0 0 0-1.5 1.6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function SparkIcon({ className = 'h-4 w-4' }: IconProps) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3c.7 4.9 3.1 7.3 8 8-4.9.7-7.3 3.1-8 8-.7-4.9-3.1-7.3-8-8 4.9-.7 7.3-3.1 8-8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
    );
}

function CheckIcon({ className = 'h-4 w-4' }: IconProps) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m5 12.5 4.2 4.2L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

const features = [
    {
        title: 'Usuarios y acceso',
        description: 'Una base lista para administrar usuarios, autenticación y acceso al sistema.',
        icon: UsersIcon,
    },
    {
        title: 'Roles y permisos',
        description: 'Organiza el acceso a módulos y acciones con una estructura preparada para crecer.',
        icon: ShieldIcon,
    },
    {
        title: 'Configuración',
        description: 'Centraliza ajustes del proyecto, apariencia, identidad y preferencias administrativas.',
        icon: SettingsIcon,
    },
    {
        title: 'Base modular',
        description: 'Agrega tus propios módulos y funcionalidades sobre una interfaz consistente y reutilizable.',
        icon: ModulesIcon,
    },
];

const terminalLines = [
    { prompt: '$', text: 'php artisan migrate', tone: 'text-white' },
    { prompt: '✓', text: 'Base de datos preparada', tone: 'text-emerald-300' },
    { prompt: '✓', text: 'Roles y permisos cargados', tone: 'text-emerald-300' },
    { prompt: '✓', text: 'Recursos compilados', tone: 'text-emerald-300' },
    { prompt: '✓', text: 'CIVAN listo para desarrollar', tone: 'text-violet-300' },
];

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="CIVAN — Panel administrativo para tus proyectos">
                <meta
                    name="description"
                    content="CIVAN es una base administrativa moderna y reutilizable para iniciar proyectos con usuarios, roles, permisos, configuración y una interfaz lista para personalizar."
                />
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen overflow-hidden bg-[#070A12] font-sans text-white selection:bg-violet-500/30 selection:text-white">
                {/* Ambient background */}
                <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden" aria-hidden="true">
                    <div className="absolute left-1/2 top-[-24rem] h-[46rem] w-[46rem] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[150px]" />
                    <div className="absolute right-[-16rem] top-[28rem] h-[38rem] w-[38rem] rounded-full bg-indigo-500/10 blur-[150px]" />
                    <div className="absolute bottom-[-22rem] left-[-14rem] h-[40rem] w-[40rem] rounded-full bg-fuchsia-500/8 blur-[150px]" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
                </div>

                <div className="relative z-10">
                    {/* Navigation */}
                    <header className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
                        <nav className="flex h-20 items-center justify-between border-b border-white/[0.07]">
                            <a href="#inicio" className="group flex items-center gap-3" aria-label="CIVAN inicio">
                                <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-violet-400/25 bg-violet-500/10 shadow-[0_0_35px_rgba(124,58,237,0.16)]">
                                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-transparent" />
                                    <svg viewBox="0 0 40 40" className="relative h-7 w-7" fill="none" aria-hidden="true">
                                        <path
                                            d="M28.7 11.4A11.5 11.5 0 1 0 28.8 28.5"
                                            stroke="url(#civan-logo-gradient)"
                                            strokeWidth="4.1"
                                            strokeLinecap="round"
                                        />
                                        <path d="M24.5 14.2 30.3 20l-5.8 5.8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                        <defs>
                                            <linearGradient id="civan-logo-gradient" x1="8" y1="9" x2="31" y2="31" gradientUnits="userSpaceOnUse">
                                                <stop stopColor="#A78BFA" />
                                                <stop offset="1" stopColor="#7C3AED" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                <div className="leading-none">
                                    <span className="block text-lg font-bold tracking-[0.18em] text-white">CIVAN</span>
                                    <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.28em] text-white/35">Admin Starter</span>
                                </div>
                            </a>

                            <div className="hidden items-center gap-8 md:flex">
                                <a href="#plataforma" className="text-sm font-medium text-white/55 transition hover:text-white">
                                    Vista previa
                                </a>
                                <a href="#funciones" className="text-sm font-medium text-white/55 transition hover:text-white">
                                    Funciones
                                </a>
                                <a href="#seguridad" className="text-sm font-medium text-white/55 transition hover:text-white">
                                    Base
                                </a>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="group inline-flex items-center gap-2 rounded-xl border border-violet-400/25 bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(124,58,237,0.25)] transition hover:bg-violet-400 sm:px-5"
                                    >
                                        Ir al panel
                                        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="hidden rounded-xl px-4 py-2.5 text-sm font-medium text-white/65 transition hover:bg-white/[0.05] hover:text-white sm:inline-flex"
                                        >
                                            Iniciar sesión
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="group inline-flex items-center gap-2 rounded-xl border border-violet-400/25 bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(124,58,237,0.25)] transition hover:bg-violet-400 sm:px-5"
                                        >
                                            Comenzar
                                            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </header>

                    {/* Hero */}
                    <main id="inicio">
                        <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-16 px-5 py-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-20">
                            <div className="max-w-2xl">
                                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-3.5 py-2 text-xs font-semibold text-violet-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
                                    </span>
                                    Una base administrativa para tus proyectos
                                </div>

                                <h1 className="max-w-3xl text-5xl font-bold leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl lg:text-[4.7rem]">
                                    Construye.
                                    <br />
                                    Administra.
                                    <br />
                                    <span className="bg-gradient-to-r from-violet-300 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                                        Personaliza.
                                    </span>
                                </h1>

                                <p className="mt-7 max-w-xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
                                    CIVAN te brinda una base administrativa moderna para comenzar tus proyectos sin construir el panel desde cero. Usuarios, roles, permisos, configuración y una estructura lista para adaptar a tus necesidades.
                                </p>

                                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                    {auth.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_45px_rgba(124,58,237,0.3)] transition hover:-translate-y-0.5 hover:bg-violet-400"
                                        >
                                            Abrir panel
                                            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('register')}
                                            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_45px_rgba(124,58,237,0.3)] transition hover:-translate-y-0.5 hover:bg-violet-400"
                                        >
                                            Probar CIVAN
                                            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    )}

                                    <a
                                        href="#funciones"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-6 py-3.5 text-sm font-semibold text-white/75 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                                    >
                                        Ver funcionalidades
                                    </a>
                                </div>

                                <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-500 sm:text-sm">
                                    {['Base reutilizable', 'Diseño responsivo', 'Lista para personalizar'].map((item) => (
                                        <span key={item} className="flex items-center gap-2">
                                            <span className="grid h-5 w-5 place-items-center rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300">
                                                <CheckIcon className="h-3 w-3" />
                                            </span>
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Product visual */}
                            <div id="plataforma" className="relative mx-auto w-full max-w-[650px] lg:mx-0">
                                <div className="absolute -inset-8 rounded-[2.5rem] bg-violet-500/[0.08] blur-3xl" aria-hidden="true" />
                                <div className="relative rounded-[1.75rem] border border-white/10 bg-[#0B0F1A]/90 p-2.5 shadow-[0_35px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                                    <div className="overflow-hidden rounded-[1.3rem] border border-white/[0.07] bg-[#0B1020]">
                                        <div className="flex h-12 items-center justify-between border-b border-white/[0.07] px-4">
                                            <div className="flex items-center gap-2">
                                                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                                                <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
                                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                                            </div>
                                            <div className="rounded-lg border border-white/[0.06] bg-white/[0.035] px-3 py-1.5 text-[10px] font-medium tracking-wide text-slate-500">
                                                panel.civan.local
                                            </div>
                                            <div className="h-6 w-6 rounded-lg bg-violet-500/10" />
                                        </div>

                                        <div className="grid min-h-[430px] grid-cols-[72px_1fr] sm:grid-cols-[168px_1fr]">
                                            <aside className="border-r border-white/[0.06] bg-[#090D17] p-3 sm:p-4">
                                                <div className="mb-7 flex items-center gap-2 px-1">
                                                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-violet-500/15 text-xs font-bold text-violet-300">C</div>
                                                    <span className="hidden text-xs font-bold tracking-[0.16em] text-white sm:block">CIVAN</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {[
                                                        ['Panel', true],
                                                        ['Usuarios', false],
                                                        ['Roles', false],
                                                        ['Permisos', false],
                                                        ['Configuración', false],
                                                    ].map(([label, active]) => (
                                                        <div
                                                            key={label as string}
                                                            className={`flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[11px] font-medium ${
                                                                active
                                                                    ? 'bg-violet-500/12 text-violet-300'
                                                                    : 'text-slate-600'
                                                            }`}
                                                        >
                                                            <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-violet-400' : 'bg-slate-700'}`} />
                                                            <span className="hidden sm:block">{label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </aside>

                                            <div className="p-4 sm:p-5">
                                                <div className="mb-5 flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">Dashboard</p>
                                                        <h2 className="mt-1.5 text-lg font-semibold text-white">Vista general</h2>
                                                    </div>
                                                    <div className="flex h-8 items-center gap-2 rounded-lg border border-emerald-400/10 bg-emerald-400/[0.05] px-2.5 text-[10px] font-medium text-emerald-300">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                                        Operativo
                                                    </div>
                                                </div>

                                                <div className="grid gap-3 sm:grid-cols-3">
                                                    {[
                                                        ['Usuarios', '24', 'Activos'],
                                                        ['Roles', '04', 'Definidos'],
                                                        ['Permisos', '18', 'Asignados'],
                                                    ].map(([label, value, detail]) => (
                                                        <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3.5">
                                                            <p className="text-[10px] font-medium text-slate-600">{label}</p>
                                                            <div className="mt-2 flex items-end justify-between gap-2">
                                                                <span className="text-xl font-semibold tracking-tight text-white">{value}</span>
                                                                <span className="text-[9px] font-medium text-violet-300/80">{detail}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-3 grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
                                                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-[10px] text-slate-600">Actividad</p>
                                                                <p className="mt-1 text-xs font-semibold text-slate-300">Actividad administrativa</p>
                                                            </div>
                                                            <span className="rounded-md bg-violet-500/10 px-2 py-1 text-[9px] font-medium text-violet-300">En vivo</span>
                                                        </div>
                                                        <div className="mt-6 flex h-28 items-end gap-1.5">
                                                            {[32, 48, 38, 62, 53, 75, 58, 68, 88, 72, 78, 64, 91, 82].map((height, index) => (
                                                                <div key={index} className="flex-1 rounded-t-sm bg-gradient-to-t from-violet-600/30 to-violet-400/80" style={{ height: `${height}%` }} />
                                                            ))}
                                                        </div>
                                                        <div className="mt-3 flex items-center justify-between text-[9px] text-slate-700">
                                                            <span>00:00</span>
                                                            <span>12:00</span>
                                                            <span>Ahora</span>
                                                        </div>
                                                    </div>

                                                    <div className="rounded-xl border border-white/[0.06] bg-[#080C15] p-4 font-mono">
                                                        <div className="mb-4 flex items-center justify-between">
                                                            <span className="text-[10px] text-slate-600">Terminal</span>
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
                                                        </div>
                                                        <div className="space-y-3">
                                                            {terminalLines.map((line) => (
                                                                <div key={line.text} className="flex gap-2 text-[9px] sm:text-[10px]">
                                                                    <span className={line.tone}>{line.prompt}</span>
                                                                    <span className={line.tone}>{line.text}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-xl border border-white/10 bg-[#101522]/85 px-4 py-3 shadow-2xl backdrop-blur-xl sm:flex">
                                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300">
                                        <ShieldIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500">Estado de seguridad</p>
                                        <p className="mt-0.5 text-xs font-semibold text-white">Todo protegido</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Feature strip */}
                        <section id="funciones" className="border-y border-white/[0.06] bg-white/[0.015]">
                            <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
                                <div className="mx-auto max-w-2xl text-center">
                                    <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300">
                                        <SparkIcon />
                                        Base CIVAN
                                    </div>
                                    <h2 className="text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl">
                                        Empieza con una base sólida.
                                    </h2>
                                    <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
                                        Una estructura administrativa reutilizable para que puedas concentrarte en desarrollar las funciones propias de cada proyecto.
                                    </p>
                                </div>

                                <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    {features.map(({ title, description, icon: Icon }, index) => (
                                        <article
                                            key={title}
                                            className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/20 hover:bg-violet-500/[0.045]"
                                        >
                                            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-violet-500/0 blur-2xl transition group-hover:bg-violet-500/10" />
                                            <div className="relative">
                                                <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl border border-violet-400/15 bg-violet-500/[0.08] text-violet-300 transition group-hover:border-violet-400/25 group-hover:bg-violet-500/15">
                                                    <Icon />
                                                </div>
                                                <div className="mb-2 flex items-center justify-between">
                                                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                                                    <span className="font-mono text-[10px] text-white/15">0{index + 1}</span>
                                                </div>
                                                <p className="text-sm leading-6 text-slate-500">{description}</p>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Base / final CTA */}
                        <section id="seguridad" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
                            <div className="relative overflow-hidden rounded-[2rem] border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.10] via-white/[0.025] to-transparent p-7 sm:p-10 lg:p-14">
                                <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-500/15 blur-[100px]" aria-hidden="true" />
                                <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
                                    <div className="max-w-2xl">
                                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                                            <ShieldIcon />
                                        </div>
                                        <h2 className="text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">
                                            Una base. Muchos proyectos.
                                        </h2>
                                        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base sm:leading-7">
                                            Usa CIVAN como punto de partida, adapta los módulos a tu proyecto y mantén una experiencia administrativa consistente desde el primer día.
                                        </p>
                                    </div>

                                    {auth.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#0A0E18] transition hover:-translate-y-0.5 hover:bg-violet-100"
                                        >
                                            Entrar al panel
                                            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('register')}
                                            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#0A0E18] transition hover:-translate-y-0.5 hover:bg-violet-100"
                                        >
                                            Usar CIVAN como base
                                            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </section>
                    </main>

                    <footer className="border-t border-white/[0.06]">
                        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-7 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                            <div className="flex items-center gap-2.5">
                                <div className="grid h-7 w-7 place-items-center rounded-lg bg-violet-500/10 text-[10px] font-bold text-violet-300">C</div>
                                <span className="font-semibold tracking-[0.14em] text-slate-400">CIVAN</span>
                            </div>
                            <p>Tu base administrativa. Tu proyecto.</p>
                            <p>© {new Date().getFullYear()} CIVAN</p>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
