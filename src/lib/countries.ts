/**
 * Regional Configuration Master Data
 * Single source of truth for country → currency → timezone mappings
 */

export interface CountryConfig {
    name: string;
    currencySymbol: string;
    currencyCode: string;
    timezone: string;
    displayName: string;
}

export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
    'Guatemala': {
        name: 'Guatemala',
        displayName: 'Guatemala (Q)',
        currencySymbol: 'Q',
        currencyCode: 'GTQ',
        timezone: 'America/Guatemala'
    },
    'El Salvador': {
        name: 'El Salvador',
        displayName: 'El Salvador ($)',
        currencySymbol: '$',
        currencyCode: 'USD',
        timezone: 'America/El_Salvador'
    },
    'Honduras': {
        name: 'Honduras',
        displayName: 'Honduras (L)',
        currencySymbol: 'L',
        currencyCode: 'HNL',
        timezone: 'America/Tegucigalpa'
    },
    'Nicaragua': {
        name: 'Nicaragua',
        displayName: 'Nicaragua (C$)',
        currencySymbol: 'C$',
        currencyCode: 'NIO',
        timezone: 'America/Managua'
    },
    'Costa Rica': {
        name: 'Costa Rica',
        displayName: 'Costa Rica (₡)',
        currencySymbol: '₡',
        currencyCode: 'CRC',
        timezone: 'America/Costa_Rica'
    },
    'Panamá': {
        name: 'Panamá',
        displayName: 'Panamá ($)',
        currencySymbol: '$',
        currencyCode: 'USD',
        timezone: 'America/Panama'
    },
    'Belice': {
        name: 'Belice',
        displayName: 'Belice (BZ$)',
        currencySymbol: 'BZ$',
        currencyCode: 'BZD',
        timezone: 'America/Belize'
    },
    'México': {
        name: 'México',
        displayName: 'México ($)',
        currencySymbol: '$',
        currencyCode: 'MXN',
        timezone: 'America/Mexico_City'
    },
    'Colombia': {
        name: 'Colombia',
        displayName: 'Colombia ($)',
        currencySymbol: '$',
        currencyCode: 'COP',
        timezone: 'America/Bogota'
    },
    'USA': {
        name: 'USA',
        displayName: 'Estados Unidos ($)',
        currencySymbol: '$',
        currencyCode: 'USD',
        timezone: 'America/New_York'
    }
};

export const SUPPORTED_COUNTRIES = Object.keys(COUNTRY_CONFIGS);

export const TIMEZONE_OPTIONS = Array.from(
    new Set(
        Object.values(COUNTRY_CONFIGS).map(c => c.timezone)
    )
).sort();

export function getCountryConfig(countryName: string): CountryConfig {
    return COUNTRY_CONFIGS[countryName] || COUNTRY_CONFIGS['Guatemala'];
}
