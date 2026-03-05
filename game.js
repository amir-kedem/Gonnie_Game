// ─────────────────────────────────────────
//  GONNIE GAME  –  Chicken Space Shooter
// ─────────────────────────────────────────

const W = 480;
const H = 720;

// ══════════════════════════════════════════
//  SOUND MANAGER  (Web Audio API)
// ══════════════════════════════════════════
class SoundManager {
  constructor() { this.ctx = null; }

  _ctx() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    return this.ctx;
  }

  laser() {
    const ctx = this._ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  explosion() {
    const ctx = this._ctx();
    const bufSize = ctx.sampleRate * 0.4;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
    src.buffer = buf;
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    src.start(ctx.currentTime);
  }

  eggPop() {
    const ctx = this._ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }

  playerHit() {
    const ctx = this._ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }

  gameOver() {
    const ctx = this._ctx();
    [440, 330, 220, 110].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.25);
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.25 + 0.3);
      osc.start(ctx.currentTime + i * 0.25);
      osc.stop(ctx.currentTime + i * 0.25 + 0.3);
    });
  }
}

const sfx = new SoundManager();

// ══════════════════════════════════════════
//  BOOT SCENE  –  load assets & gen textures
// ══════════════════════════════════════════
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    this._chickenFailed = false;
    this.load.on('loaderror', (file) => {
      if (file.key === 'chicken') this._chickenFailed = true;
    });
    this.load.image('chicken', './chicken.png');
  }

  create() {
    if (this._chickenFailed) this._makeChickenFallback();

    this._makeShip();
    this._makeLaser();
    this._makeEgg();
    this._makeStar();
    this._makeFireball();
    this._makeHeart();
    this.scene.start('Game');
  }

  _makeChickenFallback() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xf0f0f0, 1);
    g.fillEllipse(40, 50, 58, 52);
    g.fillEllipse(40, 22, 30, 28);
    g.fillStyle(0xcc0000, 1);
    g.fillEllipse(34, 9, 8, 13);
    g.fillEllipse(42, 6, 8, 15);
    g.fillEllipse(50, 9, 8, 13);
    g.fillStyle(0xffaa00, 1);
    g.fillTriangle(24, 23, 13, 27, 24, 31);
    g.fillStyle(0x111111, 1);
    g.fillCircle(37, 19, 4);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(35, 17, 1.5);
    g.fillStyle(0xcc0000, 1);
    g.fillEllipse(28, 31, 9, 13);
    g.fillStyle(0xdddddd, 1);
    g.fillEllipse(54, 46, 22, 32);
    g.fillStyle(0xffaa00, 1);
    g.fillRect(28, 72, 7, 12);
    g.fillRect(43, 72, 7, 12);
    g.fillRect(22, 82, 16, 4);
    g.fillRect(39, 82, 16, 4);
    g.generateTexture('chicken', 80, 88);
    g.destroy();
  }

  _makeShip() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x00ccff, 1);
    g.fillTriangle(30, 0, 0, 60, 60, 60);
    g.fillStyle(0x0055ff, 1);
    g.fillRect(20, 45, 8, 20);
    g.fillRect(32, 45, 8, 20);
    g.fillStyle(0xffffff, 0.9);
    g.fillEllipse(30, 28, 12, 18);
    g.fillStyle(0x0099dd, 1);
    g.fillTriangle(0, 60, 15, 40, 0, 30);
    g.fillTriangle(60, 60, 45, 40, 60, 30);
    g.generateTexture('ship', 60, 70);
    g.destroy();
  }

  _makeLaser() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x00ffff, 1);
    g.fillRect(0, 0, 4, 20);
    g.fillStyle(0xffffff, 0.6);
    g.fillRect(1, 0, 2, 20);
    g.generateTexture('laser', 4, 20);
    g.destroy();
  }

  _makeEgg() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffee88, 1);
    g.fillEllipse(8, 10, 16, 20);
    g.fillStyle(0xffffff, 0.4);
    g.fillEllipse(5, 6, 5, 7);
    g.generateTexture('egg', 16, 20);
    g.destroy();
  }

  _makeStar() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 2, 2);
    g.generateTexture('star', 2, 2);
    g.destroy();
  }

  _makeFireball() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xff6600, 1);
    g.fillCircle(16, 16, 16);
    g.fillStyle(0xffcc00, 1);
    g.fillCircle(16, 16, 10);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(16, 16, 4);
    g.generateTexture('fireball', 32, 32);
    g.destroy();
  }

  _makeHeart() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xff1744, 1);
    g.fillCircle(9, 10, 9);
    g.fillCircle(23, 10, 9);
    g.fillTriangle(0, 14, 32, 14, 16, 30);
    g.fillStyle(0xff6688, 0.55);
    g.fillCircle(8, 8, 4);
    g.generateTexture('heart', 32, 30);
    g.destroy();
  }
}

