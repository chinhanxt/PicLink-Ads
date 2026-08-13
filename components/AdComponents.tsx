'use client';

import React, { useEffect, useRef } from 'react';

export const DIRECT_LINK_URL = 'https://www.effectivecpmnetwork.com/jczniw4qk?key=9083731f51eaa7f78478fe19b3f395f3';

export function triggerDirectLinkAd() {
  if (typeof window === 'undefined') return;
  try {
    const adWin = window.open(DIRECT_LINK_URL, '_blank');
    if (adWin) {
      try {
        adWin.blur();
        window.focus();
      } catch (e) {}
    }
  } catch (err) {
    console.log('[Adsterra] Direct link blocked:', err);
  }
}

/** 1. Popunder & Social Bar scripts injector (Global) */
export function AdsterraPopunderInjector() {
  useEffect(() => {
    const scripts = [
      'https://pl30830126.effectivecpmnetwork.com/16/b8/35/16b8351a1bbdde1b816aa6cfd5d788a4.js',
      'https://pl30830129.effectivecpmnetwork.com/80/2c/31/802c318ff1927b4621d18fff520f770c.js',
    ];

    scripts.forEach((src) => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        document.head.appendChild(s);
      }
    });
  }, []);

  return null;
}

/** 2. Native Ad Banner (container-4004ae1af2f5bcbeb988daa86280d559) */
export function AdsterraNativeBanner() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://pl30830127.effectivecpmnetwork.com/4004ae1af2f5bcbeb988daa86280d559/invoke.js';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');

    const adDiv = document.createElement('div');
    adDiv.id = 'container-4004ae1af2f5bcbeb988daa86280d559';

    containerRef.current.appendChild(script);
    containerRef.current.appendChild(adDiv);
  }, []);

  return (
    <div style={{ width: '100%', margin: '12px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', overflowX: 'auto' }}>
      <div ref={containerRef} style={{ minHeight: '60px' }} />
    </div>
  );
}

/** 3. Leaderboard 728x90 Banner */
export function AdsterraLeaderboardBanner() {
  const desktopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (desktopRef.current) {
      desktopRef.current.innerHTML = '';
      const confScript = document.createElement('script');
      confScript.type = 'text/javascript';
      confScript.text = `
        atOptions = {
          'key' : '63394116e0ff81449dc819d74916dfc9',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = 'https://www.highperformanceformat.com/63394116e0ff81449dc819d74916dfc9/invoke.js';
      desktopRef.current.appendChild(confScript);
      desktopRef.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '10px 0' }}>
      <div style={{ width: '728px', height: '90px', maxWidth: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div ref={desktopRef} style={{ width: '728px', height: '90px' }} />
      </div>
    </div>
  );
}

/** 4. Mobile Banner 320x50 */
export function AdsterraMobileBanner() {
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mobileRef.current) {
      mobileRef.current.innerHTML = '';
      const confScriptM = document.createElement('script');
      confScriptM.type = 'text/javascript';
      confScriptM.text = `
        atOptions = {
          'key' : '63743d776689e84339b0b9819eb088db',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };
      `;
      const invokeScriptM = document.createElement('script');
      invokeScriptM.type = 'text/javascript';
      invokeScriptM.src = 'https://www.highperformanceformat.com/63743d776689e84339b0b9819eb088db/invoke.js';
      mobileRef.current.appendChild(confScriptM);
      mobileRef.current.appendChild(invokeScriptM);
    }
  }, []);

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '8px 0' }}>
      <div style={{ width: '320px', height: '50px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div ref={mobileRef} style={{ width: '320px', height: '50px' }} />
      </div>
    </div>
  );
}

/** 5. Banner 468x60 */
export function Adsterra468x60Banner() {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current) return;
    bannerRef.current.innerHTML = '';

    const confScript = document.createElement('script');
    confScript.type = 'text/javascript';
    confScript.text = `
      atOptions = {
        'key' : 'b07e91a9eb07b41a0077fc1fcb9b3194',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
    `;
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = 'https://www.highperformanceformat.com/b07e91a9eb07b41a0077fc1fcb9b3194/invoke.js';

    bannerRef.current.appendChild(confScript);
    bannerRef.current.appendChild(invokeScript);
  }, []);

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '10px 0', overflow: 'hidden' }}>
      <div ref={bannerRef} style={{ width: '468px', height: '60px', maxWidth: '100%' }} />
    </div>
  );
}

/** 6. Banner 300x250 Medium Rectangle */
export function Adsterra300x250Banner() {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current) return;
    bannerRef.current.innerHTML = '';

    const confScript = document.createElement('script');
    confScript.type = 'text/javascript';
    confScript.text = `
      atOptions = {
        'key' : 'd5bf407d04057f1bbd0336a0ffddc3be',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = 'https://www.highperformanceformat.com/d5bf407d04057f1bbd0336a0ffddc3be/invoke.js';

    bannerRef.current.appendChild(confScript);
    bannerRef.current.appendChild(invokeScript);
  }, []);

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '14px 0', overflow: 'hidden' }}>
      <div ref={bannerRef} style={{ width: '300px', height: '250px' }} />
    </div>
  );
}

/** 7. Skyscraper 160x600 Banner */
export function Adsterra160x600Banner() {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current) return;
    bannerRef.current.innerHTML = '';

    const confScript = document.createElement('script');
    confScript.type = 'text/javascript';
    confScript.text = `
      atOptions = {
        'key' : '96fcfbddabbb4fa0365093851845a93a',
        'format' : 'iframe',
        'height' : 600,
        'width' : 160,
        'params' : {}
      };
    `;
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = 'https://www.highperformanceformat.com/96fcfbddabbb4fa0365093851845a93a/invoke.js';

    bannerRef.current.appendChild(confScript);
    bannerRef.current.appendChild(invokeScript);
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '10px 0', overflow: 'hidden' }}>
      <div ref={bannerRef} style={{ width: '160px', height: '600px' }} />
    </div>
  );
}

/** 8. Skyscraper 160x300 Banner */
export function Adsterra160x300Banner() {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current) return;
    bannerRef.current.innerHTML = '';

    const confScript = document.createElement('script');
    confScript.type = 'text/javascript';
    confScript.text = `
      atOptions = {
        'key' : 'f0950b2a147069648584ac6e3f5686e9',
        'format' : 'iframe',
        'height' : 300,
        'width' : 160,
        'params' : {}
      };
    `;
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = 'https://www.highperformanceformat.com/f0950b2a147069648584ac6e3f5686e9/invoke.js';

    bannerRef.current.appendChild(confScript);
    bannerRef.current.appendChild(invokeScript);
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '10px 0', overflow: 'hidden' }}>
      <div ref={bannerRef} style={{ width: '160px', height: '300px' }} />
    </div>
  );
}
