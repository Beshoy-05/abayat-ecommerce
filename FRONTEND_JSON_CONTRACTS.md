# 📜 Complete Frontend & Backend Integration Contract (JSON & DTOs)
> **المصدر المعتمد والمطابق 100% لكود الـ Backend (.NET 8 Clean Architecture)**
>
> هذا الملف صُمم خصيصاً لفريق الـ Frontend (React / Next.js / Vue / Mobile) لمنع أي **Conflicts** أو أخطاء في الـ DTOs والـ JSON Payloads.

---

## 📌 القواعد الذهبية لمنع الـ Conflicts (Golden Rules)

1. **حالة الحروف (Property Casing):**
   - الـ Backend يقوم بعمل Serialize لجميع حقول الـ JSON بتنسيق **`camelCase`** افتراضياً (مثال: `totalAmount` وليس `TotalAmount`، `shippingAddress` وليس `ShippingAddress`).
2. **استخراج هوية المستخدم تلقائياً (Zero IDOR Security):**
   - في جميع الـ Endpoints الخاصة بالـ `Cart` والـ `Orders` والـ `Favorites` والـ `Reviews` والـ `Account`: **لا ترسل `customerId` في الـ Request Body أبداً**.
   - الـ Backend يقرأ الـ Customer Id تلقائياً ومباشرة من الـ **JWT Token** (`ClaimTypes.NameIdentifier`).
3. **أشكال الردود (Response Wrappers):**
   - **الردود العادية الناجحة (200 OK / 201 Created):** ترجع الـ Object أو الـ Array أو القيمة مباشرة دون Envelope إضافي.
   - **ردود القوائم والصفحات (Pagination):** ترجع داخل الـ Wrapper الثابت `PaginatedList<T>` (تفاصيله أدناه).
   - **ردود الأخطاء (400, 401, 403, 404, 409, 429, 500):** ترجع بصيغة موحدة ثابتة تحتوي على `statusCode`, `message`, `errors`.
4. **الـ Headers الإلزامية:**
   - لجميع الـ Endpoints المحمية بـ `[Authorize]`:
     ```http
     Authorization: Bearer <JWT_TOKEN>
     Content-Type: application/json
     ```
   - لرفع الصور: `Content-Type: multipart/form-data`.

---

## 0. الهياكل العامة الموحدة (Global Schemas)

### أ) رد الخطأ القياسي (Standard Error Response)
عند حدوث أي خطأ في التحقق من البيانات (Validation) أو في السيرفر:
```json
{
  "statusCode": 400,
  "message": "One or more validation errors occurred.",
  "errors": [
    "Product price must be greater than zero.",
    "Shipping address is required."
  ]
}
```

### ب) مغلف الصفحات القياسي (Standard Paginated List Envelope: `PaginatedList<T>`)
يُستخدم في قوائم المنتجات، طلبات الأدمن، العملاء، ومراجعات المنتجات:
```json
{
  "pageIndex": 1,
  "pageSize": 10,
  "totalCount": 42,
  "totalPages": 5,
  "hasPreviousPage": false,
  "hasNextPage": true,
  "data": [
    /* مصفوفة العناصر T */
  ]
}
```

---

## 1. المصادقة والحساب (Authentication & Account)

### 1.1 تسجيل مستخدم جديد
- **Method & Route:** `POST /api/Auth/register`
- **Rate Limit:** 10 requests / min
- **Request Body:**
```json
{
  "displayName": "أمينة أحمد",
  "email": "amina@example.com",
  "password": "Password123!",
  "phoneNumber": "+201012345678"
}
```
- **Response Body (200 OK):**
```json
{
  "displayName": "أمينة أحمد",
  "email": "amina@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1IiwibmFtZWlkIjoiNSIsImVtYWlsIjoiYW1pbmFAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciJ9..."
}
```

---

### 1.2 تسجيل الدخول
- **Method & Route:** `POST /api/Auth/login`
- **Rate Limit:** 10 requests / min
- **Request Body:**
```json
{
  "email": "amina@example.com",
  "password": "Password123!"
}
```
- **Response Body (200 OK):**
```json
{
  "displayName": "أمينة أحمد",
  "email": "amina@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 1.3 الحصول على بيانات الملف الشخصي
- **Method & Route:** `GET /api/Account/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response Body (200 OK):**
```json
{
  "id": 5,
  "displayName": "أمينة أحمد",
  "email": "amina@example.com",
  "phoneNumber": "+201012345678",
  "roles": [
    "user"
  ]
}
```

