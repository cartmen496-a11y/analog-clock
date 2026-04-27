(function() {
    const canvas = document.getElementById('clockCanvas');
    const ctx = canvas.getContext('2d');
    const dateDisplay = document.getElementById('dateDisplay');
    const digitalTimeDisplay = document.getElementById('digitalTime');

    // Размеры
    const size = 600;
    canvas.width = size;
    canvas.height = size;
    const radius = 260;
    const centerX = size / 2;
    const centerY = size / 2;

    // --- ТЕКУЩИЙ СТИЛЬ ---
    let currentStyle = 'neon';
    
    // --- ОПРЕДЕЛЕНИЕ СТИЛЕЙ ---
    const styles = {
        neon: {
            name: 'Neon',
            mainGlow: '#00ffff',
            accentGlow: '#ff00ff',
            secondGlow: '#ff3366',
            dialGradient: ['#1a1a2e', '#0f0f1a', '#0a0a0f'],
            ringColor: '#00ffff',
            digitColor: '#00ffff',
            markColor: '#00ffff',
            hourColor: '#00ffff',
            minuteColor: '#ff00ff',
            secondColor: '#ff3366',
            dotColors: ['#00ffff', '#ff00ff'],
            panelBorder: 'rgba(0, 255, 255, 0.2)',
            panelText: 'rgba(0, 255, 255, 0.7)',
            isClassic: false
        },
        gold: {
            name: 'Gold',
            mainGlow: '#ffd700',
            accentGlow: '#ff8c00',
            secondGlow: '#ff4500',
            dialGradient: ['#2a1a0a', '#1a0f05', '#0a0805'],
            ringColor: '#ffd700',
            digitColor: '#ffd700',
            markColor: '#ffd700',
            hourColor: '#ffd700',
            minuteColor: '#ff8c00',
            secondColor: '#ff4500',
            dotColors: ['#ffd700', '#ff8c00'],
            panelBorder: 'rgba(255, 215, 0, 0.2)',
            panelText: 'rgba(255, 215, 0, 0.7)',
            isClassic: false
        },
        ice: {
            name: 'Ice',
            mainGlow: '#00bfff',
            accentGlow: '#87ceeb',
            secondGlow: '#ffffff',
            dialGradient: ['#0a2a3a', '#051520', '#020a10'],
            ringColor: '#00bfff',
            digitColor: '#00bfff',
            markColor: '#00bfff',
            hourColor: '#00bfff',
            minuteColor: '#87ceeb',
            secondColor: '#ffffff',
            dotColors: ['#00bfff', '#87ceeb'],
            panelBorder: 'rgba(0, 191, 255, 0.2)',
            panelText: 'rgba(0, 191, 255, 0.7)',
            isClassic: false
        },
        sunset: {
            name: 'Sunset',
            mainGlow: '#ff6b35',
            accentGlow: '#ff4d6d',
            secondGlow: '#c77dff',
            dialGradient: ['#2a0a1a', '#1a0510', '#0a0208'],
            ringColor: '#ff6b35',
            digitColor: '#ff6b35',
            markColor: '#ff6b35',
            hourColor: '#ff6b35',
            minuteColor: '#ff4d6d',
            secondColor: '#c77dff',
            dotColors: ['#ff6b35', '#ff4d6d'],
            panelBorder: 'rgba(255, 107, 53, 0.2)',
            panelText: 'rgba(255, 107, 53, 0.7)',
            isClassic: false
        },
        classic: {
            name: 'Classic',
            mainGlow: '#8B7355',
            accentGlow: '#6B5340',
            secondGlow: '#cc3333',
            dialGradient: ['#f5f0e8', '#ede5d8', '#e8ddd0'],
            ringColor: '#8B7355',
            digitColor: '#2c1810',
            markColor: '#8B7355',
            hourColor: '#2c1810',
            minuteColor: '#2c1810',
            secondColor: '#cc3333',
            dotColors: ['#8B7355', '#6B5340'],
            panelBorder: 'rgba(139, 115, 85, 0.3)',
            panelText: 'rgba(80, 60, 40, 0.8)',
            isClassic: true
        }
    };

    // --- ЗВУК ТИКАНЬЯ ---
    let audioContext = null;
    let lastSecond = -1;
    let soundEnabled = true;

    function initAudio() {
        if (audioContext) return;
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    function playTick() {
        if (!soundEnabled) return;
        
        try {
            if (!audioContext) {
                initAudio();
                if (audioContext.state === 'suspended') {
                    audioContext.resume();
                }
            }
            
            const now = audioContext.currentTime;
            
            const osc1 = audioContext.createOscillator();
            const gain1 = audioContext.createGain();
            osc1.connect(gain1);
            gain1.connect(audioContext.destination);
            osc1.type = 'sine';
            osc1.frequency.value = 1200;
            gain1.gain.value = 0.12;
            gain1.gain.exponentialRampToValueAtTime(0.00001, now + 0.06);
            osc1.start(now);
            osc1.stop(now + 0.02);
            
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.type = 'triangle';
            osc2.frequency.value = 800;
            gain2.gain.value = 0.08;
            gain2.gain.exponentialRampToValueAtTime(0.00001, now + 0.05);
            osc2.start(now + 0.01);
            osc2.stop(now + 0.03);
            
        } catch (e) {
            console.log('Audio error:', e);
        }
    }

    // Обновление цифровой информации
    function updateDigitalInfo() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        
        digitalTimeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
        
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateDisplay.textContent = now.toLocaleDateString('ru-RU', options);
        
        const style = styles[currentStyle];
        digitalTimeDisplay.style.color = style.mainGlow;
        digitalTimeDisplay.style.textShadow = `0 0 20px ${style.mainGlow}, 0 0 40px ${style.mainGlow}66`;
        dateDisplay.style.color = style.mainGlow;
        dateDisplay.style.textShadow = `0 0 10px ${style.mainGlow}`;
    }

    // Рисование классических стрелок
    function drawClassicHand(angleRad, length, thickness, color) {
        const x = centerX + length * Math.cos(angleRad);
        const y = centerY + length * Math.sin(angleRad);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.lineWidth = thickness;
        ctx.strokeStyle = color;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, thickness / 1.8, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        
        ctx.shadowBlur = 2;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
    }

    // Рисование неоновых стрелок
    function drawHand(angleRad, length, thickness, color, glowColor) {
        const x = centerX + length * Math.cos(angleRad);
        const y = centerY + length * Math.sin(angleRad);
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = glowColor;
        
        const gradient = ctx.createLinearGradient(centerX, centerY, x, y);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color === styles[currentStyle].hourColor ? styles[currentStyle].accentGlow : styles[currentStyle].mainGlow);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.lineWidth = thickness;
        ctx.strokeStyle = gradient;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, thickness / 1.5, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }

    // ОСНОВНАЯ ФУНКЦИЯ РИСОВАНИЯ
    function drawClock() {
        ctx.clearRect(0, 0, size, size);
        
        const style = styles[currentStyle];
        const isClassic = style.isClassic;
        
        // Циферблат
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, style.dialGradient[0]);
        gradient.addColorStop(0.7, style.dialGradient[1]);
        gradient.addColorStop(1, style.dialGradient[2]);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        if (isClassic) {
            ctx.shadowBlur = 5;
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius - 3, 0, 2 * Math.PI);
            ctx.strokeStyle = '#b89a6e';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius - 7, 0, 2 * Math.PI);
            ctx.strokeStyle = style.ringColor;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius - 12, 0, 2 * Math.PI);
            ctx.strokeStyle = '#c4a67a';
            ctx.lineWidth = 0.8;
            ctx.stroke();
        } else {
            ctx.shadowBlur = 20;
            ctx.shadowColor = style.mainGlow;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius - 5, 0, 2 * Math.PI);
            ctx.strokeStyle = style.ringColor;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius - 15, 0, 2 * Math.PI);
            ctx.strokeStyle = `${style.mainGlow}4D`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
        
        // Часовые метки и цифры
        for (let hour = 1; hour <= 12; hour++) {
            const angle = (hour * 30 - 90) * Math.PI / 180;
            const tickLength = isClassic ? 25 : 20;
            const tickStartX = centerX + (radius - (isClassic ? 28 : 30)) * Math.cos(angle);
            const tickStartY = centerY + (radius - (isClassic ? 28 : 30)) * Math.sin(angle);
            const tickEndX = centerX + (radius - (isClassic ? 28 : 30) - tickLength) * Math.cos(angle);
            const tickEndY = centerY + (radius - (isClassic ? 28 : 30) - tickLength) * Math.sin(angle);
            
            if (!isClassic) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = style.mainGlow;
            } else {
                ctx.shadowBlur = 0;
            }
            
            ctx.beginPath();
            ctx.moveTo(tickStartX, tickStartY);
            ctx.lineTo(tickEndX, tickEndY);
            ctx.lineWidth = isClassic ? (hour % 3 === 0 ? 4 : 2) : 4;
            ctx.strokeStyle = style.markColor;
            ctx.stroke();
            
            if (isClassic) {
                ctx.font = `${(hour % 3 === 0) ? 'bold 28px' : '24px'} "Times New Roman", "Georgia", serif`;
                ctx.fillStyle = style.digitColor;
                ctx.shadowBlur = 0;
            } else {
                ctx.font = `bold ${(hour % 3 === 0) ? 32 : 26}px "SF Pro Display", "Helvetica Neue", system-ui`;
                ctx.fillStyle = style.digitColor;
                ctx.shadowBlur = 15;
                ctx.shadowColor = style.mainGlow;
            }
            
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const textRadius = radius - (isClassic ? 52 : 55);
            const textX = centerX + textRadius * Math.cos(angle);
            const textY = centerY + textRadius * Math.sin(angle);
            ctx.fillText(hour.toString(), textX, textY);
        }
        
        // Минутные деления
        for (let minute = 0; minute < 60; minute++) {
            const angle = (minute * 6 - 90) * Math.PI / 180;
            const isHourMark = (minute % 5 === 0);
            if (isHourMark) continue;
            
            const x = centerX + (radius - (isClassic ? 22 : 25)) * Math.cos(angle);
            const y = centerY + (radius - (isClassic ? 22 : 25)) * Math.sin(angle);
            
            if (isClassic) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                const x2 = centerX + (radius - 18) * Math.cos(angle);
                const y2 = centerY + (radius - 18) * Math.sin(angle);
                ctx.lineTo(x2, y2);
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#b89a6e';
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, 2 * Math.PI);
                ctx.fillStyle = minute % 2 === 0 ? style.dotColors[0] : style.dotColors[1];
                ctx.shadowBlur = 8;
                ctx.shadowColor = minute % 2 === 0 ? style.dotColors[0] : style.dotColors[1];
                ctx.fill();
            }
        }
        
        // Декоративные элементы
        if (!isClassic) {
            for (let hour = 0; hour < 12; hour++) {
                const angle = (hour * 30 - 90) * Math.PI / 180;
                const x = centerX + (radius - 18) * Math.cos(angle);
                const y = centerY + (radius - 18) * Math.sin(angle);
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = style.accentGlow;
                ctx.shadowBlur = 12;
                ctx.shadowColor = style.accentGlow;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
                ctx.fillStyle = style.mainGlow;
                ctx.fill();
            }
        } else {
            const specialHours = [12, 3, 6, 9];
            specialHours.forEach(hour => {
                const angle = (hour * 30 - 90) * Math.PI / 180;
                const x = centerX + (radius - 25) * Math.cos(angle);
                const y = centerY + (radius - 25) * Math.sin(angle);
                ctx.beginPath();
                ctx.moveTo(x, y - 4);
                ctx.lineTo(x + 4, y);
                ctx.lineTo(x, y + 4);
                ctx.lineTo(x - 4, y);
                ctx.closePath();
                ctx.fillStyle = '#d4af7a';
                ctx.fill();
            });
        }
        
        // Получаем текущее время
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        if (lastSecond !== seconds) {
            lastSecond = seconds;
            playTick();
            updateDigitalInfo();
        }
        
        const hourAngle = ((hours % 12) * 30 + minutes * 0.5 - 90) * Math.PI / 180;
        const minuteAngle = (minutes * 6 + seconds * 0.1 - 90) * Math.PI / 180;
        const secondAngle = (seconds * 6 - 90) * Math.PI / 180;
        
        // Рисуем стрелки
        if (isClassic) {
            drawClassicHand(hourAngle, radius * 0.45, 8, '#2c1810');
            drawClassicHand(minuteAngle, radius * 0.65, 6, '#2c1810');
            
            ctx.shadowBlur = 0;
            const secondX = centerX + (radius * 0.75) * Math.cos(secondAngle);
            const secondY = centerY + (radius * 0.75) * Math.sin(secondAngle);
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(secondX, secondY);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#cc3333';
            ctx.stroke();
            
            const backWeightLen = 30;
            const backX = centerX - backWeightLen * Math.cos(secondAngle);
            const backY = centerY - backWeightLen * Math.sin(secondAngle);
            ctx.beginPath();
            ctx.arc(backX, backY, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#cc3333';
            ctx.fill();
        } else {
            drawHand(hourAngle, radius * 0.45, 8, style.hourColor, style.mainGlow);
            drawHand(minuteAngle, radius * 0.65, 6, style.minuteColor, style.accentGlow);
            
            ctx.shadowBlur = 20;
            ctx.shadowColor = style.secondGlow;
            const secondX = centerX + (radius * 0.75) * Math.cos(secondAngle);
            const secondY = centerY + (radius * 0.75) * Math.sin(secondAngle);
            
            const secondGradient = ctx.createLinearGradient(centerX, centerY, secondX, secondY);
            secondGradient.addColorStop(0, style.secondGlow);
            secondGradient.addColorStop(1, style.accentGlow);
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(secondX, secondY);
            ctx.lineWidth = 3;
            ctx.strokeStyle = secondGradient;
            ctx.stroke();
            
            const backWeightLen = 35;
            const backX = centerX - backWeightLen * Math.cos(secondAngle);
            const backY = centerY - backWeightLen * Math.sin(secondAngle);
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(backX, backY);
            ctx.lineWidth = 3;
            ctx.strokeStyle = style.secondGlow;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(secondX, secondY, 7, 0, 2 * Math.PI);
            ctx.fillStyle = style.secondGlow;
            ctx.fill();
        }
        
        // Центральная ось
        if (isClassic) {
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
            ctx.fillStyle = '#d4af7a';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
            ctx.fillStyle = '#8B7355';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
            ctx.fillStyle = '#2c1810';
            ctx.fill();
        } else {
            ctx.shadowBlur = 15;
            ctx.shadowColor = style.mainGlow;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 14, 0, 2 * Math.PI);
            ctx.fillStyle = style.dialGradient[0];
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
            ctx.fillStyle = style.mainGlow;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
            ctx.fillStyle = style.accentGlow;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }
        
        ctx.shadowBlur = 0;
    }
    
    // Применение UI стиля
    function applyUIStyle(styleName) {
        const style = styles[styleName];
        const stylePanel = document.querySelector('.style-panel');
        const soundBtn = document.querySelector('.sound-btn');
        const glowEffect = document.querySelector('.glow-effect');
        
        if (stylePanel) {
            stylePanel.style.borderColor = style.panelBorder;
            const styleTitle = stylePanel.querySelector('.style-title');
            if (styleTitle) styleTitle.style.color = style.panelText;
        }
        
        if (soundBtn) {
            soundBtn.style.borderColor = style.panelBorder;
            soundBtn.style.color = style.mainGlow;
            if (!style.isClassic) {
                soundBtn.style.boxShadow = `0 0 15px ${style.mainGlow}33`;
            } else {
                soundBtn.style.boxShadow = 'none';
            }
        }
        
        if (glowEffect) {
            if (style.isClassic) {
                glowEffect.style.opacity = '0';
                glowEffect.style.animation = 'none';
            } else {
                glowEffect.style.opacity = '1';
                glowEffect.style.animation = 'pulseGlow 3s ease-in-out infinite';
                glowEffect.style.background = `radial-gradient(circle, ${style.mainGlow}26 0%, ${style.mainGlow}00 70%)`;
            }
        }
        
        document.querySelectorAll('.style-btn').forEach(btn => {
            if (btn.dataset.style === styleName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    // Обновление фона
    function updateBodyBackground(styleName) {
        let gradient;
        switch(styleName) {
            case 'neon':
                gradient = 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)';
                break;
            case 'gold':
                gradient = 'linear-gradient(135deg, #1a0f05 0%, #2a1a0a 50%, #1a0f05 100%)';
                break;
            case 'ice':
                gradient = 'linear-gradient(135deg, #020a10 0%, #051520 50%, #0a2a3a 100%)';
                break;
            case 'sunset':
                gradient = 'linear-gradient(135deg, #0a0208 0%, #1a0510 50%, #2a0a1a 100%)';
                break;
            case 'classic':
                gradient = 'linear-gradient(135deg, #2c2418 0%, #4a3a28 50%, #2c2418 100%)';
                break;
            default:
                gradient = 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)';
        }
        document.body.style.background = gradient;
    }
    
    // Смена стиля
    function changeStyle(styleName) {
        if (!styles[styleName]) return;
        currentStyle = styleName;
        applyUIStyle(styleName);
        updateBodyBackground(styleName);
        updateDigitalInfo();
        localStorage.setItem('clockStyle', styleName);
    }
    
    // Анимация
    function animate() {
        drawClock();
        requestAnimationFrame(animate);
    }
    
    // Активация аудио
    function enableAudio() {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        } else if (!audioContext) {
            initAudio();
            audioContext.resume();
        }
    }
    
    canvas.addEventListener('click', enableAudio);
    document.body.addEventListener('click', enableAudio);
    
    // Управление звуком
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            soundEnabled = !soundEnabled;
            const icon = soundToggleBtn.querySelector('.sound-icon');
            const text = soundToggleBtn.querySelector('.sound-text');
            
            if (soundEnabled) {
                icon.textContent = '🔊';
                text.textContent = 'Звук включён';
                soundToggleBtn.style.opacity = '1';
                enableAudio();
                setTimeout(() => playTick(), 50);
            } else {
                icon.textContent = '🔇';
                text.textContent = 'Звук выключен';
                soundToggleBtn.style.opacity = '0.7';
            }
        });
    }
    
    // Настройка кнопок стиля
    function setupStyleButtons() {
        const buttons = document.querySelectorAll('.style-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const styleName = btn.dataset.style;
                if (styleName) changeStyle(styleName);
            });
        });
    }
    
    // Загрузка сохранённого стиля
    const savedStyle = localStorage.getItem('clockStyle');
    if (savedStyle && styles[savedStyle]) currentStyle = savedStyle;
    
    // Инициализация
    setupStyleButtons();
    applyUIStyle(currentStyle);
    updateBodyBackground(currentStyle);
    updateDigitalInfo();
    animate();
    
    setInterval(() => {
        if (lastSecond !== new Date().getSeconds()) updateDigitalInfo();
    }, 100);
})();