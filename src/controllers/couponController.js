const Coupon = require("../models/Coupon");
const Product = require("../models/Product");
const Category = require("../models/Category");
const ApiFeatures = require("../utils/apiFeatures");

/**
 * Tüm kuponları getiren fonksiyon
 * @param {Object} req - Express istek nesnesi
 * @param {Object} res - Express yanıt nesnesi 
 */
const getAllCoupons = async (req, res) => {
  try {
    // Query oluştur
    const features = new ApiFeatures(Coupon.find(), req.query)
      .search("code")
      .filter()
      .sort();
    
    // Sayfalama bilgisi için kopya query oluştur
    const paginationFeatures = new ApiFeatures(Coupon.find(), req.query)
      .search("code")
      .filter();
      
    // Toplam kupon sayısını bul
    const total = await Coupon.countDocuments(paginationFeatures.query.getFilter());
      
    // Sayfalama uygula
    features.paginate();
    
    // Sorguyu çalıştır
    const coupons = await features.query;
    
    // Sayfalama bilgisi
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.status(200).json({
      success: true,
      count: coupons.length,
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
      data: coupons
    });
  } catch (error) {
    console.error("Kuponları getirme hatası:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Sunucu hatası",
      error: error.message
    });
  }
};

/**
 * Kupon detayını getiren fonksiyon
 * @param {Object} req - Express istek nesnesi
 * @param {Object} res - Express yanıt nesnesi 
 */
const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate("applicableProducts")
      .populate("applicableCategories");

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Kupon bulunamadı"
      });
    }

    res.status(200).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error("Kupon getirme hatası:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Sunucu hatası",
      error: error.message
    });
  }
};

/**
 * Kupon kodu ile kupon bulan fonksiyon
 * @param {Object} req - Express istek nesnesi
 * @param {Object} res - Express yanıt nesnesi 
 */
const getCouponByCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Kupon bulunamadı veya aktif değil"
      });
    }

    // Kupon geçerliliğini kontrol et
    const validationResult = coupon.isValid();
    
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        message: validationResult.message
      });
    }

    res.status(200).json({
      success: true,
      data: coupon,
      message: "Kupon geçerli"
    });
  } catch (error) {
    console.error("Kupon getirme hatası:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Sunucu hatası",
      error: error.message
    });
  }
};

/**
 * Kuponun sepet için geçerliliğini ve indirim tutarını hesaplayan fonksiyon
 * @param {Object} req - Express istek nesnesi
 * @param {Object} res - Express yanıt nesnesi 
 */
const validateCoupon = async (req, res) => {
  try {
    const { code, cart } = req.body;
    
    if (!code || !cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz istek formatı. Kod ve sepet ürünleri gerekli"
      });
    }
    
    // Kupon kodunu bul
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Kupon bulunamadı veya aktif değil"
      });
    }

    // Kupon geçerliliğini kontrol et
    const validationResult = coupon.isValid();
    
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        message: validationResult.message
      });
    }
    
    // Sepetteki ürünleri ve toplam tutarı hesapla
    let totalAmount = 0;
    let applicableAmount = 0;
    let productIds = [];
    let categoryIds = [];

    // Sepetteki ürün ID'lerini topla
    for (const item of cart) {
      if (!item.productId || !item.quantity || !item.price) {
        continue;
      }
      
      const itemTotal = item.price * item.quantity;
      totalAmount += itemTotal;
      productIds.push(item.productId);
    }
    
    // Kuponun belirli ürünlere veya kategorilere uygulanabilir olup olmadığını kontrol et
    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      // Ürünlerin detaylarını getir
      const products = await Product.find({
        _id: { $in: productIds }
      });
      
      // Uygulanabilir ürünleri hesapla
      for (const item of cart) {
        const product = products.find(p => p._id.toString() === item.productId);
        
        if (product && coupon.applicableProducts.includes(product._id)) {
          applicableAmount += item.price * item.quantity;
        }
      }
    } else if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      // Ürünlerin detaylarını getir
      const products = await Product.find({
        _id: { $in: productIds }
      }).populate('category');
      
      // Uygulanabilir kategorileri hesapla
      for (const item of cart) {
        const product = products.find(p => p._id.toString() === item.productId);
        
        if (product && coupon.applicableCategories.includes(product.category._id)) {
          applicableAmount += item.price * item.quantity;
        }
      }
    } else {
      // Tüm sepete uygulanabilir
      applicableAmount = totalAmount;
    }
    
    // İndirim tutarını hesapla
    const discountResult = coupon.calculateDiscount(applicableAmount);
    
    if (!discountResult.valid) {
      return res.status(400).json({
        success: false,
        message: discountResult.message
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        coupon,
        totalAmount,
        applicableAmount,
        discountAmount: discountResult.discount,
        finalAmount: totalAmount - discountResult.discount
      },
      message: "Kupon geçerli"
    });
    
  } catch (error) {
    console.error("Kupon doğrulama hatası:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Sunucu hatası",
      error: error.message
    });
  }
};

