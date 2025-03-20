const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker/locale/tr');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Faker zaten Türkçe locale ile import edildi
// faker.setLocale('tr'); // Bu satırı kaldırın

// .env dosyasından ortam değişkenlerini yükle
dotenv.config();

// MongoDB bağlantısı
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/express-mongo")
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => {
    console.error('MongoDB bağlantı hatası:', err);
    process.exit(1);
  });

// Örnek Türkçe e-ticaret kategorileri
const kategoriListesi = [
  { name: 'Elektronik', description: 'Bilgisayar, telefon ve diğer elektronik ürünler' },
  { name: 'Giyim', description: 'Kadın, erkek ve çocuk giyim ürünleri' },
  { name: 'Ev & Yaşam', description: 'Ev dekorasyon ve yaşam ürünleri' },
  { name: 'Kitap & Kırtasiye', description: 'Kitaplar, defterler ve kırtasiye malzemeleri' },
  { name: 'Kişisel Bakım', description: 'Kozmetik ve kişisel bakım ürünleri' },
  { name: 'Spor & Outdoor', description: 'Spor ekipmanları ve outdoor giyim' },
  { name: 'Oyuncak & Hobi', description: 'Çocuk oyuncakları ve hobi malzemeleri' },
  { name: 'Mutfak Gereçleri', description: 'Mutfak eşyaları ve pişirme ekipmanları' },
  { name: 'Mobilya', description: 'Ev ve ofis mobilyaları' },
  { name: 'Bahçe & Yapı Market', description: 'Bahçe mobilyaları ve yapı market ürünleri' },
];

// Ürünler için örnek Türkçe açıklamalar
const urunAciklamalari = [
  'Yüksek kaliteli malzemeden üretilmiştir. Uzun ömürlü ve dayanıklıdır.',
  'En son teknoloji ile tasarlanmış, kullanıcı dostu bir üründür.',
  'Şık tasarımı ve ergonomik yapısıyla günlük kullanıma uygundur.',
  'Uygun fiyatıyla bütçe dostu, kaliteden ödün vermeyen bir seçenek.',
  'Kompakt boyutu sayesinde az yer kaplar ve taşıması kolaydır.',
  'Çevre dostu malzemelerden üretilmiştir ve tamamen geri dönüştürülebilir.',
  'Minimal tasarımı her türlü dekora uyum sağlar.',
  'Yenilikçi özellikleri ile kullanıcıların beğenisini kazanmaktadır.',
  'Profesyonel kullanım için tasarlanmış, yüksek performanslı bir üründür.',
  'Türkiye\'de üretilmiş, yerli bir marka ürünüdür.',
];

// Kategorileri oluşturan fonksiyon
const kategorileriOlustur = async () => {
  console.log('Kategoriler oluşturuluyor...');
  const kategoriler = [];

  // Önce tüm kategorileri temizle
  await Category.deleteMany({});

  // Yeni kategorileri oluştur
  for (const kategori of kategoriListesi) {
    const yeniKategori = await Category.create({
      name: kategori.name,
      description: kategori.description,
      image: faker.image.urlLoremFlickr({ category: kategori.name.toLowerCase() }),
    });
    kategoriler.push(yeniKategori);
    console.log(`Kategori oluşturuldu: ${yeniKategori.name}`);
  }

  return kategoriler;
};

// Ürünleri oluşturan fonksiyon
const urunleriOlustur = async (kategoriler) => {
  console.log('Ürünler oluşturuluyor...');
  
  // Önce tüm ürünleri temizle
  await Product.deleteMany({});
  
  const urunler = [];
  
  // Her kategori için 10 ürün oluştur (toplam 100 ürün)
  for (const kategori of kategoriler) {
    for (let i = 0; i < 10; i++) {
      const urunAdi = `${faker.commerce.productAdjective()} ${faker.commerce.product()}`;
      const fiyat = faker.commerce.price({ min: 10, max: 5000, dec: 2 });
      const aciklama = urunAciklamalari[Math.floor(Math.random() * urunAciklamalari.length)];
      const stok = faker.number.int({ min: 1, max: 1000 });
      
      const yeniUrun = await Product.create({
        name: urunAdi,
        price: fiyat,
        description: aciklama,
        stock: stok,
        category: kategori._id,
        image: faker.image.urlLoremFlickr({ category: 'product' }),
      });
      
      urunler.push(yeniUrun);
      console.log(`Ürün oluşturuldu: ${yeniUrun.name} (${kategori.name})`);
    }
  }
  
  return urunler;
};

// Ana fonksiyon
const seed = async () => {
  try {
    console.log('Seed işlemi başlatılıyor...');
    
    // Kategorileri oluştur
    const kategoriler = await kategorileriOlustur();
    
    // Ürünleri oluştur
    const urunler = await urunleriOlustur(kategoriler);
    
    console.log(`Seed işlemi tamamlandı. ${kategoriler.length} kategori ve ${urunler.length} ürün oluşturuldu.`);
    
    // Bağlantıyı kapat
    await mongoose.connection.close();
    console.log('MongoDB bağlantısı kapatıldı.');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed işlemi sırasında hata:', error);
    // Bağlantıyı kapat
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Seed işlemini başlat
seed(); 