// ══════════════════════════════════════════
//  GAME SCENE
// ══════════════════════════════════════════
class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  init() {
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.chickensAlive = 0;
    this.playerInvincible = false;
    this.gameRunning = true;
    this.lastFire = 0;
    this.fireRate = 300;
    this.pendingDeath = false;     // set by overlap callbacks, processed in update()
    this.pendingChickenHit = null; // chicken that caused the hit (or null if egg)
    this.touchLeft  = false;
    this.touchRight = false;
    this.touchFire  = false;
  }

  create() {
    // Starfield
    this.stars = [];
    for (let i = 0; i < 120; i++) {
      const s = this.add.image(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        'star'
      );
      s.setAlpha(Phaser.Math.FloatBetween(0.3, 1));
      s.speed = Phaser.Math.FloatBetween(0.5, 2.5);
      this.stars.push(s);
    }

    // Physics groups
    this.lasers = this.physics.add.group();
    this.eggs   = this.physics.add.group();
    this.chickens = this.physics.add.group();

    // Player
    this.player = this.physics.add.sprite(W / 2, H - 80, 'ship');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      fire:  Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // HUD
    this._createHUD();

    // Touch controls (mobile)
    this.input.addPointer(2); // support 2 simultaneous touches (e.g. move + fire)
    this._createTouchControls();

    // Collisions
    this.physics.add.overlap(this.lasers,   this.chickens, this._hitChicken,   null, this);
    this.physics.add.overlap(this.lasers,   this.eggs,     this._hitEgg,       null, this);
    // processCallback pre-filters: only call when not invincible (avoids re-entry issues)
    this.physics.add.overlap(
      this.eggs, this.player, this._hitPlayer,
      (egg, player) => egg.active && player.active && !this.playerInvincible,
      this
    );
    this.physics.add.overlap(
      this.chickens, this.player, this._hitByChicken,
      (chicken, player) => chicken.active && player.active && !this.playerInvincible,
      this
    );

    // Spawn first wave
    this._spawnWave();
  }

  update(time) {
    // Process player death here — update() runs AFTER all physics/overlap callbacks,
    // so it's the only safe place to modify groups, bodies, and positions.
    if (this.pendingDeath && this.gameRunning) {
      this.pendingDeath = false;
      const ch = this.pendingChickenHit;
      this.pendingChickenHit = null;
      this.eggs.clear(true, true);
      if (ch && ch.active) this._explodeChicken(ch);
      this._playerDeath();
    }

    if (!this.gameRunning) return;

    // Scroll stars
    for (const s of this.stars) {
      s.y += s.speed;
      if (s.y > H + 4) { s.y = -4; s.x = Phaser.Math.Between(0, W); }
    }

    // Player movement
    if (!this.player) return;
    this.player.setVelocityX(0);
    if (this.cursors.left.isDown || this.wasd.left.isDown || this.touchLeft) {
      this.player.setVelocityX(-280);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown || this.touchRight) {
      this.player.setVelocityX(280);
    }

    // Fire on Space held / touch fire button
    if (this.cursors.up.isDown || this.wasd.fire.isDown || this.touchFire) {
      if (time - this.lastFire > this.fireRate) {
        this._fireLaser();
        this.lastFire = time;
      }
    }

    // Clean off-screen bullets
    this.lasers.getChildren().forEach(l => { if (l.y < -30) l.destroy(); });
    this.eggs.getChildren().forEach(e => { if (e.y > H + 30) e.destroy(); });

    // Check wave cleared
    if (this.chickensAlive === 0 && this.gameRunning) {
      this.chickensAlive = -1; // prevent re-trigger
      this.time.delayedCall(1200, () => {
        if (this.gameRunning) {
          this.wave++;
          this._updateWaveText();
          this._spawnWave();
        }
      });
    }
  }

  // ── Laser ──────────────────────────────
  _fireLaser() {
    const laser = this.lasers.create(this.player.x, this.player.y - 40, 'laser');
    laser.setVelocityY(-700);
    laser.setDepth(8);
    sfx.laser();
  }

  // ── Wave Spawner ───────────────────────
  _spawnWave() {
    const count = Math.min(5 + (this.wave - 1) * 2, 16);
    const cols = Math.min(count, 6);
    const rows = Math.ceil(count / cols);
    const spacingX = 70;
    const startX = (W - (cols - 1) * spacingX) / 2;
    let spawned = 0;

    for (let r = 0; r < rows && spawned < count; r++) {
      for (let c = 0; c < cols && spawned < count; c++) {
        const delay = (r * cols + c) * 120;
        const tx = startX + c * spacingX;
        const ty = 80 + r * 80;
        this.time.delayedCall(delay, () => { this._spawnChicken(tx, ty); });
        spawned++;
      }
    }
    this.chickensAlive = count;
  }

  _spawnChicken(x, y) {
    const chicken = this.chickens.create(x, -60, 'chicken');
    chicken.setDisplaySize(70, 70);
    chicken.setDepth(5);

    this.tweens.add({
      targets: chicken,
      x, y,
      duration: 600,
      ease: 'Back.Out',
      onComplete: () => {
        chicken.inPosition = true;
        chicken.baseX = x;
        chicken.baseY = y;
        chicken.diveTimer = this.time.addEvent({
          delay: Phaser.Math.Between(3000, 8000) / Math.max(1, this.wave * 0.3),
          callback: () => this._chickenDive(chicken)
        });
        chicken.fireTimer = this.time.addEvent({
          delay: Phaser.Math.Between(2000, 5000),
          loop: true,
          callback: () => { if (chicken.active) this._fireEgg(chicken); }
        });
      }
    });
  }

  _chickenDive(chicken) {
    if (!chicken.active || !chicken.inPosition) return;
    chicken.inPosition = false;
    this.tweens.add({
      targets: chicken,
      x: this.player.x + Phaser.Math.Between(-40, 40),
      y: H + 80,
      duration: Math.max(600, 1400 - this.wave * 60),
      ease: 'Quad.In',
      onComplete: () => {
        if (chicken.active) {
          chicken.setPosition(chicken.baseX, chicken.baseY);
          chicken.inPosition = true;
          chicken.diveTimer = this.time.addEvent({
            delay: Phaser.Math.Between(2000, 6000),
            callback: () => this._chickenDive(chicken)
          });
        }
      }
    });
  }

  // ── Egg ────────────────────────────────
  _fireEgg(chicken) {
    if (!this.gameRunning || !chicken.active) return;
    const egg = this.eggs.create(chicken.x, chicken.y + 35, 'egg');
    egg.setDepth(7);
    const angle = Phaser.Math.Angle.Between(chicken.x, chicken.y, this.player.x, this.player.y);
    const speed = 180 + this.wave * 15;
    egg.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  // ── Collision: laser hits chicken ──────
  _hitChicken(laser, chicken) {
    laser.destroy();
    this._explodeChicken(chicken);
  }

  // Laser destroys egg (egg cracks open)
  _hitEgg(laser, egg) {
    if (!laser.active || !egg.active) return;
    laser.destroy();
    const colors = [0xffee88, 0xffcc00, 0xffffff];
    for (let i = 0; i < 8; i++) {
      const p = this.add.graphics().setDepth(15);
      p.fillStyle(colors[i % colors.length], 1);
      p.fillCircle(0, 0, Phaser.Math.Between(2, 5));
      p.setPosition(egg.x, egg.y);
      const a = Math.random() * Math.PI * 2;
      const spd = Phaser.Math.Between(40, 120);
      this.tweens.add({
        targets: p,
        x: egg.x + Math.cos(a) * spd * 0.4,
        y: egg.y + Math.sin(a) * spd * 0.4,
        alpha: 0, scaleX: 0.1, scaleY: 0.1,
        duration: 200,
        onComplete: () => p.destroy()
      });
    }
    egg.destroy();
    sfx.eggPop();
  }

  _explodeChicken(chicken) {
    if (chicken === this.player) return; // safety guard
    const x = chicken.x;
    const y = chicken.y;

    if (chicken.diveTimer) this.time.removeEvent(chicken.diveTimer);
    if (chicken.fireTimer) this.time.removeEvent(chicken.fireTimer);
    this.tweens.killTweensOf(chicken); // kill active dive/entry tween before destroy
    chicken.destroy();

    this.chickensAlive = Math.max(0, this.chickensAlive - 1);
    this.score += 10 * this.wave;
    this._updateScore();

    // Fireball
    const fb = this.add.sprite(x, y, 'fireball').setDepth(20);
    this.tweens.add({
      targets: fb,
      scaleX: 3, scaleY: 3, alpha: 0,
      duration: 500, ease: 'Quad.Out',
      onComplete: () => fb.destroy()
    });

    // Particles
    const colors = [0xff6600, 0xffcc00, 0xff3300, 0xffffff];
    for (let i = 0; i < 20; i++) {
      const p = this.add.graphics().setDepth(19);
      p.fillStyle(colors[i % colors.length], 1);
      p.fillCircle(0, 0, Phaser.Math.Between(3, 7));
      p.setPosition(x, y);
      const a = Math.random() * Math.PI * 2;
      const spd = Phaser.Math.Between(80, 220);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(a) * spd * 0.5,
        y: y + Math.sin(a) * spd * 0.5,
        alpha: 0, scaleX: 0.2, scaleY: 0.2,
        duration: Phaser.Math.Between(300, 600),
        onComplete: () => p.destroy()
      });
    }

    this.cameras.main.shake(150, 0.008);
    sfx.explosion();
  }

  // Egg hits player — only set flags here; actual work happens in update()
  _hitPlayer(_egg, _player) {
    this.playerInvincible = true;
    this.pendingDeath = true;
  }

  // Chicken body hits player — only set flags here; actual work happens in update()
  _hitByChicken(chicken, _player) {
    this.playerInvincible = true;
    this.pendingDeath = true;
    this.pendingChickenHit = chicken;
    // Kill the dive tween immediately — prevents it running on a soon-to-be-destroyed body
    this.tweens.killTweensOf(chicken);
  }

  // Shared death + respawn flow
  _playerDeath() {
    this.playerInvincible = true;

    const deathX = this.player.x;
    const deathY = this.player.y;

    // Move player off-screen (body stays enabled — avoids physics state corruption)
    this.player.setVisible(false);
    this.player.setAlpha(1);
    this.player.setVelocity(0, 0);
    this.player.setPosition(W / 2, H + 500);

    this._shipExplosion(deathX, deathY);
    sfx.playerHit();

    this.lives--;
    this._updateLives();

    if (this.lives <= 0) {
      this._endGame();
      return;
    }

    // After 1 second — bring back to center with 2-sec flashing invincibility
    this.time.delayedCall(1000, () => {
      if (!this.gameRunning) return;
      this.player.setPosition(W / 2, H - 80);
      this.player.setVelocity(0, 0);
      this.player.setAlpha(1);
      this.player.setVisible(true);

      // 10 × (100ms + 100ms yoyo) = 2000ms flash
      this.tweens.add({
        targets: this.player,
        alpha: 0.1,
        yoyo: true,
        repeat: 9,
        duration: 100,
        ease: 'Linear',
        onComplete: () => {
          this.player.setAlpha(1);
          this.playerInvincible = false;
        }
      });
    });
  }

  // Explosion effect for the ship
  _shipExplosion(x, y) {
    const fb = this.add.sprite(x, y, 'fireball').setDepth(20).setScale(0.5);
    this.tweens.add({
      targets: fb,
      scaleX: 2.5, scaleY: 2.5, alpha: 0,
      duration: 400, ease: 'Quad.Out',
      onComplete: () => fb.destroy()
    });
    const colors = [0x00ccff, 0xffffff, 0x0055ff, 0xffcc00];
    for (let i = 0; i < 14; i++) {
      const p = this.add.graphics().setDepth(19);
      p.fillStyle(colors[i % colors.length], 1);
      p.fillCircle(0, 0, Phaser.Math.Between(3, 6));
      p.setPosition(x, y);
      const a = Math.random() * Math.PI * 2;
      const spd = Phaser.Math.Between(60, 200);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(a) * spd * 0.5,
        y: y + Math.sin(a) * spd * 0.5,
        alpha: 0, scaleX: 0.1, scaleY: 0.1,
        duration: Phaser.Math.Between(300, 550),
        onComplete: () => p.destroy()
      });
    }
    this.cameras.main.shake(200, 0.015);
  }

  _endGame() {
    this.gameRunning = false;
    this.player.setVisible(false);
    sfx.gameOver();
    this.time.delayedCall(800, () => {
      this.scene.start('GameOver', { score: this.score, wave: this.wave });
    });
  }

  // ── Touch controls ─────────────────────
  _createTouchControls() {
    const BW = 80, BH = 70, BY = H - 50, R = 12, DEPTH = 60;

    const makeBtn = (cx, label, onDown, onUp) => {
      const bg = this.add.graphics().setDepth(DEPTH).setScrollFactor(0);
      const draw = (alpha) => {
        bg.clear();
        bg.fillStyle(0xffffff, alpha);
        bg.fillRoundedRect(cx - BW / 2, BY - BH / 2, BW, BH, R);
      };
      draw(0.25);

      this.add.text(cx, BY, label, { fontSize: '28px', fill: '#fff', fontFamily: 'monospace' })
        .setOrigin(0.5).setDepth(DEPTH + 1).setScrollFactor(0);

      const zone = this.add.zone(cx, BY, BW, BH).setDepth(DEPTH + 2).setScrollFactor(0).setInteractive();
      zone.on('pointerdown', () => { draw(0.55); onDown(); });
      zone.on('pointerup',   () => { draw(0.25); onUp();   });
      zone.on('pointerout',  () => { draw(0.25); onUp();   });
    };

    makeBtn(55,     '◄', () => { this.touchLeft  = true;  }, () => { this.touchLeft  = false; });
    makeBtn(150,    '►', () => { this.touchRight = true;  }, () => { this.touchRight = false; });
    makeBtn(W - 55, '●', () => { this.touchFire  = true;  }, () => { this.touchFire  = false; });
  }

  // ── HUD ────────────────────────────────
  _createHUD() {
    const style = { fontSize: '18px', fill: '#fff', fontFamily: 'monospace' };

    this.scoreTxt = this.add.text(12, 12, 'SCORE: 0', style).setDepth(50);
    this.waveTxt  = this.add.text(W / 2, 12, 'WAVE 1', style)
      .setOrigin(0.5, 0).setDepth(50);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const icon = this.add.image(W - 20 - i * 38, 22, 'heart')
        .setDisplaySize(28, 26).setDepth(50);
      this.lifeIcons.push(icon);
    }
  }

  _updateScore() {
    this.scoreTxt.setText('SCORE: ' + this.score);
  }

  _updateLives() {
    for (let i = 0; i < this.lifeIcons.length; i++) {
      this.lifeIcons[i].setAlpha(i < this.lives ? 1 : 0.15);
    }
  }

  _updateWaveText() {
    this.waveTxt.setText('WAVE ' + this.wave);
    this.tweens.add({
      targets: this.waveTxt,
      scaleX: 1.6, scaleY: 1.6,
      yoyo: true, duration: 300,
      ease: 'Quad.InOut'
    });
  }
}

