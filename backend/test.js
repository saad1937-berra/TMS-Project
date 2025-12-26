const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connecté');
    console.log('📊 Base de données:', mongoose.connection.db.databaseName);
    
    // Lister les collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections disponibles:');
    collections.forEach(c => console.log('  -', c.name));
    
    // Vérifier le modèle Formateur
    try {
      const Formateur = require('./models/Formateur');
      const count = await Formateur.countDocuments();
      console.log(`\n👨‍🏫 Nombre de formateurs dans la collection: ${count}`);
      
      if (count === 0) {
        console.log('ℹ️  La base est vide. Vous pouvez créer un formateur via POST /api/formateurs');
      } else {
        const formateurs = await Formateur.find().limit(3);
        console.log('\n📋 3 premiers formateurs:');
        console.log(formateurs);
      }
    } catch (err) {
      console.error('❌ Erreur avec le modèle Formateur:', err.message);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erreur connexion MongoDB:', err.message);
    process.exit(1);
  });