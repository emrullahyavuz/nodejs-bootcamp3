const Category = require("../models/Category");
const fs = require("fs").promises;
const path = require("path");

const getAllCategories = async (req, res) => {
  try {
    const categorys = await Category.find();
    res.status(200).json(categorys);
  } catch (error) {
    console.log(error);
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const savedCategory = await Category.create({
      name,
      description,
    });

    res.status(201).json(savedCategory);
  } catch (error) {
    console.log(error);
  }
};

const updateCategory = async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(204).json({ message: "Category deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findBySlug(req.params.slug);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori bulunamadı",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Slug ile kategori bulma hatası:", error);
    return res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
};

const uploadCategoryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Lütfen bir görsel yükleyin." });
    }

    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      // Delete uploaded file
      await fs.unlink(req.file.path);
      return res.status(404).json({ message: "Kategori bulunamadı." });
    }

    // Delete old image if exists
    if (category.image) {
      const oldImagePath = path.join(__dirname, "..", category.image);
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
    category.image = relativePath;
    await category.save();

    // Generate image URL
    const imageUrl = `${req.protocol}://${req.get(
      "host"
    )}/${relativePath.replace(/\\/g, "/")}`;

    res.status(200).json({
      message: "Görsel başarıyla yüklendi.",
      image: category.image,
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
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryBySlug,
  uploadCategoryImage
};
