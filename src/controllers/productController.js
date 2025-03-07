const Product = require("../models/Product");
const Category = require("../models/Category");
const fs = require("fs").promises;
const path = require("path");

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.status(200).json(products);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, price, description, stock, category } = req.body;
    const findCategory = await Category.findOne({ slug: category });

    if (!findCategory) {
      return res.status(400).json({ message: "Category not found" });
    }

    const savedProduct = await Product.create({
      name,
      price,
      description,
      stock,
      category,
    });

    return res.status(201).json(savedProduct);
  } catch (error) {
    console.log(error);
  }
};

const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(
      req.params.productId
    );

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(204).send();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ category: categoryId }).populate(
      "category"
    );

    if (!products.length) {
      return res.status(404).json({ message: "Products not found" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.log(error);
  }
};

// ...existing code...

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
    });
  }
};

const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Lütfen bir görsel yükleyin." });
    }

    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      // Delete uploaded file
      await fs.unlink(req.file.path);
      return res.status(404).json({ message: "Ürün bulunamadı." });
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
      message: "Görsel başarıyla yüklendi.",
      image: product.image,
      imageUrl: imageUrl,
    });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path);
    }
    res.status(500).json({
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
