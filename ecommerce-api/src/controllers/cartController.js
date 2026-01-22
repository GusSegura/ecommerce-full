import errorHandler from '../middlewares/errorHandler.js';
import Cart from '../models/cart.js';

async function getCarts(req, res) {
  try {
    const carts = await Cart.find().populate('user').populate('products.product');
    res.json(carts);
  } catch (error) {
    errorHandler(error, req, res);
  }
}

async function getCartById(req, res) {
  try {
    const id = req.params.id;
    const cart = await Cart.findById(id).populate('user').populate('products.product');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.json(cart);
  } catch (error) {
    errorHandler(error, req, res);
  }
}

async function getCartByUser(req, res) {
  try {
    const userId = req.params.id;
    const cart = await Cart.findOne({ user: userId }).populate('user').populate('products.product');
    if (!cart) {
      return res.status(404).json({ message: 'No cart found for this user' });
    }
    res.json(cart);
  } catch (error) {
    errorHandler(error, req, res);
  }
}

async function createCart(req, res) {
  try {
    const { user, products } = req.body;
    if (!user || !products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'User and products array are required' });
    }

    // Validar que cada producto tenga los campos requeridos
    for (const item of products) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: 'Each product must have product ID and quantity >= 1' });
      }
    }

    const newCart = await Cart.create({
      user,
      products
    });

    await newCart.populate('user');
    await newCart.populate('products.product');

    res.status(201).json(newCart);
  } catch (error) {
    errorHandler(error, req, res);
  }
}

async function updateCart(req, res) {
  try {
    const { id } = req.params;
    const { user, products } = req.body;
    if (!user || !products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'User and products array are required' });
    }

    // Validar que cada producto tenga los campos requeridos
    for (const item of products) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: 'Each product must have product ID and quantity >= 1' });
      }
    }

    const updatedCart = await Cart.findByIdAndUpdate(id,
      { user, products },
      { new: true }
    ).populate('user').populate('products.product');

    if (updatedCart) {
      return res.status(200).json(updatedCart);
    } else {
      return res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
}

async function deleteCart(req, res) {
  try {
    const { id } = req.params;
    const deletedCart = await Cart.findByIdAndDelete(id);

    if (deletedCart) {
      return res.status(204).send();
    } else {
      return res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
}

async function addProductToCart(req, res) {
  try {
    const { userId, productId, quantity = 1 } = req.body;

    if (!userId || !productId || quantity < 1) {
      return res.status(400).json({ error: 'User ID, product ID, and valid quantity are required' });
    }

    // Buscar el carrito del usuario
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // Si no existe carrito, crear uno nuevo
      cart = new Cart({
        user: userId,
        products: [{ product: productId, quantity }]
      });
    } else {
      // Si existe carrito, verificar si el producto ya está
      const existingProductIndex = cart.products.findIndex(
        item => item.product.toString() === productId
      );

      if (existingProductIndex >= 0) {
        // Si el producto ya existe, actualizar cantidad
        cart.products[existingProductIndex].quantity += quantity;
      } else {
        // Si el producto no existe, agregarlo
        cart.products.push({ product: productId, quantity });
      }
    }

    await cart.save();
    await cart.populate('user');
    await cart.populate('products.product');

    res.status(200).json(cart);
  } catch (error) {
    errorHandler(error, req, res);
  }
}

// --- NUEVO: obtener carrito del usuario autenticado ---
async function getMyCart(req, res) {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('products.product'); 

    if (!cart) {
      return res.json({ products: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener carrito' });
  }
};

// --- NUEVO: agregar producto usando user desde el token ---
async function addToMyCart(req, res) {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    // Validación básica
    if (!productId) {
      return res.status(400).json({ message: "El productId es obligatorio" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: "La cantidad debe ser mayor a 0" });
    }

    // Buscar carrito del usuario
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // Crear carrito nuevo
      cart = await Cart.create({
        user: userId,
        products: [{ product: productId, quantity }]
      });
    } else {
      // Buscar si ya está el producto
      const index = cart.products.findIndex(
        (p) => p.product.toString() === productId
      );

      if (index >= 0) {
        // Si ya existe se suma
        cart.products[index].quantity += quantity;
      } else {
        // Si no existe se agrega
        cart.products.push({ product: productId, quantity });
      }
    }

    await cart.save();

    // Poblar el producto para devolver detalle completo
    await cart.populate("products.product");

    return res.json({
      message: "Producto agregado al carrito",
      cart
    });

  } catch (error) {
    console.error(error);
    return errorHandler(error, req, res);
  }
}


// --- NUEVO: eliminar un producto ---async function removeFromMyCart(req, res) {
async function removeFromMyCart(req, res) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    cart.products = cart.products.filter(
      p => p.product.toString() !== productId
    );

    await cart.save();
    await cart.populate("products.product");

    res.json(cart);

  } catch (error) {
    errorHandler(error, req, res);
  }
};

// --- NUEVO: vaciar carrito ---
async function clearMyCart(req, res) {
  try {
    const userId = req.user.id;

    await Cart.findOneAndUpdate(
      { user: userId },
      { products: [] }
    );

    res.json({ message: "Carrito vaciado" });

  } catch (error) {
    errorHandler(error, req, res);
  }
};

async function updateProductQuantity(req, res) {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Buscar el producto en el carrito
    const productIndex = cart.products.findIndex(
      item => item.product.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    // Actualizar la cantidad
    cart.products[productIndex].quantity = quantity;
    await cart.save();

    // Repoblar antes de devolver
    await cart.populate('products.product');

    res.json({
      message: 'Product quantity updated',
      cart
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating quantity', error });
  }
};

export {
  getCarts,
  getCartById,
  getCartByUser,
  createCart,
  updateCart,
  deleteCart,
  addProductToCart,
  getMyCart,
  addToMyCart,
  removeFromMyCart,
  clearMyCart,
  updateProductQuantity,
};