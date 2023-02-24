const ms = require('../dist')('pl');
// const ms = require('enhanced-ms')('pl');

test('convert from string to number', () => {
    expect(ms('1m')).toBe(60000);

    expect(ms('3 godziny')).toBe(3 * 3.6e6);

    expect(ms('4 godziny + 60min')).toBe(5 * 3.6e6);

    expect(ms('1d + 1 dzień + 5 dni - tydzień')).toBe(0);
});

test('convert from number to string', () => {
    expect(ms(123456789)).toBe('1 dzień 10 godzin 17 minut i 36 sekund');

    expect(ms(123456789, { shortFormat: true })).toBe('1d 10h 17min 36s');

    expect(ms(91000, { roundUp: true })).toBe('2 minuty');

    expect(ms(1111.111111, { includeSubMs: true })).toBe(
        '1 sekunda 111 milisekund 111 mikrosekund i 111 nanosekund'
    );
});
