require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/dbConfig");
const http = require('http');
const socketIo = require('socket.io');

// Port numarasını ayarla
const PORT = process.env.PORT || 3001;

// HTTP sunucusu oluştur
const server = http.createServer(app);

// Socket.IO sunucusunu başlat
const io = socketIo(server, {
  cors: {
    origin: "*", // Güvenlik için production'da spesifik domain belirtilmeli
    methods: ["GET", "POST"]
  }
});

// Veritabanı bağlantısını başlat 
connectDB();

// Aktif kullanıcıları saklamak için Map
const activeUsers = new Map();

// Online kullanıcı sayısını güncelle ve gönder
const updateOnlineUsers = () => {
  io.emit('onlineUsers', {
    count: activeUsers.size,
    users: Array.from(activeUsers.values())
  });
};

// Socket bağlantılarını dinle
io.on('connection', (socket) => {
  console.log('Yeni bir kullanıcı bağlandı:', socket.id);

  // Kullanıcı adı ayarlandığında
  socket.on('setUsername', (username) => {
    // Kullanıcıyı aktif kullanıcılar listesine ekle
    activeUsers.set(socket.id, username);
    console.log(`${username} sohbete katıldı`);
    
    // Online kullanıcı sayısını güncelle
    updateOnlineUsers();
  });

  // Kullanıcı mesaj gönderdiğinde
  socket.on('sendMessage', (data) => {
    // Mesajı tüm bağlı kullanıcılara ilet
    io.emit('message', {
      userId: socket.id,
      username: activeUsers.get(socket.id),
      text: data.text,
      timestamp: new Date()
    });
  });

  // Kullanıcı yazıyor durumunu gönderdiğinde
  socket.on('typing', (data) => {
    // Diğer kullanıcılara bildir
    socket.broadcast.emit('userTyping', {
      userId: socket.id,
      username: activeUsers.get(socket.id),
      isTyping: data.isTyping
    });
  });

  // Kullanıcı bağlantısı koptuğunda
  socket.on('disconnect', () => {
    const username = activeUsers.get(socket.id);
    console.log(`${username || 'Bir kullanıcı'} ayrıldı:`, socket.id);
    // Kullanıcıyı aktif listeden çıkar
    activeUsers.delete(socket.id);
    // Online kullanıcı sayısını güncelle
    updateOnlineUsers();
  });
});

// Sunucuyu başlat
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor!`);
});
