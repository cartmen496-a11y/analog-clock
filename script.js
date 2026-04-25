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
            
            // Neon-звук тиканья
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
    }

    // Рисование часов с neon эффектом
    function drawClock() {
        ctx.clearRect(0, 0, size, size);
        
        // Темный циферблат с градиентом (ночной режим)
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.7, '#0f0f1a');
        gradient.addColorStop(1, '#0a0a0f');
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Neon внешнее кольцо
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 5, 0, 2 * Math.PI);
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Внутреннее кольцо
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 15, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Часовые метки (арабские цифры с neon эффектом)
        for (let hour = 1; hour <= 12; hour++) {
            const angle = (hour * 30 - 90) * Math.PI / 180;
            const tickLength = 20;
            const tickStartX = centerX + (radius - 30) * Math.cos(angle);
            const tickStartY = centerY + (radius - 30) * Math.sin(angle);
            const tickEndX = centerX + (radius - 30 - tickLength) * Math.cos(angle);
            const tickEndY = centerY + (radius - 30 - tickLength) * Math.sin(angle);
            
            // Neon метки
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ffff';
            ctx.beginPath();
            ctx.moveTo(tickStartX, tickStartY);
            ctx.lineTo(tickEndX, tickEndY);
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#00ffff';
            ctx.stroke();
            
            // Арабские цифры с neon glow
            ctx.font = `bold ${(hour % 3 === 0) ? 32 : 26}px "SF Pro Display", "Helvetica Neue", system-ui`;
            ctx.fillStyle = '#00ffff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const textRadius = radius - 55;
            const textX = centerX + textRadius * Math.cos(angle);
            const textY = centerY + textRadius * Math.sin(angle);
            ctx.fillText(hour.toString(), textX, textY);
        }
        
        // Минутные деления (светящиеся точки)
        for (let minute = 0; minute < 60; minute++) {
            const angle = (minute * 6 - 90) * Math.PI / 180;
            const isHourMark = (minute % 5 === 0);
            if (isHourMark) continue;
            
            const x = centerX + (radius - 25) * Math.cos(angle);
            const y = centerY + (radius - 25) * Math.sin(angle);
            
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fillStyle = minute % 2 === 0 ? '#00ffff' : '#ff00ff';
            ctx.shadowBlur = 8;
            ctx.shadowColor = minute % 2 === 0 ? '#00ffff' : '#ff00ff';
            ctx.fill();
        }
        
        // Декоративные точки на часовых метках
        for (let hour = 0; hour < 12; hour++) {
            const angle = (hour * 30 - 90) * Math.PI / 180;
            const x = centerX + (radius - 18) * Math.cos(angle);
            const y = centerY + (radius - 18) * Math.sin(angle);
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#ff00ff';
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#ff00ff';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
            ctx.fillStyle = '#00ffff';
            ctx.fill();
        }
        
        // Получаем текущее время
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        // Звук при смене секунды
        if (lastSecond !== seconds) {
            lastSecond = seconds;
            playTick();
            updateDigitalInfo();
        }
        
        // Углы стрелок
        const hourAngle = ((hours % 12) * 30 + minutes * 0.5 - 90) * Math.PI / 180;
        const minuteAngle = (minutes * 6 + seconds * 0.1 - 90) * Math.PI / 180;
        const secondAngle = (seconds * 6 - 90) * Math.PI / 180;
        
        // Рисуем часовую стрелку с neon эффектом
        drawHand(hourAngle, radius * 0.45, 8, '#00ffff', 0.6);
        // Рисуем минутную стрелку
        drawHand(minuteAngle, radius * 0.65, 6, '#ff00ff', 0.6);
        
        // Секундная стрелка (яркая, с хвостом)
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff3366';
        const secondX = centerX + (radius * 0.75) * Math.cos(secondAngle);
        const secondY = centerY + (radius * 0.75) * Math.sin(secondAngle);
        
        // Градиент для секундной стрелки
        const secondGradient = ctx.createLinearGradient(centerX, centerY, secondX, secondY);
        secondGradient.addColorStop(0, '#ff3366');
        secondGradient.addColorStop(1, '#ff00ff');
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(secondX, secondY);
        ctx.lineWidth = 3;
        ctx.strokeStyle = secondGradient;
        ctx.stroke();
        
        // Противовес секундной стрелки
        const backWeightLen = 35;
        const backX = centerX - backWeightLen * Math.cos(secondAngle);
        const backY = centerY - backWeightLen * Math.sin(secondAngle);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(backX, backY);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ff3366';
        ctx.stroke();
        
        // Светящийся круг на конце секундной стрелки
        ctx.beginPath();
        ctx.arc(secondX, secondY, 7, 0, 2 * Math.PI);
        ctx.fillStyle = '#ff3366';
        ctx.shadowBlur = 15;
        ctx.fill();
        
        // Центральная ось (многослойная с neon эффектом)
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 14, 0, 2 * Math.PI);
        ctx.fillStyle = '#1a1a2e';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#00ffff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#ff00ff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
    
    function drawHand(angleRad, length, thickness, color, shadowIntensity = 0.5) {
        const x = centerX + length * Math.cos(angleRad);
        const y = centerY + length * Math.sin(angleRad);
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        
        // Стрелка с градиентом
        const gradient = ctx.createLinearGradient(centerX, centerY, x, y);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color === '#00ffff' ? '#ff00ff' : '#00ffff');
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.lineWidth = thickness;
        ctx.strokeStyle = gradient;
        ctx.stroke();
        
        // Декоративная база
        ctx.beginPath();
        ctx.arc(centerX, centerY, thickness / 1.5, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
    
    // Анимация с дополнительным эффектом мерцания
    let time = 0;
    function animate() {
        drawClock();
        
        // Динамическое изменение интенсивности свечения
        time += 0.02;
        const glowIntensity = (Math.sin(time) + 1) / 2 * 0.3 + 0.7;
        
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
    
    // Инициализация
    updateDigitalInfo();
    animate();
    
    setInterval(() => {
        if (lastSecond !== new Date().getSeconds()) {
            updateDigitalInfo();
        }
    }, 100);
})();