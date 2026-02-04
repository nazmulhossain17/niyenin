// ========================================
// File: components/layout/header.tsx
// Header with Search Functionality
// ========================================

"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Mail,
  Phone,
  ChevronDown,
  ChevronRight,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Instagram,
  ShoppingCart,
  Menu,
  Search,
  Sun,
  Moon,
  X,
  User,
  LogOut,
  Settings,
  Package,
  Heart,
  MapPinned,
  Store,
  Shield,
  LayoutDashboard,
  Grid3X3,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { authClient, type User as AuthUser, type UserRole } from "@/lib/auth-client";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";

interface Category {
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  parentId: string | null;
  level: number;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  children?: Category[];
}

const UserAvatar = ({ user, size = "md" }: { user: { name?: string | null; email?: string | null; image?: string | null }; size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = { sm: "w-6 h-6 text-xs", md: "w-8 h-8 text-sm", lg: "w-10 h-10 text-base" };
  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) { const parts = name.split(" "); return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.substring(0, 2).toUpperCase(); }
    return email ? email.substring(0, 2).toUpperCase() : "U";
  };
  if (user.image) return <Image src={user.image} alt={user.name || "User"} width={40} height={40} className={`${sizeClasses[size]} rounded-full object-cover border-2 border-primary`} />;
  return <div className={`${sizeClasses[size]} rounded-full bg-linear-to-br from-primary to-brand flex items-center justify-center text-white font-semibold border-2 border-primary/20`}>{getInitials(user.name, user.email)}</div>;
};

