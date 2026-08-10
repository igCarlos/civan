<?php

namespace App\Services;

class UserAgentService
{
    /**
     * @return array{
     *     browser: string,
     *     platform: string,
     *     device: 'desktop'|'mobile'|'tablet'|'unknown'
     * }
     */
    public function parse(
        ?string $userAgent,
    ): array {
        $userAgent =
            trim(
                (string) $userAgent
            );

        if ($userAgent === '') {
            return [
                'browser' =>
                    'Navegador desconocido',

                'platform' =>
                    'Sistema desconocido',

                'device' =>
                    'unknown',
            ];
        }

        return [
            'browser' =>
                $this->browser(
                    $userAgent
                ),

            'platform' =>
                $this->platform(
                    $userAgent
                ),

            'device' =>
                $this->device(
                    $userAgent
                ),
        ];
    }

    private function browser(
        string $userAgent,
    ): string {
        return match (true) {
            str_contains(
                $userAgent,
                'Edg/'
            ) =>
                'Microsoft Edge',

            str_contains(
                $userAgent,
                'OPR/'
            ),
            str_contains(
                $userAgent,
                'Opera'
            ) =>
                'Opera',

            str_contains(
                $userAgent,
                'Firefox/'
            ),
            str_contains(
                $userAgent,
                'FxiOS/'
            ) =>
                'Mozilla Firefox',

            str_contains(
                $userAgent,
                'CriOS/'
            ) =>
                'Google Chrome',

            str_contains(
                $userAgent,
                'Chrome/'
            ),
            str_contains(
                $userAgent,
                'Chromium/'
            ) =>
                'Google Chrome',

            str_contains(
                $userAgent,
                'Safari/'
            )
            && str_contains(
                $userAgent,
                'Version/'
            ) =>
                'Safari',

            default =>
                'Navegador desconocido',
        };
    }

    private function platform(
        string $userAgent,
    ): string {
        return match (true) {
            str_contains(
                $userAgent,
                'Windows NT'
            ) =>
                'Windows',

            str_contains(
                $userAgent,
                'CrOS'
            ) =>
                'ChromeOS',

            str_contains(
                $userAgent,
                'Android'
            ) =>
                'Android',

            str_contains(
                $userAgent,
                'iPhone'
            ),
            str_contains(
                $userAgent,
                'iPod'
            ) =>
                'iOS',

            str_contains(
                $userAgent,
                'iPad'
            ) =>
                'iPadOS',

            str_contains(
                $userAgent,
                'Macintosh'
            ),
            str_contains(
                $userAgent,
                'Mac OS X'
            ) =>
                'macOS',

            str_contains(
                $userAgent,
                'Linux'
            ) =>
                'Linux',

            default =>
                'Sistema desconocido',
        };
    }

    /**
     * @return 'desktop'|'mobile'|'tablet'|'unknown'
     */
    private function device(
        string $userAgent,
    ): string {
        if (
            str_contains(
                $userAgent,
                'iPad'
            )
            || str_contains(
                $userAgent,
                'Tablet'
            )
        ) {
            return 'tablet';
        }

        if (
            str_contains(
                $userAgent,
                'iPhone'
            )
            || str_contains(
                $userAgent,
                'iPod'
            )
            || str_contains(
                $userAgent,
                'Mobile'
            )
            || (
                str_contains(
                    $userAgent,
                    'Android'
                )
                && ! str_contains(
                    $userAgent,
                    'Tablet'
                )
            )
        ) {
            return 'mobile';
        }

        if (
            str_contains(
                $userAgent,
                'Windows'
            )
            || str_contains(
                $userAgent,
                'Macintosh'
            )
            || str_contains(
                $userAgent,
                'Linux'
            )
            || str_contains(
                $userAgent,
                'CrOS'
            )
        ) {
            return 'desktop';
        }

        return 'unknown';
    }
}
