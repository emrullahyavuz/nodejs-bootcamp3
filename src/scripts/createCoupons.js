const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { faker } = require('@faker-js/faker/locale/tr');
const dotenv = require('dotenv');
dotenv.config();

// Örnek kupon kodları oluşturacak fonksiyon
const generateCouponCode = (prefix) => {
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}${randomPart}`;
};

// MongoDB bağlantısı
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Bağlantısı Kuruldu: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Hata: ${error.message}`);
    process.exit(1);
  }
};

// Tüm kuponları temizle
const clearCoupons = async () => {
  try {
    await Coupon.deleteMany({});
    console.log('Tüm kuponlar silindi');
  } catch (error) {
    console.error(`Kuponları silme hatası: ${error.message}`);
  }
};

// Rastgele tarih oluşturma (bugünden itibaren belirli gün ekleyerek)
const getRandomFutureDate = (daysToAdd) => {
  const result = new Date();
  result.setDate(result.getDate() + daysToAdd);
  return result;
};

// Rassal tarih aralığı oluşturma
const getRandomDateRange = () => {
  // Başlangıç tarihi: Bugün ile 7 gün sonrası arasında
  const startOffset = Math.floor(Math.random() * 7);
  const startDate = getRandomFutureDate(startOffset);
  
  // Bitiş tarihi: Başlangıçtan 30-90 gün sonrası
  const endOffset = 30 + Math.floor(Math.random() * 60);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + endOffset);
  
  return { startDate, endDate };
};

// Test kuponları oluştur
const createTestCoupons = async () => {
  try {
    const products = await Product.find({}).select('_id');
    const categories = await Category.find({}).select('_id');
    
    if (products.length === 0) {
      console.log('Ürün bulunamadı. Önce ürünleri oluşturun.');
      return;
    }
    
    if (categories.length === 0) {
      console.log('Kategori bulunamadı. Önce kategorileri oluşturun.');
      return;
    }

    const productIds = products.map(product => product._id);
    const categoryIds = categories.map(category => category._id);
    
    // Örnek kuponlar
    const coupons = [
      // Tüm ürünlere uygulanabilir yüzde kuponlar
      {
        code: generateCouponCode('YUZ'),
        type: 'percentage',
        value: 10,
        minPurchase: 100,
        maxDiscount: 50,
        isActive: true,
        usageLimit: faker.number.int({ min: 50, max: 200 }),
        ...getRandomDateRange()
      },
      {
        code: generateCouponCode('YUZ'),
        type: 'percentage',
        value: 15,
        minPurchase: 200,
        maxDiscount: 75,
        isActive: true,
        usageLimit: faker.number.int({ min: 50, max: 200 }),
        ...getRandomDateRange()
      },
      {
        code: generateCouponCode('YUZ'),
        type: 'percentage',
        value: 20,
        minPurchase: 300,
        maxDiscount: 100,
        isActive: true,
        usageLimit: faker.number.int({ min: 20, max: 100 }),
        ...getRandomDateRange()
      },
      
      // Tüm ürünlere uygulanabilir sabit indirim kuponları
      {
        code: generateCouponCode('SAB'),
        type: 'fixed',
        value: 25,
        minPurchase: 150,
        isActive: true,
        usageLimit: faker.number.int({ min: 50, max: 200 }),
        ...getRandomDateRange()
      },
      {
        code: generateCouponCode('SAB'),
        type: 'fixed',
        value: 50,
        minPurchase: 250,
        isActive: true,
        usageLimit: faker.number.int({ min: 40, max: 150 }),
        ...getRandomDateRange()
      },
      {
        code: generateCouponCode('SAB'),
        type: 'fixed',
        value: 100,
        minPurchase: 500,
        isActive: true,
        usageLimit: faker.number.int({ min: 30, max: 100 }),
        ...getRandomDateRange()
      },
      
      // Belirli kategorilere uygulanabilir kuponlar (ilk 2 kategori)
      {
        code: generateCouponCode('KAT'),
        type: 'percentage',
        value: 25,
        minPurchase: 100,
        maxDiscount: 100,
        isActive: true,
        usageLimit: faker.number.int({ min: 50, max: 150 }),
        applicableCategories: categoryIds.slice(0, Math.min(2, categoryIds.length)),
        ...getRandomDateRange()
      },
      
      // Belirli ürünlere uygulanabilir kuponlar (ilk 3 ürün)
      {
        code: generateCouponCode('URN'),
        type: 'percentage',
        value: 30,
        minPurchase: 0,
        maxDiscount: 200,
        isActive: true,
        usageLimit: faker.number.int({ min: 20, max: 80 }),
        applicableProducts: productIds.slice(0, Math.min(3, productIds.length)),
        ...getRandomDateRange()
      },
      
      // Geçmiş tarihli (süresi dolmuş) kupon
      {
        code: generateCouponCode('ESK'),
        type: 'percentage',
        value: 50,
        minPurchase: 0,
        maxDiscount: 200,
        isActive: true,
        usageLimit: 100,
        startDate: getRandomFutureDate(-60),
        endDate: getRandomFutureDate(-30)
      },
      
      // Gelecek tarihte başlayacak kupon
      {
        code: generateCouponCode('GEL'),
        type: 'percentage',
        value: 40,
        minPurchase: 200,
        maxDiscount: 200,
        isActive: true,
        usageLimit: 100,
        startDate: getRandomFutureDate(30),
        endDate: getRandomFutureDate(60)
      },
      
      // Pasif kupon
      {
        code: generateCouponCode('PAS'),
        type: 'percentage',
        value: 25,
        minPurchase: 0,
        isActive: false,
        usageLimit: 100,
        ...getRandomDateRange()
      },
      
      // Yüksek indirim ama düşük kullanım limiti olan kupon
      {
        code: generateCouponCode('AZ'),
        type: 'percentage',
        value: 50,
        minPurchase: 300,
        maxDiscount: 300,
        isActive: true,
        usageLimit: faker.number.int({ min: 5, max: 15 }),
        ...getRandomDateRange()
      }
    ];
    
    // Kuponları rastgele varyasyonlarla çoğalt
    const additionalCoupons = [];
    for (let i = 0; i < 10; i++) {
      const isPercentage = Math.random() > 0.5;
      
      additionalCoupons.push({
        code: generateCouponCode(isPercentage ? 'X' : 'Z'),
        type: isPercentage ? 'percentage' : 'fixed',
        value: isPercentage 
          ? faker.number.int({ min: 5, max: 40 }) 
          : faker.number.int({ min: 10, max: 200 }),
        minPurchase: faker.number.int({ min: 0, max: 500 }),
        maxDiscount: isPercentage ? faker.number.int({ min: 30, max: 250 }) : null,
        isActive: faker.datatype.boolean(0.9), // %90 oranında aktif
        usageLimit: faker.number.int({ min: 10, max: 300 }),
        ...getRandomDateRange()
      });
    }
    
    // Tüm kuponları veritabanına ekle
    const allCoupons = [...coupons, ...additionalCoupons];
    await Coupon.insertMany(allCoupons);
    
    console.log(`${allCoupons.length} adet kupon başarıyla oluşturuldu.`);
  } catch (error) {
    console.error(`Kupon oluşturma hatası: ${error.message}`);
  }
};

// Ana fonksiyon
const populateCoupons = async () => {
  const conn = await connectDB();
  
  await clearCoupons();
  await createTestCoupons();
  
  // Bağlantıyı kapat
  mongoose.disconnect();
  console.log('Veritabanı bağlantısı kapatıldı.');
};

// Scripti çalıştır
populateCoupons(); 