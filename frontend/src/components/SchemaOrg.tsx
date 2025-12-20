import Script from "next/script";

export default function SchemaOrg() {
    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": "https://dealz-market.vercel.app/#organization",
                "name": "Dealz",
                "url": "https://dealz-market.vercel.app",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://dealz-market.vercel.app/logo.png",
                    "width": 512,
                    "height": 512
                },
                "sameAs": [
                    "https://facebook.com/dealz",
                    "https://twitter.com/dealz",
                    "https://instagram.com/dealz"
                ]
            },
            {
                "@type": "WebSite",
                "@id": "https://dealz-market.vercel.app/#website",
                "url": "https://dealz-market.vercel.app",
                "name": "Dealz Marketplace",
                "publisher": {
                    "@id": "https://dealz-market.vercel.app/#organization"
                },
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://dealz-market.vercel.app/?query={search_term_string}",
                    "query-input": "required name=search_term_string"
                }
            }
        ]
    };

    return (
        <Script
            id="schema-org"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            strategy="afterInteractive"
        />
    );
}
