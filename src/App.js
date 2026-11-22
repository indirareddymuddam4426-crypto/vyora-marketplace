import React, { useState, useEffect } from 'react';

const USERS_TABLE = [
    { user_id: "F101", name: "Ramesh", role: "farmer", village: "Pochampally" },
    { user_id: "F102", name: "Lakshmi", role: "farmer", village: "Warangal" },
    { user_id: "C201", name: "Indira", role: "customer", village: "Hyderabad" }
];

const SUPABASE_URL = "https://sfguhtleqiwvvbmukcvq.supabase.co";
const SUPABASE_KEY = "sb_publishable_0bNuA2dHkC3Mu1j5mJbkyw__7JE4xux";

const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
};

const VYORA_BG = "https://i.ibb.co/GffBnkCk/VYORAA.png";

const PHOTOS = {
    honey: "https://images.pexels.com/photos/302163/pexels-photo-302163.jpeg?auto=compress&cs=tinysrgb&w=600",
    custard: "https://images.pexels.com/photos/5945755/pexels-photo-5945755.jpeg?auto=compress&cs=tinysrgb&w=600",
    coconut: "https://images.pexels.com/photos/322483/pexels-photo-322483.jpeg?auto=compress&cs=tinysrgb&w=600",
    tomato: "https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=600",
    milk: "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=600",
    brinjal: "https://images.pexels.com/photos/321551/pexels-photo-321551.jpeg?auto=compress&cs=tinysrgb&w=600",
    carrot: "https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=600",
    paneer: "https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=600",
    corn: "https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&cs=tinysrgb&w=600",
    default: "https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=600"
};

const FALLBACK_PRODUCTS = [
    { product_id: 1, farmer_id: "F101", name: "Organic Forest Honey", category: "Dairy & Honey", price: 350, stock_qty: 10, image: PHOTOS.honey },
    { product_id: 2, farmer_id: "F101", name: "Custard Apple (Sitaphal)", category: "Fruits", price: 120, stock_qty: 25, image: PHOTOS.custard },
    { product_id: 3, farmer_id: "F102", name: "Tender Green Coconut", category: "Fruits", price: 45, stock_qty: 40, image: PHOTOS.coconut },
    { product_id: 4, farmer_id: "F101", name: "Country Tomato", category: "Vegetables", price: 40, stock_qty: 50, image: PHOTOS.tomato },
    { product_id: 5, farmer_id: "F102", name: "Farm Fresh Milk (1L)", category: "Dairy & Honey", price: 65, stock_qty: 20, image: PHOTOS.milk },
    { product_id: 6, farmer_id: "F102", name: "Custard Apple (Sitaphal)", category: "Fruits", price: 95, stock_qty: 18, image: PHOTOS.custard },
    { product_id: 7, farmer_id: "F101", name: "Purple Brinjal", category: "Vegetables", price: 45, stock_qty: 35, image: PHOTOS.brinjal },
    { product_id: 8, farmer_id: "F102", name: "Red Carrot", category: "Vegetables", price: 50, stock_qty: 40, image: PHOTOS.carrot },
    { product_id: 9, farmer_id: "F101", name: "Fresh Malai Paneer", category: "Dairy & Honey", price: 180, stock_qty: 15, image: PHOTOS.paneer },
    { product_id: 10, farmer_id: "F102", name: "Village Sweet Corn", category: "Vegetables", price: 35, stock_qty: 45, image: PHOTOS.corn }
];

const getSmartImage = (name, customUrl) => {
    if (customUrl && customUrl.trim()) return customUrl.trim();
    const lower = name.toLowerCase();
    for (let key of Object.keys(PHOTOS)) {
        if (lower.includes(key)) return PHOTOS[key];
    }
    return PHOTOS.default;
};