// ══════════════════════════════════════════
//  GAME OVER SCENE
// ══════════════════════════════════════════
class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }

  init(data) {
    this.finalScore = data.score || 0;
    this.finalWave  = data.wave  || 1;
  }

  create() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75);
    this.add.image(W / 2, H / 2 - 100, 'chicken').setDisplaySize(120, 120).setAlpha(0.6);

    const titleStyle = { fontSize: '42px', fill: '#ff3300', fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 6 };
    const infoStyle  = { fontSize: '22px', fill: '#ffffff', fontFamily: 'monospace' };
    const btnStyle   = { fontSize: '26px', fill: '#00ffcc', fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 4 };

    this.add.text(W / 2, H / 2 - 10,  'GAME OVER',               titleStyle).setOrigin(0.5);
    this.add.text(W / 2, H / 2 + 60,  `SCORE: ${this.finalScore}`, infoStyle).setOrigin(0.5);
    this.add.text(W / 2, H / 2 + 95,  `WAVE: ${this.finalWave}`,   infoStyle).setOrigin(0.5);

    const btn = this.add.text(W / 2, H / 2 + 170, '[ PLAY AGAIN ]', btnStyle)
      .setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover',  () => btn.setStyle({ fill: '#ffffff' }));
    btn.on('pointerout',   () => btn.setStyle({ fill: '#00ffcc' }));
    btn.on('pointerdown',  () => this.scene.start('Game'));

    this.input.keyboard.once('keydown', () => this.scene.start('Game'));
  }
}

// ══════════════════════════════════════════
//  PHASER CONFIG
// ══════════════════════════════════════════
const config = {
  type: Phaser.AUTO,
  width: W,
  height: H,
  backgroundColor: '#04040f',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [BootScene, GameScene, GameOverScene]
};

new Phaser.Game(config);