---

### 1.4 تحديث الملف الشخصي
- **Method & Route:** `PUT /api/Account/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "displayName": "أمينة أحمد السيد",
  "phoneNumber": "+201098765432"
}
```
- **Response Body (200 OK):**
```json
{
  "id": 5,
  "displayName": "أمينة أحمد السيد",
  "email": "amina@example.com",
  "phoneNumber": "+201098765432",
  "roles": [
    "user"
  ]
}
```

---

### 1.5 تغيير كلمة المرور
- **Method & Route:** `PUT /api/Account/change-password`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewStrongPassword2026!"
}
```
- **Response Body (200 OK):**
```json
true
```

---

### 1.6 حذف الحساب نهائياً
- **Method & Route:** `DELETE /api/Account`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "password": "NewStrongPassword2026!"
}
```
- **Response Body (200 OK):**
```json
true
```

---

## 2. المنتجات والكتالوج (Products Catalog)

### 2.1 جلب المنتجات مع الفلترة والصفحات
- **Method & Route:** `GET /api/Products`
- **Query Parameters:**
  - `pageIndex` (number, default: `1`)
  - `pageSize` (number, default: `10`, max: `50`)
  - `categoryId` (number, optional)
  - `search` (string, optional)
  - `size` (string, optional, e.g. `"54"`)
  - `color` (string, optional, e.g. `"Black"`)
  - `minPrice` (number, optional)
  - `maxPrice` (number, optional)
  - `sortingOption` (number: `1` = NameAsc, `2` = NameDesc, `3` = PriceAsc, `4` = PriceDesc)
- **Response Body (200 OK):**
```json
{
  "pageIndex": 1,
  "pageSize": 10,
  "totalCount": 25,
  "totalPages": 3,
  "hasPreviousPage": false,
  "hasNextPage": true,
  "data": [
    {
      "id": 1,
      "name": "عباية كريب ملكي كلاسيك",
      "description": "عباية فاخرة بقماش الكريب الملكي الكوري مع تطريز يدوي على الأكمام.",
      "price": 850.00,
      "discount": 100.00,
      "finalPrice": 750.00,
      "categoryId": 2,
      "categoryName": "عبايات مناسبات",
      "pictureUrl": "https://res.cloudinary.com/demo/image/upload/abaya-1.webp",
      "images": [
        "https://res.cloudinary.com/demo/image/upload/abaya-1-front.webp",
        "https://res.cloudinary.com/demo/image/upload/abaya-1-back.webp"
      ],
      "variants": [
        {
          "id": 101,
          "productId": 1,
          "color": "أسود ملكي",
          "size": "54",
          "stockQuantity": 8,
          "images": [
            "https://res.cloudinary.com/demo/image/upload/black-54.webp"
          ]
        }
      ],
      "colorGroups": [
        {
          "color": "أسود ملكي",
          "images": [
            "https://res.cloudinary.com/demo/image/upload/black-1.webp",
            "https://res.cloudinary.com/demo/image/upload/black-2.webp"
          ],
          "sizes": [
            { "variantId": 101, "size": "52", "stockQuantity": 4 },
            { "variantId": 102, "size": "54", "stockQuantity": 8 },
            { "variantId": 103, "size": "56", "stockQuantity": 0 }
          ]
        },
        {
          "color": "كحلي داكن",
          "images": [
            "https://res.cloudinary.com/demo/image/upload/navy-1.webp"
          ],
          "sizes": [
            { "variantId": 104, "size": "54", "stockQuantity": 6 },
            { "variantId": 105, "size": "56", "stockQuantity": 3 }
          ]
        }
      ]
    }
  ]
}
```

---

### 2.2 جلب منتج محدد بالتفصيل
- **Method & Route:** `GET /api/Products/{id}`
- **Response Body (200 OK):** (نفس كائن الـ `ProductDto` الموضح أعلاه)

---

