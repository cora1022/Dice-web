const measurementId = 'G-PHEXQ6C1M0';
const consentKey = 'cora-dice:analytics-consent:v1';
const banner = document.querySelector('[data-consent]');
function loadAnalytics() { if (document.querySelector('[data-ga4]')) return; const script = document.createElement('script'); script.async = true; script.dataset.ga4 = 'true'; script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`; document.head.appendChild(script); window.dataLayer = window.dataLayer || []; window.gtag = function gtag(){ window.dataLayer.push(arguments); }; window.gtag('js', new Date()); window.gtag('config', measurementId, { anonymize_ip: true }); }
function choose(value) { try { localStorage.setItem(consentKey, value); } catch { /* 통계 없이 계속 */ } if (banner) banner.hidden = true; if (value === 'granted') loadAnalytics(); }
let saved = null; try { saved = localStorage.getItem(consentKey); } catch { /* 통계 없이 계속 */ }
if (saved === 'granted') loadAnalytics(); else if (saved !== 'denied' && banner) banner.hidden = false;
document.querySelector('[data-consent-accept]')?.addEventListener('click', () => choose('granted'));
document.querySelector('[data-consent-reject]')?.addEventListener('click', () => choose('denied'));
document.querySelectorAll('[data-year]').forEach((element) => { element.textContent = new Date().getFullYear(); });

