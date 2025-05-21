// File: scripts/main.js

Hooks.once('init', () => {
  console.log('click-to-scene-v13 | Initialized');
});

Hooks.on('renderDrawingConfig', (app, html, data) => {
  // Only proceed for Drawing sheets
  if ( app.constructor.name !== "DrawingConfig" ) return;
  const $html = $(html);

  // 1) Inject our Hotspot tab button
  const nav = $html.find('header nav.tabs[data-group="primary"]');
  if (!nav.length) return;
  nav.append(
    `<a class="item" data-tab="click2scene"><i class="fas fa-map-signs"></i> Hotspot</a>`
  );

  // 2) Append the Hotspot panel
  const content = $html.find('div.window-content');
  if (!content.length) return;
  content.append(
    `<div class="tab click2scene" data-tab="click2scene" style="display:none; padding:10px;">
      <div class="form-group">
        <label>Target Scene</label>
        <select name="flags.click-to-scene-v13.targetScene">
          <option value="">— Select Scene —</option>
          ${game.scenes.map(s => `
            <option value="${s.id}" ${app.object.document.getFlag('click-to-scene-v13','targetScene')===s.id?'selected':''}>
              ${s.name}
            </option>
          `).join('')}
        </select>
      </div>
    </div>`
  );

  // 3) Tab switching
  nav.find('a.item').on('click', ev => {
    const tab = ev.currentTarget.dataset.tab;
    content.find('.tab').hide();
    content.find(`.tab.${tab}`).show();
    nav.find('a.item').removeClass('active');
    $(ev.currentTarget).addClass('active');
  });
  nav.find('a.item').first().click();

  // 4) Intercept save to auto-create macro
  const originalSubmit = app._updateObject;
  app._updateObject = async function(event, formData) {
    // Save targetScene flag normally
    await originalSubmit.call(this, event, formData);
    const drawing = this.object.document;
    const sceneId = drawing.getFlag('click-to-scene-v13','targetScene');
    if (!sceneId) return;
    // Find or create a macro for this drawing
    let macro = game.macros.find(m => m.getFlag('click-to-scene-v13','drawingId') === drawing.id);
    if (!macro) {
      macro = await Macro.create({
        name: `Jump → ${game.scenes.get(sceneId).name}`,
        type: "script",
        scope: "global",
        command: `const s = game.scenes.get("${sceneId}"); if(s) s.activate();`,
        flags: { 'click-to-scene-v13': { drawingId: drawing.id } }
      }, { displaySheet: false });
    }
    // Store the macro ID on the drawing
    await drawing.setFlag('click-to-scene-v13','macroId', macro.id);
  };
});

Hooks.on('canvasReady', () => {
  canvas.app.renderer.plugins.interaction.on('pointerdown', async event => {
    const { x, y } = event.data.getLocalPosition(canvas.stage);
    for (const d of canvas.drawings.placeables) {
      const macroId = d.document.getFlag('click-to-scene-v13','macroId');
      if (!macroId) continue;
      const b = d.object.getBounds();
      if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
        const macro = game.macros.get(macroId);
        if (macro) macro.execute();
      }
    }
  });
});
