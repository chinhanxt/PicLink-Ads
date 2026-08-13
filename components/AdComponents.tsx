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

/** 1. Popunder & Social Bar scripts injector */
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

/** 2. Native Ad Banner */
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
    <div className="w-full my-3 flex justify-center items-center overflow-x-auto">
      <div ref={containerRef} className="min-h-[60px]" />
    </div>
  );
}

/** 3. Leaderboard 728x90 (Desktop) / 320x50 (Mobile) */
export function AdsterraLeaderboardBanner() {
  const desktopRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

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
    <div className="w-full flex justify-center items-center my-2">
      <div className="hidden md:flex justify-center items-center w-[728px] h-[90px] overflow-hidden">
        <div ref={desktopRef} className="w-[728px] h-[90px]" />
      </div>
      <div className="flex md:hidden justify-center items-center w-[320px] h-[50px] overflow-hidden">
        <div ref={mobileRef} className="w-[320px] h-[50px]" />
      </div>
    </div>
  );
}

/** 4. Banner 468x60 */
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
    <div className="flex justify-center items-center my-2 overflow-hidden max-w-full">
      <div ref={bannerRef} className="w-[468px] h-[60px]" />
    </div>
  );
}

/** 5. Banner 300x250 Medium Rectangle */
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
    <div className="flex justify-center items-center my-3 overflow-hidden">
      <div ref={bannerRef} className="w-[300px] h-[250px]" />
    </div>
  );
}

/** 6. Skyscraper 160x600 & 160x300 */
export function AdsterraSkyscraperBanner({ height = 600 }: { height?: 600 | 300 }) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const key = height === 600 ? '96fcfbddabbb4fa0365093851845a93a' : 'f0950b2a147069648584ac6e3f5686e9';

  useEffect(() => {
    if (!bannerRef.current) return;
    bannerRef.current.innerHTML = '';

    const confScript = document.createElement('script');
    confScript.type = 'text/javascript';
    confScript.text = `
      atOptions = {
        'key' : '${key}',
        'format' : 'iframe',
        'height' : ${height},
        'width' : 160,
        'params' : {}
      };
    `;
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = `https://www.highperformanceformat.com/${key}/invoke.js`;

    bannerRef.current.appendChild(confScript);
    bannerRef.current.appendChild(invokeScript);
  }, [height, key]);

  return (
    <div className="flex justify-center items-center my-2 overflow-hidden">
      <div ref={bannerRef} style={{ width: '160px', height: `${height}px` }} />
    </div>
  );
}
