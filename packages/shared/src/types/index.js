"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = exports.OrderStatus = exports.ProductStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "CUSTOMER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["ACTIVE"] = "ACTIVE";
    ProductStatus["INACTIVE"] = "INACTIVE";
    ProductStatus["OUT_OF_STOCK"] = "OUT_OF_STOCK";
})(ProductStatus || (exports.ProductStatus = ProductStatus = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["REFUNDED"] = "REFUNDED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
//# sourceMappingURL=index.js.map