<?php

namespace App\Services;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

class SystemDateTimeService
{
    private ?array $settings = null;

    /**
     * Configuración regional de CIVAN para la petición actual.
     */
    private function settings(): array
    {
        if ($this->settings === null) {
            $this->settings =
                app(SystemSettingsService::class)
                    ->general();
        }

        return $this->settings;
    }

    /**
     * Zona horaria usada únicamente para mostrar fechas.
     */
    public function timezone(): string
    {
        return (string) (
            $this->settings()['timezone']
            ?? 'UTC'
        );
    }

    /**
     * Idioma utilizado por Carbon para textos relativos.
     */
    public function locale(): string
    {
        $locale = (string) (
            $this->settings()['locale']
            ?? 'es'
        );

        return in_array(
            $locale,
            ['es', 'en'],
            true
        )
            ? $locale
            : 'es';
    }

    public function dateFormat(): string
    {
        return (string) (
            $this->settings()['date_format']
            ?? 'd/m/Y'
        );
    }

    /**
     * El panel guarda H:i / h:i A.
     * Para auditoría agregamos segundos sin alterar la preferencia.
     */
    public function timeFormat(
        bool $withSeconds = true
    ): string {
        $format = (string) (
            $this->settings()['time_format']
            ?? 'H:i'
        );

        if (! $withSeconds) {
            return $format;
        }

        return match ($format) {
            'h:i A' => 'h:i:s A',
            default => 'H:i:s',
        };
    }

    /**
     * Convierte un instante UTC a la zona configurada solo para mostrarlo.
     */
    public function format(
        ?CarbonInterface $dateTime,
        bool $withSeconds = true
    ): ?string {
        if (! $dateTime) {
            return null;
        }

        return $dateTime
            ->copy()
            ->setTimezone(
                $this->timezone()
            )
            ->format(
                $this->dateFormat()
                . ' '
                . $this->timeFormat(
                    $withSeconds
                )
            );
    }

    /**
     * Texto relativo correcto y traducido:
     * "hace 5 minutos" / "5 minutes ago".
     *
     * La zona horaria no cambia el instante real, solamente su representación.
     */
    public function human(
        ?CarbonInterface $dateTime
    ): ?string {
        if (! $dateTime) {
            return null;
        }

        return $dateTime
            ->copy()
            ->setTimezone(
                $this->timezone()
            )
            ->locale(
                $this->locale()
            )
            ->diffForHumans();
    }

    /**
     * Inicio de un día LOCAL convertido a UTC para consultar la base de datos.
     */
    public function localDayStartUtc(
        ?string $date
    ): ?CarbonImmutable {
        if (! $date) {
            return null;
        }

        return CarbonImmutable::parse(
            $date,
            $this->timezone()
        )
            ->startOfDay()
            ->utc();
    }

    /**
     * Fin de un día LOCAL convertido a UTC para consultar la base de datos.
     */
    public function localDayEndUtc(
        ?string $date
    ): ?CarbonImmutable {
        if (! $date) {
            return null;
        }

        return CarbonImmutable::parse(
            $date,
            $this->timezone()
        )
            ->endOfDay()
            ->utc();
    }
}
