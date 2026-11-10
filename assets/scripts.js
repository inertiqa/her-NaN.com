//prevent flashbang
(function() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
})();

let currentWeatherCode = 'default';

function randomMade(count) {
  let text = 'Hello and check ';
  
  const made = [
  'a corne split keyboard <a href="https://github.com/inertiqa/crkbd_v2_alien" title="a corne split keyboard \'Alien\' customization" target="_blank"><span>\'Alien\' customization</span></a>',
  'the micro-framework <a href="/code/sass-seriff" title="the micro-framework sass-seriff.css" target="_self">sass-seriff.css</a>',
  'an interactive <a href="/code/westinghouse" title="an interactive Westinghouse Neon Sign" target="_self">Westinghouse Neon Sign</a>',
  'a complete z80 port of the <a href="/code/agc-zx" title="a complete z80 port of the Apollo 11 AGC source" target="_self">Apollo 11 AGC source</a>',
  'The Legend of Zelda <a href="/code/zxelda" title="The Legend of Zelda for the ZX Spectrum" target="_self">for the ZX Spectrum</a>',
  'a shader of the <a href="/code/psp" title="a shader of the PSP background" target="_self">PSP background</a>',
  'John Carmack\'s complete <a href="/carmack-plan" title="John Carmack diaries while working on Doom & Quake" target="_self">.plan archive</a>',
  ];

  for (let i = 0; i < count; i++) {
	text += made.splice(Math.floor(Math.random() * made.length), 1)[0];
	if (i < count - 2) {
		text += ', ';
	} else if (i < count - 1) {
		text += ' or ';
	} else {
		text += '.';
	}
  }
	document.querySelector('.made').innerHTML = text;
}

function randomPro(count) {
    let text = '';

    const pro = [
        'My graphic design have been awarded in the <a href="https://graphis.com/publications/books/design-2017" title="the Aquazoo logo was featured in this historic annual" target="_blank">Graphis Annual</a>',
    ];

    for (let i = 0; i < count; i++) {
        text += pro.splice(Math.floor(Math.random() * pro.length), 1)[0];
        if (i < count - 2) {
            text += ', ';
        } else if (i < count - 1) {
            text += ' and ';
        } else {
            text += '.';
        }
    }
    document.querySelector('.pro').innerHTML = text;
}

function randomNerd(count) {
    let text = '';

    const nerd = [
        'I\'m a total nerd',
        'also world top three in SSFIV playing <a href="https://youtu.be/DrjXqBEfn8Q" title="myself destroying some scrub online" target="_blank">Juri</a> <img src="assets/chibiJuri.svg" title="chibi-Juri!"/>',
        'the last thing on the log is: <a href="/plan/" title="last entry: general downsize of" target="_self">general downsize of</a> (<span data-uid="2026-11-10T11:36:07+01:00"></span>)',
    ];

    for (let i = 0; i < count; i++) {
        let item = nerd.splice(Math.floor(Math.random() * nerd.length), 1)[0];

        if (i === 0) {
            item = item.charAt(0).toUpperCase() + item.slice(1);
        }

        text += item;
    
        if (i < count - 2) {
            text += ', ';
        } else if (i < count - 1) {
            text += ' and ';
        } else {
            text += '.';
        }
    }
    document.querySelector('.nerd').innerHTML = text;
}

function LinkColorSet() {
     const isDark = document.documentElement.classList.contains('dark');

    Array.from(document.links).forEach(link => {
        if (isDark) {
            link.style.backgroundColor = 'hsla(' + ~~(360 * Math.random()) + ', 70%, 80%, 1)';
        } else {
            link.style.backgroundColor = 'hsla(' + ~~(360 * Math.random()) + ', 70%, 40%, 1)';
        }
    });
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');

    // Guardar la elección explícita del usuario
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    // Actualizar enlaces y emoji según el estado
    LinkColorSet();

    if (isDark) {
        setDarkEmoji();
    } else {
        setLightEmoji(currentWeatherCode);
    }
}

