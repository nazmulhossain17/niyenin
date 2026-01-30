import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  uniqueIndex,
  index,
  pgEnum,
  numeric,
  uuid,
  foreignKey,
  varchar,
  jsonb,
  date,
} from "drizzle-orm/pg-core";

/*************************
 * ENUMS
 *************************/

export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "admin",
  "moderator",
  "vendor",
  "customer",
]);

export const vendorStatusEnum = pgEnum("vendor_status", [
  "pending",
  "approved",
  "rejected",
  "suspended",
]);

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "pending_review",
  "approved",
  "rejected",
  "suspended",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
  "refunded",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "processing",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash_on_delivery",
  "sslcommerz",
  "bkash",
  "nagad",
  "rocket",
  "stripe",
  "google_pay",
  "credit_card",
  "debit_card",
]);

export const payoutStatusEnum = pgEnum("payout_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "open",
  "in_progress",
  "escalated",
  "resolved",
  "closed",
]);

export const ticketPriorityEnum = pgEnum("ticket_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const disputeStatusEnum = pgEnum("dispute_status", [
  "open",
  "under_review",
  "escalated_to_admin",
  "escalated_to_super_admin",
  "resolved_customer_favor",
  "resolved_vendor_favor",
  "closed",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "order",
  "payment",
  "shipping",
  "promotion",
  "system",
  "support",
]);

export const discountTypeEnum = pgEnum("discount_type", [
  "percentage",
  "fixed_amount",
]);

export const bannerPositionEnum = pgEnum("banner_position", [
  "hero_slider",
  "homepage_top",
  "homepage_middle",
  "homepage_bottom",
  "category_page",
  "sidebar",
]);

// ========================================
// BETTER AUTH TABLES (Required)
// ========================================

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),

    // Extended fields for e-commerce
    phone: varchar("phone", { length: 20 }).unique(),
    phoneVerified: boolean("phone_verified").default(false).notNull(),
    role: userRoleEnum("role").notNull().default("customer"),
    twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isBanned: boolean("is_banned").default(false).notNull(),
    banReason: text("ban_reason"),
    bannedAt: timestamp("banned_at", { withTimezone: true }),
    bannedBy: text("banned_by"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    lastLoginIp: varchar("last_login_ip", { length: 45 }),
  },
  (t) => ({
    emailIdx: uniqueIndex("user_email_idx").on(t.email),
    phoneIdx: index("user_phone_idx").on(t.phone),
    roleIdx: index("user_role_idx").on(t.role),
    activeIdx: index("user_active_idx").on(t.isActive),
  })
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    deviceInfo: jsonb("device_info"),
    isValid: boolean("is_valid").default(true).notNull(),
  },
  (t) => ({
    userSessionIdx: index("session_user_idx").on(t.userId),
    tokenIdx: uniqueIndex("session_token_idx").on(t.token),
    expiresIdx: index("session_expires_idx").on(t.expiresAt),
  })
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => ({
    userAccountIdx: index("account_user_idx").on(t.userId),
    providerIdx: index("account_provider_idx").on(t.providerId, t.accountId),
  })
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => ({
    identifierIdx: index("verification_identifier_idx").on(t.identifier),
  })
);

