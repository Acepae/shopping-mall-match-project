export interface Product {
    id: string;
    name: string;
    price: string;
    category: string;
    image: string;
    description: string;
    images: string[];
}

const BASE_PRODUCTS: Product[] = [
    {
        id: "5",
        name: "Callaway TA Legacy Ball Cap",
        price: "₩30,680",
        category: "Accessories",
        image: "/cap.jpg",
        description: "A classic navy golf cap featuring the signature Callaway logo. Made with breathable fabric for comfort on and off the course. Perfect for completing your sporty daily look.",
        images: ["/cap.jpg", "/cap.jpg", "/cap.jpg"]
    },
    { id: "2", name: "Muted Lavender Knit", price: "₩89,000", image: "/p2.jpg", category: "Tops", description: "Soft knitwear.", images: ["/p2.jpg"] },
    { id: "3", name: "Dusty Rose Pleated Skirt", price: "₩129,000", image: "/p3.jpg", category: "Bottoms", description: "Elegant pleated skirt.", images: ["/p3.jpg"] },
    { id: "4", name: "Charcoal Wool Coat", price: "₩349,000", image: "/p4.jpg", category: "Outerwear", description: "Premium wool coat.", images: ["/p4.jpg"] },
    { id: "6", name: "Classic White Tee", price: "₩45,000", image: "/p6.jpg", category: "Tops", description: "Essential cotton t-shirt for everyday wear.", images: ["/p6.jpg"] },
];

// Generate 24 more items (Total 30)
const MORE_PRODUCTS: Product[] = Array.from({ length: 24 }).map((_, i) => ({
    id: `${i + 7}`, // Starts from 7
    name: `Premium Collection Item ${i + 1}`,
    price: `₩${(Math.floor(Math.random() * 20) + 3) * 10},000`,
    category: ["Tops", "Bottoms", "Outerwear", "Accessories"][Math.floor(Math.random() * 4)],
    image: `/p${i + 7}.jpg`,
    description: "Part of our new premium collection. High quality materials and modern design.",
    images: [`/p${i + 7}.jpg`]
}));

export const PRODUCTS: Product[] = [...BASE_PRODUCTS, ...MORE_PRODUCTS];
