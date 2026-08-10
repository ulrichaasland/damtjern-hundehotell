(() => {
  'use strict';

  const TAG_ID = 'AW-858941803';
  const STORAGE_KEY = 'damtjern_tracking_consent_v1';
  const CONSENT_PARAM = 'damtjern_tracking_consent';
  const BOOKING_HOST = 'damtjern-os.onrender.com';
  const LINKED_DOMAINS = ['damtjern.no', BOOKING_HOST];
  const PRODUCTION_HOSTS = new Set(['damtjern.no', 'www.damtjern.no', BOOKING_HOST]);
  const GRANTED = 'granted';
  const DENIED = 'denied';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('consent', 'default', {
    ad_storage: DENIED,
    analytics_storage: DENIED,
    ad_user_data: DENIED,
    ad_personalization: DENIED,
  });
  window.gtag('set', 'linker', { domains: LINKED_DOMAINS });

  let decision = readIncomingDecision() || readStoredDecision();
  let tagStarted = false;

  function validDecision(value) {
    return value === GRANTED || value === DENIED ? value : null;
  }

  function readStoredDecision() {
    try {
      return validDecision(window.localStorage.getItem(STORAGE_KEY));
    } catch (error) {
      return null;
    }
  }

  function storeDecision(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      // Consent still applies for this page when storage is unavailable.
    }
  }

  function readIncomingDecision() {
    try {
      const url = new URL(window.location.href);
      const value = validDecision(url.searchParams.get(CONSENT_PARAM));
      if (!value) return null;
      url.searchParams.delete(CONSENT_PARAM);
      window.history.replaceState(
        window.history.state,
        '',
        `${url.pathname}${url.search}${url.hash}`,
      );
      return value;
    } catch (error) {
      return null;
    }
  }

  function consentState(value) {
    return {
      ad_storage: value,
      analytics_storage: value,
      ad_user_data: value,
      ad_personalization: value,
    };
  }

  function startGoogleTag() {
    if (tagStarted) return;
    tagStarted = true;
    window.gtag('js', new Date());
    window.gtag('config', TAG_ID);

    if (!PRODUCTION_HOSTS.has(window.location.hostname)) return;
    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${TAG_ID}"]`)) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${TAG_ID}`;
    document.head.appendChild(script);
  }

  function syncBookingLinks() {
    document.querySelectorAll('a[href]').forEach((link) => {
      try {
        const url = new URL(link.href, window.location.href);
        if (url.hostname !== BOOKING_HOST) return;
        if (decision) url.searchParams.set(CONSENT_PARAM, decision);
        else url.searchParams.delete(CONSENT_PARAM);
        link.href = url.toString();
      } catch (error) {
        // Ignore malformed or non-HTTP links.
      }
    });
  }

  function hideBanner() {
    document.getElementById('damtjern-consent-banner')?.remove();
    const settings = document.getElementById('damtjern-consent-settings');
    if (settings) settings.hidden = false;
  }

  function applyDecision(value, announce = true) {
    decision = validDecision(value) || DENIED;
    storeDecision(decision);
    window.gtag('consent', 'update', consentState(decision));

    if (decision === GRANTED) {
      startGoogleTag();
      if (announce) window.dispatchEvent(new CustomEvent('damtjern:tracking-granted'));
    }

    syncBookingLinks();
    hideBanner();
  }

  function installStyles() {
    if (document.getElementById('damtjern-consent-styles')) return;
    const style = document.createElement('style');
    style.id = 'damtjern-consent-styles';
    style.textContent = `
      #damtjern-consent-banner{position:fixed;z-index:2147483000;left:16px;right:16px;bottom:16px;max-width:760px;margin:auto;padding:20px;background:#fff;color:#153127;border:1px solid #d9e4de;border-radius:18px;box-shadow:0 18px 55px rgba(10,35,26,.24);font-family:Inter,system-ui,-apple-system,sans-serif;line-height:1.45}
      #damtjern-consent-banner h2{margin:0 0 7px;font-size:20px;line-height:1.2}
      #damtjern-consent-banner p{margin:0;color:#52645c;font-size:14px}
      #damtjern-consent-banner .damtjern-consent-actions{display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap;margin-top:16px}
      #damtjern-consent-banner button,#damtjern-consent-settings{border:0;border-radius:999px;padding:10px 16px;font:700 14px/1.2 Inter,system-ui,-apple-system,sans-serif;cursor:pointer}
      #damtjern-consent-banner [data-consent="deny"]{background:#e8eeeb;color:#153127}
      #damtjern-consent-banner [data-consent="grant"]{background:#237453;color:#fff}
      #damtjern-consent-settings{position:fixed;z-index:2147482999;left:12px;bottom:12px;padding:8px 12px;background:#fff;color:#153127;border:1px solid #cbd9d2;box-shadow:0 5px 18px rgba(10,35,26,.14);font-size:12px}
      #damtjern-consent-banner button:focus-visible,#damtjern-consent-settings:focus-visible{outline:3px solid rgba(35,116,83,.35);outline-offset:2px}
      @media(max-width:560px){#damtjern-consent-banner{left:10px;right:10px;bottom:10px;padding:17px}#damtjern-consent-banner .damtjern-consent-actions{display:grid;grid-template-columns:1fr 1fr}#damtjern-consent-banner button{width:100%}}
    `;
    document.head.appendChild(style);
  }

  function showBanner() {
    installStyles();
    document.getElementById('damtjern-consent-banner')?.remove();

    const banner = document.createElement('section');
    banner.id = 'damtjern-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'true');
    banner.setAttribute('aria-labelledby', 'damtjern-consent-title');
    banner.innerHTML = `
      <h2 id="damtjern-consent-title">Personvernvalg</h2>
      <p>Vi bruker valgfrie måle- og annonsekapsler for å se om Google-annonsene fører til bookinger. Avslag påvirker ikke nettsiden eller muligheten til å bestille. Du kan endre valget senere via «Personvernvalg».</p>
      <div class="damtjern-consent-actions">
        <button type="button" data-consent="deny">Avslå</button>
        <button type="button" data-consent="grant">Godta</button>
      </div>
    `;
    banner.querySelector('[data-consent="deny"]').addEventListener('click', () => applyDecision(DENIED));
    banner.querySelector('[data-consent="grant"]').addEventListener('click', () => applyDecision(GRANTED));
    document.body.appendChild(banner);

    const settings = document.getElementById('damtjern-consent-settings');
    if (settings) settings.hidden = true;
    banner.querySelector('[data-consent="grant"]').focus({ preventScroll: true });
  }

  function mountControls() {
    installStyles();
    let settings = document.getElementById('damtjern-consent-settings');
    if (!settings) {
      settings = document.createElement('button');
      settings.id = 'damtjern-consent-settings';
      settings.type = 'button';
      settings.textContent = 'Personvernvalg';
      settings.setAttribute('aria-haspopup', 'dialog');
      settings.addEventListener('click', showBanner);
      document.body.appendChild(settings);
    }
    syncBookingLinks();
    if (!decision) showBanner();
  }

  window.DamtjernTracking = Object.freeze({
    getDecision: () => decision,
    hasConsent: () => decision === GRANTED,
    openSettings: showBanner,
  });

  if (decision) applyDecision(decision, false);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountControls, { once: true });
  } else {
    mountControls();
  }
})();