// Better Auth Plugin Tables
export const twoFactor = pgTable("two_factor", {
  id: text("id").primaryKey(),
  secret: text("secret").notNull(),
  backupCodes: text("backup_codes").notNull(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const passkey = pgTable(
  "passkey",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    publicKey: text("public_key").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    webauthnUserID: text("webauthn_user_id").notNull(),
    counter: integer("counter").notNull(),
    deviceType: text("device_type").notNull(),
    backedUp: boolean("backed_up").notNull(),
    transports: text("transports"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    userPasskeyIdx: index("passkey_user_idx").on(t.userId),
  })
);

// ========================================
// USER ADDRESSES
// ========================================

export const userAddresses = pgTable(
  "user_addresses",
  {
    addressId: uuid("address_id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 50 }),
    fullName: varchar("full_name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    addressLine1: text("address_line_1").notNull(),
    addressLine2: text("address_line_2"),
    city: varchar("city", { length: 100 }).notNull(),
    district: varchar("district", { length: 100 }).notNull(),
    postalCode: varchar("postal_code", { length: 20 }),
    country: varchar("country", { length: 100 }).notNull().default("Bangladesh"),
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userAddressIdx: index("user_address_idx").on(t.userId),
  })
);

// ========================================
// VENDORS
// ========================================

export const vendors = pgTable(
  "vendors",
  {
    vendorId: uuid("vendor_id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    shopName: varchar("shop_name", { length: 150 }).notNull(),
    shopSlug: varchar("shop_slug", { length: 200 }).notNull().unique(),
    description: text("description"),
    logo: varchar("logo", { length: 500 }),
    banner: varchar("banner", { length: 500 }),
    businessName: varchar("business_name", { length: 200 }),
    businessRegistrationNo: varchar("business_registration_no", { length: 100 }),
    taxId: varchar("tax_id", { length: 100 }),
    businessEmail: varchar("business_email", { length: 100 }),
    businessPhone: varchar("business_phone", { length: 20 }),
    businessAddress: text("business_address"),
    returnPolicy: text("return_policy"),
    shippingPolicy: text("shipping_policy"),
    commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }),
    status: vendorStatusEnum("status").notNull().default("pending"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedBy: text("approved_by").references(() => user.id),
    rejectionReason: text("rejection_reason"),
    averageRating: numeric("average_rating", { precision: 3, scale: 2 }).default("0"),
    totalRatings: integer("total_ratings").default(0).notNull(),
    totalProducts: integer("total_products").default(0).notNull(),
    totalOrders: integer("total_orders").default(0).notNull(),
    totalEarnings: numeric("total_earnings", { precision: 12, scale: 2 }).default("0"),
    walletBalance: numeric("wallet_balance", { precision: 12, scale: 2 }).default("0"),
    adminNotes: text("admin_notes"),
    isVerified: boolean("is_verified").default(false).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    vendorUserIdx: uniqueIndex("vendor_user_idx").on(t.userId),
    vendorSlugIdx: uniqueIndex("vendor_slug_idx").on(t.shopSlug),
    vendorStatusIdx: index("vendor_status_idx").on(t.status),
    vendorFeaturedIdx: index("vendor_featured_idx").on(t.isFeatured),
  })
);

export const vendorPaymentDetails = pgTable(
  "vendor_payment_details",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.vendorId, { onDelete: "cascade" }),
    bankName: varchar("bank_name", { length: 100 }),
    accountName: varchar("account_name", { length: 150 }),
    accountNumber: varchar("account_number", { length: 50 }),
    branchName: varchar("branch_name", { length: 100 }),
    routingNumber: varchar("routing_number", { length: 50 }),
    bkashNumber: varchar("bkash_number", { length: 20 }),
    nagadNumber: varchar("nagad_number", { length: 20 }),
    rocketNumber: varchar("rocket_number", { length: 20 }),
    preferredMethod: varchar("preferred_method", { length: 20 }).default("bank"),
    isVerified: boolean("is_verified").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    vendorPaymentIdx: index("vendor_payment_idx").on(t.vendorId),
  })
);

// ========================================
// CATEGORIES & BRANDS
// ========================================

