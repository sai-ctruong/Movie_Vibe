const mongoose = require('mongoose');

// Kết nối MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-streaming';

async function checkDatabase() {
  try {
    console.log('🔍 Đang kết nối MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công!');
    
    // Kiểm tra collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📋 Danh sách Collections:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Kiểm tra users collection
    if (collections.find(col => col.name === 'users')) {
      console.log('\n👥 Kiểm tra Users Collection:');
      const usersCollection = db.collection('users');
      const userCount = await usersCollection.countDocuments();
      console.log(`  📊 Tổng số users: ${userCount}`);
      
      if (userCount > 0) {
        console.log('\n📝 Danh sách users:');
        const users = await usersCollection.find({}, { 
          projection: { 
            email: 1, 
            name: 1, 
            role: 1, 
            isActive: 1, 
            createdAt: 1 
          } 
        }).toArray();
        
        users.forEach((user, index) => {
          console.log(`  ${index + 1}. Email: ${user.email}`);
          console.log(`     Tên: ${user.name}`);
          console.log(`     Role: ${user.role}`);
          console.log(`     Active: ${user.isActive}`);
          console.log(`     Tạo lúc: ${user.createdAt}`);
          console.log('     ---');
        });
      } else {
        console.log('  ❌ Không có user nào trong database');
      }
    } else {
      console.log('\n❌ Không tìm thấy users collection');
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Gợi ý:');
      console.log('  - Kiểm tra MongoDB có đang chạy không');
      console.log('  - Chạy: mongod (nếu cài local)');
      console.log('  - Hoặc khởi động MongoDB service');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Đã ngắt kết nối database');
  }
}

checkDatabase();