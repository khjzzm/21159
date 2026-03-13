(function() {
    // =====================
    // Concept2 공식 (Rower & SkiErg 동일)
    // =====================
    function paceToWatts(paceSeconds) {
        if (paceSeconds <= 0) return 0;
        var v = 500 / paceSeconds;
        return 2.8 * v * v * v;
    }

    function wattsToPace(watts) {
        if (watts <= 0) return 0;
        var v = Math.pow(watts / 2.8, 1 / 3);
        return 500 / v;
    }

    function wattsToCalHr(watts) {
        return (4 * watts * 0.8604) + 300;
    }

    function calHrToWatts(calHr) {
        return (calHr - 300) / (4 * 0.8604);
    }

    // 체중 보정 Cal/hr
    function adjustedCalHr(monitorCalHr, weightKg) {
        var weightLb = weightKg * 2.20462;
        return monitorCalHr - 300 + (1.714 * weightLb);
    }

    // 목표 칼로리 소요 시간 (초)
    function c2TimeForCal(watts, targetCal) {
        if (watts <= 0 || targetCal <= 0) return 0;
        // E = (4 * W + 0.35 * t) / 4.2, W = watts * t / 1000
        // targetCal = (4 * watts * t / 1000 + 0.35 * t) / 4.2
        // targetCal * 4.2 = t * (4 * watts / 1000 + 0.35)
        var denominator = (4 * watts / 1000) + 0.35;
        return (targetCal * 4.2) / denominator;
    }

    function formatTime(seconds) {
        if (seconds <= 0 || !isFinite(seconds)) return '—';
        var m = Math.floor(seconds / 60);
        var s = Math.round(seconds % 60);
        if (s === 60) { m++; s = 0; }
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function formatPace(paceSeconds) {
        var m = Math.floor(paceSeconds / 60);
        var s = Math.round(paceSeconds % 60);
        if (s === 60) { m++; s = 0; }
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    // =====================
    // Assault Bike 공식 (역산 근사치)
    // =====================
    function bikeRpmToWatts(rpm) {
        if (rpm <= 0) return 0;
        return Math.exp(0.0408 * rpm);
    }

    function bikeWattsToRpm(watts) {
        if (watts <= 0) return 0;
        return Math.log(watts) / 0.0408;
    }

    function bikeWattsToCalMin(watts) {
        return watts * 0.0404;
    }

    function bikeCalMinToWatts(calMin) {
        return calMin / 0.0404;
    }

    // =====================
    // 탭 전환
    // =====================
    var tabs = document.querySelectorAll('.erg-tab');
    var panels = document.querySelectorAll('.erg-panel');

    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            tabs.forEach(function(t) { t.classList.remove('active'); });
            panels.forEach(function(p) { p.classList.remove('active'); });
            tab.classList.add('active');
            document.getElementById('panel-' + tab.dataset.erg).classList.add('active');
        });
    });

    // =====================
    // Rower 이벤트
    // =====================
    var rPaceMin = document.getElementById('rower-pace-min');
    var rPaceSec = document.getElementById('rower-pace-sec');
    var rWatts = document.getElementById('rower-watts');
    var rCalHr = document.getElementById('rower-calhr');
    var rTargetCal = document.getElementById('rower-target-cal');
    var rTimeResult = document.getElementById('rower-time-result');
    var rAdjCalHr = document.getElementById('rower-adj-calhr');
    var userWeight = document.getElementById('user-weight');

    var updating = false;

    function updateRowerAdj() {
        var calHr = parseFloat(rCalHr.value);
        var wkg = parseFloat(userWeight.value) || 79.5;
        if (calHr > 0) {
            rAdjCalHr.textContent = Math.round(adjustedCalHr(calHr, wkg));
        } else {
            rAdjCalHr.textContent = '—';
        }
    }

    function rowerFromPace() {
        if (updating) return;
        updating = true;
        var m = parseInt(rPaceMin.value) || 0;
        var s = parseInt(rPaceSec.value) || 0;
        var pace = m * 60 + s;
        if (pace > 0) {
            var w = paceToWatts(pace);
            rWatts.value = Math.round(w);
            rCalHr.value = Math.round(wattsToCalHr(w));
            updateRowerTime();
            updateRowerAdj();
        }
        updating = false;
    }

    function rowerFromWatts() {
        if (updating) return;
        updating = true;
        var w = parseFloat(rWatts.value);
        if (w > 0) {
            var pace = wattsToPace(w);
            rPaceMin.value = Math.floor(pace / 60);
            rPaceSec.value = Math.round(pace % 60);
            rCalHr.value = Math.round(wattsToCalHr(w));
            updateRowerTime();
            updateRowerAdj();
        }
        updating = false;
    }

    function rowerFromCalHr() {
        if (updating) return;
        updating = true;
        var c = parseFloat(rCalHr.value);
        if (c > 300) {
            var w = calHrToWatts(c);
            rWatts.value = Math.round(w);
            var pace = wattsToPace(w);
            rPaceMin.value = Math.floor(pace / 60);
            rPaceSec.value = Math.round(pace % 60);
            updateRowerTime();
            updateRowerAdj();
        }
        updating = false;
    }

    function updateRowerTime() {
        var w = parseFloat(rWatts.value);
        var cal = parseFloat(rTargetCal.value);
        if (w > 0 && cal > 0) {
            rTimeResult.textContent = formatTime(c2TimeForCal(w, cal));
        } else {
            rTimeResult.textContent = '—';
        }
    }

    rPaceMin.addEventListener('input', rowerFromPace);
    rPaceSec.addEventListener('input', rowerFromPace);
    rWatts.addEventListener('input', rowerFromWatts);
    rCalHr.addEventListener('input', rowerFromCalHr);
    rTargetCal.addEventListener('input', updateRowerTime);

    // =====================
    // SkiErg 이벤트 (Rower와 동일 공식)
    // =====================
    var sPaceMin = document.getElementById('ski-pace-min');
    var sPaceSec = document.getElementById('ski-pace-sec');
    var sWatts = document.getElementById('ski-watts');
    var sCalHr = document.getElementById('ski-calhr');
    var sTargetCal = document.getElementById('ski-target-cal');
    var sTimeResult = document.getElementById('ski-time-result');
    var sAdjCalHr = document.getElementById('ski-adj-calhr');

    function updateSkiAdj() {
        var calHr = parseFloat(sCalHr.value);
        var wkg = parseFloat(userWeight.value) || 79.5;
        if (calHr > 0) {
            sAdjCalHr.textContent = Math.round(adjustedCalHr(calHr, wkg));
        } else {
            sAdjCalHr.textContent = '—';
        }
    }

    function skiFromPace() {
        if (updating) return;
        updating = true;
        var m = parseInt(sPaceMin.value) || 0;
        var s = parseInt(sPaceSec.value) || 0;
        var pace = m * 60 + s;
        if (pace > 0) {
            var w = paceToWatts(pace);
            sWatts.value = Math.round(w);
            sCalHr.value = Math.round(wattsToCalHr(w));
            updateSkiTime();
            updateSkiAdj();
        }
        updating = false;
    }

    function skiFromWatts() {
        if (updating) return;
        updating = true;
        var w = parseFloat(sWatts.value);
        if (w > 0) {
            var pace = wattsToPace(w);
            sPaceMin.value = Math.floor(pace / 60);
            sPaceSec.value = Math.round(pace % 60);
            sCalHr.value = Math.round(wattsToCalHr(w));
            updateSkiTime();
            updateSkiAdj();
        }
        updating = false;
    }

    function skiFromCalHr() {
        if (updating) return;
        updating = true;
        var c = parseFloat(sCalHr.value);
        if (c > 300) {
            var w = calHrToWatts(c);
            sWatts.value = Math.round(w);
            var pace = wattsToPace(w);
            sPaceMin.value = Math.floor(pace / 60);
            sPaceSec.value = Math.round(pace % 60);
            updateSkiTime();
            updateSkiAdj();
        }
        updating = false;
    }

    function updateSkiTime() {
        var w = parseFloat(sWatts.value);
        var cal = parseFloat(sTargetCal.value);
        if (w > 0 && cal > 0) {
            sTimeResult.textContent = formatTime(c2TimeForCal(w, cal));
        } else {
            sTimeResult.textContent = '—';
        }
    }

    sPaceMin.addEventListener('input', skiFromPace);
    sPaceSec.addEventListener('input', skiFromPace);
    sWatts.addEventListener('input', skiFromWatts);
    sCalHr.addEventListener('input', skiFromCalHr);
    sTargetCal.addEventListener('input', updateSkiTime);

    // 체중 변경 시 Rower & SkiErg 보정 칼로리 재계산
    userWeight.addEventListener('input', function() {
        updateRowerAdj();
        updateSkiAdj();
    });

    // =====================
    // Assault Bike 이벤트
    // =====================
    var bRpm = document.getElementById('bike-rpm');
    var bWatts = document.getElementById('bike-watts');
    var bCalMin = document.getElementById('bike-calmin');
    var bTargetCal = document.getElementById('bike-target-cal');
    var bTimeResult = document.getElementById('bike-time-result');

    function bikeFromRpm() {
        if (updating) return;
        updating = true;
        var rpm = parseFloat(bRpm.value);
        if (rpm > 0) {
            var w = bikeRpmToWatts(rpm);
            bWatts.value = Math.round(w);
            bCalMin.value = bikeWattsToCalMin(w).toFixed(1);
            updateBikeTime();
        }
        updating = false;
    }

    function bikeFromWatts() {
        if (updating) return;
        updating = true;
        var w = parseFloat(bWatts.value);
        if (w > 0) {
            bRpm.value = Math.round(bikeWattsToRpm(w));
            bCalMin.value = bikeWattsToCalMin(w).toFixed(1);
            updateBikeTime();
        }
        updating = false;
    }

    function bikeFromCalMin() {
        if (updating) return;
        updating = true;
        var c = parseFloat(bCalMin.value);
        if (c > 0) {
            var w = bikeCalMinToWatts(c);
            bWatts.value = Math.round(w);
            bRpm.value = Math.round(bikeWattsToRpm(w));
            updateBikeTime();
        }
        updating = false;
    }

    function updateBikeTime() {
        var calMin = parseFloat(bCalMin.value);
        var target = parseFloat(bTargetCal.value);
        if (calMin > 0 && target > 0) {
            var seconds = (target / calMin) * 60;
            bTimeResult.textContent = formatTime(seconds);
        } else {
            bTimeResult.textContent = '—';
        }
    }

    bRpm.addEventListener('input', bikeFromRpm);
    bWatts.addEventListener('input', bikeFromWatts);
    bCalMin.addEventListener('input', bikeFromCalMin);
    bTargetCal.addEventListener('input', updateBikeTime);

    // =====================
    // 참고 테이블 생성
    // =====================

    // Rower 참고 테이블
    var rowerPaces = [
        [1, 30], [1, 35], [1, 40], [1, 45], [1, 50],
        [1, 55], [2, 0], [2, 5], [2, 10], [2, 15],
        [2, 20], [2, 30], [2, 45], [3, 0]
    ];

    var rowerTable = document.getElementById('rower-ref-table');
    rowerPaces.forEach(function(p) {
        var pace = p[0] * 60 + p[1];
        var w = paceToWatts(pace);
        var calHr = wattsToCalHr(w);
        var time30 = c2TimeForCal(w, 30);
        var highlight = (p[0] === 2 && p[1] === 0) ? ' class="highlight-row"' : '';
        rowerTable.insertAdjacentHTML('beforeend',
            '<tr' + highlight + '><td>' + formatPace(pace) + '</td><td>' + Math.round(w) + 'W</td><td>' + Math.round(calHr) + '</td><td>' + formatTime(time30) + '</td></tr>'
        );
    });

    // SkiErg 참고 테이블 (동일 공식)
    var skiTable = document.getElementById('ski-ref-table');
    rowerPaces.forEach(function(p) {
        var pace = p[0] * 60 + p[1];
        var w = paceToWatts(pace);
        var calHr = wattsToCalHr(w);
        var time30 = c2TimeForCal(w, 30);
        var highlight = (p[0] === 2 && p[1] === 0) ? ' class="highlight-row"' : '';
        skiTable.insertAdjacentHTML('beforeend',
            '<tr' + highlight + '><td>' + formatPace(pace) + '</td><td>' + Math.round(w) + 'W</td><td>' + Math.round(calHr) + '</td><td>' + formatTime(time30) + '</td></tr>'
        );
    });

    // Assault Bike 참고 테이블
    var bikeRpms = [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90];
    var bikeTable = document.getElementById('bike-ref-table');
    bikeRpms.forEach(function(rpm) {
        var w = bikeRpmToWatts(rpm);
        var calMin = bikeWattsToCalMin(w);
        var time20 = (20 / calMin) * 60;
        var highlight = (rpm === 60) ? ' class="highlight-row"' : '';
        bikeTable.insertAdjacentHTML('beforeend',
            '<tr' + highlight + '><td>' + rpm + '</td><td>' + Math.round(w) + 'W</td><td>' + calMin.toFixed(1) + '</td><td>' + formatTime(time20) + '</td></tr>'
        );
    });
})();