const SearchBar = ({ isOpen, onClose, isMobile = false }: { isOpen: boolean; onClose: () => void; isMobile?: boolean }) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      try { const stored = localStorage.getItem("recentSearches"); if (stored) setRecentSearches(JSON.parse(stored).slice(0, 5)); } catch (e) {}
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const saveSearch = (query: string) => {
    if (!query.trim()) return;
    try { const stored = localStorage.getItem("recentSearches"); let searches = stored ? JSON.parse(stored) : []; searches = [query, ...searches.filter((s: string) => s !== query)].slice(0, 5); localStorage.setItem("recentSearches", JSON.stringify(searches)); } catch (e) {}
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) { saveSearch(searchQuery.trim()); router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`); setSearchQuery(""); onClose(); }
  };

  const handleRecentSearchClick = (query: string) => { router.push(`/shop?search=${encodeURIComponent(query)}`); onClose(); };
  const clearRecentSearches = () => { localStorage.removeItem("recentSearches"); setRecentSearches([]); };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <form onSubmit={handleSearch} className="w-full">
        <div className="flex items-center space-x-2 bg-muted rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input ref={inputRef} type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." className="flex-1 bg-transparent text-sm outline-none min-w-0" autoComplete="off" />
          {searchQuery && <button type="button" onClick={() => setSearchQuery("")} className="p-1 hover:bg-background rounded-full"><X className="w-3 h-3 text-muted-foreground" /></button>}
          <button type="submit" disabled={!searchQuery.trim()} className="p-1.5 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"><ArrowRight className="w-4 h-4" /></button>
        </div>
        {recentSearches.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Recent</span><button type="button" onClick={clearRecentSearches} className="text-xs text-destructive hover:underline">Clear</button></div>
            <div className="flex flex-wrap gap-2">{recentSearches.map((search, i) => <button key={i} type="button" onClick={() => handleRecentSearchClick(search)} className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-full">{search}</button>)}</div>
          </div>
        )}
      </form>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.2 }} className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-card rounded-xl shadow-2xl border border-border z-50 overflow-hidden mx-4">
        <form onSubmit={handleSearch}>
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input ref={inputRef} type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for products, brands, categories..." className="flex-1 bg-transparent text-lg outline-none" autoComplete="off" />
            {searchQuery && <button type="button" onClick={() => setSearchQuery("")} className="p-1.5 hover:bg-muted rounded-full"><X className="w-4 h-4 text-muted-foreground" /></button>}
            <kbd className="hidden sm:inline-flex px-2 py-1 text-xs text-muted-foreground bg-muted rounded">ESC</kbd>
          </div>
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {searchQuery.trim() ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> to search</p>
                <button type="submit" className="w-full flex items-center justify-between p-3 rounded-lg bg-primary/5 hover:bg-primary/10 group">
                  <span className="flex items-center gap-3"><Search className="w-4 h-4 text-primary" /><span>Search for &quot;<span className="font-medium text-primary">{searchQuery}</span>&quot;</span></span>
                  <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100" />
                </button>
              </div>
            ) : (
              <>
                {recentSearches.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-medium text-muted-foreground">Recent Searches</h3><button type="button" onClick={clearRecentSearches} className="text-xs text-destructive hover:underline">Clear all</button></div>
                    <div className="space-y-1">{recentSearches.map((search, i) => <button key={i} type="button" onClick={() => handleRecentSearchClick(search)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left group"><Search className="w-4 h-4 text-muted-foreground" /><span className="flex-1">{search}</span><ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100" /></button>)}</div>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Links</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ label: "Flash Deals", href: "/shop?flashDeal=true", icon: "🔥" }, { label: "Featured", href: "/shop?featured=true", icon: "⭐" }, { label: "New Arrivals", href: "/shop?sortBy=createdAt&sortOrder=desc", icon: "🆕" }, { label: "Best Sellers", href: "/shop?sortBy=soldCount&sortOrder=desc", icon: "🏆" }].map((link, i) => (
                      <Link key={i} href={link.href} onClick={onClose} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted"><span>{link.icon}</span><span className="text-sm">{link.label}</span></Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center justify-between p-3 border-t border-border bg-muted/30">
            <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground"><span><kbd className="px-1.5 py-0.5 bg-muted rounded">↵</kbd> search</span><span><kbd className="px-1.5 py-0.5 bg-muted rounded">ESC</kbd> close</span></div>
            <button type="button" onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
          </div>
        </form>
      </motion.div>
    </>
  );
};

const CategoryMenu = ({ categories, isLoading, isOpen, onClose, isMobile = false }: { categories: Category[]; isLoading: boolean; isOpen: boolean; onClose: () => void; isMobile?: boolean }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<string[]>([]);
  const rootCategories = categories.filter((cat) => cat.level === 0);
  const getChildren = (parentId: string) => categories.filter((cat) => cat.parentId === parentId);
  const toggleMobileCategory = (categoryId: string) => setExpandedMobileCategories((prev) => prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]);
  const getCategoryUrl = (slug: string) => `/shop?category=${slug}`;

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
        {isLoading ? <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> : rootCategories.length === 0 ? <p className="text-center py-4 text-muted-foreground text-sm">No categories</p> : (
          <div className="space-y-1 py-2">
            {rootCategories.map((category) => {
              const children = getChildren(category.categoryId);
              const isExpanded = expandedMobileCategories.includes(category.categoryId);
              return (
                <div key={category.categoryId}>
                  <div className="flex items-center">
                    <Link href={getCategoryUrl(category.slug)} className="flex-1 flex items-center space-x-3 px-3 py-2 text-sm hover:bg-muted rounded-lg" onClick={onClose}>
                      {category.image ? <Image src={category.image} alt={category.name} width={24} height={24} className="w-6 h-6 rounded object-cover" /> : <Grid3X3 className="w-5 h-5 text-muted-foreground" />}
                      <span>{category.name}</span>
                    </Link>
                    {children.length > 0 && <button onClick={() => toggleMobileCategory(category.categoryId)} className="p-2 hover:bg-muted rounded-lg"><ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} /></button>}
                  </div>
                  <AnimatePresence>
                    {isExpanded && children.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="ml-6 space-y-1 overflow-hidden">
                        {children.map((child) => <Link key={child.categoryId} href={getCategoryUrl(child.slug)} className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg" onClick={onClose}>{child.name}</Link>)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
            <Link href="/shop" className="flex items-center justify-center space-x-2 px-3 py-3 mt-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg" onClick={onClose}><span>View All Products</span><ChevronRight className="w-4 h-4" /></Link>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-0 top-full mt-1 w-[800px] max-w-[calc(100vw-2rem)] bg-card rounded-lg shadow-xl border border-border z-50" onMouseLeave={() => setActiveCategory(null)}>
      {isLoading ? <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> : rootCategories.length === 0 ? <div className="flex items-center justify-center py-12 text-muted-foreground">No categories</div> : (
        <div className="flex">
          <div className="w-64 border-r border-border py-2 max-h-[400px] overflow-y-auto">
            {rootCategories.map((category) => {
              const children = getChildren(category.categoryId);
              return (
                <div key={category.categoryId} className={activeCategory === category.categoryId ? "bg-muted" : ""} onMouseEnter={() => setActiveCategory(category.categoryId)}>
                  <Link href={getCategoryUrl(category.slug)} className="flex items-center justify-between px-4 py-3 hover:bg-muted" onClick={onClose}>
                    <div className="flex items-center space-x-3">{category.image ? <Image src={category.image} alt={category.name} width={32} height={32} className="w-8 h-8 rounded object-cover" /> : <div className="w-8 h-8 rounded bg-muted flex items-center justify-center"><Grid3X3 className="w-4 h-4 text-muted-foreground" /></div>}<span className="text-sm font-medium">{category.name}</span></div>
                    {children.length > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </Link>
                </div>
              );
            })}
            <Link href="/shop" className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10 border-t border-border mt-2" onClick={onClose}><span>View All</span><ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="flex-1 p-4 max-h-[400px] overflow-y-auto">
            {activeCategory ? (() => {
              const activeCat = rootCategories.find((c) => c.categoryId === activeCategory);
              const children = getChildren(activeCategory);
              if (!activeCat) return null;
              return (
                <>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-border"><h3 className="font-semibold text-lg">{activeCat.name}</h3><Link href={getCategoryUrl(activeCat.slug)} className="text-sm text-primary hover:underline" onClick={onClose}>View All</Link></div>
                  {children.length > 0 ? <div className="grid grid-cols-3 gap-4">{children.map((child) => <Link key={child.categoryId} href={getCategoryUrl(child.slug)} className="text-sm hover:text-primary" onClick={onClose}>{child.name}</Link>)}</div> : <p className="text-sm text-muted-foreground">No subcategories</p>}
                </>
              );
            })() : <div className="flex items-center justify-center h-full text-muted-foreground">Hover over a category</div>}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [categoriesFetched, setCategoriesFetched] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { itemCount: cartItemCount, subtotal } = useCart();
  const { itemCount: wishlistItemCount } = useWishlist();
  const userRole = (user?.role as UserRole) || "customer";
  const isAuthenticated = !!user;

  const fetchCategories = useCallback(async () => {
    if (categoriesFetched) return;
    setIsCategoriesLoading(true);
    try { const res = await fetch("/api/categories?tree=false&limit=100"); const data = await res.json(); if (data.success) { setCategories(data.data); setCategoriesFetched(true); } } catch (e) {} finally { setIsCategoriesLoading(false); }
  }, [categoriesFetched]);

  useEffect(() => { if ((isCategoryMenuOpen || isMobileCategoryOpen) && !categoriesFetched) fetchCategories(); }, [isCategoryMenuOpen, isMobileCategoryOpen, categoriesFetched, fetchCategories]);
  
  // Re-check session on mount AND when pathname changes (after login redirect)
  useEffect(() => { 
    const checkSession = async () => { 
      try { 
        const { data: session } = await authClient.getSession(); 
        setUser(session?.user || null); 
      } catch (e) { 
        setUser(null); 
      } finally { 
        setIsLoading(false); 
      } 
    }; 
    checkSession(); 
  }, [pathname]); // Re-run when route changes
  
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { const handleKeyDown = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setIsSearchOpen(true); } }; document.addEventListener("keydown", handleKeyDown); return () => document.removeEventListener("keydown", handleKeyDown); }, []);
  useEffect(() => { const handleClickOutside = (e: MouseEvent) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setIsUserMenuOpen(false); if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) setIsCategoryMenuOpen(false); }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);

  const toggleMobileMenu = () => { setIsMobileMenuOpen(!isMobileMenuOpen); if (isMobileMenuOpen) setIsMobileCategoryOpen(false); };
  const handleSignOut = async () => { setIsUserMenuOpen(false); setIsMobileMenuOpen(false); try { await authClient.signOut(); setUser(null); router.push("/"); router.refresh(); } catch (e) {} };
  const getMenuItems = () => {
    const baseItems = [{ icon: User, label: "My Profile", href: "/profile" }, { icon: Package, label: "My Orders", href: "/orders" }, { icon: Heart, label: "Wishlist", href: "/wishlist" }, { icon: MapPinned, label: "Addresses", href: "/profile/addresses" }, { icon: Settings, label: "Settings", href: "/profile/settings" }];
    if (userRole === "vendor") return [{ icon: LayoutDashboard, label: "Vendor Dashboard", href: "/vendor/dashboard" }, { icon: Store, label: "My Shop", href: "/vendor/shop" }, ...baseItems];
    if (userRole === "admin" || userRole === "super_admin") return [{ icon: Shield, label: "Admin Panel", href: "/admin" }, ...baseItems];
    return baseItems;
  };
  const menuItems = getMenuItems();
  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;

  return (
    <div className="w-full">
      <AnimatePresence>{isSearchOpen && <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}</AnimatePresence>

      {/* Top Bar */}
      <div className="bg-background border-b border-border px-4 py-2 hidden md:block">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between text-sm">
          <div className="hidden lg:flex items-center space-x-6">
            <div className="flex items-center space-x-1"><div className="w-2 h-2 bg-brand rounded-full"></div><span className="text-muted-foreground">Deliver to</span><MapPin className="w-4 h-4 text-destructive" /><span className="font-medium">Bangladesh</span></div>
            <div className="flex items-center space-x-1 bg-muted px-2 py-1 rounded"><Calendar className="w-4 h-4 text-primary" /><span className="text-primary font-medium">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}</span></div>
          </div>
          <div className="flex items-center space-x-3 lg:space-x-6">
            <div className="hidden lg:flex items-center space-x-6"><div className="flex items-center space-x-1"><Mail className="w-4 h-4 text-primary" /><span className="text-muted-foreground">niyenin.bd@gmail.com</span></div><div className="flex items-center space-x-1"><Phone className="w-4 h-4 text-primary" /><span className="text-muted-foreground">+880 163-0072567</span></div></div>
            <div className="flex items-center space-x-4"><div className="flex items-center space-x-1 cursor-pointer hover:text-foreground"><span className="text-muted-foreground">Eng</span><ChevronDown className="w-4 h-4 text-muted-foreground" /></div><div className="flex items-center space-x-1 cursor-pointer hover:text-foreground"><span className="text-muted-foreground">BDT</span><ChevronDown className="w-4 h-4 text-muted-foreground" /></div></div>
            <div className="hidden lg:flex items-center space-x-2 text-muted-foreground"><a href="https://www.facebook.com/niyeninbd/" target="_blank" rel="noopener noreferrer"><Facebook className="w-4 h-4 hover:text-primary cursor-pointer" /></a><a href="https://www.instagram.com/niyeninbd/" target="_blank" rel="noopener noreferrer"><Instagram className="w-4 h-4 hover:text-accent cursor-pointer" /></a><a href="https://www.youtube.com/@niyeninbd" target="_blank" rel="noopener noreferrer"><Youtube className="w-4 h-4 hover:text-destructive cursor-pointer" /></a><a href="https://www.linkedin.com/company/niyeninbd/" target="_blank" rel="noopener noreferrer"><Linkedin className="w-4 h-4 hover:text-primary cursor-pointer" /></a></div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-card px-4 py-4 border-b border-border">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <button onClick={toggleMobileMenu} className="md:hidden p-2 hover:text-primary">{isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
          <Link href="/" className="flex items-center">{mounted && <Image src={theme === "dark" ? "/images/niyenin-dark.png" : "/images/niyenin-white.png"} alt="NIYENIN" width={240} height={80} className="h-12 w-auto md:h-16" priority />}</Link>
          <div className="flex items-center space-x-2 md:space-x-3">
            <button onClick={() => setIsSearchOpen(true)} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title="Search (Ctrl+K)"><Search className="w-5 h-5" /><span className="text-sm hidden lg:inline">Search...</span><kbd className="hidden xl:inline-flex px-1.5 py-0.5 text-[10px] bg-muted rounded">⌘K</kbd></button>
            <button onClick={() => setIsSearchOpen(true)} className="md:hidden p-2 text-muted-foreground hover:text-foreground"><Search className="w-5 h-5" /></button>
            <Link href="/wishlist" className="relative group"><div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center"><Heart className={`w-5 h-5 md:w-6 md:h-6 ${wishlistItemCount > 0 ? "text-destructive fill-destructive" : "text-muted-foreground group-hover:text-destructive"}`} /></div>{wishlistItemCount > 0 && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center font-medium">{wishlistItemCount > 9 ? "9+" : wishlistItemCount}</motion.div>}</Link>
            <Link href="/cart" className="flex items-center space-x-2 group"><div className="relative"><div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-primary"><ShoppingCart className="w-5 h-5 md:w-6 md:h-6" /></div>{cartItemCount > 0 && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">{cartItemCount > 9 ? "9+" : cartItemCount}</motion.div>}</div><div className="hidden md:block text-sm"><div className="text-muted-foreground text-xs">Shopping cart:</div><div className="text-primary font-semibold">{cartItemCount > 0 ? formatCurrency(subtotal) : "Empty"}</div></div></Link>
            {mounted && <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className={`relative w-10 h-5 md:w-12 md:h-6 rounded-full cursor-pointer ${theme === "dark" ? "bg-primary" : "bg-muted"}`}><div className="absolute inset-0 flex items-center justify-between px-1"><Sun className="w-2 h-2 md:w-3 md:h-3 text-yellow-500" /><Moon className="w-2 h-2 md:w-3 md:h-3 text-blue-300" /></div><motion.div initial={false} animate={{ x: theme === "dark" ? 24 : 0 }} className="absolute top-0.5 left-0.5 md:top-1 md:left-1 w-3 h-3 md:w-4 md:h-4 bg-card rounded-full shadow z-10" /></button>}
          </div>
        </div>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:block bg-card border-t border-border px-4 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="relative" ref={categoryMenuRef}>
            <button className="bg-brand hover:bg-primary/90 text-white px-3 py-2 md:px-4 rounded-lg flex items-center space-x-2 font-medium text-sm" onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}><Menu className="w-4 h-4" /><span className="hidden lg:inline">Browse Category</span><span className="lg:hidden">Browse</span><ChevronDown className={`w-4 h-4 transition-transform ${isCategoryMenuOpen ? "rotate-180" : ""}`} /></button>
            <AnimatePresence>{isCategoryMenuOpen && <CategoryMenu categories={categories} isLoading={isCategoriesLoading} isOpen={isCategoryMenuOpen} onClose={() => setIsCategoryMenuOpen(false)} />}</AnimatePresence>
          </div>
          <nav className="flex items-center space-x-4 lg:space-x-8">
            <Link href="/" className="hover:text-primary font-medium text-sm">Home</Link>
            <Link href="/shop" className="hover:text-primary font-medium text-sm">Shop</Link>
            <div className="flex items-center space-x-1 hover:text-primary cursor-pointer"><span className="font-medium text-sm">Pages</span><ChevronDown className="w-4 h-4" /></div>
            <div className="flex items-center space-x-1 hover:text-primary cursor-pointer"><span className="font-medium text-sm">Blog</span><ChevronDown className="w-4 h-4" /></div>
            <Link href="/about-us" className="hidden lg:flex hover:text-primary font-medium text-sm">About Us</Link>
            <Link href="/contact" className="hover:text-primary font-medium text-sm">Contact</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSearchOpen(true)} className="hidden lg:flex cursor-pointer text-muted-foreground hover:text-foreground"><Search className="w-5 h-5" /></button>
            {isLoading ? <div className="w-20 h-9 bg-muted animate-pulse rounded" /> : isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-2 p-1 rounded-full hover:bg-muted"><UserAvatar user={user} size="md" /><div className="hidden lg:block text-left"><p className="text-sm font-medium truncate max-w-[100px]">{user.name || "User"}</p><p className="text-xs text-muted-foreground truncate max-w-[100px]">{userRole === "vendor" ? "Vendor" : userRole === "admin" || userRole === "super_admin" ? "Admin" : "Customer"}</p></div><ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} /></button>
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-2 w-56 bg-card rounded-lg shadow-lg border border-border py-2 z-50">
                      <div className="px-4 py-3 border-b border-border"><div className="flex items-center space-x-3"><UserAvatar user={user} size="lg" /><div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{user.name || "User"}</p><p className="text-xs text-muted-foreground truncate">{user.email}</p></div></div></div>
                      <div className="py-2">{menuItems.map((item, i) => <Link key={i} href={item.href} onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-3 px-4 py-2 text-sm hover:bg-muted"><item.icon className="w-4 h-4 text-muted-foreground" /><span>{item.label}</span></Link>)}</div>
                      <div className="border-t border-border pt-2"><button onClick={handleSignOut} className="flex items-center space-x-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 w-full"><LogOut className="w-4 h-4" /><span>Sign Out</span></button></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : <Link href="/sign-in"><button className="bg-brand text-white px-3 py-2 md:px-4 rounded font-medium text-xs md:text-sm"><span className="hidden md:inline">Login / Sign Up</span><span className="md:hidden">Login</span></button></Link>}
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-card border-t border-border overflow-hidden">
            <div className="px-4 py-4 space-y-4">
              {isAuthenticated && user && <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg"><UserAvatar user={user} size="lg" /><div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{user.name || "User"}</p><p className="text-xs text-muted-foreground truncate">{user.email}</p></div></div>}
              <SearchBar isOpen={true} onClose={() => setIsMobileMenuOpen(false)} isMobile />
              <div>
                <button className="w-full bg-brand text-white px-4 py-3 rounded-lg flex items-center justify-between font-medium" onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)}><div className="flex items-center space-x-2"><Menu className="w-4 h-4" /><span>Browse Category</span></div><ChevronDown className={`w-4 h-4 transition-transform ${isMobileCategoryOpen ? "rotate-180" : ""}`} /></button>
                <AnimatePresence>{isMobileCategoryOpen && <CategoryMenu categories={categories} isLoading={isCategoriesLoading} isOpen={isMobileCategoryOpen} onClose={() => { setIsMobileCategoryOpen(false); setIsMobileMenuOpen(false); }} isMobile />}</AnimatePresence>
              </div>
              <nav className="space-y-1">{[{ href: "/", label: "Home" }, { href: "/shop", label: "Shop" }, { href: "/about-us", label: "About Us" }, { href: "/contact", label: "Contact" }].map((link) => <Link key={link.href} href={link.href} className="block font-medium py-3 border-b border-border hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>{link.label}</Link>)}</nav>
              {isAuthenticated && user ? (
                <>
                  <div className="pt-4 border-t border-border"><p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-1">Account</p><nav className="space-y-1">{menuItems.map((item, i) => <Link key={i} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3 px-2 py-2 text-sm hover:bg-muted rounded-lg"><item.icon className="w-4 h-4 text-muted-foreground" /><span>{item.label}</span></Link>)}</nav></div>
                  <button onClick={handleSignOut} className="w-full flex items-center justify-center space-x-2 bg-destructive/10 text-destructive px-4 py-3 rounded-lg font-medium hover:bg-destructive/20"><LogOut className="w-4 h-4" /><span>Sign Out</span></button>
                </>
              ) : <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}><button className="w-full bg-brand text-white px-4 py-3 rounded font-medium">Login / Sign Up</button></Link>}
              <div className="pt-4 border-t border-border space-y-2 text-sm"><div className="flex items-center space-x-2 text-muted-foreground"><Mail className="w-4 h-4 text-primary" /><span>niyenin.bd@gmail.com</span></div><div className="flex items-center space-x-2 text-muted-foreground"><Phone className="w-4 h-4 text-primary" /><span>+880 163-0072567</span></div></div>
              <div className="flex items-center justify-center space-x-4 pt-4 border-t border-border text-muted-foreground"><Facebook className="w-5 h-5 hover:text-primary cursor-pointer" /><Twitter className="w-5 h-5 hover:text-primary cursor-pointer" /><Youtube className="w-5 h-5 hover:text-destructive cursor-pointer" /><Linkedin className="w-5 h-5 hover:text-primary cursor-pointer" /><Instagram className="w-5 h-5 hover:text-accent cursor-pointer" /></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Header;