import Link from "next/link";

interface BreadcrumbItem {
    label: string;
    href?: string; // Optional, last item is usually not clickable
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav className="flex text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3 rtl:space-x-reverse">
                <li className="inline-flex items-center">
                    <Link href="/" className="inline-flex items-center hover:text-red-600 transition">
                        🏠 Home
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index} className="inline-flex items-center">
                        <span className="mx-2 text-gray-400">/</span>
                        {item.href ? (
                            <Link href={item.href} className="hover:text-red-600 transition font-medium">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-gray-900 dark:text-gray-100 font-semibold">{item.label}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