export default function App() {
    const [products, setProducts] = useState(FALLBACK_PRODUCTS);
    const [orders, setOrders] = useState([]);
    const [cloudStatus, setCloudStatus] = useState("Connecting...");

    const [currentUser, setCurrentUser] = useState(null);
    const [loginInput, setLoginInput] = useState("");
    const [loginError, setLoginError] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("default");
    const [cart, setCart] = useState([]);

    const [newName, setNewName] = useState("");
    const [newCategory, setNewCategory] = useState("Vegetables");
    const [newPrice, setNewPrice] = useState("");
    const [newStock, setNewStock] = useState("");
    const [newImage, setNewImage] = useState("");

    const [profileOpen, setProfileOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const loadCloudData = async () => {
        try {
            const [prodRes, ordRes] = await Promise.all([
                fetch(SUPABASE_URL + "/rest/v1/products?select=*&order=product_id.asc", { headers }),
                fetch(SUPABASE_URL + "/rest/v1/orders?select=*&order=order_id.desc", { headers })
            ]);
            if (prodRes.ok) {
                const prodData = await prodRes.json();
                if (Array.isArray(prodData) && prodData.length > 0) {
                    setProducts(prodData);
                }
                setCloudStatus("🟢 Live Cloud");
            } else {
                setCloudStatus("⚠️ Local Fallback");
            }
            if (ordRes.ok) {
                const ordData = await ordRes.json();
                if (Array.isArray(ordData)) setOrders(ordData);
            }
        } catch (err) {
            setCloudStatus("⚠️ Offline Mode");
        }
    };

    useEffect(() => {
        loadCloudData();
    }, []);

    const handleLogin = () => {
        const user = USERS_TABLE.find(u => u.user_id.toUpperCase() === loginInput.trim().toUpperCase());
        if (!user) return setLoginError("Invalid ID! Try F101, F102, or C201");
        setCurrentUser(user); setLoginError(""); setLoginInput(""); setProfileOpen(false); setShowHistory(false);
        loadCloudData();
    };

    const handleLogout = () => {
        setCurrentUser(null); setCart([]); setProfileOpen(false); setShowHistory(false);
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!newName || !newPrice || !newStock) return;
        const newItem = {
            product_id: Date.now(),
            farmer_id: currentUser.user_id,
            name: newName,
            category: newCategory,
            price: Number(newPrice),
            stock_qty: Number(newStock),
            image: getSmartImage(newName, newImage)
        };
        setProducts([...products, newItem]);
        setNewName(""); setNewPrice(""); setNewStock(""); setNewImage("");
        await fetch(SUPABASE_URL + "/rest/v1/products", {
            method: "POST",
            headers,
            body: JSON.stringify(newItem)
        });
    };

    const handleDeleteProduct = async (id) => {
        setProducts(products.filter(p => p.product_id !== id));
        await fetch(SUPABASE_URL + "/rest/v1/products?product_id=eq." + id, {
            method: "DELETE",
            headers
        });
    };

    const handleUpdateStock = async (id, change) => {
        const target = products.find(p => p.product_id === id);
        if (!target || target.stock_qty + change < 0) return;
        const updatedQty = target.stock_qty + change;
        setProducts(products.map(p => p.product_id === id ? { ...p, stock_qty: updatedQty } : p));
        await fetch(SUPABASE_URL + "/rest/v1/products?product_id=eq." + id, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ stock_qty: updatedQty })
        });
    };

    const handleAddToCart = (product) => {
        if (product.stock_qty <= 0) return;
        const existing = cart.find(item => item.product_id === product.product_id);
        if (existing) {
            if (existing.qty >= product.stock_qty) return alert("Maximum available stock reached!");
            setCart(cart.map(item => item.product_id === product.product_id ? { ...item, qty: item.qty + 1 } : item));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
    };

    const handleUpdateCartQty = (id, change) => {
        const product = products.find(p => p.product_id === id);
        const cartItem = cart.find(item => item.product_id === id);
        if (cartItem.qty + change > product.stock_qty) return alert("Maximum available stock reached!");
        setCart(cart.map(item => item.product_id === id ? { ...item, qty: item.qty + change } : item).filter(item => item.qty >= 1));
    };

    let totalBill = 0;
    cart.forEach(item => { totalBill += item.price * item.qty; });

    const handleCheckout = async () => {
        const newOrder = { order_id: Date.now(), customer_id: currentUser.user_id, items: cart, total: totalBill };
        const updatedLocal = products.map(prod => {
            const cartItem = cart.find(c => c.product_id === prod.product_id);
            return cartItem ? { ...prod, stock_qty: prod.stock_qty - cartItem.qty } : prod;
        });
        setProducts(updatedLocal);
        setOrders([newOrder, ...orders]);
        for (let cartItem of cart) {
            const prod = products.find(p => p.product_id === cartItem.product_id);
            const newQty = prod.stock_qty - cartItem.qty;
            await fetch(SUPABASE_URL + "/rest/v1/products?product_id=eq." + prod.product_id, {
                method: "PATCH",
                headers,
                body: JSON.stringify({ stock_qty: newQty })
            });
        }
        await fetch(SUPABASE_URL + "/rest/v1/orders", {
            method: "POST",
            headers,
            body: JSON.stringify(newOrder)
        });
        setCart([]);
        alert("Order Placed & Synced to Cloud!");
    };

    const fullDashboardStyle = {
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#f8fafc",
        fontFamily: "sans-serif",
        boxSizing: "border-box"
    };

    const innerContainerStyle = {
        maxWidth: "1050px",
margin: "0 auto",
padding: "20px"
};
const renderNavbar = () => React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", backgroundColor: "white", borderBottom: "2px solid #dcfce7", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", position: "sticky", top: 0, zIndex: 20 } },
React.createElement("div", null,
React.createElement("h2", { style: { margin: 0, color: "#15803d", fontSize: "24px", letterSpacing: "2px" } }, "VYORA"),
React.createElement("small", { style: { color: "#64748b", fontWeight: "500" } }, currentUser.role === "farmer" ? "Farmer Seller Portal" : "Direct Farm-to-Home Storefront")
),
React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px", position: "relative" } },
React.createElement("span", { style: { fontSize: "12px", color: "#475569", backgroundColor: "#f1f5f9", padding: "5px 10px", borderRadius: "12px" } }, cloudStatus),
React.createElement("button", {
onClick: loadCloudData,
style: { padding: "7px 12px", borderRadius: "16px", border: "1px solid #cbd5e1", backgroundColor: "white", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }
}, "🔄 Sync"),
React.createElement("button", {
onClick: () => setProfileOpen(!profileOpen),
style: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "20px", border: "1px solid #86efac", backgroundColor: "#f0fdf4", color: "#15803d", cursor: "pointer", fontWeight: "bold" }
}, "👤 " + currentUser.name + " ▾"),
profileOpen && React.createElement("div", { style: { position: "absolute", right: 0, top: "44px", width: "225px", backgroundColor: "white", border: "1px solid #cbd5e1", borderRadius: "10px", boxShadow: "0 6px 16px rgba(0,0,0,0.15)", padding: "12px", zIndex: 30 } },
React.createElement("p", { style: { margin: "0 0 4px", fontWeight: "bold" } }, currentUser.name + " (" + currentUser.user_id + ")"),
React.createElement("p", { style: { margin: "0 0 10px", fontSize: "12px", color: "#64748b" } }, "📍 " + currentUser.village + " • " + currentUser.role.toUpperCase()),
React.createElement("button", {
onClick: () => { setShowHistory(!showHistory); setProfileOpen(false); loadCloudData(); },
style: { width: "100%", textAlign: "left", padding: "8px", marginBottom: "6px", backgroundColor: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }
}, showHistory ? "← Back to Dashboard" : (currentUser.role === "farmer" ? "💰 Sales History" : "📦 My Order History")),
React.createElement("button", {
onClick: handleLogout,
style: { width: "100%", textAlign: "left", padding: "8px", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }
}, "🚪 Logout")
)
)
);
if (!currentUser) {
return React.createElement("div", {
style: {
minHeight: "100vh",
backgroundImage: "url('" + VYORA_BG + "')",
backgroundSize: "cover",
backgroundPosition: "center",
paddingLeft: "16px",
paddingRight: "16px",
paddingTop: "40px",
paddingBottom: "45px",
display: "flex",
flexDirection: "column",
alignItems: "center",
justifyContent: "flex-end",
fontFamily: "sans-serif",
boxSizing: "border-box"
}
},
React.createElement("div", { style: { maxWidth: "360px", width: "100%", padding: "22px", backgroundColor: "rgba(255, 255, 255, 0.25)", backdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.45)", borderRadius: "18px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.25)" } },
React.createElement("input", {
placeholder: "Enter ID (F101, F102, or C201)",
value: loginInput,
onChange: e => setLoginInput(e.target.value),
style: { width: "100%", padding: "12px", marginBottom: "10px", boxSizing: "border-box", borderRadius: "10px", border: "none", backgroundColor: "rgba(255,255,255,0.92)", color: "#0f172a", fontSize: "15px", outline: "none" }
}),
React.createElement("button", {
onClick: handleLogin,
style: { width: "100%", padding: "12px", backgroundColor: "#15803d", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }
}, "Enter Vyora Marketplace"),
loginError && React.createElement("p", { style: { color: "white", backgroundColor: "rgba(185,28,28,0.85)", padding: "6px", borderRadius: "6px", fontSize: "13px", marginTop: "10px", marginBottom: 0 } }, loginError)
)
);
}
if (currentUser.role === "farmer") {
const myProducts = products.filter(p => p.farmer_id === currentUser.user_id);
let farmerSales = [];
let totalEarned = 0;
orders.forEach(o => {
(o.items || []).filter(i => i.farmer_id === currentUser.user_id).forEach(soldItem => {
farmerSales.push({ ...soldItem, order_id: o.order_id, buyer: o.customer_id });
totalEarned += soldItem.price * soldItem.qty;
});
});
return React.createElement("div", { style: fullDashboardStyle },
renderNavbar(),
React.createElement("div", { style: innerContainerStyle },
showHistory ? React.createElement("div", { style: { padding: "20px", backgroundColor: "white", borderRadius: "12px", border: "1px solid #bbf7d0" } },
React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
React.createElement("h3", { style: { margin: 0 } }, "💰 Sales History — Total Earned: ₹" + totalEarned),
React.createElement("button", { onClick: () => setShowHistory(false) }, "Close")
),
farmerSales.length === 0 ? React.createElement("p", null, "No sales yet.") : farmerSales.map((s, idx) =>
React.createElement("p", { key: idx, style: { borderBottom: "1px solid #dcfce7", paddingBottom: "6px" } }, "Order #" + s.order_id + " (Buyer: " + s.buyer + ") — Sold " + s.qty + " x " + s.name + " = ₹" + (s.price * s.qty))
)
) : React.createElement("div", null,
React.createElement("form", { onSubmit: handleAddProduct, style: { display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap", backgroundColor: "#f0fdf4", padding: "14px", borderRadius: "12px", border: "1px solid #bbf7d0" } },
React.createElement("input", { placeholder: "Item (e.g. Coconut, Paneer)", value: newName, onChange: e => setNewName(e.target.value), style: { padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" } }),
React.createElement("select", { value: newCategory, onChange: e => setNewCategory(e.target.value), style: { padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" } },
React.createElement("option", null, "Vegetables"),
React.createElement("option", null, "Fruits"),
React.createElement("option", null, "Dairy & Honey")
),
React.createElement("input", { type: "number", placeholder: "Price (₹)", value: newPrice, onChange: e => setNewPrice(e.target.value), style: { width: "90px", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" } }),
React.createElement("input", { type: "number", placeholder: "Stock", value: newStock, onChange: e => setNewStock(e.target.value), style: { width: "80px", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" } }),
React.createElement("input", { placeholder: "Photo URL (optional)", value: newImage, onChange: e => setNewImage(e.target.value), style: { width: "160px", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" } }),
React.createElement("button", { type: "submit", style: { backgroundColor: "#15803d", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" } }, "+ Add Harvest")
),
React.createElement("h3", null, "My Listed Harvest (" + myProducts.length + ")"),
myProducts.map(p =>
React.createElement("div", { key: p.product_id, style: { display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #e2e8f0", backgroundColor: "white", padding: "12px", marginBottom: "8px", borderRadius: "10px" } },
React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px" } },
React.createElement("img", { src: p.image, alt: p.name, style: { width: "54px", height: "44px", objectFit: "cover", borderRadius: "8px" } }),
React.createElement("span", null, p.name + " (" + p.category + ") — ₹" + p.price + " | Stock: " + p.stock_qty)
),
React.createElement("div", { style: { display: "flex", gap: "6px" } },
React.createElement("button", { onClick: () => handleUpdateStock(p.product_id, -1) }, "-1"),
React.createElement("button", { onClick: () => handleUpdateStock(p.product_id, 1) }, "+1"),
React.createElement("button", { onClick: () => handleDeleteProduct(p.product_id), style: { color: "red" } }, "Remove")
)
)
)
)
)
);
}
let visibleProducts = products.filter(p => {
const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
return matchesCat && matchesSearch;
});
if (sortOrder === "low") visibleProducts = [...visibleProducts].sort((a, b) => a.price - b.price);
if (sortOrder === "high") visibleProducts = [...visibleProducts].sort((a, b) => b.price - a.price);
const myOrders = orders.filter(o => o.customer_id === currentUser.user_id);
return React.createElement("div", { style: fullDashboardStyle },
renderNavbar(),
React.createElement("div", { style: innerContainerStyle },
showHistory ? React.createElement("div", { style: { padding: "20px", backgroundColor: "white", borderRadius: "12px", border: "1px solid #bbf7d0" } },
React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
React.createElement("h3", { style: { margin: 0 } }, "📦 My Order History (" + myOrders.length + ")"),
React.createElement("button", { onClick: () => setShowHistory(false) }, "Close")
),
myOrders.length === 0 ? React.createElement("p", null, "No orders placed yet.") : myOrders.map(o => {
const receiptTotal = o.total !== undefined ? o.total : (o.items || []).reduce((sum, item) => sum + item.price * item.qty, 0);
return React.createElement("div", { key: o.order_id, style: { borderBottom: "1px solid #dcfce7", padding: "8px 0" } },
React.createElement("strong", null, "Order #" + o.order_id + " — Paid: ₹" + receiptTotal),
(o.items || []).map(i => React.createElement("p", { key: i.product_id, style: { margin: "2px 0 0 12px", fontSize: "14px" } }, "• " + i.name + " x " + i.qty + " (₹" + (i.price * i.qty) + ")"))
);
})
) : React.createElement("div", null,
React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "18px" } },
React.createElement("div", { style: { display: "flex", gap: "6px", flexWrap: "wrap" } },
["All", "Fruits", "Vegetables", "Dairy & Honey"].map(cat =>
React.createElement("button", { key: cat, onClick: () => setSelectedCategory(cat), style: { padding: "7px 15px", borderRadius: "20px", border: "1px solid #15803d", backgroundColor: selectedCategory === cat ? "#15803d" : "white", color: selectedCategory === cat ? "white" : "#15803d", cursor: "pointer", fontWeight: "bold" } }, cat)
)
),
React.createElement("div", { style: { display: "flex", gap: "8px" } },
React.createElement("input", { placeholder: "Search coconut, paneer...", value: searchQuery, onChange: e => setSearchQuery(e.target.value), style: { padding: "7px 10px", borderRadius: "8px", border: "1px solid #cbd5e1" } }),
React.createElement("select", { value: sortOrder, onChange: e => setSortOrder(e.target.value), style: { padding: "7px", borderRadius: "8px", border: "1px solid #cbd5e1" } },
React.createElement("option", { value: "default" }, "Sort: Default"),
React.createElement("option", { value: "low" }, "Price: Low to High"),
React.createElement("option", { value: "high" }, "Price: High to Low")
)
)
),
React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "16px" } },
visibleProducts.map(p => {
const seller = USERS_TABLE.find(u => u.user_id === p.farmer_id) || { name: "Village Farmer", village: "Telangana" };
return React.createElement("div", { key: p.product_id, style: { border: "1px solid #cbd5e1", borderRadius: "12px", overflow: "hidden", backgroundColor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" } },
React.createElement("img", { src: p.image, alt: p.name, style: { width: "100%", height: "145px", objectFit: "cover" } }),
React.createElement("div", { style: { padding: "12px" } },
React.createElement("small", { style: { color: "#15803d", fontWeight: "bold" } }, p.category),
React.createElement("h3", { style: { margin: "4px 0" } }, p.name),
React.createElement("p", { style: { margin: "2px 0", fontSize: "13px", color: "#475569" } }, "👨‍🌾 " + seller.name + " (" + seller.village + ")"),
React.createElement("p", { style: { margin: "6px 0", fontWeight: "bold", fontSize: "15px" } }, "₹" + p.price + " • Stock: " + p.stock_qty),
React.createElement("button", {
onClick: () => handleAddToCart(p),
disabled: p.stock_qty === 0,
style: { marginTop: "6px", width: "100%", padding: "9px", backgroundColor: p.stock_qty === 0 ? "#94a3b8" : "#15803d", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }
}, p.stock_qty === 0 ? "Out of Stock" : "Add to Cart")
)
);
})
),
React.createElement("div", { style: { marginTop: "30px", padding: "16px", backgroundColor: "#f0fdf4", borderRadius: "12px", border: "1px solid #bbf7d0" } },
React.createElement("h3", { style: { marginTop: 0 } }, "🛒 My Cart (" + cart.length + " items)"),
cart.map(item =>
React.createElement("div", { key: item.product_id, style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", backgroundColor: "white", padding: "8px 12px", borderRadius: "8px" } },
React.createElement("span", null, item.name + " — Qty: " + item.qty + " (₹" + (item.price * item.qty) + ")"),
React.createElement("div", { style: { display: "flex", gap: "6px" } },
React.createElement("button", { onClick: () => handleUpdateCartQty(item.product_id, -1) }, "-1"),
React.createElement("button", { onClick: () => handleUpdateCartQty(item.product_id, 1) }, "+1")
)
)
),
cart.length > 0 && React.createElement("div", null,
React.createElement("h4", null, "Total Bill: ₹" + totalBill),
React.createElement("button", { onClick: handleCheckout, style: { padding: "10px 22px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" } }, "Buy Now & Update Stock")
)
)
)
)
);
        }