### 2.3 إنشاء منتج جديد (Admin Only)
- **Method & Route:** `POST /api/Products`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Request Body:**
```json
{
  "name": "عباية حرير كاجوال",
  "description": "عباية مريحة وعملية للاستخدام اليومي مع خامة انسيابية خفيفة.",
  "price": 600.00,
  "categoryId": 1,
  "discount": 50.00,
  "imageUrl": "https://res.cloudinary.com/demo/image/upload/silk-abaya.webp",
  "imageUrls": [
    "https://res.cloudinary.com/demo/image/upload/silk-1.webp",
    "https://res.cloudinary.com/demo/image/upload/silk-2.webp"
  ],
  "colorGroups": [
    {
      "color": "أسود",
      "imageUrls": [
        "https://res.cloudinary.com/demo/image/upload/black-angle.webp"
      ],
      "sizes": [
        { "size": "52", "stockQuantity": 10 },
        { "size": "54", "stockQuantity": 15 },
        { "size": "56", "stockQuantity": 5 }
      ]
    },
    {
      "color": "رمادي دخاني",
      "imageUrls": [
        "https://res.cloudinary.com/demo/image/upload/grey-angle.webp"
      ],
      "sizes": [
        { "size": "54", "stockQuantity": 7 },
        { "size": "56", "stockQuantity": 4 }
      ]
    }
  ]
}
```
- **Response Body (201 Created):**
```json
14
```
*(يرجع رقم الـ ID الخاص بالمنتج الجديد مباشرة)*

---

### 2.4 تعديل منتج (Admin Only)
- **Method & Route:** `PUT /api/Products/{id}`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Request Body:**
```json
{
  "id": 14,
  "name": "عباية حرير كاجوال محدثة",
  "description": "عباية مريحة وعملية للاستخدام اليومي بتصميم عصري.",
  "price": 650.00,
  "categoryId": 1,
  "discount": 0,
  "imageUrl": "https://res.cloudinary.com/demo/image/upload/silk-abaya.webp",
  "imageUrls": [
    "https://res.cloudinary.com/demo/image/upload/silk-1.webp"
  ],
  "colorGroups": [
    {
      "color": "أسود",
      "imageUrls": [
        "https://res.cloudinary.com/demo/image/upload/black-angle.webp"
      ],
      "sizes": [
        { "size": "52", "stockQuantity": 12 },
        { "size": "54", "stockQuantity": 18 }
      ]
    }
  ]
}
```
- **Response Body (200 OK):** `Status 200 OK`

---

### 2.5 حذف منتج (Admin Only)
- **Method & Route:** `DELETE /api/Products/{id}`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response Body (200 OK):** `Status 200 OK`

---

## 3. الأقسام (Categories)

### 3.1 جلب كل الأقسام
- **Method & Route:** `GET /api/Categories`
- **Response Body (200 OK):**
```json
[
  {
    "id": 1,
    "name": "عبايات كاجوال وعملية",
    "productsCount": 14
  },
  {
    "id": 2,
    "name": "عبايات سهرة ومناسبات",
    "productsCount": 9
  },
  {
    "id": 3,
    "name": "عبايات ملونة ومطرزة",
    "productsCount": 6
  }
]
```

---

### 3.2 جلب قسم محدد
- **Method & Route:** `GET /api/Categories/{id}`
- **Response Body (200 OK):**
```json
{
  "id": 1,
  "name": "عبايات كاجوال وعملية",
  "productsCount": 14
}
```

---

### 3.3 إنشاء قسم جديد (Admin Only)
- **Method & Route:** `POST /api/Categories`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Request Body:**
```json
{
  "name": "كولكشن العيد 2026"
}
```
- **Response Body (201 Created):**
```json
4
```

---

### 3.4 تعديل قسم (Admin Only)
- **Method & Route:** `PUT /api/Categories/{id}`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Request Body:**
```json
{
  "id": 4,
  "name": "تشكيلة العيد الفاخرة"
}
```
- **Response Body (200 OK):** `Status 200 OK`

---

### 3.5 حذف قسم (Admin Only)
- **Method & Route:** `DELETE /api/Categories/{id}`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response Body (200 OK):** `Status 200 OK`

---

## 4. سلة التسوق (Shopping Cart)