export const categories = pgTable(
  "categories",
  {
    categoryId: uuid("category_id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 150 }).notNull().unique(),
    description: text("description"),
    image: varchar("image", { length: 500 }),
    icon: varchar("icon", { length: 100 }),
    parentId: uuid("parent_id"),
    level: integer("level").default(0).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    metaTitle: varchar("meta_title", { length: 200 }),
    metaDescription: text("meta_description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    categorySlugIdx: uniqueIndex("category_slug_idx").on(t.slug),
    categoryParentIdx: index("category_parent_idx").on(t.parentId),
    categoryActiveIdx: index("category_active_idx").on(t.isActive),
    categoryFeaturedIdx: index("category_featured_idx").on(t.isFeatured),
    parentFk: foreignKey({
      columns: [t.parentId],
      foreignColumns: [t.categoryId],
      name: "categories_parent_fk",
    }).onDelete("set null"),
  })
);

export const brands = pgTable(
  "brands",
  {
    brandId: uuid("brand_id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 150 }).notNull().unique(),
    description: text("description"),
    logo: varchar("logo", { length: 500 }),
    website: varchar("website", { length: 255 }),
    isActive: boolean("is_active").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    brandSlugIdx: uniqueIndex("brand_slug_idx").on(t.slug),
    brandActiveIdx: index("brand_active_idx").on(t.isActive),
  })
);

// ========================================
// PRODUCTS
// ========================================

export const products = pgTable(
  "products",
  {
    productId: uuid("product_id").primaryKey().defaultRandom(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.vendorId, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.categoryId, { onDelete: "restrict" }),
    brandId: uuid("brand_id").references(() => brands.brandId, { onDelete: "set null" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 300 }).notNull().unique(),
    sku: varchar("sku", { length: 100 }).unique(),
    shortDescription: text("short_description"),
    description: text("description"),
    originalPrice: numeric("original_price", { precision: 12, scale: 2 }).notNull(),
    salePrice: numeric("sale_price", { precision: 12, scale: 2 }),
    costPrice: numeric("cost_price", { precision: 12, scale: 2 }),
    stockQuantity: integer("stock_quantity").default(0).notNull(),
    lowStockThreshold: integer("low_stock_threshold").default(5).notNull(),
    trackInventory: boolean("track_inventory").default(true).notNull(),
    allowBackorders: boolean("allow_backorders").default(false).notNull(),
    mainImage: varchar("main_image", { length: 500 }),
    images: jsonb("images").$type<string[]>().default([]),
    videoUrl: varchar("video_url", { length: 500 }),
    metaTitle: varchar("meta_title", { length: 200 }),
    metaDescription: text("meta_description"),
    tags: jsonb("tags").$type<string[]>().default([]),
    weight: numeric("weight", { precision: 10, scale: 2 }),
    length: numeric("length", { precision: 10, scale: 2 }),
    width: numeric("width", { precision: 10, scale: 2 }),
    height: numeric("height", { precision: 10, scale: 2 }),
    isFreeShipping: boolean("is_free_shipping").default(false).notNull(),
    status: productStatusEnum("status").notNull().default("draft"),
    isActive: boolean("is_active").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    isFlashDeal: boolean("is_flash_deal").default(false).notNull(),
    flashDealStartAt: timestamp("flash_deal_start_at", { withTimezone: true }),
    flashDealEndAt: timestamp("flash_deal_end_at", { withTimezone: true }),
    moderatedBy: text("moderated_by").references(() => user.id),
    moderatedAt: timestamp("moderated_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    viewCount: integer("view_count").default(0).notNull(),
    soldCount: integer("sold_count").default(0).notNull(),
    averageRating: numeric("average_rating", { precision: 3, scale: 2 }).default("0"),
    totalRatings: integer("total_ratings").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    productSlugIdx: uniqueIndex("product_slug_idx").on(t.slug),
    productSkuIdx: uniqueIndex("product_sku_idx").on(t.sku),
    productVendorIdx: index("product_vendor_idx").on(t.vendorId),
    productCategoryIdx: index("product_category_idx").on(t.categoryId),
    productBrandIdx: index("product_brand_idx").on(t.brandId),
    productStatusIdx: index("product_status_idx").on(t.status),
    productActiveIdx: index("product_active_idx").on(t.isActive),
    productFeaturedIdx: index("product_featured_idx").on(t.isFeatured),
    productFlashDealIdx: index("product_flash_deal_idx").on(t.isFlashDeal),
    productPriceIdx: index("product_price_idx").on(t.salePrice, t.originalPrice),
  })
);

export const productVariants = pgTable(
  "product_variants",
  {
    variantId: uuid("variant_id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.productId, { onDelete: "cascade" }),
    sku: varchar("sku", { length: 100 }).unique(),
    name: varchar("name", { length: 150 }).notNull(),
    attributes: jsonb("attributes").$type<Record<string, string>>().notNull(),
    price: numeric("price", { precision: 12, scale: 2 }),
    stockQuantity: integer("stock_quantity").default(0).notNull(),
    image: varchar("image", { length: 500 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    variantProductIdx: index("variant_product_idx").on(t.productId),
    variantSkuIdx: uniqueIndex("variant_sku_idx").on(t.sku),
  })
);

export const attributeTypes = pgTable("attribute_types", {
  attributeId: uuid("attribute_id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  values: jsonb("values").$type<string[]>().default([]),
  isFilterable: boolean("is_filterable").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const productSpecifications = pgTable(
  "product_specifications",
  {
    specId: uuid("spec_id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.productId, { onDelete: "cascade" }),
    groupName: varchar("group_name", { length: 100 }),
    key: varchar("key", { length: 100 }).notNull(),
    value: text("value").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    specProductIdx: index("spec_product_idx").on(t.productId),
  })
);

export const productWarranties = pgTable("product_warranties", {
  warrantyId: uuid("warranty_id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .unique()
    .references(() => products.productId, { onDelete: "cascade" }),
  warrantyPeriod: integer("warranty_period").notNull(),
  warrantyType: varchar("warranty_type", { length: 100 }),
  details: text("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ========================================
// CART & WISHLIST
// ========================================

export const carts = pgTable(
  "carts",
  {
    cartId: uuid("cart_id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    sessionId: varchar("session_id", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (t) => ({
    cartUserIdx: index("cart_user_idx").on(t.userId),
    cartSessionIdx: index("cart_session_idx").on(t.sessionId),
  })
);

export const cartItems = pgTable(
  "cart_items",
  {
    cartItemId: uuid("cart_item_id").primaryKey().defaultRandom(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.cartId, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.productId, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.variantId, {
      onDelete: "cascade",
    }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    cartItemCartIdx: index("cart_item_cart_idx").on(t.cartId),
    cartItemProductIdx: index("cart_item_product_idx").on(t.productId),
    cartItemUniqueIdx: uniqueIndex("cart_item_unique_idx").on(t.cartId, t.productId, t.variantId),
  })
);

export const wishlists = pgTable(
  "wishlists",
  {
    wishlistId: uuid("wishlist_id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.productId, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    wishlistUserIdx: index("wishlist_user_idx").on(t.userId),
    wishlistUniqueIdx: uniqueIndex("wishlist_unique_idx").on(t.userId, t.productId),
  })
);

// ========================================
// COUPONS
// ========================================

export const coupons = pgTable(
  "coupons",
  {
    couponId: uuid("coupon_id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    description: text("description"),
    discountType: discountTypeEnum("discount_type").notNull(),
    discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
    maxDiscount: numeric("max_discount", { precision: 10, scale: 2 }),
    minOrderAmount: numeric("min_order_amount", { precision: 10, scale: 2 }).default("0"),
    usageLimit: integer("usage_limit"),
    usedCount: integer("used_count").default(0).notNull(),
    usageLimitPerUser: integer("usage_limit_per_user").default(1),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    applicableCategories: jsonb("applicable_categories").$type<string[]>(),
    applicableProducts: jsonb("applicable_products").$type<string[]>(),
    applicableVendors: jsonb("applicable_vendors").$type<string[]>(),
    excludedProducts: jsonb("excluded_products").$type<string[]>(),
    isPublic: boolean("is_public").default(true).notNull(),
    allowedUsers: jsonb("allowed_users").$type<string[]>(),
    isActive: boolean("is_active").default(true).notNull(),
    createdBy: text("created_by").references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    couponCodeIdx: uniqueIndex("coupon_code_idx").on(t.code),
    couponActiveIdx: index("coupon_active_idx").on(t.isActive),
    couponDateIdx: index("coupon_date_idx").on(t.startDate, t.endDate),
  })
);

// ========================================
// ORDERS
// ========================================

export const orders = pgTable(
  "orders",
  {
    orderId: uuid("order_id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    shippingCost: numeric("shipping_cost", { precision: 10, scale: 2 }).default("0").notNull(),
    discount: numeric("discount", { precision: 10, scale: 2 }).default("0").notNull(),
    tax: numeric("tax", { precision: 10, scale: 2 }).default("0").notNull(),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    status: orderStatusEnum("status").notNull().default("pending"),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    shippingAddressId: uuid("shipping_address_id").references(() => userAddresses.addressId),
    shippingFullName: varchar("shipping_full_name", { length: 100 }).notNull(),
    shippingPhone: varchar("shipping_phone", { length: 20 }).notNull(),
    shippingAddress: text("shipping_address").notNull(),
    shippingCity: varchar("shipping_city", { length: 100 }).notNull(),
    shippingDistrict: varchar("shipping_district", { length: 100 }).notNull(),
    shippingPostalCode: varchar("shipping_postal_code", { length: 20 }),
    billingAddress: text("billing_address"),
    couponId: uuid("coupon_id").references(() => coupons.couponId),
    couponCode: varchar("coupon_code", { length: 50 }),
    customerNote: text("customer_note"),
    adminNote: text("admin_note"),
    estimatedDeliveryDate: date("estimated_delivery_date"),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancelReason: text("cancel_reason"),
    cancelledBy: text("cancelled_by").references(() => user.id),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    orderNumberIdx: uniqueIndex("order_number_idx").on(t.orderNumber),
    orderUserIdx: index("order_user_idx").on(t.userId),
    orderStatusIdx: index("order_status_idx").on(t.status),
    orderPaymentStatusIdx: index("order_payment_status_idx").on(t.paymentStatus),
    orderCreatedIdx: index("order_created_idx").on(t.createdAt),
  })
);

export const orderItems = pgTable(
  "order_items",
  {
    orderItemId: uuid("order_item_id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.orderId, { onDelete: "cascade" }),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.vendorId, { onDelete: "restrict" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.productId, { onDelete: "restrict" }),
    variantId: uuid("variant_id").references(() => productVariants.variantId),
    productName: varchar("product_name", { length: 255 }).notNull(),
    productSku: varchar("product_sku", { length: 100 }),
    productImage: varchar("product_image", { length: 500 }),
    variantName: varchar("variant_name", { length: 150 }),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull(),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 10, scale: 2 }).default("0").notNull(),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).notNull(),
    commissionAmount: numeric("commission_amount", { precision: 10, scale: 2 }).notNull(),
    vendorEarnings: numeric("vendor_earnings", { precision: 12, scale: 2 }).notNull(),
    status: orderStatusEnum("status").notNull().default("pending"),
    trackingNumber: varchar("tracking_number", { length: 100 }),
    shippingCarrier: varchar("shipping_carrier", { length: 100 }),
    shippedAt: timestamp("shipped_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    orderItemOrderIdx: index("order_item_order_idx").on(t.orderId),
    orderItemVendorIdx: index("order_item_vendor_idx").on(t.vendorId),
    orderItemProductIdx: index("order_item_product_idx").on(t.productId),
    orderItemStatusIdx: index("order_item_status_idx").on(t.status),
  })
);

export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.orderId, { onDelete: "cascade" }),
    orderItemId: uuid("order_item_id").references(() => orderItems.orderItemId, {
      onDelete: "cascade",
    }),
    fromStatus: orderStatusEnum("from_status"),
    toStatus: orderStatusEnum("to_status").notNull(),
    note: text("note"),
    changedBy: text("changed_by").references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    statusHistoryOrderIdx: index("status_history_order_idx").on(t.orderId),
  })
);

// ========================================
// PAYMENTS & PAYOUTS
// ========================================

export const payments = pgTable(
  "payments",
  {
    paymentId: uuid("payment_id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.orderId, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 10 }).default("BDT").notNull(),
    method: paymentMethodEnum("method").notNull(),
    status: paymentStatusEnum("status").notNull().default("pending"),
    gatewayTransactionId: varchar("gateway_transaction_id", { length: 255 }),
    gatewayResponse: jsonb("gateway_response"),
    refundedAmount: numeric("refunded_amount", { precision: 12, scale: 2 }).default("0"),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    refundReason: text("refund_reason"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    paymentOrderIdx: index("payment_order_idx").on(t.orderId),
    paymentStatusIdx: index("payment_status_idx").on(t.status),
    paymentTransactionIdx: index("payment_transaction_idx").on(t.gatewayTransactionId),
  })
);

export const vendorPayouts = pgTable(
  "vendor_payouts",
  {
    payoutId: uuid("payout_id").primaryKey().defaultRandom(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.vendorId, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 10 }).default("BDT").notNull(),
    status: payoutStatusEnum("status").notNull().default("pending"),
    paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
    paymentDetails: jsonb("payment_details"),
    transactionId: varchar("transaction_id", { length: 255 }),
    transactionNote: text("transaction_note"),
    requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow().notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    processedBy: text("processed_by").references(() => user.id),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    payoutVendorIdx: index("payout_vendor_idx").on(t.vendorId),
    payoutStatusIdx: index("payout_status_idx").on(t.status),
  })
);

export const vendorEarnings = pgTable(
  "vendor_earnings",
  {
    earningId: uuid("earning_id").primaryKey().defaultRandom(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.vendorId, { onDelete: "cascade" }),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.orderId, { onDelete: "cascade" }),
    orderItemId: uuid("order_item_id")
      .notNull()
      .references(() => orderItems.orderItemId, { onDelete: "cascade" }),
    orderAmount: numeric("order_amount", { precision: 12, scale: 2 }).notNull(),
    commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).notNull(),
    commissionAmount: numeric("commission_amount", { precision: 10, scale: 2 }).notNull(),
    netEarning: numeric("net_earning", { precision: 12, scale: 2 }).notNull(),
    isPaid: boolean("is_paid").default(false).notNull(),
    payoutId: uuid("payout_id").references(() => vendorPayouts.payoutId),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    earningVendorIdx: index("earning_vendor_idx").on(t.vendorId),
    earningOrderIdx: index("earning_order_idx").on(t.orderId),
    earningPaidIdx: index("earning_paid_idx").on(t.isPaid),
  })
);

