// File: scripts/main.js

Hooks.once('init', () => {
  console.log('click-to-scene-v13 | Initialized');
});

Hooks.on('renderDrawingConfig', (app, html, data) => {
  if ( app.constructor.name !== "DrawingConfig" ) return;

  // 1) Tab button
  const nav = html.find('header nav.tabs[data-group="primary"]');
  if ( !nav.length ) return;
  nav.append(`
    <a class="item" data-tab="click2scene">
      <i class="fas fa-map-signs"></i> Hotspot
    </a>
  `);

  // 2) Panel content
  const body = html.find('div.window-content');
  body.append(`
    <div class="tab click2scene" data-tab="click2scene" style="display:none; padding:10px;">
      <div class="form-group">
        <label>Target Scene</label>
        <select name="flags.click-to-scene-v13.targetScene">
          <option value="">— Select Scene —</option>
          ${game.scenes.map(s => `
            <option value="${s.id}"
              ${app.object.document.getFlag('click-to-scene-v13','targetScene')===s.id?'selected':''}
            >${s.name}</option>
          `).join('')}
        </select>
      </div>
    </div>
  `);

  // 3) Tab switching
  nav.find('a.item').on('click', ev => {
    const tab = ev.currentTarget.dataset.tab;
    body.find('.tab').hide();
    body.find(`.tab.${tab}`).show();
    nav.find('a.item').removeClass('active');
    $(ev.currentTarget).addClass('active');
  });

  // 4) Activate Appearance tab first
  nav.find('a.item').first().click();
});

Hooks.on('canvasReady', () => {
  canvas.app.renderer.plugins.interaction.on('pointerdown', event => {
    const { x, y } = event.data.getLocalPosition(canvas.stage);
    for ( let draw of canvas.drawings.placeables ) {
      const target = draw.document.getFlag('click-to-scene-v13', 'targetScene');
      if (!target) continue;
      const b = draw.object.getBounds();
      if ( x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height ) {
        const scene = game.scenes.get(target);
        if ( scene ) scene.activate();
      }
    }
  });
});
