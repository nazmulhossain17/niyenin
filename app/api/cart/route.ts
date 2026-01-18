// ========================================
// app/api/cart/route.ts - Cart API
// ========================================

import { NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { carts, cartItems, products, productVariants } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import {
  successResponse,
  errorResponse,
  getSession,
} from "@/lib/api-utils";

// Helper to get or create cart
async function getOrCreateCart(userId: string | null, sessionId: string | null) {
  let cart;

  if (userId) {
    // Try to find user's cart
    const userCart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .limit(1);

    if (userCart.length > 0) {
      cart = userCart[0];
    }
  } else if (sessionId) {
    // Try to find session cart
    const sessionCart = await db
      .select()
      .from(carts)
      .where(eq(carts.sessionId, sessionId))
      .limit(1);

    if (sessionCart.length > 0) {
      cart = sessionCart[0];
    }
  }

  // Create new cart if not found
  if (!cart) {
    const newCart = await db
      .insert(carts)
      .values({
        userId,
        sessionId: userId ? null : sessionId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      })
      .returning();
    cart = newCart[0];
  }

  return cart;
}

// GET /api/cart - Get cart contents
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.user?.id || null;
    const sessionId = request.cookies.get("cart_session")?.value || null;

    if (!userId && !sessionId) {
      return successResponse({
        cart: null,
        items: [],
        summary: {
          itemCount: 0,
          subtotal: 0,
        },
      });
    }

    const cart = await getOrCreateCart(userId, sessionId);

    // Get cart items with product details
    const items = await db
      .select({
        cartItem: cartItems,
        product: {
          productId: products.productId,
          name: products.name,
          slug: products.slug,
          mainImage: products.mainImage,
          originalPrice: products.originalPrice,
          salePrice: products.salePrice,
          stockQuantity: products.stockQuantity,
          isActive: products.isActive,
          status: products.status,
        },
        variant: {
          variantId: productVariants.variantId,
          name: productVariants.name,
          sku: productVariants.sku,
          price: productVariants.price,
          stockQuantity: productVariants.stockQuantity,
          image: productVariants.image,
        },
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.productId))
      .leftJoin(productVariants, eq(cartItems.variantId, productVariants.variantId))
      .where(eq(cartItems.cartId, cart.cartId));

    // Calculate summary
    let itemCount = 0;
    let subtotal = 0;

    const validItems = items.filter((item) => {
      // Filter out unavailable products
      return (
        item.product &&
        item.product.isActive &&
        item.product.status === "approved"
      );
    });

    for (const item of validItems) {
      const price = item.variant?.price || item.product?.salePrice || item.product?.originalPrice || "0";
      itemCount += item.cartItem.quantity;
      subtotal += Number(price) * item.cartItem.quantity;
    }

    return successResponse({
      cart,
      items: validItems.map((item) => ({
        ...item.cartItem,
        product: item.product,
        variant: item.variant,
      })),
      summary: {
        itemCount,
        subtotal: subtotal.toFixed(2),
      },
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return errorResponse("Failed to fetch cart", 500);
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.user?.id || null;
    let sessionId = request.cookies.get("cart_session")?.value || null;

    // Generate session ID if not exists and user is not logged in
    if (!userId && !sessionId) {
      sessionId = crypto.randomUUID();
    }

    const body = await request.json();
    const { productId, variantId, quantity = 1 } = body;

    if (!productId) {
      return errorResponse("Product ID is required");
    }

    if (quantity < 1) {
      return errorResponse("Quantity must be at least 1");
    }

    // Check if product exists and is available
    const product = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.productId, productId),
          eq(products.isActive, true),
          eq(products.status, "approved")
        )
      )
      .limit(1);

    if (product.length === 0) {
      return errorResponse("Product not found or unavailable", 404);
    }

    // Check stock
    let availableStock = product[0].stockQuantity;
    if (variantId) {
      const variant = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.variantId, variantId))
        .limit(1);

      if (variant.length === 0) {
        return errorResponse("Product variant not found", 404);
      }
      availableStock = variant[0].stockQuantity;
    }

    if (product[0].trackInventory && quantity > availableStock) {
      return errorResponse(`Only ${availableStock} items available in stock`);
    }

    const cart = await getOrCreateCart(userId, sessionId);

    // Check if item already exists in cart
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.cartId),
          eq(cartItems.productId, productId),
          variantId ? eq(cartItems.variantId, variantId) : sql`${cartItems.variantId} IS NULL`
        )
      )
      .limit(1);

    let cartItem;
    if (existingItem.length > 0) {
      // Update quantity
      const newQuantity = existingItem[0].quantity + quantity;

      if (product[0].trackInventory && newQuantity > availableStock) {
        return errorResponse(`Only ${availableStock} items available in stock`);
      }

      const updated = await db
        .update(cartItems)
        .set({
          quantity: newQuantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.cartItemId, existingItem[0].cartItemId))
        .returning();
      cartItem = updated[0];
    } else {
      // Add new item
      const newItem = await db
        .insert(cartItems)
        .values({
          cartId: cart.cartId,
          productId,
          variantId,
          quantity,
        })
        .returning();
      cartItem = newItem[0];
    }

    // Create response with session cookie if needed
    const response = successResponse(cartItem, "Item added to cart", 201);

    if (!userId && sessionId) {
      response.cookies.set("cart_session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    return response;
  } catch (error) {
    console.error("Error adding to cart:", error);
    return errorResponse("Failed to add item to cart", 500);
  }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.user?.id || null;
    const sessionId = request.cookies.get("cart_session")?.value || null;

    if (!userId && !sessionId) {
      return errorResponse("Cart not found", 404);
    }

    const body = await request.json();
    const { cartItemId, quantity } = body;

    if (!cartItemId) {
      return errorResponse("Cart item ID is required");
    }

    if (quantity < 0) {
      return errorResponse("Quantity cannot be negative");
    }

    // Get cart
    let cart;
    if (userId) {
      const userCart = await db
        .select()
        .from(carts)
        .where(eq(carts.userId, userId))
        .limit(1);
      cart = userCart[0];
    } else if (sessionId) {
      const sessionCart = await db
        .select()
        .from(carts)
        .where(eq(carts.sessionId, sessionId))
        .limit(1);
      cart = sessionCart[0];
    }

    if (!cart) {
      return errorResponse("Cart not found", 404);
    }

    // Get cart item
    const cartItem = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartItemId, cartItemId),
          eq(cartItems.cartId, cart.cartId)
        )
      )
      .limit(1);

    if (cartItem.length === 0) {
      return errorResponse("Cart item not found", 404);
    }

    if (quantity === 0) {
      // Remove item
      await db.delete(cartItems).where(eq(cartItems.cartItemId, cartItemId));
      return successResponse(null, "Item removed from cart");
    }

    // Check stock
    const product = await db
      .select()
      .from(products)
      .where(eq(products.productId, cartItem[0].productId))
      .limit(1);

    if (product.length > 0 && product[0].trackInventory) {
      let availableStock = product[0].stockQuantity;
      if (cartItem[0].variantId) {
        const variant = await db
          .select()
          .from(productVariants)
          .where(eq(productVariants.variantId, cartItem[0].variantId))
          .limit(1);
        if (variant.length > 0) {
          availableStock = variant[0].stockQuantity;
        }
      }

      if (quantity > availableStock) {
        return errorResponse(`Only ${availableStock} items available in stock`);
      }
    }

    // Update quantity
    const updated = await db
      .update(cartItems)
      .set({
        quantity,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.cartItemId, cartItemId))
      .returning();

    return successResponse(updated[0], "Cart updated successfully");
  } catch (error) {
    console.error("Error updating cart:", error);
    return errorResponse("Failed to update cart", 500);
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.user?.id || null;
    const sessionId = request.cookies.get("cart_session")?.value || null;

    if (!userId && !sessionId) {
      return errorResponse("Cart not found", 404);
    }

    // Get cart
    let cart;
    if (userId) {
      const userCart = await db
        .select()
        .from(carts)
        .where(eq(carts.userId, userId))
        .limit(1);
      cart = userCart[0];
    } else if (sessionId) {
      const sessionCart = await db
        .select()
        .from(carts)
        .where(eq(carts.sessionId, sessionId))
        .limit(1);
      cart = sessionCart[0];
    }

    if (!cart) {
      return errorResponse("Cart not found", 404);
    }

    // Delete all cart items
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.cartId));

    return successResponse(null, "Cart cleared successfully");
  } catch (error) {
    console.error("Error clearing cart:", error);
    return errorResponse("Failed to clear cart", 500);
  }
}