### 4.1 عرض سلة المستخدم الحالي
- **Method & Route:** `GET /api/Carts`
- **Headers:** `Authorization: Bearer <token>`
- **Response Body (200 OK):**
```json
{
  "id": 12,
  "customerId": 5,
  "items": [
    {
      "id": 31,
      "productVariantId": 102,
      "productName": "عباية كريب ملكي كلاسيك",
      "color": "أسود ملكي",
      "size": "54",
      "unitPrice": 750.00,
      "quantity": 2,
      "totalPrice": 1500.00
    }
  ],
  "totalAmount": 1500.00
}
```

---

### 4.2 إضافة عنصر إلى السلة
- **Method & Route:** `POST /api/Carts/items`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "productVariantId": 102,
  "quantity": 1
}
```
*(ملاحظة هامة: لا ترسل customerId نهائياً)*
- **Response Body (200 OK):**
```json
{
  "success": true,
  "message": "Item added to cart successfully."
}
```

---

### 4.3 إزالة عنصر من السلة
- **Method & Route:** `DELETE /api/Carts/items/{cartItemId}`
- **Headers:** `Authorization: Bearer <token>`
- **Response Body (200 OK):**
```json
{
  "success": true,
  "message": "Item removed from cart successfully."
}
```

---

## 5. قائمة الرغبات / المفضلة (Favorites)

### 5.1 عرض مفضلات المستخدم الحالي
- **Method & Route:** `GET /api/Favorites`
- **Headers:** `Authorization: Bearer <token>`
- **Response Body (200 OK):**
```json
[
  {
    "productId": 1,
    "productName": "عباية كريب ملكي كلاسيك",
    "productDescription": "عباية فاخرة بقماش الكريب الملكي...",
    "productPrice": 750.00,
    "categoryId": 2,
    "categoryName": "عبايات مناسبات",
    "pictureUrl": "https://res.cloudinary.com/demo/image/upload/abaya-1.webp"
  }
]
```

---

### 5.2 تبديل الإضافة/الحذف من المفضلة (Toggle)
- **Method & Route:** `POST /api/Favorites/toggle/{productId}`
- **Headers:** `Authorization: Bearer <token>`
- **Response Body (200 OK):**
```json
true
```
*(يرجع `true` إذا تمت إضافته للمفضلة، و `false` إذا تم حذفه)*

---

### 5.3 حذف منتج من المفضلة
- **Method & Route:** `DELETE /api/Favorites/{productId}`
- **Headers:** `Authorization: Bearer <token>`
- **Response Body (200 OK):**
```json
true
```

---

### 5.4 فحص هل المنتج في المفضلة
- **Method & Route:** `GET /api/Favorites/check/{productId}`
- **Headers:** `Authorization: Bearer <token>`
- **Response Body (200 OK):**
```json
true
```

---

## 6. الطلبات (Orders Management)

### 6.1 إنشاء طلب جديد (Checkout)
- **Method & Route:** `POST /api/Orders`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "shippingAddress": "فيلا 14، الحي الدبلوماسي، التجمع الخامس، القاهرة",
  "items": [
    {
      "productVariantId": 102,
      "quantity": 2
    }
  ],
  "deliveryMethodId": 1,
  "paymentMethod": "CashOnDelivery",
  "paymentReceiptUrl": null,
  "comments": "يرجى الاتصال بي هاتفياً قبل موعد التسليم بنصف ساعة"
}
```
*(طرق الدفع المدعومة: `"CashOnDelivery"`, `"Card"`, `"VodafoneCash"`, إلخ)*
- **Response Body (201 Created):**
```json
45
```
*(يرجع رقم معرف الطلب الجديد Order ID كـ integer)*

---

### 6.2 جلب طلبات المستخدم الحالي
- **Method & Route:** `GET /api/Orders`
- **Headers:** `Authorization: Bearer <token>`
- **Response Body (200 OK):**
```json
[
  {
    "id": 45,
    "orderDate": "2026-10-27T16:30:00Z",
    "status": "Pending",
    "totalAmount": 1560.00,
    "shippingAddress": "فيلا 14، الحي الدبلوماسي، التجمع الخامس، القاهرة",
    "paymentMethod": "CashOnDelivery",
    "paymentReceiptUrl": null,
    "cancellationReason": null,
    "comments": "يرجى الاتصال بي هاتفياً قبل موعد التسليم بنصف ساعة",
    "customerId": 5,
    "deliveryMethodId": 1,
    "deliveryMethod": "شحن سريع قياسي (القاهرة والجيزة)",
    "deliveryCost": 60.00,
    "items": [
      {
        "id": 88,
        "productVariantId": 102,
        "productName": "عباية كريب ملكي كلاسيك",
        "color": "أسود ملكي",
        "size": "54",
        "unitPrice": 750.00,
        "quantity": 2,
        "totalPrice": 1500.00
      }
    ]
  }
]
```

