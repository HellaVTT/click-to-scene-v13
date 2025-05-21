// File: scripts/main.js

Hooks.once('init', () => {
  console.log('click-to-scene-v13 | Initialized');
});

Hooks.on('renderDrawingConfig', (app, html, data) => {
  // Only proceed for actual Drawings
  if ( app.object.document.documentName !== "Drawing" ) return;

  // 1) Inject our new tab into the primary tab list
  const nav = html.find(".tabs[data-group='primary']");
  nav.append(`
    <li class="item" data-tab="click2scene">
      <i class="fas fa-map-signs"></i> Hotspot
    </li>
  `);

  // 2) Append the content panel for our Hotspot tab
  html.find(".sheet-body").append(`
    <div class="tab click2scene" style="display:none; padding:10px;">
      <div class="form-group">
        <label>Target Scene</label>
        <select name="flags.click-to-scene-v13.targetScene">
          <option value="">— Select Scene —</option>
          ${game.scenes.map(s => `
            <option value="${s.id}"
              ${app.object.document.getFlag('click-to-scene-v13','targetScene') === s.id ? 'selected' : ''}
            >${s.name}</option>
          `).join('')}
        </select>
      </div>
    </div>
  `);

  // 3) Handle switching tabs (show/hide)
  html.find('.tabs[data-group="primary"] li').on('click', ev => {
    const tabId = $(ev.currentTarget).data('tab');
    html.find('.tab').hide();
    html.find(`.tab.${tabId}`).show();
    html.find('.tabs[data-group="primary"] li').removeClass('active');
    $(ev.currentTarget).addClass('active');
  });

  // 4) Activate the first tab (Appearance) by default
  html.find('.tabs[data-group="primary"] li').first().click();
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