export const couponUsage = pgTable(
  "coupon_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    couponId: uuid("coupon_id")
      .notNull()
      .references(() => coupons.couponId, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.orderId, { onDelete: "cascade" }),
    discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    couponUsageIdx: index("coupon_usage_coupon_idx").on(t.couponId),
    couponUsageUserIdx: index("coupon_usage_user_idx").on(t.userId),
  })
);

// ========================================
// REVIEWS & Q&A
// ========================================

export const reviews = pgTable(
  "reviews",
  {
    reviewId: uuid("review_id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.productId, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    orderId: uuid("order_id").references(() => orders.orderId, { onDelete: "set null" }),
    orderItemId: uuid("order_item_id").references(() => orderItems.orderItemId, {
      onDelete: "set null",
    }),
    rating: integer("rating").notNull(),
    title: varchar("title", { length: 200 }),
    comment: text("comment"),
    images: jsonb("images").$type<string[]>().default([]),
    isApproved: boolean("is_approved").default(false).notNull(),
    isVerifiedPurchase: boolean("is_verified_purchase").default(false).notNull(),
    moderatedBy: text("moderated_by").references(() => user.id),
    moderatedAt: timestamp("moderated_at", { withTimezone: true }),
    helpfulCount: integer("helpful_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    reviewProductIdx: index("review_product_idx").on(t.productId),
    reviewUserIdx: index("review_user_idx").on(t.userId),
    reviewApprovedIdx: index("review_approved_idx").on(t.isApproved),
    reviewRatingIdx: index("review_rating_idx").on(t.rating),
    reviewUniqueIdx: uniqueIndex("review_unique_idx").on(t.productId, t.userId, t.orderId),
  })
);

export const vendorReviews = pgTable(
  "vendor_reviews",
  {
    reviewId: uuid("review_id").primaryKey().defaultRandom(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.vendorId, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    orderId: uuid("order_id").references(() => orders.orderId, { onDelete: "set null" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    isApproved: boolean("is_approved").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    vendorReviewVendorIdx: index("vendor_review_vendor_idx").on(t.vendorId),
    vendorReviewUserIdx: index("vendor_review_user_idx").on(t.userId),
  })
);

export const productQuestions = pgTable(
  "product_questions",
  {
    questionId: uuid("question_id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.productId, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    isApproved: boolean("is_approved").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    questionProductIdx: index("question_product_idx").on(t.productId),
  })
);

export const productAnswers = pgTable(
  "product_answers",
  {
    answerId: uuid("answer_id").primaryKey().defaultRandom(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => productQuestions.questionId, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    answer: text("answer").notNull(),
    isOfficial: boolean("is_official").default(false).notNull(),
    isApproved: boolean("is_approved").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    answerQuestionIdx: index("answer_question_idx").on(t.questionId),
  })
);

// ========================================
// SUPPORT SYSTEM
// ========================================

export const supportTickets = pgTable(
  "support_tickets",
  {
    ticketId: uuid("ticket_id").primaryKey().defaultRandom(),
    ticketNumber: varchar("ticket_number", { length: 50 }).notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    orderId: uuid("order_id").references(() => orders.orderId),
    orderItemId: uuid("order_item_id").references(() => orderItems.orderItemId),
    productId: uuid("product_id").references(() => products.productId),
    subject: varchar("subject", { length: 255 }).notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 50 }).notNull(),
    status: ticketStatusEnum("status").notNull().default("open"),
    priority: ticketPriorityEnum("priority").notNull().default("medium"),
    assignedTo: text("assigned_to").references(() => user.id),
    assignedAt: timestamp("assigned_at", { withTimezone: true }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolvedBy: text("resolved_by").references(() => user.id),
    resolution: text("resolution"),
    escalatedTo: text("escalated_to").references(() => user.id),
    escalatedAt: timestamp("escalated_at", { withTimezone: true }),
    escalationReason: text("escalation_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    ticketNumberIdx: uniqueIndex("ticket_number_idx").on(t.ticketNumber),
    ticketUserIdx: index("ticket_user_idx").on(t.userId),
    ticketStatusIdx: index("ticket_status_idx").on(t.status),
    ticketAssignedIdx: index("ticket_assigned_idx").on(t.assignedTo),
    ticketOrderIdx: index("ticket_order_idx").on(t.orderId),
  })
);

export const ticketMessages = pgTable(
  "ticket_messages",
  {
    messageId: uuid("message_id").primaryKey().defaultRandom(),
    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => supportTickets.ticketId, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    attachments: jsonb("attachments").$type<string[]>().default([]),
    isInternal: boolean("is_internal").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    messageTicketIdx: index("message_ticket_idx").on(t.ticketId),
  })
);

export const disputes = pgTable(
  "disputes",
  {
    disputeId: uuid("dispute_id").primaryKey().defaultRandom(),
    disputeNumber: varchar("dispute_number", { length: 50 }).notNull().unique(),
    ticketId: uuid("ticket_id").references(() => supportTickets.ticketId),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.orderId),
    orderItemId: uuid("order_item_id").references(() => orderItems.orderItemId),
    customerId: text("customer_id")
      .notNull()
      .references(() => user.id),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.vendorId),
    reason: text("reason").notNull(),
    customerStatement: text("customer_statement").notNull(),
    vendorStatement: text("vendor_statement"),
    status: disputeStatusEnum("status").notNull().default("open"),
    customerEvidence: jsonb("customer_evidence").$type<string[]>().default([]),
    vendorEvidence: jsonb("vendor_evidence").$type<string[]>().default([]),
    resolvedBy: text("resolved_by").references(() => user.id),
    resolution: text("resolution"),
    refundAmount: numeric("refund_amount", { precision: 12, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (t) => ({
    disputeNumberIdx: uniqueIndex("dispute_number_idx").on(t.disputeNumber),
    disputeOrderIdx: index("dispute_order_idx").on(t.orderId),
    disputeCustomerIdx: index("dispute_customer_idx").on(t.customerId),
    disputeVendorIdx: index("dispute_vendor_idx").on(t.vendorId),
    disputeStatusIdx: index("dispute_status_idx").on(t.status),
  })
);

// ========================================
// NOTIFICATIONS & BANNERS
// ========================================

export const notifications = pgTable(
  "notifications",
  {
    notificationId: uuid("notification_id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    message: text("message").notNull(),
    data: jsonb("data"),
    isRead: boolean("is_read").default(false).notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    notificationUserIdx: index("notification_user_idx").on(t.userId),
    notificationReadIdx: index("notification_read_idx").on(t.isRead),
    notificationCreatedIdx: index("notification_created_idx").on(t.createdAt),
  })
);

export const banners = pgTable(
  "banners",
  {
    bannerId: uuid("banner_id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 200 }).notNull(),
    subtitle: text("subtitle"),
    image: varchar("image", { length: 500 }).notNull(),
    mobileImage: varchar("mobile_image", { length: 500 }),
    link: varchar("link", { length: 500 }),
    position: bannerPositionEnum("position").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    isActive: boolean("is_active").default(true).notNull(),
    createdBy: text("created_by").references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    bannerPositionIdx: index("banner_position_idx").on(t.position),
    bannerActiveIdx: index("banner_active_idx").on(t.isActive),
  })
);

// ========================================
// SITE SETTINGS & AUDIT
// ========================================

export const siteSettings = pgTable(
  "site_settings",
  {
    settingId: uuid("setting_id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 100 }).notNull().unique(),
    value: jsonb("value").notNull(),
    group: varchar("group", { length: 50 }),
    description: text("description"),
    updatedBy: text("updated_by").references(() => user.id),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    settingKeyIdx: uniqueIndex("setting_key_idx").on(t.key),
    settingGroupIdx: index("setting_group_idx").on(t.group),
  })
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    logId: uuid("log_id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 50 }),
    entityId: text("entity_id"),
    oldData: jsonb("old_data"),
    newData: jsonb("new_data"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    auditUserIdx: index("audit_user_idx").on(t.userId),
    auditActionIdx: index("audit_action_idx").on(t.action),
    auditEntityIdx: index("audit_entity_idx").on(t.entityType, t.entityId),
    auditCreatedIdx: index("audit_created_idx").on(t.createdAt),
  })
);

// ========================================
// FAQ
// ========================================

export const faqCategories = pgTable("faq_categories", {
  categoryId: uuid("category_id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const faqs = pgTable(
  "faqs",
  {
    faqId: uuid("faq_id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => faqCategories.categoryId, { onDelete: "cascade" }),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    faqCategoryIdx: index("faq_category_idx").on(t.categoryId),
  })
);

// ========================================
// SHIPPING
// ========================================

export const shippingZones = pgTable("shipping_zones", {
  zoneId: uuid("zone_id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  districts: jsonb("districts").$type<string[]>().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const shippingRates = pgTable(
  "shipping_rates",
  {
    rateId: uuid("rate_id").primaryKey().defaultRandom(),
    zoneId: uuid("zone_id")
      .notNull()
      .references(() => shippingZones.zoneId, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    baseRate: numeric("base_rate", { precision: 10, scale: 2 }).notNull(),
    perKgRate: numeric("per_kg_rate", { precision: 10, scale: 2 }).default("0"),
    minWeight: numeric("min_weight", { precision: 10, scale: 2 }),
    maxWeight: numeric("max_weight", { precision: 10, scale: 2 }),
    estimatedDays: varchar("estimated_days", { length: 50 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    rateZoneIdx: index("rate_zone_idx").on(t.zoneId),
  })
);

// ========================================
// SCHEMA EXPORT FOR BETTER AUTH & DRIZZLE
// ========================================

export const schema = {
  // Better Auth Core Tables (Required)
  user,
  session,
  account,
  verification,

  // Better Auth Plugin Tables
  twoFactor,
  passkey,

  // User Related
  userAddresses,

  // Vendor Related
  vendors,
  vendorPaymentDetails,
  vendorPayouts,
  vendorEarnings,

  // Catalog
  categories,
  brands,
  products,
  productVariants,
  attributeTypes,
  productSpecifications,
  productWarranties,

  // Shopping
  carts,
  cartItems,
  wishlists,

  // Orders & Payments
  orders,
  orderItems,
  orderStatusHistory,
  payments,
  coupons,
  couponUsage,

  // Reviews & Q&A
  reviews,
  vendorReviews,
  productQuestions,
  productAnswers,

  // Support
  supportTickets,
  ticketMessages,
  disputes,

  // Site Management
  notifications,
  banners,
  siteSettings,
  auditLogs,
  faqCategories,
  faqs,

  // Shipping
  shippingZones,
  shippingRates,
};

// ========================================
// TYPE EXPORTS
// ========================================

// Better Auth Types
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

// E-commerce Types
export type UserAddress = typeof userAddresses.$inferSelect;
export type NewUserAddress = typeof userAddresses.$inferInsert;
export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;
export type VendorPaymentDetail = typeof vendorPaymentDetails.$inferSelect;
export type NewVendorPaymentDetail = typeof vendorPaymentDetails.$inferInsert;
export type VendorPayout = typeof vendorPayouts.$inferSelect;
export type NewVendorPayout = typeof vendorPayouts.$inferInsert;
export type VendorEarning = typeof vendorEarnings.$inferSelect;
export type NewVendorEarning = typeof vendorEarnings.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
export type AttributeType = typeof attributeTypes.$inferSelect;
export type NewAttributeType = typeof attributeTypes.$inferInsert;
export type ProductSpecification = typeof productSpecifications.$inferSelect;
export type NewProductSpecification = typeof productSpecifications.$inferInsert;
export type ProductWarranty = typeof productWarranties.$inferSelect;
export type NewProductWarranty = typeof productWarranties.$inferInsert;
export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
export type Wishlist = typeof wishlists.$inferSelect;
export type NewWishlist = typeof wishlists.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type OrderStatusHistoryEntry = typeof orderStatusHistory.$inferSelect;
export type NewOrderStatusHistoryEntry = typeof orderStatusHistory.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
export type CouponUsageRecord = typeof couponUsage.$inferSelect;
export type NewCouponUsageRecord = typeof couponUsage.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type VendorReview = typeof vendorReviews.$inferSelect;
export type NewVendorReview = typeof vendorReviews.$inferInsert;
export type ProductQuestion = typeof productQuestions.$inferSelect;
export type NewProductQuestion = typeof productQuestions.$inferInsert;
export type ProductAnswer = typeof productAnswers.$inferSelect;
export type NewProductAnswer = typeof productAnswers.$inferInsert;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type NewSupportTicket = typeof supportTickets.$inferInsert;
export type TicketMessage = typeof ticketMessages.$inferSelect;
export type NewTicketMessage = typeof ticketMessages.$inferInsert;
export type Dispute = typeof disputes.$inferSelect;
export type NewDispute = typeof disputes.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type Banner = typeof banners.$inferSelect;
export type NewBanner = typeof banners.$inferInsert;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type FaqCategory = typeof faqCategories.$inferSelect;
export type NewFaqCategory = typeof faqCategories.$inferInsert;
export type Faq = typeof faqs.$inferSelect;
export type NewFaq = typeof faqs.$inferInsert;
export type ShippingZone = typeof shippingZones.$inferSelect;
export type NewShippingZone = typeof shippingZones.$inferInsert;
export type ShippingRate = typeof shippingRates.$inferSelect;
export type NewShippingRate = typeof shippingRates.$inferInsert;