---

### 6.3 تفاصيل طلب محدد بالرقم
- **Method & Route:** `GET /api/Orders/{id}`
- **Headers:** `Authorization: Bearer <token>`
- **Response Body (200 OK):** (نفس كائن الـ `OrderDto` أعلاه)

---

### 6.4 إلغاء طلب من قبل العميل أو الأدمن
- **Method & Route:** `PUT /api/Orders/{id}/cancel`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "reason": "تغيير المقاس المطلوب قبل تجهيز الشحنة"
}
```
- **Response Body (200 OK):** `Status 200 OK`

---

### 6.5 قبول واعتماد طلب (Admin Only)
- **Method & Route:** `PUT /api/Orders/{id}/approve`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response Body (200 OK):** `Status 200 OK`

---

### 6.6 جلب جميع الطلبات بنظام الصفحات (Admin Only)
- **Method & Route:** `GET /api/Orders/all`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Query Parameters:** `pageIndex` (default: 1), `pageSize` (default: 10, max: 50)
- **Response Body (200 OK):**
```json
{
  "pageIndex": 1,
  "pageSize": 10,
  "totalCount": 128,
  "totalPages": 13,
  "hasPreviousPage": false,
  "hasNextPage": true,
  "data": [
    /* مصفوفة كائنات OrderDto */
  ]
}
```

---

## 7. التقييمات والمراجعات (Reviews)

### 7.1 جلب تقييمات منتج معين مع الإحصائيات (Public)
- **Method & Route:** `GET /api/Reviews/product/{productId}`
- **Query Parameters:**
  - `pageIndex` (default: 1)
  - `pageSize` (default: 10)
  - `sortingOption` (1 = DateDesc, 2 = DateAsc, 3 = RatingHigh, 4 = RatingLow)
- **Response Body (200 OK):**
```json
{
  "productId": 1,
  "averageRating": 4.8,
  "totalReviews": 18,
  "createdAt": "2026-10-27T18:00:00Z",
  "reviews": {
    "pageIndex": 1,
    "pageSize": 10,
    "totalCount": 18,
    "totalPages": 2,
    "hasPreviousPage": false,
    "hasNextPage": true,
    "data": [
      {
        "id": 12,
        "productId": 1,
        "customerId": 5,
        "customerName": "أمينة أحمد",
        "stars": 5,
        "message": "خامة الكريب فاخرة جداً والتطريز متقن للغاية. التوصيل كان سريعاً أيضاً!",
        "createdAt": "2026-10-25T14:20:00Z"
      }
    ]
  }
}
```

---

### 7.2 إضافة تقييم جديد
- **Method & Route:** `POST /api/Reviews`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "productId": 1,
  "stars": 5,
  "message": "خامة ممتازة ومقاس مظبوط بالملي، أنصح بالشراء."
}
```
- **Response Body (201 Created):**
```json
{
  "id": 13,
  "productId": 1,
  "customerId": 5,
  "customerName": "أمينة أحمد",
  "stars": 5,
  "message": "خامة ممتازة ومقاس مظبوط بالملي، أنصح بالشراء.",
  "createdAt": "2026-10-27T19:00:00Z"
}
```

---

