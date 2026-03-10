document.addEventListener('DOMContentLoaded', function() {
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
    var timeDisplay = document.getElementById('timeDisplay');
    var timerLabel = document.getElementById('timerLabel');
    var roundInfo = document.getElementById('roundInfo');
    var currentRoundEl = document.getElementById('currentRound');
    var totalRoundsEl = document.getElementById('totalRounds');
    var startBtn = document.getElementById('startBtn');
    var pauseBtn = document.getElementById('pauseBtn');
    var resetBtn = document.getElementById('resetBtn');
    var soundEnabled = document.getElementById('soundEnabled');

    // 사운드 생성 (Web Audio API 사용)
    let audioContext;

    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playBeep(frequency = 800, duration = 200) {
        if (!soundEnabled.checked) return;

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
    document.querySelectorAll('.mode-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (isRunning) {
                showToast('타이머가 실행 중입니다. 먼저 정지해주세요.');
                return;
            }

            document.querySelectorAll('.mode-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            this.classList.add('active');

            currentMode = this.dataset.mode;
            resetTimer();
            updateSettingsDisplay();
        });
    });

    // 설정 패널 업데이트
    function updateSettingsDisplay() {
        document.querySelectorAll('.setting-group').forEach(function(el) {
            el.style.display = 'none';
        });
        document.getElementById(currentMode + 'Settings').style.display = 'block';

        // 라운드 정보 표시 여부
        if (currentMode === 'emom' || currentMode === 'tabata') {
            roundInfo.style.display = 'block';
        } else {
            roundInfo.style.display = 'none';
        }

        // 타이머 라벨 업데이트
        updateTimerLabel();
    }

    // 타이머 라벨 업데이트
    function updateTimerLabel() {
        switch (currentMode) {
            case 'countdown':
                timerLabel.textContent = 'For Time';
                break;
            case 'amrap':
                timerLabel.textContent = 'AMRAP';
                break;
            case 'emom':
                timerLabel.textContent = `라운드 ${currentRound}`;
                break;
            case 'tabata':
                if (isWorkPhase) {
                    timerLabel.textContent = '운동';
                } else {
                    timerLabel.textContent = '휴식';
                }
                break;
        }
    }

    // 시작 버튼
    startBtn.addEventListener('click', function() {
        if (isPaused) {
            resumeTimer();
        } else {
            startTimer();
        }
    });

    // 일시정지 버튼
    pauseBtn.addEventListener('click', function() {
        pauseTimer();
    });

    // 리셋 버튼
    resetBtn.addEventListener('click', function() {
        resetTimer();
    });

    // 타이머 시작
    function startTimer() {
        initAudio(); // 사용자 상호작용 후 오디오 컨텍스트 초기화

        // 준비시간 설정
        var prepTimeInput = document.getElementById('prepTime');
        prepTime = prepTimeInput ? parseInt(prepTimeInput.value) : 10;
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

        startBtn.style.display = 'none';
        pauseBtn.style.display = '';

        var timerDisplayEl = document.querySelector('.timer-display');
        timerDisplayEl.classList.add('pulse');
        setTimeout(function() { timerDisplayEl.classList.remove('pulse'); }, 1000);
    }

    // 타이머 일시정지
    function pauseTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }

        isRunning = false;
        isPaused = true;

        pauseBtn.style.display = 'none';
        startBtn.style.display = '';
        startBtn.textContent = '재시작';

        if (isPrepPhase) {
            timerLabel.textContent = '준비 일시정지';
        } else {
            timerLabel.textContent = '일시정지';
        }
    }

    // 타이머 재시작
    function resumeTimer() {
        if (isPrepPhase) {
            // 준비시간 재시작
            prepStartTime = Date.now() - (prepTime - parseInt(timeDisplay.textContent.split(':').pop())) * 1000;
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

        startBtn.style.display = 'none';
        pauseBtn.style.display = '';

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

        startBtn.style.display = '';
        startBtn.textContent = '시작';
        pauseBtn.style.display = 'none';

        var timerDisplayEl = document.querySelector('.timer-display');
        timerDisplayEl.classList.remove('warning');
        timerDisplayEl.classList.remove('danger');

        // 초기 시간 설정
        switch (currentMode) {
            case 'countdown':
                timeDisplay.textContent = '00:00'; // For Time은 0부터 시작
                break;
            case 'amrap':
                const amrapMinutes = parseInt(document.getElementById('amrapMinutes').value);
                const amrapSeconds = parseInt(document.getElementById('amrapSeconds').value);
                const finalAmrapMinutes = isNaN(amrapMinutes) ? 15 : amrapMinutes;
                const finalAmrapSeconds = isNaN(amrapSeconds) ? 0 : amrapSeconds;
                totalTime = finalAmrapMinutes * 60 + finalAmrapSeconds;
                timeDisplay.textContent = formatTime(totalTime);
                break;
            case 'emom':
                const emomRounds = parseInt(document.getElementById('emomRounds').value);
                const emomWork = parseInt(document.getElementById('emomWork').value);

                totalRounds = isNaN(emomRounds) ? 10 : emomRounds;
                emomWorkTime = isNaN(emomWork) ? 40 : emomWork;
                intervalTime = 60; // EMOM은 항상 60초 간격
                timeDisplay.textContent = formatTime(emomWorkTime);
                currentRoundEl.textContent = '1';
                totalRoundsEl.textContent = totalRounds;
                break;
            case 'tabata':
                const tabataRounds = parseInt(document.getElementById('tabataRounds').value);
                const tabataWork = parseInt(document.getElementById('tabataWork').value);
                const tabataRest = parseInt(document.getElementById('tabataRest').value);

                totalRounds = isNaN(tabataRounds) ? 8 : tabataRounds;
                workTime = isNaN(tabataWork) ? 20 : tabataWork;
                restTime = isNaN(tabataRest) ? 10 : tabataRest;
                timeDisplay.textContent = formatTime(workTime);
                currentRoundEl.textContent = '1';
                totalRoundsEl.textContent = totalRounds;
                break;
        }

        updateTimerLabel();
    }

    // For Time 모드 (스톱워치 + Time Cap)
    function startForTime() {
        const minutes = parseInt(document.getElementById('countdownMinutes').value);
        const seconds = parseInt(document.getElementById('countdownSeconds').value);
        // 값이 NaN이면 기본값 사용, 0은 유효한 값으로 처리
        const finalMinutes = isNaN(minutes) ? 15 : minutes;
        const finalSeconds = isNaN(seconds) ? 0 : seconds;
        totalTime = finalMinutes * 60 + finalSeconds; // Time Cap

        startTime = Date.now();
        timerInterval = setInterval(updateForTime, 100);
        timerLabel.textContent = 'For Time 진행 중';
    }

    function updateForTime() {
        elapsedTime = Date.now() - startTime;
        const currentSeconds = Math.floor(elapsedTime / 1000);

        timeDisplay.textContent = formatTime(currentSeconds);

        // Time Cap 체크
        if (totalTime > 0 && currentSeconds >= totalTime) {
            playBeep(1200, 500);
            finishTimer();
            return;
        }

        // 경고 효과 (For Time용 기준)
        const warningTime = Math.min(60, Math.floor(totalTime * 0.2)); // 전체의 20% 또는 60초
        const dangerTime = Math.min(30, Math.floor(totalTime * 0.1)); // 전체의 10% 또는 30초

        var timerDisplayEl = document.querySelector('.timer-display');
        if (totalTime > 0) {
            const remainingTime = totalTime - currentSeconds;

            if (remainingTime <= warningTime && remainingTime > dangerTime) {
                timerDisplayEl.classList.add('warning');
                timerDisplayEl.classList.remove('danger');
            } else if (remainingTime <= dangerTime && remainingTime > 0) {
                timerDisplayEl.classList.add('danger');
                timerDisplayEl.classList.remove('warning');
                // 마지막 3초 카운트다운
                if (remainingTime <= 3) {
                    playBeep(1000, 100);
                }
            } else {
                timerDisplayEl.classList.remove('warning');
                timerDisplayEl.classList.remove('danger');
            }
        }
    }

    // AMRAP 모드
    function startAmrap() {
        const amrapMinutes = parseInt(document.getElementById('amrapMinutes').value);
        const amrapSeconds = parseInt(document.getElementById('amrapSeconds').value);
        const finalAmrapMinutes = isNaN(amrapMinutes) ? 15 : amrapMinutes;
        const finalAmrapSeconds = isNaN(amrapSeconds) ? 0 : amrapSeconds;
        totalTime = finalAmrapMinutes * 60 + finalAmrapSeconds;

        startTime = Date.now();
        timerInterval = setInterval(updateAmrap, 100);
        timerLabel.textContent = 'AMRAP 진행 중';
    }

    function updateAmrap() {
        elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, totalTime - Math.floor(elapsedTime / 1000));

        timeDisplay.textContent = formatTime(remainingTime);

        // 경고 효과 (AMRAP용 기준)
        const warningTime = Math.min(60, Math.floor(totalTime * 0.2)); // 전체의 20% 또는 60초
        const dangerTime = Math.min(30, Math.floor(totalTime * 0.1)); // 전체의 10% 또는 30초

        var timerDisplayEl = document.querySelector('.timer-display');
        if (remainingTime <= warningTime && remainingTime > dangerTime) {
            timerDisplayEl.classList.add('warning');
            timerDisplayEl.classList.remove('danger');
        } else if (remainingTime <= dangerTime && remainingTime > 0) {
            timerDisplayEl.classList.add('danger');
            timerDisplayEl.classList.remove('warning');
        } else {
            timerDisplayEl.classList.remove('warning');
            timerDisplayEl.classList.remove('danger');
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
        const emomRounds = parseInt(document.getElementById('emomRounds').value);
        const emomWork = parseInt(document.getElementById('emomWork').value);

        totalRounds = isNaN(emomRounds) ? 10 : emomRounds;
        emomWorkTime = isNaN(emomWork) ? 40 : emomWork;
        intervalTime = 60; // EMOM은 항상 60초 간격

        startTime = Date.now();
        timerInterval = setInterval(updateEmom, 100);
        timerLabel.textContent = `라운드 ${currentRound}`;
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
            currentRoundEl.textContent = currentRound;
            updateTimerLabel();

            if (currentRound > totalRounds) {
                finishTimer();
                return;
            }
        }

        // 각 라운드는 설정한 시간만큼 진행
        const remainingTime = emomWorkTime - secondsInCurrentRound;

        timeDisplay.textContent = formatTime(remainingTime);

        // 경고 효과 (EMOM용 기준)
        const warningTime = Math.min(10, Math.floor(emomWorkTime * 0.1)); // 전체의 10% 또는 10초
        const dangerTime = Math.min(5, Math.floor(emomWorkTime * 0.05)); // 전체의 5% 또는 5초

        var timerDisplayEl = document.querySelector('.timer-display');
        if (remainingTime <= warningTime && remainingTime > dangerTime) {
            timerDisplayEl.classList.add('warning');
            timerDisplayEl.classList.remove('danger');
        } else if (remainingTime <= dangerTime && remainingTime > 0) {
            timerDisplayEl.classList.add('danger');
            timerDisplayEl.classList.remove('warning');
        } else {
            timerDisplayEl.classList.remove('warning');
            timerDisplayEl.classList.remove('danger');
        }
    }

    // TABATA 모드
    function startTabata() {
        const tabataRounds = parseInt(document.getElementById('tabataRounds').value);
        const tabataWork = parseInt(document.getElementById('tabataWork').value);
        const tabataRest = parseInt(document.getElementById('tabataRest').value);

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
                    currentRoundEl.textContent = currentRound;

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

        timeDisplay.textContent = formatTime(remainingTime);

        // 경고 효과 (TABATA용 기준)
        const currentPhaseTime = isWorkPhase ? workTime : restTime;
        const warningTime = Math.min(5, Math.floor(currentPhaseTime * 0.1)); // 전체의 10% 또는 5초
        const dangerTime = Math.min(3, Math.floor(currentPhaseTime * 0.05)); // 전체의 5% 또는 3초

        var timerDisplayEl = document.querySelector('.timer-display');
        if (remainingTime <= warningTime && remainingTime > dangerTime) {
            timerDisplayEl.classList.add('warning');
            timerDisplayEl.classList.remove('danger');
        } else if (remainingTime <= dangerTime && remainingTime > 0) {
            timerDisplayEl.classList.add('danger');
            timerDisplayEl.classList.remove('warning');
        } else {
            timerDisplayEl.classList.remove('warning');
            timerDisplayEl.classList.remove('danger');
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

        startBtn.style.display = '';
        startBtn.textContent = '시작';
        pauseBtn.style.display = 'none';

        timerLabel.textContent = '완료!';
        timeDisplay.textContent = '00:00';

        var timerDisplayEl = document.querySelector('.timer-display');
        timerDisplayEl.classList.remove('warning');
        timerDisplayEl.classList.remove('danger');

        // 완료 알림
        playBeep(1200, 1000);
        showToast('타이머가 완료되었습니다! 🎉');

        // 진동 (모바일)
        if ('vibrate' in navigator) {
            navigator.vibrate([500, 200, 500]);
        }
    }

    // 설정 값 변경 감지
    ['countdownMinutes', 'countdownSeconds'].forEach(function(id) {
        document.getElementById(id).addEventListener('input', function() {
            if (!isRunning && currentMode === 'countdown') {
                resetTimer();
            }
        });
    });

    ['amrapMinutes', 'amrapSeconds'].forEach(function(id) {
        document.getElementById(id).addEventListener('input', function() {
            if (!isRunning && currentMode === 'amrap') {
                resetTimer();
            }
        });
    });

    ['emomRounds', 'emomWork'].forEach(function(id) {
        document.getElementById(id).addEventListener('input', function() {
            if (!isRunning && currentMode === 'emom') {
                resetTimer();
            }
        });
    });

    ['tabataWork', 'tabataRest', 'tabataRounds'].forEach(function(id) {
        document.getElementById(id).addEventListener('input', function() {
            if (!isRunning && currentMode === 'tabata') {
                resetTimer();
            }
        });
    });

    // 준비시간 설정 변경 감지
    var prepTimeInput = document.getElementById('prepTime');
    if (prepTimeInput) {
        prepTimeInput.addEventListener('input', function() {
            if (!isRunning) {
                // 타이머가 실행 중이 아닐 때만 반영
                prepTime = parseInt(this.value);
                if (isNaN(prepTime) || prepTime < 0) prepTime = 10;
            }
        });
    }

    // 키보드 단축키
    document.addEventListener('keydown', function(e) {
        // input 필드에 포커스가 있으면 키보드 단축키 무시
        if (e.target.matches('input, textarea, select')) {
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
                var modeBtn = document.querySelector('.mode-btn[data-mode="' + modes[modeIndex] + '"]');
                if (modeBtn) modeBtn.click();
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
        timerLabel.textContent = '준비 중...';
    }

    // 준비시간 업데이트
    function updatePrepPhase() {
        const elapsedPrepTime = Math.floor((Date.now() - prepStartTime) / 1000);
        const remainingPrepTime = Math.max(0, prepTime - elapsedPrepTime);

        timeDisplay.textContent = formatTime(remainingPrepTime);

        // 마지막 3초 카운트다운
        if (remainingPrepTime <= 3 && remainingPrepTime > 0) {
            playBeep(800, 200);
            document.querySelector('.timer-display').classList.add('warning');
        }

        // 준비시간 종료
        if (remainingPrepTime === 0) {
            playBeep(1000, 500); // 시작 신호
            clearInterval(timerInterval);
            isPrepPhase = false;
            var timerDisplayEl = document.querySelector('.timer-display');
            timerDisplayEl.classList.remove('warning');
            timerDisplayEl.classList.remove('danger');
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