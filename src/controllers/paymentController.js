const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/Product');

/**
 * Stripe ödeme oturumu oluşturan fonksiyon
 * @param {Object} req - Express istek nesnesi
 * @param {Object} res - Express yanıt nesnesi
 */
const createCheckoutSession = async (req, res) => {
  try {
    const { productId } = req.body;

    // Ürünü veritabanından al
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Ürün bulunamadı"
      });
    }

    // Stripe checkout session oluştur
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'try',
            product_data: {
              name: product.name,
              description: product.description,
              images: product.image ? [product.image] : [],
            },
            unit_amount: Math.round(product.price * 100), // Stripe kuruş cinsinden istiyor
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get('host')}/products?canceled=true`,
      locale: 'tr', // Türkçe dil desteği
      metadata: {
        productId: product._id.toString(),
      },
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error("Stripe session oluşturma hatası:", error);
    res.status(500).json({
      success: false,
      message: "Ödeme oturumu oluşturulurken bir hata oluştu",
      error: error.message
    });
  }
};

/**
 * Stripe webhook işleyici fonksiyonu
 * @param {Object} req - Express istek nesnesi
 * @param {Object} res - Express yanıt nesnesi
 */
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook hata:', err.message);
    return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
  }

  // Ödeme başarılı olduğunda
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Ürün ID'sini metadata'dan al
      const productId = session.metadata.productId;

      // Burada ödeme başarılı olduktan sonra yapılacak işlemleri ekleyebilirsiniz
      // Örneğin:
      // - Sipariş oluşturma
      // - Stok güncelleme
      // - Kullanıcıya bildirim gönderme
      // - Fatura oluşturma
      
      console.log('Ödeme başarılı:', session);
    } catch (error) {
      console.error('Ödeme sonrası işlem hatası:', error);
      return res.status(500).json({ success: false, message: 'Ödeme sonrası işlem hatası' });
    }
  }

  res.status(200).json({ success: true, message: 'Webhook alındı' });
};

module.exports = {
  createCheckoutSession,
  handleWebhook
}; 