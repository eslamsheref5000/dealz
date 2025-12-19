import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/profile/', '/inbox/', '/post-ad/'], // Private routes
        },
        sitemap: 'https://dealz-market.vercel.app/sitemap.xml',
    };
}
