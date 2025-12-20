
import { Metadata } from "next";
import ProductDetailsClient from "../../../components/ProductDetailsClient";
import { countries } from "../../../context/CountryContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';

async function getProduct(slug: string) {
    const res = await fetch(`${API_URL}/api/products?filters[slug][$eq]=${slug}&populate=*`, { cache: 'no-store' });
    const data = await res.json();
    return data.data?.[0] || null;
}

async function getRelatedProducts(categoryId: number, currentId: number) {
    if (!categoryId) return [];
    try {
        const res = await fetch(`${API_URL}/api/products?filters[category][id][$eq]=${categoryId}&filters[documentId][$ne]=${currentId}&populate=*&pagination[limit]=4`, { next: { revalidate: 3600 } });
        const data = await res.json();
        return data.data || [];
    } catch (e) {
        return [];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return {
            title: 'Product Not Found | Dealz',
            description: 'The requested product could not be found.'
        };
    }

    const price = `${product.price.toLocaleString()} ${countries.find(c => c.id === product.country)?.currency || 'AED'}`;
    const imageUrl = product.images?.[0]?.url.startsWith('http')
        ? product.images[0].url
        : `${API_URL}${product.images?.[0]?.url}`;

    return {
        title: `${product.title} - ${price} | Dealz`,
        description: `${product.description.substring(0, 160)}... Buy ${product.title} in ${product.city} for ${price}.`,
        openGraph: {
            title: `${product.title} - ${price}`,
            description: product.description.substring(0, 200),
            images: [imageUrl],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product.title} - ${price}`,
            description: product.description.substring(0, 200),
            images: [imageUrl],
        }
    };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await getProduct(slug);
    const relatedProducts = product ? await getRelatedProducts(product.category?.id, product.documentId || product.id) : [];

    return (
        <>
            {/* JSON-LD Structured Data (Server Side) */}
            {product && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org/",
                            "@type": "Product",
                            "name": product.title,
                            "image": product.images?.map((img: any) => img.url.startsWith('http') ? img.url : `${API_URL}${img.url}`),
                            "description": product.description,
                            "offers": {
                                "@type": "Offer",
                                "url": `https://dealz-market.vercel.app/product/${product.slug || product.documentId}`,
                                "priceCurrency": countries.find(c => c.id === product.country)?.currency || "AED",
                                "price": product.price,
                                "availability": "https://schema.org/InStock",
                                "itemCondition": "https://schema.org/UsedCondition"
                            }
                        })
                    }}
                />
            )}

            <ProductDetailsClient product={product} relatedProducts={relatedProducts} />
        </>
    );
}
