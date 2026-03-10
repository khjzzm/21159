/**
 * 공통 입력 필드 유효성 검사 및 이벤트 핸들러
 * 1rm.js, weightlifting.js에서 공유
 */
function setupInputValidation(selector, callbacks) {
    document.querySelectorAll(selector).forEach(function(el) {
        el.addEventListener('input', function() {
            var value = this.value;

            if (value.startsWith('.')) {
                value = '0' + value;
            }
            value = value.replace(/[^0-9.]/g, '');

            var decimalCount = (value.match(/\./g) || []).length;
            if (decimalCount > 1) {
                value = value.replace(/\./g, function(match, index, original) {
                    return index === original.indexOf('.') ? match : '';
                });
            }

            this.value = value;

            if (value !== '' && value !== '.' && !value.endsWith('.')) {
                var numValue = parseFloat(value);
                var max = currentUnit === 'kg' ? 1000 : 2200;

                if (numValue < 0) {
                    this.value = 0;
                } else if (numValue > max) {
                    this.value = max;
                    showToast('최대 ' + max + currentUnit + ' 까지 입력 가능합니다.');
                }

                if (value.includes('.') && value.split('.')[1].length > 2) {
                    this.value = parseFloat(value).toFixed(2);
                }
            }

            if (callbacks && callbacks.onInput) {
                callbacks.onInput.call(this);
            }
        });

        el.addEventListener('blur', function() {
            var value = this.value;

            if (value === '' || value === '.') {
                this.value = '';
                if (callbacks && callbacks.onBlur) callbacks.onBlur.call(this);
                return;
            }

            if (isNaN(value)) {
                this.value = '';
                showToast('올바른 숫자를 입력해주세요.');
                if (callbacks && callbacks.onBlur) callbacks.onBlur.call(this);
                return;
            }

            if (value.endsWith('.')) {
                this.value = value.slice(0, -1);
            }

            var numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                this.value = numValue.toFixed(numValue % 1 === 0 ? 0 : 2);
            }

            if (callbacks && callbacks.onBlur) {
                callbacks.onBlur.call(this);
            }
        });
    });
}
