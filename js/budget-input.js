// budget-input.js — Xử lý nhập và định dạng tiền tệ cho mục "Chi phí" (đ/người)
// Tự động phân tách dấu chấm (.) ở mỗi 3 chữ số hàng nghìn
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var input = document.getElementById("budget-per-person");
    if (!input) return;

    // Định dạng chuỗi số với dấu chấm ngăn cách mỗi 3 số
    function formatCurrency(val) {
      var digits = String(val || "").replace(/\D/g, "");
      if (!digits) return "";
      // Bỏ các số 0 ở đầu nếu có (trừ khi chỉ có duy nhất số 0)
      digits = digits.replace(/^0+(?=\d)/, "");
      return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // Xử lý khi người dùng gõ hoặc dán số
    input.addEventListener("input", function () {
      var raw = input.value;
      var cursorPos = input.selectionStart || 0;

      // Đếm số lượng chữ số nằm trước con trỏ hiện tại
      var digitsBefore = raw.substring(0, cursorPos).replace(/\D/g, "").length;

      // Làm sạch số (giới hạn tối đa 12 chữ số ~ 999 tỷ)
      var clean = raw.replace(/\D/g, "");
      if (clean.length > 12) {
        clean = clean.substring(0, 12);
      }

      var formatted = formatCurrency(clean);
      input.value = formatted;

      // Khôi phục vị trí con trỏ chính xác theo số lượng chữ số phía trước
      var newCursor = 0;
      var counted = 0;
      for (var i = 0; i < formatted.length; i++) {
        if (formatted[i] !== ".") {
          counted++;
        }
        if (counted === digitsBefore) {
          newCursor = i + 1;
          break;
        }
      }
      if (digitsBefore === 0) newCursor = 0;
      if (counted < digitsBefore) newCursor = formatted.length;

      input.setSelectionRange(newCursor, newCursor);
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    // Xử lý phím Backspace khi đứng ngay sau dấu chấm
    input.addEventListener("keydown", function (e) {
      if (e.key === "Backspace") {
        var start = input.selectionStart;
        var end = input.selectionEnd;
        if (start === end && start > 0 && input.value[start - 1] === ".") {
          e.preventDefault();
          var val = input.value;
          // Xóa chữ số đứng trước dấu chấm thay vì chỉ xóa dấu chấm
          input.value = val.substring(0, start - 2) + val.substring(start);
          input.setSelectionRange(start - 2, start - 2);
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    });

    input.addEventListener("focus", function () {
      if (input.value === "") {
        input.placeholder = "";
      }
    });

    input.addEventListener("blur", function () {
      if (input.value === "") {
        input.placeholder = "0";
      }
    });
  });
})();
