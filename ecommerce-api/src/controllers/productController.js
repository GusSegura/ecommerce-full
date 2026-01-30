import Product from '../models/product.js';
import Category from '../models/category.js';

async function getProducts(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const totalResults = await Product.countDocuments();
    const totalPages = Math.ceil(totalResults / limit);

    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalResults,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const id = req.params.id;
    const product = await Product.findById(id).populate('category');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
}

async function getProductByCategory(req, res, next) {
  try {
    const id = req.params.idCategory;
    const products = await Product.find({ category: id })
      .populate('category')
      .sort({ name: 1 });

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found on this category' });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ error });
  }
}

async function createProduct(req, res, next) {
  try {
    console.log('\n🔵 === CREAR PRODUCTO ===');
    console.log('📦 Body:', req.body);
    console.log('🖼️ Files:', req.files);
      
    
    const { name, description, price, stock, category, season } = req.body;
    
    // Validaciones
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price and category are required' });
    }

    // Obtener URLs de las imágenes subidas
    let imagesUrl = [];
    if (req.files && req.files.length > 0) {
      imagesUrl = req.files.map(file => `/public/productos/${file.filename}`);
      console.log('✅ URLs generadas:', imagesUrl);
    } else {
      console.log('⚠️ No se recibieron archivos');
    }

    const newProduct = new Product({
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      category,
      imagesUrl,
      season
    });
    
    await newProduct.save();
    console.log('✅ Producto guardado:', newProduct);
    
    res.status(201).json(newProduct);
    
  } catch (error) {
    console.error('❌ ERROR COMPLETO:', error);
    console.error('❌ Stack:', error.stack);
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    console.log('\n📦 UPDATE - Body recibido:', req.body);
    console.log('🖼️ UPDATE - Archivos recibidos:', req.files);
    
    const id = req.params.id;
    const { name, description, price, stock, category, season, imagesUrl } = req.body;

    // Buscar el producto existente
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Preparar datos para actualizar
    const updateData = {
      name: name || existingProduct.name,
      description: description !== undefined ? description : existingProduct.description,
      price: price ? Number(price) : existingProduct.price,
      stock: stock !== undefined ? Number(stock) : existingProduct.stock,
      category: category || existingProduct.category,
      season: season !== undefined ? season : existingProduct.season
    };

    // Manejo de imágenes
    if (req.files && req.files.length > 0) {
      // Hay nuevas imágenes
      const newImages = req.files.map(file => `/public/productos/${file.filename}`);
      console.log('✅ Nuevas imágenes:', newImages);
      
      // Agregar a las existentes
      updateData.imagesUrl = [...existingProduct.imagesUrl, ...newImages];
    } else if (imagesUrl) {
      // Si viene imagesUrl en el body (para eliminar imágenes desde el frontend)
      updateData.imagesUrl = Array.isArray(imagesUrl) ? imagesUrl : JSON.parse(imagesUrl);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('category');

    console.log('✅ Producto actualizado:', updatedProduct);
    res.status(200).json(updatedProduct);
    
  } catch (error) {
    console.error('❌ Error en updateProduct:', error);
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const id = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function searchProducts(req, res, next) {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      inStock,
      sort,
      order,
      page = 1,
      limit = 10,
    } = req.query;

    let filters = {};

    if (q) {
      filters.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    if (category) filters.category = category;

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseFloat(minPrice);
      if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
    }

    if (inStock === 'true') {
      filters.stock = { $gt: 0 };
    }

    let sortOptions = {};
    sortOptions[sort || 'name'] = order === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filters)
      .populate('category')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const totalResults = await Product.countDocuments(filters);
    const totalPages = Math.ceil(totalResults / limit);

    res.status(200).json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalResults,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    next(error);
  }
}

// async function getProductsByCategoryName(req, res, next) {
//   try {
//     const { name } = req.params;

//     const category = await Category.findOne({ name });
//     if (!category) {
//       return res.status(404).json({ message: "Category not found" });
//     }

//     const products = await Product.find({ category: category._id });
//     res.status(200).json(products);
    
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error", error });
//   }
// }

async function getProductsByCategoryName(req, res, next) {
  try {
    const { name } = req.params;
    
    console.log('🔍 Buscando categoría:', name);
    console.log('📊 Tipo de name:', typeof name);

    const category = await Category.findOne({ name });
    console.log('📂 Categoría encontrada:', category);
    
    if (!category) {
      console.log('❌ No se encontró la categoría');
      return res.status(404).json({ 
        message: "Category not found",
        searchedName: name,
        availableCategories: await Category.find({}, 'name') // Ver qué categorías existen
      });
    }

    const products = await Product.find({ category: category._id });
    console.log('📦 Productos encontrados:', products.length);
    
    res.status(200).json(products);
    
  } catch (error) {
    console.error('❌ Error completo:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export {
  getProducts,
  getProductById,
  getProductByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategoryName
};