// EPGTalk holiday calendar for the greeting on the day itself (viewer's local date).
// Which season is ON is decided by make_season.py (docs/tvguide/season-now.json); this file only knows the holiday days.
// window.epgHolidayToday(date, superBowlDay) -> [emoji, English greeting, Spanish greeting] or null
(function () {
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function easter(y) {                           // Easter Sunday (Gregorian), same maths as make_season.py
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    var mo = Math.floor((h + l - 7 * m + 114) / 31), da = (h + l - 7 * m + 114) % 31 + 1;
    return [mo, da];
  }
  function lastMonday(y, mo) {                   // mo is 1-12
    var d = new Date(y, mo, 0);                  // last day of that month
    while (d.getDay() !== 1) d.setDate(d.getDate() - 1);
    return d.getDate();
  }
  window.epgHolidayToday = function (d, sbDay) {
    var y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
    if (sbDay && sbDay === y + '-' + pad(m) + '-' + pad(day)) return ['🏈', "It's Super Bowl Sunday!", '¡Es el domingo del Super Bowl!'];
    if (m === 10 && day === 31) return ['🎃', 'Happy Halloween!', '¡Feliz Halloween!'];
    if (m === 11 && d.getDay() === 4 && day >= 22 && day <= 28) return ['🦃', 'Happy Thanksgiving!', '¡Feliz Día de Acción de Gracias!'];
    if (m === 12 && day === 24) return ['🎄', 'Merry Christmas Eve!', '¡Feliz Nochebuena!'];
    if (m === 12 && day === 25) return ['🎄', 'Merry Christmas!', '¡Feliz Navidad!'];
    if (m === 12 && day === 31) return ['🎆', "Happy New Year's Eve!", '¡Feliz Nochevieja!'];
    if (m === 1 && day === 1) return ['🎆', 'Happy New Year!', '¡Feliz Año Nuevo!'];
    if (m === 1 && day === 6) return ['👑', 'Happy Three Kings Day!', '¡Feliz Día de Reyes!'];
    if (m === 2 && day === 14) return ['💘', "Happy Valentine's Day!", '¡Feliz Día de San Valentín!'];
    if (m === 3 && day === 17) return ['☘️', "Happy St. Patrick's Day!", '¡Feliz Día de San Patricio!'];
    var e = easter(y);
    if (m === e[0] && day === e[1]) return ['🐰', 'Happy Easter!', '¡Feliz Pascua!'];
    if (m === 5 && day === 10) return ['💐', "Happy Mother's Day!", '¡Feliz Día de las Madres!'];
    if (m === 5 && day === lastMonday(y, 5)) return ['🎖️', 'Remembering our heroes this Memorial Day.', 'Honramos a nuestros héroes en el Día de los Caídos.'];
    if (m === 7 && day === 4) return ['🇺🇸', 'Happy Fourth of July!', '¡Feliz 4 de Julio!'];
    return null;
  };
})();