### 7.3 تعديل تقييم
- **Method & Route:** `PUT /api/Reviews/{id}`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "stars": 4,
  "message": "العباية رائعة جداً ولكن أتمنى توفير ألوان إضافية قريباً."
}
```
- **Response Body (200 OK):**
```json
true
```

---

### 7.4 حذف تقييم
- **Method & Route:** `DELETE /api/Reviews/{id}`
- **Headers:** `Authorization: Bearer <token>`
- **Response Body (200 OK):**
```json
true
```

---

## 8. خيارات وطرق الشحن والتوصيل (Delivery Methods)

### 8.1 جلب جميع طرق التوصيل
- **Method & Route:** `GET /api/DeliveryMethods`
- **Response Body (200 OK):**
```json
[
  {
    "id": 1,
    "shortName": "شحن قياسي (القاهرة والجيزة)",
    "description": "التسليم خلال 2 - 3 أيام عمل",
    "deliveryTime": "2-3 أيام",
    "cost": 60.00
  },
  {
    "id": 2,
    "shortName": "شحن إكسبريس فوري",
    "description": "التوصيل خلال 24 ساعة للطلبات العاجلة داخل القاهرة",
    "deliveryTime": "24 ساعة",
    "cost": 120.00
  },
  {
    "id": 3,
    "shortName": "شحن المحافظات والأقاليم",
    "description": "التسليم للإسكندرية، الدلتا، والقناة خلال 3 - 5 أيام عمل",
    "deliveryTime": "3-5 أيام",
    "cost": 85.00
  }
]
```

---

### 8.2 إضافة طريقة شحن جديدة (Admin Only)
- **Method & Route:** `POST /api/DeliveryMethods`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Request Body:**
```json
{
  "shortName": "شحن دولي (الخليج العربي)",
  "description": "شحن عبر أرامكس لجميع دول مجلس التعاون الخليجي",
  "deliveryTime": "4-7 أيام",
  "cost": 450.00
}
```
- **Response Body (201 Created):**
```json
4
```

---

### 8.3 تعديل طريقة شحن (Admin Only)
- **Method & Route:** `PUT /api/DeliveryMethods/{id}`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Request Body:**
```json
{
  "id": 4,
  "shortName": "شحن دولي إكسبريس (الخليج العربي)",
  "description": "شحن سريع عبر DHL لدول الخليج",
  "deliveryTime": "3-5 أيام",
  "cost": 500.00
}
```
- **Response Body (200 OK):** `Status 200 OK`

---

### 8.4 حذف طريقة شحن (Admin Only)
- **Method & Route:** `DELETE /api/DeliveryMethods/{id}`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response Body (200 OK):** `Status 200 OK`

---

## 9. لوحة تحكم الإدارة والإحصائيات (Admin Dashboard)

### 9.1 ملخص الإحصائيات الشامل للوحة التحكم
- **Method & Route:** `GET /api/Dashboard/summary?days=30`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response Body (200 OK):**
```json
{
  "revenue": {
    "totalRevenue": 348500.00,
    "todayRevenue": 12400.00,
    "thisMonthRevenue": 96800.00
  },
  "orders": {
    "totalOrders": 420,
    "pendingOrders": 12,
    "approvedOrders": 385,
    "cancelledOrders": 23,
    "todayOrders": 14
  },
  "customers": {
    "totalCustomers": 280,
    "newCustomersToday": 6,
    "newCustomersThisMonth": 45
  },
  "catalog": {
    "totalProducts": 54,
    "totalCategories": 6,
    "lowStockCount": 4
  },
  "topSellingProducts": [
    {
      "productId": 1,
      "productName": "عباية كريب ملكي كلاسيك",
      "totalQuantitySold": 78,
      "totalRevenue": 58500.00,
      "imageUrl": "https://res.cloudinary.com/demo/image/upload/abaya-1.webp"
    }
  ],
  "lowStockAlerts": [
    {
      "productId": 1,
      "productName": "عباية كريب ملكي كلاسيك",
      "variantId": 103,
      "color": "أسود ملكي",
      "size": "56",
      "quantity": 1
    }
  ],
  "recentOrders": [
    {
      "orderId": 45,
      "customerName": "أمينة أحمد",
      "orderDate": "2026-10-27T16:30:00Z",
      "totalAmount": 1560.00,
      "status": "Pending",
      "itemsCount": 2
    }
  ],
  "dailySalesTrend": [
    {
      "date": "2026-10-27",
      "revenue": 12400.00,
      "ordersCount": 14
    }
  ]
}
```

---

## 10. إدارة العملاء والأدوار (Customers & Roles - Admin Only)

### 10.1 جلب كل العملاء مع البحث والصفحات
- **Method & Route:** `GET /api/Customers`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Query Parameters:** `pageIndex` (default: 1), `pageSize` (default: 10), `search` (optional)
- **Response Body (200 OK):**
```json
{
  "pageIndex": 1,
  "pageSize": 10,
  "totalCount": 280,
  "totalPages": 28,
  "hasPreviousPage": false,
  "hasNextPage": true,
  "data": [
    {
      "id": 5,
      "name": "أمينة أحمد",
      "userName": "amina@example.com",
      "email": "amina@example.com",
      "phone": "+201012345678",
      "role": "User",
      "roles": [
        "User"
      ]
    }
  ]
}
```

---

### 10.2 إضافة دور لمستخدم (Assign Role)
- **Method & Route:** `POST /api/Customers/{userId}/roles/{role}`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response Body (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Role assigned successfully."
}
```

