/**
 * 공통 입력 필드 유효성 검사 및 이벤트 핸들러
 * 1rm.js, weightlifting.js에서 공유
 */
function setupInputValidation(selector, callbacks) {
    $(selector).on('input', function() {
        let value = $(this).val();

        if (value.startsWith('.')) {
            value = '0' + value;
        }
        value = value.replace(/[^0-9.]/g, '');

        // 소수점이 여러 개인 경우 첫 번째만 유지
        const decimalCount = (value.match(/\./g) || []).length;
        if (decimalCount > 1) {
            value = value.replace(/\./g, function(match, index, original) {
                return index === original.indexOf('.') ? match : '';
            });
        }

        $(this).val(value);

        if (value !== '' && value !== '.' && !value.endsWith('.')) {
            const numValue = parseFloat(value);
            const max = currentUnit === 'kg' ? 1000 : 2200;

            if (numValue < 0) {
                $(this).val(0);
            } else if (numValue > max) {
                $(this).val(max);
                showToast('최대 ' + max + currentUnit + ' 까지 입력 가능합니다.');
            }

            if (value.includes('.') && value.split('.')[1].length > 2) {
                $(this).val(parseFloat(value).toFixed(2));
            }
        }

        if (callbacks && callbacks.onInput) {
            callbacks.onInput.call(this);
        }
    });

    $(selector).on('blur', function() {
        const value = $(this).val();

        if (value === '' || value === '.') {
            $(this).val('');
            if (callbacks && callbacks.onBlur) callbacks.onBlur.call(this);
            return;
        }

        if (isNaN(value)) {
            $(this).val('');
            showToast('올바른 숫자를 입력해주세요.');
            if (callbacks && callbacks.onBlur) callbacks.onBlur.call(this);
            return;
        }

        if (value.endsWith('.')) {
            $(this).val(value.slice(0, -1));
        }

        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            $(this).val(numValue.toFixed(numValue % 1 === 0 ? 0 : 2));
        }

        if (callbacks && callbacks.onBlur) {
            callbacks.onBlur.call(this);
        }
    });
}
