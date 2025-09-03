/**
 * Data Transfer Object para Producto
 */
export class ProductDTO {
    constructor(product) {
        this.id = product._id;
        this.title = product.title;
        this.description = product.description;
        this.code = product.code;
        this.price = product.price;
        this.stock = product.stock;
        this.category = product.category;
        this.thumbnails = product.thumbnails || [];
    }

    static fromProduct(product) {
        if (!product) return null;
        return new ProductDTO(product);
    }

    static fromProducts(products) {
        return products.map(product => new ProductDTO(product));
    }
}

/**
 * DTO simplificado para listas de productos
 */
export class ProductListDTO {
    constructor(product) {
        this.id = product._id;
        this.title = product.title;
        this.price = product.price;
        this.category = product.category;
        this.stock = product.stock;
        this.thumbnails = product.thumbnails?.[0] || null; // Solo primera imagen
    }

    static fromProducts(products) {
        return products.map(product => new ProductListDTO(product));
    }
}

/**
 * DTO para carrito (solo info básica del producto)
 */
export class ProductCartDTO {
    constructor(product) {
        this.id = product._id;
        this.title = product.title;
        this.price = product.price;
        this.stock = product.stock;
    }

    static fromProduct(product) {
        if (!product) return null;
        return new ProductCartDTO(product);
    }
}