---

### 10.3 إزالة دور من مستخدم (Remove Role)
- **Method & Route:** `DELETE /api/Customers/{userId}/roles/{role}`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response Body (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Role removed successfully."
}
```

---

## 11. رفع وإدارة الصور السحابية (Images & Cloudinary)

### 11.1 جلب توقيع الرفع المباشر (Direct Upload Signature)
- **Method & Route:** `GET /api/Images/upload-signature?fileName=abaya.webp&folder=products`
- **Response Body (200 OK):**
```json
{
  "signature": "3a9fb87a912e6c43f...",
  "timestamp": 1729000000,
  "apiKey": "123456789012345",
  "cloudName": "abaya-cloud",
  "folder": "products",
  "publicId": "products/abaya_1729000000",
  "uploadUrl": "https://api.cloudinary.com/v1_1/abaya-cloud/image/upload"
}
```

---

### 11.2 رفع صورة فردية عبر السيرفر (Multipart Form-Data)
- **Method & Route:** `POST /api/Images/upload?folder=products`
- **Headers:** `Content-Type: multipart/form-data`
- **Form Data Field:** `file` (File binary)
- **Response Body (200 OK):**
```json
{
  "publicId": "products/img_987654",
  "url": "http://res.cloudinary.com/abaya-cloud/image/upload/v1/products/img_987654.webp",
  "secureUrl": "https://res.cloudinary.com/abaya-cloud/image/upload/v1/products/img_987654.webp",
  "format": "webp",
  "bytes": 184500,
  "width": 1200,
  "height": 1600
}
```

---

### 11.3 رفع عدة صور دفعة واحدة (Bulk Upload)
- **Method & Route:** `POST /api/Images/upload-multiple?folder=products`
- **Headers:** `Content-Type: multipart/form-data`
- **Form Data Field:** `files` (Array of File binaries)
- **Response Body (200 OK):**
```json
[
  {
    "publicId": "products/img_01",
    "url": "http://res.cloudinary.com/.../img_01.webp",
    "secureUrl": "https://res.cloudinary.com/.../img_01.webp",
    "format": "webp",
    "bytes": 142000,
    "width": 1200,
    "height": 1600
  },
  {
    "publicId": "products/img_02",
    "url": "http://res.cloudinary.com/.../img_02.webp",
    "secureUrl": "https://res.cloudinary.com/.../img_02.webp",
    "format": "webp",
    "bytes": 158000,
    "width": 1200,
    "height": 1600
  }
]
```

---

### 11.4 حذف صورة من Cloudinary
- **Method & Route:** `DELETE /api/Images/{*publicId}`
- **Response Body (200 OK):** `Status 200 OK`

---

## 12. إعدادات المتجر وبيانات الموقع (Site Settings)

### 12.1 جلب إعدادات وتخصيصات المتجر (Public)
- **Method & Route:** `GET /api/Settings`
- **Response Body (200 OK):**
```json
{
  "id": 1,
  "storeName": "قصر العباية | Qasr Al-Abaya",
  "aboutUs": "متجر رائد يقدم أفخم وأرقى تصاميم العبايات الخليجية والمصرية المصنوعة يدوياً بأجود الأقمشة الكورية واليابانية.",
  "contactEmail": "support@qasralabaya.com",
  "contactPhone": "+201012345678",
  "address": "القاهرة، جمهورية مصر العربية",
  "whatsappNumber": "+201012345678",
  "facebookUrl": "https://facebook.com/qasralabaya",
  "instagramUrl": "https://instagram.com/qasralabaya",
  "twitterUrl": null,
  "tiktokUrl": "https://tiktok.com/@qasralabaya",
  "snapchatUrl": null,
  "privacyPolicy": "نحن نحترم خصوصية عملائنا ونلتزم بحماية بياناتهم الشخصية...",
  "returnPolicy": "يمكن استبدال أو استرجاع المنتجات خلال 14 يوماً من تاريخ الاستلام في حالتها الأصلية.",
  "shippingPolicy": "الشحن متاح لجميع محافظات جمهورية مصر العربية وجميع دول الخليج العربي.",
  "announcementBarText": "🎉 كود خصم إضافي 10% بمناسبة إطلاق التشكيلة الجديدة: ABAYA2026",
  "isAnnouncementBarActive": true,
  "heroBadge": "تشكيلة خريف وشتاء 2026",
  "heroTitle": "الفخامة والأناقة في كل تفصيلة",
  "heroSubtitle": "تألقي بأحدث إطلالات العبايات الملكية المصممة لتعكس جمالك وحضورك الراقي.",
  "heroImageUrl": "https://res.cloudinary.com/demo/image/upload/hero-banner.webp",
  "heroCardTag": "الأكثر طلباً هذا الأسبوع",
  "heroCardTitle": "عباية الكريب الملكي الأسود",
  "updatedAt": "2026-10-27T17:30:00Z"
}
```

---

### 12.2 تحديث إعدادات المتجر (Admin Only)
- **Method & Route:** `PUT /api/Settings`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Request Body:**
```json
{
  "storeName": "قصر العباية الملكية | Royal Qasr Al-Abaya",
  "aboutUs": "المتجر الأول في الوطن العربي لأفخم العبايات الخليجية.",
  "contactEmail": "info@qasralabaya.com",
  "contactPhone": "+201012345678",
  "address": "القاهرة الجديدة، مصر",
  "whatsappNumber": "+201012345678",
  "facebookUrl": "https://facebook.com/qasralabaya",
  "instagramUrl": "https://instagram.com/qasralabaya",
  "twitterUrl": null,
  "tiktokUrl": "https://tiktok.com/@qasralabaya",
  "snapchatUrl": null,
  "privacyPolicy": "سياسة الخصوصية وحماية البيانات...",
  "returnPolicy": "سياسة الاستبدال والاسترجاع...",
  "shippingPolicy": "سياسة الشحن والتوصيل السريع...",
  "announcementBarText": "شحن مجاني للطلبات التي تتعدى 1500 جنيه لفترة محدودة!",
  "isAnnouncementBarActive": true,
  "heroBadge": "التشكيلة الملكية الحصرية",
  "heroTitle": "حضور يعبر عنكِ بفخامة لا تُنسى",
  "heroSubtitle": "خامات ملكية وتطريزات يدوية فاخرة تعكس أصالة الذوق العربي.",
  "heroImageUrl": "https://res.cloudinary.com/demo/image/upload/hero-banner-new.webp",
  "heroCardTag": "العباية الأكثر مبيعاً",
  "heroCardTitle": "عباية الزمرد الملكية"
}
```
- **Response Body (200 OK):** (نفس كائن `SiteSettingDto` المحدث أعلاه)

---

## 🎯 ملخص سريع لمنع الـ Frontend Conflicts

| الخاصية | القيمة المعتمدة في الباك إند | تحذير للفرونت إند |
|---|---|---|
| **Property Casing** | `camelCase` | لا تستخدم `PascalCase` في جيسون الطلب أو قراءة الرد. |
| **Authentication** | `Authorization: Bearer <token>` | تأكد من حفظ التوكن وإرفاقه في كل طلب محمي. |
| **Customer ID** | تلقائي من التوكن | لا تمرر `customerId` في الكارت أو الطلبات أو المفضلة. |
| **Paging Format** | `{ pageIndex, pageSize, totalCount, totalPages, data: [...] }` | استخدم `data` للوصول لمصفوفة العناصر، و `totalCount` لعدد الصفحات. |
| **Variant ID** | `productVariantId` في السلة والطلب | العميل يشتري Variant معين (مقاس + لون) وليس المنتج المجرد. |
| **Sorting Values** | `1` = NameAsc, `2` = NameDesc, `3` = PriceAsc, `4` = PriceDesc | تمرر كأرقام Enum مطابقة للباك. |
