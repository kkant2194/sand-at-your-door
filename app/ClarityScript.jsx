import Script from "next/script";

export default function ClarityScript() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  const enableOnLocalhost = process.env.NEXT_PUBLIC_ENABLE_CLARITY_ON_LOCALHOST === "true";

  if (!projectId) return null;

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          if (c.location.pathname.startsWith("/admin")) return;
          if (!${JSON.stringify(enableOnLocalhost)} && ["localhost", "127.0.0.1"].includes(c.location.hostname)) return;
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", ${JSON.stringify(projectId)});
      `}
    </Script>
  );
}
