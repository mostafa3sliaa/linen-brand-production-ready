"use client";
import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function PixelScripts() {
  const [settings, setSettings] = useState({
    fbPixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || '1726555298615011',
    tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || 'D9INTRJC77U820ARL2J0',
    snapPixelId: ''
  });

  useEffect(() => {
    // Fetch live settings dynamically
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data?.settings) {
          const s = data.settings;
          setSettings(prev => ({
            fbPixelId: s.fbPixelId || prev.fbPixelId,
            tiktokPixelId: s.tiktokPixelId || prev.tiktokPixelId,
            snapPixelId: s.snapPixelId || prev.snapPixelId
          }));

          // Trigger init for FB if initialized after window load
          if (s.fbPixelId && typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('init', s.fbPixelId);
            (window as any).fbq('track', 'PageView');
          }

          // Trigger init for TikTok if loaded
          if (s.tiktokPixelId && typeof window !== 'undefined' && (window as any).ttq) {
            (window as any).ttq.load(s.tiktokPixelId);
            (window as any).ttq.page();
          }
        }
      })
      .catch(err => console.warn("Could not fetch live pixel settings:", err));
  }, []);

  return (
    <>
      {/* Facebook Pixel */}
      {settings.fbPixelId && (
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${settings.fbPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* TikTok Pixel */}
      {settings.tiktokPixelId && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._iq||{},n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=i+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                ttq.load('${settings.tiktokPixelId}');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}
    </>
  );
}