function atLanding() {
    const savedTheme = localStorage.getItem('theme');
    // Si hay valor guardado lo usa; si no, consulta la preferencia del SO
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

    // Aplicar o quitar la clase 'dark' en <html>
    document.documentElement.classList.toggle('dark', isDark);

    // Inicializar evento y emoji
    setEmoji();

    // Aplicar color de los enlaces tras determinar el tema
    LinkColorSet();
}

function setEmoji() {
    const skyEmoji = document.querySelector('.skyEmoji');
    if (!skyEmoji) return;

    skyEmoji.onclick = toggleTheme;
    skyEmoji.style.cursor = 'pointer';

    // Evaluar estado activo en <html>
    const isDark = document.documentElement.classList.contains('dark');

    if (isDark) {
        setDarkEmoji();
    } else {
        setLightEmoji(currentWeatherCode);
    }
}

function setLightEmoji(weatherIconCode) {
    let skyEmoji = document.querySelector('.skyEmoji');
    if (!skyEmoji) return;
    let baseCode = (weatherIconCode && weatherIconCode !== 'default') ? weatherIconCode.substring(0, 2) : 'default';

    switch (baseCode) {
        case '01': skyEmoji.innerHTML = '☀️'; skyEmoji.title = 'current weather: Clear'; break;
        case '02': skyEmoji.innerHTML = '🌤️'; skyEmoji.title = 'current weather: Light Clouds'; break;
        case '03':
        case '04': skyEmoji.innerHTML = '☁️'; skyEmoji.title = 'current weather: Cloudy'; break;
        case '09':
        case '10': skyEmoji.innerHTML = '🌧️'; skyEmoji.title = 'current weather: Rain'; break;
        case '11': skyEmoji.innerHTML = '⛈'; skyEmoji.title = 'current weather: Storm'; break;
        case '13': skyEmoji.innerHTML = '❄️'; skyEmoji.title = 'current weather: Snow'; break;
        case '50': skyEmoji.innerHTML = '🌫️'; skyEmoji.title = 'current weather: Fog'; break;
        default:   skyEmoji.innerHTML = '🌤️'; skyEmoji.title = 'Switch to dark theme'; break;
    }
}

function weather() {
    if (!navigator.geolocation) {
        console.warn("Geolocation not supported.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const apiKey = '09a412d594c6a360aaa3748b09c90faa'; 
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;

            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    currentWeatherCode = data.weather[0].icon;
                    if (!document.body.classList.contains('dark')) {
                        setLightEmoji(currentWeatherCode);
                    }
                })
                .catch(error => console.error("Error getting weather:", error));
        },
        (error) => {
            console.warn("Location denied.");
        }
    );
}

function setDarkEmoji() {
	let skyEmoji = document.querySelector('.skyEmoji');
    if (!skyEmoji) return;
    let d = new Date();
    let moonPhase = getMoonPhase(d.getDate(), d.getMonth() + 1, d.getFullYear());

    switch (moonPhase) {
        case 0: skyEmoji.innerHTML = '🌑'; skyEmoji.title = 'current Moon: New'; break;
        case 1: skyEmoji.innerHTML = '🌒'; skyEmoji.title = 'current Moon: Waxing Crescent'; break;
        case 2: skyEmoji.innerHTML = '🌓'; skyEmoji.title = 'current Moon: Quarter Crescent'; break;
        case 3: skyEmoji.innerHTML = '🌔'; skyEmoji.title = 'current Moon: Waxing Gibbous'; break;
        case 4: skyEmoji.innerHTML = '🌕'; skyEmoji.title = 'current Moon: Full'; break;
        case 5: skyEmoji.innerHTML = '🌖'; skyEmoji.title = 'current Moon: Waning Gibbous'; break;
        case 6: skyEmoji.innerHTML = '🌗'; skyEmoji.title = 'current Moon: Quarter Crepuscular'; break;
        default: skyEmoji.innerHTML = '🌘'; skyEmoji.title = 'current Moon: Waning Crepuscular'; break;
    }
}

