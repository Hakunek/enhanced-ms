import de from './locales/de';
import en from './locales/en';
import mi from './locales/mi';
import pl from './locales/pl';
import { measurements } from './measurements';

export const languages = { en, mi, de, pl };

export interface Unit {
    /** Short form of the measurement */
    abbreviation?: string | ((count: number) => string);
    /** Key to identify this unit */
    key: keyof typeof measurements;
    /** Strings used for the string regex */
    matches: string[];
    /** Long form of the measurement */
    name: string | ((count: number) => string);
}

export interface Language {
    /** The version of 'and' in this language */
    and: string;
    /** The decimal separator this language uses */
    decimal: ',' | '.';
    /** Measurement units */
    units: Unit[];
}

export interface LanguageOptions {
    /** The version of 'and' in the language */
    andValue: string;
    /** The decimal separator the language uses */
    decimalSeparator: string;
    /** The key for the selected language */
    key: LanguageKey;
    /** The regex to match lengths of time */
    regex: RegExp;
    /** Whether the language has full short support */
    supportsAbbreviations: boolean;
    /** The thousands separator the language uses */
    thousandsSeparator: string;
    /** The units and their names in the language, as a map */
    units: Record<string, Unit & { ms: number }>;
}

export type LanguageKey = keyof typeof languages;

/** Check that a string is a valid language key */
export function isLanguageKey(value: string): value is LanguageKey {
    return value in languages;
}

const LANGUAGE_CACHE: Record<string, LanguageOptions> = {};

/** Convert a language object into a object this module can utilitise */
export function makeLanguageOptions(key: LanguageKey): LanguageOptions {
    if (LANGUAGE_CACHE[key]) return LANGUAGE_CACHE[key];

    const language = languages[key];
    const decimal = language.decimal;
    const thousands = decimal === '.' ? ',' : '.';

    const regex = new RegExp(
        '([-+*/]+|' + // Operators
            '[()]|' + // Brackets
            `(?![${decimal}${thousands}])` + // Dont match single .,
            `[\\d${decimal}${thousands}]+|` + // Numbers
            language.units // Units
                .flatMap(({ matches }) => matches)
                .sort((a, b) => b.length - a.length)
                .join('|') +
            ')',
        'gi'
    );

    // Turn the units array into a map where every key is a match
    // This saves having to 'find' a match manually
    // `units.find(u => u.matches.includes(value))` vs `units[value]`
    const units = language.units.reduce<LanguageOptions['units']>((all, cur) => {
        for (const match of [...cur.matches, cur.key])
            all[match] = Object.assign(cur, { ms: measurements[cur.key] });
        return all;
    }, {});

    return {
        key,
        decimalSeparator: decimal,
        thousandsSeparator: thousands,
        andValue: language.and,
        supportsAbbreviations: language.units.every(unit => unit.abbreviation),
        regex,
        units,
    };
}

/** The default language to use, in this case English */
export const defaultLanguageOptions = makeLanguageOptions('en');
