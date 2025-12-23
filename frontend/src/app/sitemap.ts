import { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Base routes
    const routes: MetadataRoute.Sitemap = [
        {
            url: 'https://dealz-market.vercel.app',
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 1,
        },
        {
            url: 'https://dealz-market.vercel.app/login',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: 'https://dealz-market.vercel.app/register',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: 'https://dealz-market.vercel.app/post-ad',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
    ];

    try {
        try {
            // Fetch Products for dynamic routes
            // Limit to 100 for now to avoid huge build times
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

            try {
                const res = await fetch(`${API_URL}/api/products?fields[0]=slug&fields[1]=updatedAt&pagination[limit]=100&sort[0]=updatedAt:desc`, {
                    next: { revalidate: 60 },
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!res.ok) {
                    console.warn(`Sitemap fetch failed: ${res.status} ${res.statusText}`);
                    return routes;
                }

                const text = await res.text();
                try {
                    const data = JSON.parse(text);
                    const products = data.data?.map((product: any) => ({
                        url: `https://dealz-market.vercel.app/product/${product.slug || product.documentId}`,
                        lastModified: new Date(product.updatedAt),
                        changeFrequency: 'weekly' as const,
                        priority: 0.8,
                    })) || [];

                    return [...routes, ...products];
                } catch (jsonError) {
                    console.warn("Sitemap: API returned non-JSON response.");
                    return routes;
                }
            } catch (fetchError) {
                clearTimeout(timeoutId);
                console.warn("Sitemap: API fetch timed out or failed. Returning base routes.");
                return routes;
            }

            const text = await res.text();
            try {
                const data = JSON.parse(text);
                const products = data.data?.map((product: any) => ({
                    url: `https://dealz-market.vercel.app/product/${product.slug || product.documentId}`,
                    lastModified: new Date(product.updatedAt),
                    changeFrequency: 'weekly' as const,
                    priority: 0.8,
                })) || [];

                return [...routes, ...products];
            } catch (jsonError) {
                console.warn("Sitemap: API returned non-JSON response (likely HTML error page). Returning base routes.");
                return routes;
            }

        } catch (error) {
            console.error("Sitemap generation failed:", error);
            return routes;
        }
    }
