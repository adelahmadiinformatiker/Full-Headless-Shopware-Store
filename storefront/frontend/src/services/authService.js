export const loginUser = async (email, password) => {
  // 🔐 ارسال درخواست ورود به API سمت Club Manager
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Login failed");
  }

  const result = await response.json(); // شامل { user, contextToken }

  // 🔄 همگام‌سازی سبد خرید کاربر مهمان با حساب کاربری پس از ورود
  const oldToken = localStorage.getItem("contextToken"); // توکن قدیمی مهمان
  const newToken = result.contextToken; // توکن جدید کاربر لاگین‌شده

  console.log("[Login] Old token:", oldToken);
  console.log("[Login] New token:", newToken);

  if (oldToken && newToken && oldToken !== newToken) {
    console.log("[Login] Migrating guest cart to user account...");
    // ارسال درخواست برای ادغام سبد مهمان با سبد کاربر لاگین
    await fetch(
      `${import.meta.env.VITE_SHOPWARE_API_BASE_URL}/store-api/merge-carts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "sw-context-token": newToken, // ارسال با توکن جدید کاربر
          "sw-access-key": import.meta.env.VITE_ACCESS_KEY,
        },
        body: JSON.stringify({ sourceCartToken: oldToken }), // سبد مهمان به عنوان منبع
      }
    );
  }

  // 💾 ذخیره contextToken جدید در localStorage برای استفاده‌های بعدی
  localStorage.setItem("contextToken", newToken);

  console.log("[Login] New contextToken saved:", newToken);

  // اطلاع‌رسانی به سایر بخش‌های اپ که contextToken تغییر کرده
  window.dispatchEvent(new Event("contextTokenUpdated"));
  console.log("[Login] contextTokenUpdated event dispatched");

  return result;
};