function getMoonPhase(day, month, year) { 
    let c = 0, e = 0, jd = 0, b = 0; 
    if (month < 3) { year--; month += 12; }
    ++month;
    c = 365.25 * year;
    e = 30.6 * month;
    jd = c + e + day - 694039.09;
    jd /= 29.5305882;
    b = parseInt(jd);
    jd -= b;
    b = Math.round(jd * 8);
    if (b >= 8) { b = 0; }
    return b;
}

function cb(response) { //abacus pageviews api - abacus.jasoncameron.dev
	document.querySelector('.pageviews').innerHTML = "pageviews #" + response.value.toString(16).padStart(6, "0")
}

function parseCreationDates() {
    const timeNodes = document.querySelectorAll('[data-uid]');

    timeNodes.forEach(node => {
        const dateStr = node.dataset.uid;
        node.innerHTML = humaneDate(dateStr);
    });
}

function humaneDate(date_str) { 
    let time_formats = [
        [60, 'Just Now'], [90, '1 Minute'], [3600, 'Minutes', 60], 
        [5400, '1 Hour'], [86400, 'Hours', 3600], [129600, '1 Day'], 
        [604800, 'Days', 86400], [907200, '1 Week'], [2628000, 'Weeks', 604800], 
        [3942000, '1 Month'], [31536000, 'Months', 2628000], [47304000, '1 Year'], 
        [3153600000, 'Years', 31536000], [4730400000, '1 Century']
    ];

    let time = ('' + date_str).replace(/-/g, '/').replace(/[TZ]/g, ' '),
        dt = new Date,
        seconds = ((dt - new Date(time) + (dt.getTimezoneOffset() * 60000)) / 1000),
        token = ' Ago', i = 0, format;

    if (seconds < 0) { seconds = Math.abs(seconds); token = ''; }

    while (format = time_formats[i++]) {
        if (seconds < format[0]) {
            if (format.length == 2) return format[1] + (i > 1 ? token : ''); 
            else return Math.round(seconds / format[2]) + ' ' + format[1] + (i > 1 ? token : '');
        }
    }
    if (seconds > 4730400000) return Math.round(seconds / 4730400000) + ' Centuries' + token;
    return date_str;
}

function gallery() {
    const items = document.querySelectorAll('.item');
    const bgOverlay = document.getElementById('bg-overlay');

    const resetView = () => {
        if (bgOverlay) bgOverlay.style.backgroundImage = '';
        items.forEach(i => i.style.opacity = '1');
    };

    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const img = item.tagName === 'IMG' ? item : item.querySelector('img');

            if (img && img.src && bgOverlay) {
                bgOverlay.style.backgroundImage = `url("${encodeURI(img.src)}")`;
            }

            items.forEach(otherItem => {
                otherItem.style.opacity = (otherItem !== item) ? '0.1' : '1';
            });
        });

        item.addEventListener('mouseleave', resetView);
        item.addEventListener('click', resetView);
    });
}

// Asegúrate de invocar la función tras cargar el DOM
document.addEventListener('DOMContentLoaded', gallery);

function refreshPostAgo() {
	setInterval(() => {
			parseCreationDates();
		}, 60000);
}

document.addEventListener("DOMContentLoaded", () => {
	const path = window.location.pathname;

	if (path.includes("design")) {
		try { atLanding(); } catch(e) { console.error("atLanding error:", e); }
		try { weather(); } catch(e) { console.error("weather error:", e); }
		try { LinkColorSet(); } catch(e) { console.error("link color set error:", e); }
		try { gallery(); } catch(e) { console.error("gallery error:", e); }
    } else {
		try { atLanding(); } catch(e) { console.error("atLanding error:", e); }
		try { weather(); } catch(e) { console.error("weather error:", e); }
		try { randomMade(4); } catch(e) { console.error("random made error:", e); }
		try { randomPro(1); } catch(e) { console.error("random pro error:", e); }
		try { randomNerd(3); } catch(e) { console.error("random nerd error:", e); }
		try { LinkColorSet(); } catch(e) { console.error("link color set error:", e); }
		try { parseCreationDates(); } catch(e) { console.error("parseCreationDates error:", e); }
		try { refreshPostAgo(); } catch(e) { console.error("refreshPostAgo error:", e); }
	} 
});
