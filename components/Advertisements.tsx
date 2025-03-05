
'use client';

import Script from 'next/script';

export function AdBannerWide() {
  return (
    <div className="ad-container my-4 flex justify-center">
      <Script id="ad-script-1" strategy="afterInteractive">
        {`
          atOptions = {
            'key' : '4d666fdf93d80a362fcea5a1cec89670',
            'format' : 'iframe',
            'height' : 300,
            'width' : 160,
            'params' : {}
          };
          document.write('<scr'+'ipt type="text/javascript" src="//www.highperformanceformat.com/4d666fdf93d80a362fcea5a1cec89670/invoke.js"></scr'+'ipt>');
        `}
      </Script>
    </div>
  );
}

export function AdBannerSecondary() {
  return (
    <div className="ad-container my-4 flex justify-center">
      <Script id="ad-script-2" strategy="afterInteractive">
        {`
          (function() {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = '//pl25991753.effectiveratecpm.com/e9/a1/55/e9a155569b7769daf0102e8639509723.js';
            document.head.appendChild(script);
          })();
        `}
      </Script>
    </div>
  );
}
