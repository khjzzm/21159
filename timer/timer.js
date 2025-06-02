$(document).ready(function() {
    // 전역 변수
    let timerInterval = null;
    let currentMode = 'countdown';
    let isRunning = false;
    let isPaused = false;
    let startTime = 0;
    let elapsedTime = 0;
    let totalTime = 0;
    
    // EMOM & Tabata 관련 변수
    let currentRound = 1;
    let totalRounds = 1;
    let isWorkPhase = true;
    let workTime = 20;
    let restTime = 10;
    let emomWorkTime = 40;
    let emomRestTime = 20;
    let intervalTime = 60;
    
    // 준비시간 관련 변수
    let isPrepPhase = false;
    let prepStartTime = 0;
    let prepTime = 10;
    
    // DOM 요소
    const $timeDisplay = $('#timeDisplay');
    const $timerLabel = $('#timerLabel');
    const $roundInfo = $('#roundInfo');
    const $currentRound = $('#currentRound');
    const $totalRounds = $('#totalRounds');
    const $startBtn = $('#startBtn');
    const $pauseBtn = $('#pauseBtn');
    const $resetBtn = $('#resetBtn');
    const $soundEnabled = $('#soundEnabled');

    // 사운드 생성 (Web Audio API 사용)
    let audioContext;
    
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    function playBeep(frequency = 800, duration = 200) {
        if (!$soundEnabled.is(':checked')) return;
        
        initAudio();
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    }

    // 시간 포맷팅 함수
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        
        if (mins >= 60) {
            const hours = Math.floor(mins / 60);
            const remainingMins = mins % 60;
            return `${hours.toString().padStart(2, '0')}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // 모드 변경
    $('.mode-btn').click(function() {
        if (isRunning) {
            showToast('타이머가 실행 중입니다. 먼저 정지해주세요.');
            return;
        }
        
        $('.mode-btn').removeClass('active');
        $(this).addClass('active');
        
        currentMode = $(this).data('mode');
        resetTimer();
        updateSettingsDisplay();
    });

    // 설정 패널 업데이트
    function updateSettingsDisplay() {
        $('.setting-group').hide();
        $(`#${currentMode}Settings`).show();
        
        // 라운드 정보 표시 여부
        if (currentMode === 'emom' || currentMode === 'tabata') {
            $roundInfo.show();
        } else {
            $roundInfo.hide();
        }
        
        // 타이머 라벨 업데이트
        updateTimerLabel();
    }

    // 타이머 라벨 업데이트
    function updateTimerLabel() {
        switch (currentMode) {
            case 'countdown':
                $timerLabel.text('For Time');
                break;
            case 'amrap':
                $timerLabel.text('AMRAP');
                break;
            case 'emom':
                $timerLabel.text(`라운드 ${currentRound}`);
                break;
            case 'tabata':
                if (isWorkPhase) {
                    $timerLabel.text('운동');
                } else {
                    $timerLabel.text('휴식');
                }
                break;
        }
    }

    // 시작 버튼
    $startBtn.click(function() {
        if (isPaused) {
            resumeTimer();
        } else {
            startTimer();
        }
    });

    // 일시정지 버튼
    $pauseBtn.click(function() {
        pauseTimer();
    });

    // 리셋 버튼
    $resetBtn.click(function() {
        resetTimer();
    });

    // 타이머 시작
    function startTimer() {
        initAudio(); // 사용자 상호작용 후 오디오 컨텍스트 초기화
        
        // 준비시간 설정
        prepTime = parseInt($('#prepTime').val());
        if (isNaN(prepTime) || prepTime < 0) prepTime = 10;
        
        if (prepTime > 0) {
            // 준비시간부터 시작
            startPrepPhase();
        } else {
            // 준비시간 없으면 바로 메인 타이머 시작
            startMainTimer();
        }
        
        isRunning = true;
        isPaused = false;
        
        $startBtn.hide();
        $pauseBtn.show();
        
        $('.timer-display').addClass('pulse');
        setTimeout(() => $('.timer-display').removeClass('pulse'), 1000);
    }

    // 타이머 일시정지
    function pauseTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        isRunning = false;
        isPaused = true;
        
        $pauseBtn.hide();
        $startBtn.show().text('재시작');
        
        if (isPrepPhase) {
            $timerLabel.text('준비 일시정지');
        } else {
            $timerLabel.text('일시정지');
        }
    }

    // 타이머 재시작
    function resumeTimer() {
        if (isPrepPhase) {
            // 준비시간 재시작
            prepStartTime = Date.now() - (prepTime - parseInt($timeDisplay.text().split(':').pop())) * 1000;
            timerInterval = setInterval(updatePrepPhase, 100);
        } else {
            // 메인 타이머 재시작
            startTime = Date.now() - elapsedTime;
            
            switch (currentMode) {
                case 'countdown':
                    timerInterval = setInterval(updateForTime, 100);
                    break;
                case 'amrap':
                    timerInterval = setInterval(updateAmrap, 100);
                    break;
                case 'emom':
                    timerInterval = setInterval(updateEmom, 100);
                    break;
                case 'tabata':
                    timerInterval = setInterval(updateTabata, 100);
                    break;
            }
        }
        
        isRunning = true;
        isPaused = false;
        
        $startBtn.hide();
        $pauseBtn.show();
        
        updateTimerLabel();
    }

    // 타이머 리셋
    function resetTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        isRunning = false;
        isPaused = false;
        elapsedTime = 0;
        currentRound = 1;
        isWorkPhase = true;
        isPrepPhase = false; // 준비시간 플래그 리셋
        
        $startBtn.show().text('시작');
        $pauseBtn.hide();
        
        $('.timer-display').removeClass('warning danger');
        
        // 초기 시간 설정
        switch (currentMode) {
            case 'countdown':
                $timeDisplay.text('00:00'); // For Time은 0부터 시작
                break;
            case 'amrap':
                const amrapMinutes = parseInt($('#amrapMinutes').val());
                const amrapSeconds = parseInt($('#amrapSeconds').val());
                const finalAmrapMinutes = isNaN(amrapMinutes) ? 15 : amrapMinutes;
                const finalAmrapSeconds = isNaN(amrapSeconds) ? 0 : amrapSeconds;
                totalTime = finalAmrapMinutes * 60 + finalAmrapSeconds;
                $timeDisplay.text(formatTime(totalTime));
                break;
            case 'emom':
                const emomRounds = parseInt($('#emomRounds').val());
                const emomWork = parseInt($('#emomWork').val());
                
                totalRounds = isNaN(emomRounds) ? 10 : emomRounds;
                emomWorkTime = isNaN(emomWork) ? 40 : emomWork;
                intervalTime = 60; // EMOM은 항상 60초 간격
                $timeDisplay.text(formatTime(emomWorkTime));
                $currentRound.text('1');
                $totalRounds.text(totalRounds);
                break;
            case 'tabata':
                const tabataRounds = parseInt($('#tabataRounds').val());
                const tabataWork = parseInt($('#tabataWork').val());
                const tabataRest = parseInt($('#tabataRest').val());
                
                totalRounds = isNaN(tabataRounds) ? 8 : tabataRounds;
                workTime = isNaN(tabataWork) ? 20 : tabataWork;
                restTime = isNaN(tabataRest) ? 10 : tabataRest;
                $timeDisplay.text(formatTime(workTime));
                $currentRound.text('1');
                $totalRounds.text(totalRounds);
                break;
        }
        
        updateTimerLabel();
    }

    // For Time 모드 (스톱워치 + Time Cap)
    function startForTime() {
        const minutes = parseInt($('#countdownMinutes').val());
        const seconds = parseInt($('#countdownSeconds').val());
        // 값이 NaN이면 기본값 사용, 0은 유효한 값으로 처리
        const finalMinutes = isNaN(minutes) ? 15 : minutes;
        const finalSeconds = isNaN(seconds) ? 0 : seconds;
        totalTime = finalMinutes * 60 + finalSeconds; // Time Cap
        
        startTime = Date.now();
        timerInterval = setInterval(updateForTime, 100);
        $timerLabel.text('For Time 진행 중');
    }

    function updateForTime() {
        elapsedTime = Date.now() - startTime;
        const currentSeconds = Math.floor(elapsedTime / 1000);
        
        $timeDisplay.text(formatTime(currentSeconds));
        
        // Time Cap 체크
        if (totalTime > 0 && currentSeconds >= totalTime) {
            playBeep(1200, 500);
            finishTimer();
            return;
        }
        
        // 경고 효과 (For Time용 기준)
        const warningTime = Math.min(60, Math.floor(totalTime * 0.2)); // 전체의 20% 또는 60초
        const dangerTime = Math.min(30, Math.floor(totalTime * 0.1)); // 전체의 10% 또는 30초
        
        if (totalTime > 0) {
            const remainingTime = totalTime - currentSeconds;
            
            if (remainingTime <= warningTime && remainingTime > dangerTime) {
                $('.timer-display').addClass('warning').removeClass('danger');
            } else if (remainingTime <= dangerTime && remainingTime > 0) {
                $('.timer-display').addClass('danger').removeClass('warning');
                // 마지막 3초 카운트다운
                if (remainingTime <= 3) {
                    playBeep(1000, 100);
                }
            } else {
                $('.timer-display').removeClass('warning danger');
            }
        }
    }

    // AMRAP 모드
    function startAmrap() {
        const amrapMinutes = parseInt($('#amrapMinutes').val());
        const amrapSeconds = parseInt($('#amrapSeconds').val());
        const finalAmrapMinutes = isNaN(amrapMinutes) ? 15 : amrapMinutes;
        const finalAmrapSeconds = isNaN(amrapSeconds) ? 0 : amrapSeconds;
        totalTime = finalAmrapMinutes * 60 + finalAmrapSeconds;
        
        startTime = Date.now();
        timerInterval = setInterval(updateAmrap, 100);
        $timerLabel.text('AMRAP 진행 중');
    }

    function updateAmrap() {
        elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, totalTime - Math.floor(elapsedTime / 1000));
        
        $timeDisplay.text(formatTime(remainingTime));
        
        // 경고 효과 (AMRAP용 기준)
        const warningTime = Math.min(60, Math.floor(totalTime * 0.2)); // 전체의 20% 또는 60초
        const dangerTime = Math.min(30, Math.floor(totalTime * 0.1)); // 전체의 10% 또는 30초
        
        if (remainingTime <= warningTime && remainingTime > dangerTime) {
            $('.timer-display').addClass('warning').removeClass('danger');
        } else if (remainingTime <= dangerTime && remainingTime > 0) {
            $('.timer-display').addClass('danger').removeClass('warning');
        } else {
            $('.timer-display').removeClass('warning danger');
        }
        
        // AMRAP 마지막 3초 카운트다운
        if (remainingTime <= 3 && remainingTime > 0) {
            playBeep(1000, 100);
        }
        
        if (remainingTime === 0) {
            playBeep(1200, 500);
            finishTimer();
        }
    }

    // EMOM 모드
    function startEmom() {
        const emomRounds = parseInt($('#emomRounds').val());
        const emomWork = parseInt($('#emomWork').val());
        
        totalRounds = isNaN(emomRounds) ? 10 : emomRounds;
        emomWorkTime = isNaN(emomWork) ? 40 : emomWork;
        intervalTime = 60; // EMOM은 항상 60초 간격
        
        startTime = Date.now();
        timerInterval = setInterval(updateEmom, 100);
        $timerLabel.text(`라운드 ${currentRound}`);
    }

    function updateEmom() {
        elapsedTime = Date.now() - startTime;
        const totalSeconds = Math.floor(elapsedTime / 1000);
        const currentRoundNumber = Math.floor(totalSeconds / emomWorkTime) + 1;
        const secondsInCurrentRound = totalSeconds % emomWorkTime;
        
        // 라운드 변경 체크
        if (currentRoundNumber !== currentRound) {
            currentRound = currentRoundNumber;
            isWorkPhase = true;
            playBeep(1000, 200); // 새 라운드 시작 알림
            $currentRound.text(currentRound);
            updateTimerLabel();
            
            if (currentRound > totalRounds) {
                finishTimer();
                return;
            }
        }
        
        // 각 라운드는 설정한 시간만큼 진행
        const remainingTime = emomWorkTime - secondsInCurrentRound;
        
        $timeDisplay.text(formatTime(remainingTime));
        
        // 경고 효과 (EMOM용 기준)
        const warningTime = Math.min(10, Math.floor(emomWorkTime * 0.1)); // 전체의 10% 또는 10초
        const dangerTime = Math.min(5, Math.floor(emomWorkTime * 0.05)); // 전체의 5% 또는 5초
        
        if (remainingTime <= warningTime && remainingTime > dangerTime) {
            $('.timer-display').addClass('warning').removeClass('danger');
        } else if (remainingTime <= dangerTime && remainingTime > 0) {
            $('.timer-display').addClass('danger').removeClass('warning');
        } else {
            $('.timer-display').removeClass('warning danger');
        }
    }

    // TABATA 모드
    function startTabata() {
        const tabataRounds = parseInt($('#tabataRounds').val());
        const tabataWork = parseInt($('#tabataWork').val());
        const tabataRest = parseInt($('#tabataRest').val());
        
        totalRounds = isNaN(tabataRounds) ? 8 : tabataRounds;
        workTime = isNaN(tabataWork) ? 20 : tabataWork;
        restTime = isNaN(tabataRest) ? 10 : tabataRest;
        
        startTime = Date.now();
        timerInterval = setInterval(updateTabata, 100);
        updateTimerLabel();
    }

    function updateTabata() {
        elapsedTime = Date.now() - startTime;
        const totalSeconds = Math.floor(elapsedTime / 1000);
        const cycleTime = workTime + restTime; // 한 사이클 총 시간
        const cycleElapsed = totalSeconds % cycleTime;
        
        let remainingTime;
        let newWorkPhase;
        
        if (cycleElapsed < workTime) {
            // 운동 페이즈
            newWorkPhase = true;
            remainingTime = workTime - cycleElapsed;
        } else {
            // 휴식 페이즈
            newWorkPhase = false;
            remainingTime = cycleTime - cycleElapsed;
        }
        
        // 페이즈 변경 감지
        if (newWorkPhase !== isWorkPhase) {
            isWorkPhase = newWorkPhase;
            if (isWorkPhase) {
                // 휴식 -> 운동 (새 라운드 시작)
                const newRound = Math.floor(totalSeconds / cycleTime) + 1;
                if (newRound !== currentRound) {
                    currentRound = newRound;
                    playBeep(1000, 300);
                    $currentRound.text(currentRound);
                    
                    if (currentRound > totalRounds) {
                        finishTimer();
                        return;
                    }
                }
            } else {
                // 운동 -> 휴식
                playBeep(600, 300);
            }
            updateTimerLabel();
        }
        
        $timeDisplay.text(formatTime(remainingTime));
        
        // 경고 효과 (TABATA용 기준)
        const currentPhaseTime = isWorkPhase ? workTime : restTime;
        const warningTime = Math.min(5, Math.floor(currentPhaseTime * 0.1)); // 전체의 10% 또는 5초
        const dangerTime = Math.min(3, Math.floor(currentPhaseTime * 0.05)); // 전체의 5% 또는 3초
        
        if (remainingTime <= warningTime && remainingTime > dangerTime) {
            $('.timer-display').addClass('warning').removeClass('danger');
        } else if (remainingTime <= dangerTime && remainingTime > 0) {
            $('.timer-display').addClass('danger').removeClass('warning');
        } else {
            $('.timer-display').removeClass('warning danger');
        }
    }

    // 타이머 완료
    function finishTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        isRunning = false;
        isPaused = false;
        
        $startBtn.show().text('시작');
        $pauseBtn.hide();
        
        $timerLabel.text('완료!');
        $timeDisplay.text('00:00');
        
        $('.timer-display').removeClass('warning danger');
        
        // 완료 알림
        playBeep(1200, 1000);
        showToast('타이머가 완료되었습니다! 🎉');
        
        // 진동 (모바일)
        if ('vibrate' in navigator) {
            navigator.vibrate([500, 200, 500]);
        }
    }

    // 토스트 메시지
    function showToast(message) {
        const $toast = $('#toast');
        $toast.text(message).addClass('show');
        
        setTimeout(() => {
            $toast.removeClass('show');
        }, 3000);
    }

    // 설정 값 변경 감지
    $('#countdownMinutes, #countdownSeconds').on('input', function() {
        if (!isRunning && currentMode === 'countdown') {
            resetTimer();
        }
    });

    $('#amrapMinutes, #amrapSeconds').on('input', function() {
        if (!isRunning && currentMode === 'amrap') {
            resetTimer();
        }
    });

    $('#emomRounds, #emomWork').on('input', function() {
        if (!isRunning && currentMode === 'emom') {
            resetTimer();
        }
    });

    $('#tabataWork, #tabataRest, #tabataRounds').on('input', function() {
        if (!isRunning && currentMode === 'tabata') {
            resetTimer();
        }
    });

    // 준비시간 설정 변경 감지
    $('#prepTime').on('input', function() {
        if (!isRunning) {
            // 타이머가 실행 중이 아닐 때만 반영
            prepTime = parseInt($(this).val());
            if (isNaN(prepTime) || prepTime < 0) prepTime = 10;
        }
    });

    // 키보드 단축키
    $(document).keydown(function(e) {
        // input 필드에 포커스가 있으면 키보드 단축키 무시
        if ($(e.target).is('input, textarea, select')) {
            return;
        }
        
        // 스페이스바: 시작/일시정지
        if (e.code === 'Space') {
            e.preventDefault();
            if (isRunning) {
                pauseTimer();
            } else {
                if (isPaused) {
                    resumeTimer();
                } else {
                    startTimer();
                }
            }
        }
        
        // R키: 리셋
        if (e.code === 'KeyR') {
            e.preventDefault();
            resetTimer();
        }
        
        // 1-4키: 모드 변경 (stopwatch 제거됨)
        if (e.code >= 'Digit1' && e.code <= 'Digit4') {
            e.preventDefault();
            const modeIndex = parseInt(e.code.slice(-1)) - 1;
            const modes = ['countdown', 'amrap', 'emom', 'tabata'];
            if (modes[modeIndex]) {
                $(`.mode-btn[data-mode="${modes[modeIndex]}"]`).click();
            }
        }
    });

    // 페이지 가시성 변경 시 처리 (백그라운드에서도 정확한 시간 유지)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && isRunning && !isPaused) {
            // 페이지가 다시 보일 때 시간 동기화
            const now = Date.now();
            const actualElapsed = now - startTime;
            
            // 시간 차이가 클 경우 동기화
            if (Math.abs(actualElapsed - elapsedTime) > 1000) {
                elapsedTime = actualElapsed;
            }
        }
    });

    // 준비시간 시작
    function startPrepPhase() {
        isPrepPhase = true;
        prepStartTime = Date.now();
        timerInterval = setInterval(updatePrepPhase, 100);
        $timerLabel.text('준비 중...');
    }

    // 준비시간 업데이트
    function updatePrepPhase() {
        const elapsedPrepTime = Math.floor((Date.now() - prepStartTime) / 1000);
        const remainingPrepTime = Math.max(0, prepTime - elapsedPrepTime);
        
        $timeDisplay.text(formatTime(remainingPrepTime));
        
        // 마지막 3초 카운트다운
        if (remainingPrepTime <= 3 && remainingPrepTime > 0) {
            playBeep(800, 200);
            $('.timer-display').addClass('warning');
        }
        
        // 준비시간 종료
        if (remainingPrepTime === 0) {
            playBeep(1000, 500); // 시작 신호
            clearInterval(timerInterval);
            isPrepPhase = false;
            $('.timer-display').removeClass('warning danger');
            startMainTimer();
        }
    }

    // 메인 타이머 시작
    function startMainTimer() {
        switch (currentMode) {
            case 'countdown':
                startForTime();
                break;
            case 'amrap':
                startAmrap();
                break;
            case 'emom':
                startEmom();
                break;
            case 'tabata':
                startTabata();
                break;
        }
    }

    // 초기화
    updateSettingsDisplay();
    resetTimer();
}); 