// guests-stepper.js — Xử lý tăng/giảm và nhập tay cho mục "Số người"
// Gồm 3 nhóm: Trẻ em (0 - 15), Người lớn (16 - 61), Người già (> 61)
(function () {
  function initGuestStepper(inputId, minusId, plusId, minVal, maxVal) {
    var input = document.getElementById(inputId);
    var btnMinus = document.getElementById(minusId);
    var btnPlus = document.getElementById(plusId);

    if (!input || !btnMinus || !btnPlus) return;

    var min = minVal != null ? minVal : 0;
    var max = maxVal != null ? maxVal : 99;

    function getValue() {
      var v = parseInt(input.value, 10);
      if (isNaN(v)) return min;
      return v;
    }

    function clamp(v) {
      if (v < min) return min;
      if (v > max) return max;
      return v;
    }

    function updateButtonsState(v) {
      var isEmpty = input.value === "";
      btnMinus.disabled = isEmpty || v <= min;
      btnPlus.disabled = !isEmpty && v >= max;
    }

    function setValue(v) {
      v = clamp(v);
      input.value = v;
      updateButtonsState(v);
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    btnMinus.addEventListener("click", function () {
      if (input.value === "" || getValue() <= min) {
        setValue(min);
        return;
      }
      setValue(getValue() - 1);
    });

    btnPlus.addEventListener("click", function () {
      if (input.value === "") {
        setValue(min + 1);
      } else {
        setValue(getValue() + 1);
      }
    });

    // Chỉ cho phép nhập số
    input.addEventListener("input", function () {
      input.value = input.value.replace(/[^0-9]/g, "");
      var v = parseInt(input.value, 10);
      if (input.value === "") {
        updateButtonsState(min);
      } else {
        updateButtonsState(isNaN(v) ? min : v);
      }
    });

    // Rời khỏi ô: nếu để trống thì giữ nguyên trống, nếu vượt quá min/max thì ép về
    input.addEventListener("blur", function () {
      if (input.value === "") {
        updateButtonsState(min);
        return;
      }
      var v = parseInt(input.value, 10);
      if (isNaN(v)) {
        input.value = "";
        updateButtonsState(min);
        return;
      }
      setValue(v);
    });

    updateButtonsState(getValue());
  }

  document.addEventListener("DOMContentLoaded", function () {
    initGuestStepper("guests-children", "btn-minus-children", "btn-plus-children", 0, 99);
    initGuestStepper("guests-adults", "btn-minus-adults", "btn-plus-adults", 0, 99);
    initGuestStepper("guests-seniors", "btn-minus-seniors", "btn-plus-seniors", 0, 99);
  });
})();
