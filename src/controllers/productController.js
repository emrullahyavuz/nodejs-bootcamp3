const Product = require("../models/Product");
const Category = require("../models/Category");
const ApiFeatures = require("../utils/apiFeatures");
const fs = require("fs").promises;
const path = require("path");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Tüm ürünleri getiren ve arama, sayfalama özellikleri sunan fonksiyon
 * @param {Object} req - Express istek nesnesi
 * @param {Object} res - Express yanıt nesnesi 
 */
const getAllProducts = async (req, res) => {
  try {
    // Query oluştur
    const features = new ApiFeatures(Product.find().populate("category"), req.query)
      .search()
      .filter()
      .sort();
    
    // Sayfalama bilgisi için kopya query oluştur
    const paginationFeatures = new ApiFeatures(Product.find(), req.query)
      .search()
      .filter();
      
    // Toplam ürün sayısını bul
    const total = await Product.countDocuments(paginationFeatures.query.getFilter());
      
    // Sayfalama uygula
    features.paginate();
    
    // Sorguyu çalıştır
    const products = await features.query;
    
    // Sayfalama bilgisi
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pagination: {
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      },
      data: products
    });
  } catch (error) {
    console.error("Ürünleri getirme hatası:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Sunucu hatası",
      error: error.message
    });
  }
};

/**
 * Yeni ürün oluşturan fonksiyon
 * @param {Object} req - Express istek nesnesi
 * @param {Object} res - Express yanıt nesnesi 
 */
const createProduct = async (req, res) => {
  try {
    const { name, price, description, stock, category } = req.body;
    const findCategory = await Category.findById(category);

    if (!findCategory) {
      return res.status(400).json({ 
        success: false,
        message: "Kategori bulunamadı" 
      });
    }

    const savedProduct = await Product.create({
      name,
      price,
      description,
      stock,
      category,
    });

    return res.status(201).json({
      success: true,
      data: savedProduct
    });
  } catch (error) {
    console.error("Ürün oluşturma hatası:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Sunucu hatası",
      error: error.message
    });
  }
};

/**
 * Ürün güncelleyen fonksiyon
 * @param {Object} req - Express istek nesnesi
 * @param {Object} res - Express yanıt nesnesi 
 */
const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ 
        success: false,
        message: "Ürün bulunamadı" 
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    console.error("Ürün güncelleme hatası:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Sunucu hatası",
      error: error.message
    });
  }
};

/**
 * Ürün silen fonksiyon
 * @param {Object} req - Express istek nesnesi
 * @param {Object} res - Express yanıt nesnesi 
 */
const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(
      req.params.productId
    );

    if (!deletedProduct) {
      return res.status(404).json({ 
        success: false,
        message: "Ürün bulunamadı" 
      });
    }

    // Eğer ürün resmi varsa sil
    if (deletedProduct.image) {
      const imagePath = path.join(__dirname, "..", deletedProduct.image);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.error("Görsel silinirken hata oluştu:", err);
      }
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Ürün silme hatası:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Sunucu hatası",
      error: error.message
    });
  }
};

/**
 * Kategoriye göre ürünleri getiren ve sayfalama özellikleri sunan fonksiyon
 * @param {Object} req - Express istek nesnesi
 * @param {Object} res - Express yanıt nesnesi 
 */
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    // Önce kategori varlığını kontrol et
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({ 
        success: false, 
        message: "Kategori bulunamadı" 
      });
    }
    
    // Kategori filtresini ekleyerek API Features'ı kullan
    req.query.category = categoryId;
    
    // Query oluştur
    const features = new ApiFeatures(Product.find().populate("category"), req.query)
      .search()
      .filter()
      .sort();
    
    // Toplam ürün sayısını bul
    const total = await Product.countDocuments(features.query.getFilter());
    
    // Sayfalama uygula
    features.paginate();
    
    // Sorguyu çalıştır
    const products = await features.query;
    
    // Eğer hiç ürün yoksa
    if (total === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Bu kategoride ürün bulunamadı" 
      });
    }
    
    // Sayfalama bilgisi
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pagination: {
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      },
      data: products
    });
  } catch (error) {
    console.error("Kategoriye göre ürün getirme hatası:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Sunucu hatası",
      error: error.message
    });
  }
};

/**
 * Slug ile ürün getiren fonksiyon
 * @param {Object} req - Express istek nesnesi
 * @param {Object} res - Express yanıt nesnesi 
 */
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findBySlug(req.params.slug);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Ürün bulunamadı",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Slug ile ürün bulma hatası:", error);
    return res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: error.message
    });
  }
};

/**
 * Ürün resmi yükleyen fonksiyon
 * @param {Object} req - Express istek nesnesi
 * @param {Object} res - Express yanıt nesnesi 
 */
const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "Lütfen bir görsel yükleyin." 
      });
    }

    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      // Delete uploaded file
      await fs.unlink(req.file.path);
      return res.status(404).json({ 
        success: false,
        message: "Ürün bulunamadı." 
      });
    }

    // Delete old image if exists
    if (product.image) {
      const oldImagePath = path.join(__dirname, "..", product.image);
      try {
        await fs.unlink(oldImagePath);
      } catch (error) {
        console.error("Eski görsel silinirken hata oluştu:", error);
      }
    }

    // Update image path (relative to uploads directory)
    const relativePath = path.relative(
      path.join(__dirname, ".."),
      req.file.path
    );
    product.image = relativePath;
    await product.save();

    // Generate image URL
    const imageUrl = `${req.protocol}://${req.get(
      "host"
    )}/${relativePath.replace(/\\/g, "/")}`;

    res.status(200).json({
      success: true,
      message: "Görsel başarıyla yüklendi.",
      data: {
        image: product.image,
        imageUrl: imageUrl
      }
    });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: "Görsel yüklenirken bir hata oluştu.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductBySlug,
  uploadProductImage,
};