/**
 * Yeni kupon oluşturan fonksiyon
 * @param {Object} req - Express istek nesnesi
 * @param {Object} res - Express yanıt nesnesi 
 */
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      minPurchase,
      maxDiscount,
      startDate,
      endDate,
      usageLimit,
      isActive,
      applicableProducts,
      applicableCategories
    } = req.body;
    
    // Kupon kodu kontrolü
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Bu kupon kodu zaten kullanılıyor"
      });
    }
    
    // Kategori kontrolü
    if (applicableCategories && applicableCategories.length > 0) {
      const categoryCount = await Category.countDocuments({
        _id: { $in: applicableCategories }
      });
      
      if (categoryCount !== applicableCategories.length) {
        return res.status(400).json({
          success: false,
          message: "Bir veya daha fazla kategori bulunamadı"
        });
      }
    }
    
    // Ürün kontrolü
    if (applicableProducts && applicableProducts.length > 0) {
      const productCount = await Product.countDocuments({
        _id: { $in: applicableProducts }
      });
      
      if (productCount !== applicableProducts.length) {
        return res.status(400).json({
          success: false,
          message: "Bir veya daha fazla ürün bulunamadı"
        });
      }
    }
    
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value,
      minPurchase: minPurchase || 0,
      maxDiscount: maxDiscount || null,
      startDate: startDate || Date.now(),
      endDate,
      usageLimit: usageLimit || null,
      isActive: isActive !== undefined ? isActive : true,
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || []
    });
    
    res.status(201).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error("Kupon oluşturma hatası:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Sunucu hatası",
      error: error.message
    });
  }
};

/**
 * Kupon güncelleyen fonksiyon
 * @param {Object} req - Express istek nesnesi
 * @param {Object} res - Express yanıt nesnesi 
 */
const updateCoupon = async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      minPurchase,
      maxDiscount,
      startDate,
      endDate,
      usageLimit,
      isActive,
      applicableProducts,
      applicableCategories
    } = req.body;
    
    // Kupon kodunu değiştiriyorsa benzersiz olup olmadığını kontrol et
    if (code) {
      const existingCoupon = await Coupon.findOne({ 
        code: code.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: "Bu kupon kodu zaten kullanılıyor"
        });
      }
    }
    
    // Kategori kontrolü
    if (applicableCategories && applicableCategories.length > 0) {
      const categoryCount = await Category.countDocuments({
        _id: { $in: applicableCategories }
      });
      
      if (categoryCount !== applicableCategories.length) {
        return res.status(400).json({
          success: false,
          message: "Bir veya daha fazla kategori bulunamadı"
        });
      }
    }
    
    // Ürün kontrolü
    if (applicableProducts && applicableProducts.length > 0) {
      const productCount = await Product.countDocuments({
        _id: { $in: applicableProducts }
      });
      
      if (productCount !== applicableProducts.length) {
        return res.status(400).json({
          success: false,
          message: "Bir veya daha fazla ürün bulunamadı"
        });
      }
    }
    
    const updateData = {};
    
    // Update data nesnesini oluştur (sadece değişen alanlar)
    if (code) updateData.code = code.toUpperCase();
    if (type) updateData.type = type;
    if (value !== undefined) updateData.value = value;
    if (minPurchase !== undefined) updateData.minPurchase = minPurchase;
    if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount;
    if (startDate) updateData.startDate = startDate;
    if (endDate) updateData.endDate = endDate;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (applicableProducts) updateData.applicableProducts = applicableProducts;
    if (applicableCategories) updateData.applicableCategories = applicableCategories;
    
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedCoupon) {
      return res.status(404).json({
        success: false,
        message: "Kupon bulunamadı"
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedCoupon
    });
  } catch (error) {
    console.error("Kupon güncelleme hatası:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Sunucu hatası",
      error: error.message
    });
  }
};

/**
 * Kupon silen fonksiyon
 * @param {Object} req - Express istek nesnesi
 * @param {Object} res - Express yanıt nesnesi 
 */
const deleteCoupon = async (req, res) => {
  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
    
    if (!deletedCoupon) {
      return res.status(404).json({
        success: false,
        message: "Kupon bulunamadı"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Kupon başarıyla silindi"
    });
  } catch (error) {
    console.error("Kupon silme hatası:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Sunucu hatası",
      error: error.message
    });
  }
};

/**
 * Kupon kullanım sayısını artıran fonksiyon
 * @param {Object} req - Express istek nesnesi
 * @param {Object} res - Express yanıt nesnesi 
 */
const incrementCouponUsage = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Kupon kodu gerekli"
      });
    }
    
    const coupon = await Coupon.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usageCount: 1 } },
      { new: true }
    );
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Kupon bulunamadı"
      });
    }
    
    res.status(200).json({
      success: true,
      data: coupon,
      message: "Kupon kullanım sayısı güncellendi"
    });
  } catch (error) {
    console.error("Kupon kullanım güncelleme hatası:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Sunucu hatası",
      error: error.message
    });
  }
};

module.exports = {
  getAllCoupons,
  getCouponById,
  getCouponByCode,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  incrementCouponUsage
}; 